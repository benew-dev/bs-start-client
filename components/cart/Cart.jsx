"use client";

import { useContext, useEffect, useState, useRef, memo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import CartContext from "@/context/CartContext";
import dynamic from "next/dynamic";
import CartItemSkeleton from "../skeletons/CartItemSkeleton";

// Chargement dynamique du composant ItemCart
const ItemCart = dynamic(() => import("./components/ItemCart"), {
  loading: () => <CartItemSkeleton />,
  ssr: true,
});

// Composants et hooks extraits pour meilleure organisation
import EmptyCart from "./components/EmptyCart";
import CartSummary from "./components/CartSummary";
import useCartOperations from "../../hooks/useCartOperations"; // ✅ Hook avec monitoring intégré
import CartSkeleton from "../skeletons/CartSkeleton";

// Bandeau affiché aux utilisateurs non connectés au-dessus du récap
const GuestCartBanner = memo(() => (
  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
    <div>
      <p className="font-medium text-blue-900">
        Vous naviguez en tant qu&apos;invité
      </p>
      <p className="text-sm text-blue-700 mt-0.5">
        Votre panier est sauvegardé sur cet appareil. Connectez-vous pour
        finaliser votre commande et retrouver votre panier sur tous vos
        appareils.
      </p>
    </div>
    <Link
      href="/login"
      className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <LogIn className="w-4 h-4" />
      Se connecter
    </Link>
  </div>
));

GuestCartBanner.displayName = "GuestCartBanner";

const Cart = () => {
  const {
    loading,
    cart,
    cartCount,
    setCartToState,
    cartTotal,
    error,
    clearError,
    isAuthenticated,
    enrichGuestCart,
  } = useContext(CartContext);

  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const router = useRouter();

  // ✅ Hook personnalisé avec monitoring intégré
  const {
    deleteInProgress,
    itemBeingRemoved,
    increaseQty,
    decreaseQty,
    handleDeleteItem,
  } = useCartOperations();

  // Ajoutons un useRef pour suivre si une requête de chargement est en cours
  const isLoadingCart = useRef(false);

  useEffect(() => {
    // Nettoyage de l'erreur si elle existe
    if (error) {
      clearError();
      toast.error("Une erreur est survenue lors du chargement du panier.");
    }
  }, [error, clearError]);

  // Précharger la page de livraison
  useEffect(() => {
    router.prefetch("/shipping-choice");
    let isMounted = true; // Ajouter un flag de montage

    const loadCart = async () => {
      if (isLoadingCart.current || !isMounted) return; // Vérifier isMounted

      try {
        isLoadingCart.current = true;

        if (isAuthenticated) {
          // Utilisateur connecté : charger depuis la BDD (comportement original)
          await setCartToState();
        } else {
          // Utilisateur guest : enrichir le localStorage avec les données produits
          await enrichGuestCart();
        }
      } catch (error) {
        console.error("Erreur lors du chargement du panier:", error);
        // ❌ SUPPRIMÉ : Plus de captureException ici (géré par CartContext)
        toast.error("Impossible de charger votre panier. Veuillez réessayer.");
      } finally {
        if (isMounted) {
          // Vérifier avant de mettre à jour l'état
          isLoadingCart.current = false;
          setInitialLoadComplete(true);
        }
      }
    };

    if (!initialLoadComplete && !isLoadingCart.current) {
      loadCart();
    }

    return () => {
      isMounted = false; // Cleanup
    };
  }, [setCartToState, initialLoadComplete]);

  // Afficher un écran de chargement pendant le chargement initial
  if (!initialLoadComplete) {
    return <CartSkeleton />;
  }

  return (
    <>
      {/* En-tête du panier */}
      <CartHeader cartCount={cartCount} />

      {/* Contenu du panier */}
      <section className="py-8 md:py-10">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Bandeau guest au-dessus du contenu */}
          {!isAuthenticated && cart?.length > 0 && <GuestCartBanner />}

          {!loading && cart?.length === 0 ? (
            <>
              {/* Panier vide : montrer quand même le bandeau si guest */}
              {!isAuthenticated && <GuestCartBanner />}
              <EmptyCart />
            </>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
              {/* Liste des articles */}
              <CartItemsList
                cart={cart}
                loading={loading}
                handleDeleteItem={handleDeleteItem}
                decreaseQty={decreaseQty}
                increaseQty={increaseQty}
                deleteInProgress={deleteInProgress}
                itemBeingRemoved={itemBeingRemoved}
              />

              {/* Résumé du panier */}
              {cart?.length > 0 && (
                <CartSummary
                  cartItems={cart}
                  amount={cartTotal}
                  isAuthenticated={isAuthenticated}
                />
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

// Composants extraits pour une meilleure organisation

const CartHeader = memo(({ cartCount }) => (
  <section className="py-5 sm:py-7 bg-gradient-to-r from-blue-50 to-indigo-50">
    <div className="container max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
          Mon Panier
        </h1>
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
          {cartCount || 0} produit{cartCount !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  </section>
));

CartHeader.displayName = "CartHeader";

const CartItemsList = memo(
  ({
    cart,
    loading,
    handleDeleteItem,
    decreaseQty,
    increaseQty,
    deleteInProgress,
    itemBeingRemoved,
  }) => (
    <main className="md:w-3/4">
      <div className="bg-white shadow rounded-lg mb-5 p-4 lg:p-6 transition-all duration-300 ease-in-out transform translate-y-0 opacity-100">
        {loading && (
          <>
            {[...Array(3)].map((_, index) => (
              <CartItemSkeleton key={index} />
            ))}
          </>
        )}
        {!loading &&
          cart?.map((cartItem) => (
            <div
              key={cartItem.id}
              className={`transition-all duration-300 ease-in-out transform ${
                itemBeingRemoved === cartItem.id
                  ? "opacity-0 -translate-x-3 h-0 overflow-hidden"
                  : "opacity-100 translate-x-0"
              }`}
            >
              <ItemCart
                cartItem={cartItem}
                deleteItemFromCart={handleDeleteItem}
                decreaseQty={decreaseQty}
                increaseQty={increaseQty}
                deleteInProgress={deleteInProgress}
              />
            </div>
          ))}
      </div>
    </main>
  ),
);

CartItemsList.displayName = "CartItemsList";

export default Cart;
