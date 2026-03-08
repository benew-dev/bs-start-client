"use client";

import {
  createContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { DECREASE, INCREASE } from "@/helpers/constants";
import useGuestCart, {
  readGuestCart,
  writeGuestCart,
} from "@/hooks/useGuestCart";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [error, setError] = useState(null);

  // État du panier guest enrichi (avec données produits)
  const [guestCart, setGuestCart] = useState([]);
  const [guestCartCount, setGuestCartCount] = useState(0);
  const [guestCartTotal, setGuestCartTotal] = useState(0);

  const { status: sessionStatus } = useSession();
  const isAuthenticated = sessionStatus === "authenticated";

  const {
    addToGuestCart,
    removeFromGuestCart,
    updateGuestCartQuantity,
    clearGuestCart,
    getGuestCartItems,
  } = useGuestCart();

  // ─────────────────────────────────────────────────────────────────
  // GUEST CART : enrichissement des IDs localStorage via API publique
  // Les prix et stocks viennent toujours du serveur, jamais du localStorage
  // ─────────────────────────────────────────────────────────────────

  const enrichGuestCart = useCallback(async () => {
    const rawItems = getGuestCartItems();

    if (rawItems.length === 0) {
      setGuestCart([]);
      setGuestCartCount(0);
      setGuestCartTotal(0);
      return;
    }

    try {
      const enrichedItems = await Promise.all(
        rawItems.map(async ({ productId, quantity }) => {
          try {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`,
            );
            if (!res.ok) return null;

            const { data } = await res.json();
            const product = data?.product;

            if (!product || !product.isActive || product.stock === 0)
              return null;

            const adjustedQuantity = Math.min(quantity, product.stock);

            return {
              id: productId, // Utilisé comme clé dans ItemCart
              productId: product._id,
              productName: product.name,
              price: product.price, // ← toujours du serveur
              quantity: adjustedQuantity,
              stock: product.stock, // ← toujours du serveur
              subtotal: adjustedQuantity * product.price,
              imageUrl: product.images?.[0]?.url || "",
              isGuestItem: true,
            };
          } catch {
            return null;
          }
        }),
      );

      const validItems = enrichedItems.filter(Boolean);

      // Nettoyer le localStorage des produits devenus invalides
      const validIds = validItems.map((item) => item.productId.toString());
      const cleaned = rawItems.filter((item) =>
        validIds.includes(item.productId),
      );
      if (cleaned.length !== rawItems.length) {
        writeGuestCart(cleaned);
      }

      setGuestCart(validItems);
      setGuestCartCount(validItems.length);
      setGuestCartTotal(
        validItems.reduce((sum, item) => sum + item.subtotal, 0),
      );
    } catch (err) {
      console.error("[CartContext] enrichGuestCart error:", err.message);
    }
  }, [getGuestCartItems]);

  // Charger le panier guest au montage si non authentifié
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      enrichGuestCart();
    }
  }, [sessionStatus, enrichGuestCart]);

  // ─────────────────────────────────────────────────────────────────
  // FUSION : guest localStorage → BDD au moment du login
  // Appelé depuis Login.jsx après data?.ok
  // ─────────────────────────────────────────────────────────────────

  const mergeGuestCartOnLogin = useCallback(async () => {
    const rawItems = getGuestCartItems();
    if (rawItems.length === 0) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cart/merge`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ items: rawItems }),
          credentials: "include",
        },
      );

      const data = await res.json();

      if (res.ok && data.success) {
        // Vider le localStorage
        clearGuestCart();
        setGuestCart([]);
        setGuestCartCount(0);
        setGuestCartTotal(0);

        // Mettre à jour le panier BDD avec le résultat de la fusion
        remoteDataInState(data);

        if (data.data?.merge?.mergedCount > 0) {
          toast.success(
            `${data.data.merge.mergedCount} article(s) de votre panier récupérés`,
          );
        }
        if (data.data?.merge?.skippedCount > 0) {
          toast.info(
            `${data.data.merge.skippedCount} article(s) n'étaient plus disponibles`,
          );
        }
      } else {
        console.warn("[CartContext] Merge failed:", data.message);
      }
    } catch (err) {
      console.error("[CartContext] mergeGuestCartOnLogin error:", err.message);
      // Pas de toast d'erreur — l'utilisateur vient de se connecter, on ne perturbe pas
    }
  }, [getGuestCartItems, clearGuestCart]);

  // ─────────────────────────────────────────────────────────────────
  // PANIER AUTHENTIFIÉ : identique à l'original
  // ─────────────────────────────────────────────────────────────────

  const setCartToState = useCallback(async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        signal: controller.signal,
        credentials: "include",
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (!res.ok) {
        let errorMessage = "";
        switch (res.status) {
          case 401:
            errorMessage = "Session expirée. Veuillez vous reconnecter";
            break;
          case 429:
            errorMessage = "Trop de tentatives. Réessayez plus tard.";
            break;
          default:
            errorMessage =
              data.message || "Erreur lors de la récupération du panier";
        }

        const httpError = new Error(`HTTP ${res.status}: ${errorMessage}`);
        const isCritical = res.status === 401;
        console.log(httpError, "CartContext", "setCartToState", isCritical);

        setError(errorMessage);
        return;
      }

      if (data.success) {
        remoteDataInState(data);
      }
    } catch (err) {
      if (err.name === "AbortError") {
        setError("La requête a pris trop de temps");
        console.error(err, "CartContext", "setCartToState", false);
      } else {
        setError("Problème de connexion. Vérifiez votre connexion.");
        console.error(err, "CartContext", "setCartToState", true);
      }
      console.error("Cart retrieval error:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addItemToCart = useCallback(
    async ({ product, quantity = 1 }) => {
      if (!product) {
        toast.error("Produit invalide");
        return;
      }

      // ── Mode guest ──────────────────────────────────────────────
      if (!isAuthenticated) {
        try {
          // Vérifier que le produit est disponible avant de l'ajouter
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/products/${product}`,
          );

          if (!res.ok) {
            toast.error("Produit introuvable");
            return;
          }

          const { data } = await res.json();
          const productData = data?.product;

          if (!productData?.isActive) {
            toast.error("Ce produit n'est plus disponible");
            return;
          }
          if (productData?.stock === 0) {
            toast.error("Ce produit est en rupture de stock");
            return;
          }

          addToGuestCart(product, quantity);
          await enrichGuestCart();

          toast.success("Produit ajouté au panier !");
          toast.info("Connectez-vous pour finaliser votre commande", {
            toastId: "guest-cart-hint",
            autoClose: 4000,
          });
        } catch (err) {
          toast.error("Impossible d'ajouter ce produit");
          console.error("[CartContext] addItemToCart (guest):", err.message);
        }
        return;
      }

      // ── Mode authentifié (identique à l'original) ───────────────
      try {
        setLoading(true);
        setError(null);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            productId: product,
            quantity: parseInt(quantity, 10),
          }),
          signal: controller.signal,
          credentials: "include",
        });

        clearTimeout(timeoutId);
        const data = await res.json();

        if (!res.ok) {
          let errorMessage = "";
          let toastMessage = "";
          switch (res.status) {
            case 400:
              errorMessage = data.message || "Stock insuffisant";
              toastMessage = data.message || "Stock insuffisant";
              break;
            case 401:
              errorMessage = "Veuillez vous connecter";
              toastMessage = "Veuillez vous connecter";
              break;
            case 409:
              errorMessage = "Produit déjà dans le panier";
              toastMessage = "Produit déjà dans le panier";
              break;
            default:
              errorMessage = data.message || "Erreur lors de l'ajout";
              toastMessage = data.message || "Erreur lors de l'ajout";
          }

          const httpError = new Error(`HTTP ${res.status}: ${errorMessage}`);
          const isCritical = res.status === 401;
          console.log(httpError, "CartContext", "addItemToCart", isCritical);

          if (res.status === 409) {
            toast.info(toastMessage);
          } else {
            toast.error(toastMessage);
          }
          return;
        }

        if (data.success) {
          await setCartToState();
          toast.success("Produit ajouté au panier");
        }
      } catch (err) {
        if (err.name === "AbortError") {
          toast.error("La connexion est trop lente");
          console.error(err, "CartContext", "addItemToCart", false);
        } else {
          toast.error("Problème de connexion");
          console.error(err, "CartContext", "addItemToCart", true);
        }
        console.error("Add to cart error:", err.message);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, addToGuestCart, enrichGuestCart, setCartToState],
  );

  const updateCart = useCallback(
    async (product, action) => {
      if (!product?.id || ![INCREASE, DECREASE].includes(action)) {
        toast.error("Données invalides");
        return;
      }

      if (action === DECREASE && product.quantity === 1) {
        toast.info("Utilisez le bouton Supprimer pour retirer cet article");
        return;
      }

      // ── Mode guest ──────────────────────────────────────────────
      if (!isAuthenticated) {
        const newQuantity =
          action === INCREASE ? product.quantity + 1 : product.quantity - 1;

        if (newQuantity <= 0) {
          removeFromGuestCart(product.id);
        } else {
          updateGuestCartQuantity(product.id, newQuantity);
        }
        await enrichGuestCart();
        return;
      }

      // ── Mode authentifié (identique à l'original) ───────────────
      try {
        setLoading(true);
        setError(null);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ product, value: action }),
          signal: controller.signal,
          credentials: "include",
        });

        clearTimeout(timeoutId);
        const data = await res.json();

        if (!res.ok) {
          const errorMessage = data.message || "Erreur de mise à jour";
          const httpError = new Error(`HTTP ${res.status}: ${errorMessage}`);
          const isCritical = res.status === 401;
          console.log(httpError, "CartContext", "updateCart", isCritical);
          toast.error(errorMessage);
          return;
        }

        if (data.success) {
          await setCartToState();
          toast.success(
            action === INCREASE ? "Quantité augmentée" : "Quantité diminuée",
          );
        }
      } catch (err) {
        if (err.name === "AbortError") {
          toast.error("La connexion est trop lente");
          console.error(err, "CartContext", "updateCart", false);
        } else {
          toast.error("Problème de connexion");
          console.error(err, "CartContext", "updateCart", true);
        }
        console.error("Update cart error:", err.message);
      } finally {
        setLoading(false);
      }
    },
    [
      isAuthenticated,
      removeFromGuestCart,
      updateGuestCartQuantity,
      enrichGuestCart,
      setCartToState,
    ],
  );

  const deleteItemFromCart = useCallback(
    async (id) => {
      if (!id) {
        toast.error("ID invalide");
        return;
      }

      // ── Mode guest ──────────────────────────────────────────────
      if (!isAuthenticated) {
        removeFromGuestCart(id);
        await enrichGuestCart();
        toast.success("Article supprimé");
        return;
      }

      // ── Mode authentifié (identique à l'original) ───────────────
      try {
        setLoading(true);
        setError(null);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/cart/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            signal: controller.signal,
            credentials: "include",
          },
        );

        clearTimeout(timeoutId);
        const data = await res.json();

        if (!res.ok) {
          const errorMessage = data.message || "Erreur de suppression";
          const httpError = new Error(`HTTP ${res.status}: ${errorMessage}`);
          const isCritical = [401, 404].includes(res.status);
          console.log(
            httpError,
            "CartContext",
            "deleteItemFromCart",
            isCritical,
          );
          toast.error(errorMessage);
          return;
        }

        if (data.success) {
          await setCartToState();
          toast.success("Article supprimé");
        }
      } catch (err) {
        if (err.name === "AbortError") {
          toast.error("La connexion est trop lente");
          console.error(err, "CartContext", "deleteItemFromCart", false);
        } else {
          toast.error("Problème de connexion");
          console.error(err, "CartContext", "deleteItemFromCart", true);
        }
        console.error("Delete cart item error:", err.message);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, removeFromGuestCart, enrichGuestCart, setCartToState],
  );

  const clearError = () => setError(null);

  const clearCartOnLogout = () => {
    setCart([]);
    setLoading(false);
    setCartCount(0);
    setCartTotal(0);
    // On ne vide PAS le guest cart ici — l'utilisateur pourrait se reconnecter
  };

  const remoteDataInState = (response) => {
    try {
      const normalizedCart =
        response.data.cart?.map((item) => ({
          ...item,
          quantity: parseInt(item.quantity, 10) || 1,
        })) || [];

      setCart(normalizedCart);
      setCartCount(response.data.cartCount || 0);
      setCartTotal(response.data.cartTotal || 0);
    } catch (err) {
      console.error(err, "CartContext", "remoteDataInState", true);
      setCart([]);
      setCartCount(0);
      setCartTotal(0);
    }
  };

  // Exposer le bon panier selon le mode
  const contextValue = useMemo(
    () => ({
      loading,
      cart: isAuthenticated ? cart : guestCart,
      cartCount: isAuthenticated ? cartCount : guestCartCount,
      cartTotal: isAuthenticated ? cartTotal : guestCartTotal,
      error,
      isAuthenticated,
      sessionStatus, // ← ajout
      setCartToState,
      addItemToCart,
      updateCart,
      deleteItemFromCart,
      clearError,
      clearCartOnLogout,
      mergeGuestCartOnLogin,
      enrichGuestCart,
    }),
    [
      loading,
      cart,
      guestCart,
      cartCount,
      guestCartCount,
      cartTotal,
      guestCartTotal,
      error,
      isAuthenticated,
      sessionStatus,
      setCartToState,
      addItemToCart,
      updateCart,
      deleteItemFromCart,
      mergeGuestCartOnLogin,
      enrichGuestCart,
    ],
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

export default CartContext;
