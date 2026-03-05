import { NextResponse } from "next/server";
import dbConnect from "@/backend/config/dbConnect";
import isAuthenticatedUser from "@/backend/middlewares/auth";
import Order from "@/backend/models/order";
import User from "@/backend/models/user";
import Product from "@/backend/models/product";
import { captureException } from "@/monitoring/sentry";
import { withIntelligentRateLimit } from "@/utils/rateLimit";
import { getToken } from "next-auth/jwt";

/**
 * GET /api/orders/can_review/[id]
 * Vérifie si un utilisateur peut laisser un avis sur un produit
 * Condition: L'utilisateur doit avoir commandé le produit
 * Rate limit: Configuration intelligente - authenticatedRead (200 req/min)
 *
 * Headers de sécurité gérés par next.config.mjs
 */
export const GET = withIntelligentRateLimit(
  async function (req, { params }) {
    try {
      // Validation de l'ID du produit
      const { id } = await params;
      if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid product ID format",
            code: "INVALID_ID",
          },
          { status: 400 },
        );
      }

      // Vérifier l'authentification
      await isAuthenticatedUser(req, NextResponse);

      // Connexion DB
      await dbConnect();

      // Récupérer l'utilisateur
      const user = await User.findOne({ email: req.user.email }).select("_id");
      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: "User not found",
            code: "USER_NOT_FOUND",
          },
          { status: 404 },
        );
      }

      // Vérifier que le produit existe
      const product = await Product.findById(id).select("_id name isActive");
      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message: "Product not found",
            code: "PRODUCT_NOT_FOUND",
          },
          { status: 404 },
        );
      }

      // Vérifier si le produit est actif
      if (!product.isActive) {
        return NextResponse.json(
          {
            success: false,
            message: "Product is not active",
            code: "PRODUCT_INACTIVE",
            data: {
              canReview: false,
            },
          },
          { status: 200 },
        );
      }

      // Chercher les commandes de l'utilisateur contenant ce produit
      const orders = await Order.find({
        "user.userId": user._id,
        "orderItems.product": id,
      }).lean();

      // Vérifier si l'utilisateur a commandé le produit
      const canReview = orders && orders.length > 0;

      // Log pour audit (optionnel, en dev seulement)
      if (process.env.NODE_ENV === "development") {
        console.log("Can review check:", {
          userId: user._id,
          productId: id,
          canReview,
          ordersCount: orders.length,
        });
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            canReview: canReview,
            meta: {
              timestamp: new Date().toISOString(),
            },
          },
        },
        { status: 200 },
      );
    } catch (error) {
      console.error("Can review check error:", error.message);

      // Capturer les erreurs non-validation
      if (
        error.name !== "CastError" &&
        !error.message?.includes("authentication")
      ) {
        captureException(error, {
          tags: {
            component: "api",
            route: "orders/can_review/[id]/GET",
            user: req.user?.email,
            productId: params.id,
          },
          extra: {
            errorName: error.name,
            errorMessage: error.message,
          },
        });
      }

      let status = 500;
      let message = "Failed to check review eligibility";
      let code = "INTERNAL_ERROR";

      if (error.name === "CastError") {
        status = 400;
        message = "Invalid ID format";
        code = "INVALID_ID_FORMAT";
      } else if (error.message?.includes("authentication")) {
        status = 401;
        message = "Authentication failed";
        code = "AUTH_FAILED";
      } else if (error.message?.includes("connection")) {
        status = 503;
        message = "Database connection error";
        code = "DB_CONNECTION_ERROR";
      } else if (error.message?.includes("timeout")) {
        status = 504;
        message = "Request timeout";
        code = "TIMEOUT";
      }

      return NextResponse.json(
        {
          success: false,
          message,
          code,
          ...(process.env.NODE_ENV === "development" && {
            error: error.message,
          }),
        },
        { status },
      );
    }
  },
  {
    category: "api",
    action: "authenticatedRead", // 200 req/min pour utilisateurs authentifiés
    extractUserInfo: async (req) => {
      try {
        const cookieName =
          process.env.NODE_ENV === "production"
            ? "__Secure-next-auth.session-token"
            : "next-auth.session-token";

        const token = await getToken({
          req,
          secret: process.env.NEXTAUTH_SECRET,
          cookieName,
        });

        return {
          userId: token?.user?._id || token?.user?.id || token?.sub,
          email: token?.user?.email,
        };
      } catch (error) {
        console.error(
          "[CAN_REVIEW] Error extracting user from JWT:",
          error.message,
        );
        return {};
      }
    },
  },
);
