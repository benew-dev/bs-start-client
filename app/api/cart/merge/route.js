import { NextResponse } from "next/server";
import dbConnect from "@/backend/config/dbConnect";
import isAuthenticatedUser from "@/backend/middlewares/auth";
import Cart from "@/backend/models/cart";
import User from "@/backend/models/user";
import Product from "@/backend/models/product";
import { captureException } from "@/monitoring/sentry";
import { withCartRateLimit } from "@/utils/rateLimit";

/**
 * POST /api/cart/merge
 * Fusionne le panier guest (localStorage) dans le panier BDD de l'utilisateur connecté.
 * Appelé depuis Login.jsx après connexion réussie.
 *
 * Body : { items: [{ productId: string, quantity: number }] }
 *
 * Règles de fusion :
 * - Produit déjà en BDD → additionner les quantités (plafonné au stock disponible)
 * - Produit absent en BDD → créer l'entrée
 * - Produit inexistant / inactif / rupture de stock → ignorer silencieusement
 *
 * Rate limit : cart.add (100 req/min, identique à l'ajout normal)
 */
export const POST = withCartRateLimit(
  async function (req) {
    try {
      await isAuthenticatedUser(req, NextResponse);
      await dbConnect();

      const user = await User.findOne({ email: req.user.email }).select("_id");
      if (!user) {
        return NextResponse.json(
          { success: false, message: "User not found", code: "USER_NOT_FOUND" },
          { status: 404 },
        );
      }

      let body;
      try {
        body = await req.json();
      } catch {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid request body",
            code: "INVALID_BODY",
          },
          { status: 400 },
        );
      }

      const { items } = body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json(
          { success: false, message: "No items to merge", code: "NO_ITEMS" },
          { status: 400 },
        );
      }

      // Filtrer les items valides : IDs MongoDB + quantité entière >= 1
      const validItems = items.filter(
        (item) =>
          item?.productId &&
          /^[0-9a-fA-F]{24}$/.test(item.productId) &&
          Number.isInteger(item.quantity) &&
          item.quantity >= 1,
      );

      if (validItems.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "No valid items to merge",
            code: "NO_VALID_ITEMS",
          },
          { status: 400 },
        );
      }

      const merged = [];
      const skipped = [];

      for (const item of validItems) {
        try {
          const product = await Product.findById(item.productId)
            .select("name price stock isActive")
            .lean();

          if (!product || !product.isActive || product.stock === 0) {
            skipped.push({
              productId: item.productId,
              reason: !product
                ? "PRODUCT_NOT_FOUND"
                : !product.isActive
                  ? "PRODUCT_INACTIVE"
                  : "OUT_OF_STOCK",
            });
            continue;
          }

          const existingCartItem = await Cart.findOne({
            user: user._id,
            product: item.productId,
          });

          if (existingCartItem) {
            const mergedQuantity = Math.min(
              existingCartItem.quantity + item.quantity,
              product.stock,
            );
            existingCartItem.quantity = mergedQuantity;
            await existingCartItem.save();

            merged.push({
              productId: item.productId,
              action: "updated",
              quantity: mergedQuantity,
            });
          } else {
            const newQuantity = Math.min(item.quantity, product.stock);
            await Cart.create({
              user: user._id,
              product: item.productId,
              quantity: newQuantity,
              price: product.price,
              productName: product.name,
            });

            merged.push({
              productId: item.productId,
              action: "added",
              quantity: newQuantity,
            });
          }
        } catch (itemError) {
          console.error(
            `[CART_MERGE] Error processing item ${item.productId}:`,
            itemError.message,
          );
          skipped.push({
            productId: item.productId,
            reason: "PROCESSING_ERROR",
          });
        }
      }

      // Récupérer le panier final mis à jour (même format que GET /api/cart)
      const cartItems = await Cart.find({ user: user._id })
        .populate("product", "name price stock images isActive")
        .sort({ createdAt: -1 })
        .lean();

      const formattedCart = cartItems
        .filter(
          (cartItem) =>
            cartItem.product &&
            cartItem.product.isActive &&
            cartItem.product.stock > 0,
        )
        .map((cartItem) => {
          const adjustedQuantity = Math.min(
            cartItem.quantity,
            cartItem.product.stock,
          );
          return {
            id: cartItem._id,
            productId: cartItem.product._id,
            productName: cartItem.product.name,
            price: cartItem.product.price,
            quantity: adjustedQuantity,
            stock: cartItem.product.stock,
            subtotal: adjustedQuantity * cartItem.product.price,
            imageUrl: cartItem.product.images?.[0]?.url || "",
          };
        });

      const cartCount = formattedCart.length;
      const cartTotal = formattedCart.reduce(
        (sum, item) => sum + item.subtotal,
        0,
      );

      console.log("🔒 Security event - Guest cart merged:", {
        userId: user._id,
        mergedCount: merged.length,
        skippedCount: skipped.length,
        timestamp: new Date().toISOString(),
        ip:
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          "unknown",
      });

      return NextResponse.json(
        {
          success: true,
          message: `${merged.length} article(s) fusionné(s) dans votre panier`,
          data: {
            cartCount,
            cartTotal,
            cart: formattedCart,
            merge: {
              merged,
              skipped,
              mergedCount: merged.length,
              skippedCount: skipped.length,
            },
          },
        },
        { status: 200 },
      );
    } catch (error) {
      console.error("Cart merge error:", error.message);

      if (!error.message?.includes("authentication")) {
        captureException(error, {
          tags: {
            component: "api",
            route: "cart/merge/POST",
            user: req.user?.email,
          },
        });
      }

      return NextResponse.json(
        {
          success: false,
          message: error.message?.includes("authentication")
            ? "Authentication failed"
            : "Failed to merge cart",
          code: error.message?.includes("authentication")
            ? "AUTH_FAILED"
            : "MERGE_ERROR",
          ...(process.env.NODE_ENV === "development" && {
            error: error.message,
          }),
        },
        {
          status: error.message?.includes("authentication") ? 401 : 500,
        },
      );
    }
  },
  {
    action: "add",
  },
);
