"use client";

import { useState, useMemo, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { toast } from "react-toastify";
import AuthContext from "@/context/AuthContext";
import CartContext from "@/context/CartContext";
import { useSession } from "next-auth/react";

const ProductItem = ({ product }) => {
  const { user, toggleFavorite } = useContext(AuthContext);
  const { addItemToCart } = useContext(CartContext);
  const { data: session } = useSession();

  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Calcul de l'état favori
  const isFavorite = useMemo(() => {
    const sessionUser = session?.user;
    const contextUser = user;
    const currentUser = sessionUser || contextUser;

    if (!currentUser?.favorites || !Array.isArray(currentUser.favorites)) {
      return false;
    }

    return currentUser.favorites.some(
      (fav) => fav.productId?.toString() === product._id?.toString(),
    );
  }, [session, user, product._id]);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info("Connectez-vous pour ajouter aux favoris");
      return;
    }

    if (favoriteLoading) return;

    try {
      setFavoriteLoading(true);

      const result = await toggleFavorite(
        product._id,
        product.name,
        product.images?.[0] || { public_id: null, url: null },
        "toggle",
      );

      if (!result.success) {
        console.error("❌ Échec de la mise à jour des favoris");
      }
    } catch (error) {
      console.error("❌ Error toggling favorite:", error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      addItemToCart({ product: product._id });
      toast.success("Produit ajouté au panier !");
    } catch (error) {
      toast.error("Erreur lors de l'ajout au panier");
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <article className="group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-sunset-lg hover:border-orange-200 transition-all duration-300">
      <Link href={`/shop/${product._id}`} className="block">
        {/* Image du produit */}
        <div className="relative w-full h-56 bg-gray-50 overflow-hidden">
          {product.images?.[0]?.url ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-500 p-3"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={false}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-gray-300 text-sm">Pas d'image</div>
            </div>
          )}

          {/* Badge nouveau */}
          {new Date(product.createdAt) >
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
            <div className="absolute top-2 left-2 bg-gradient-sunset text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
              Nouveau
            </div>
          )}

          {/* Bouton favori avec état visuel clair */}
          <button
            onClick={handleToggleFavorite}
            disabled={favoriteLoading || !user}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
              isFavorite
                ? "bg-pink-500 text-white hover:bg-pink-600"
                : "bg-white/90 text-gray-600 hover:bg-pink-50 hover:text-pink-500"
            }`}
            aria-label={
              isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"
            }
          >
            {favoriteLoading ? (
              <div className="w-5 h-5 border-2 border-pink-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Heart
                className={`w-5 h-5 transition-all ${
                  isFavorite ? "fill-current" : ""
                }`}
              />
            )}
          </button>
        </div>

        {/* Informations produit */}
        <div className="p-4 space-y-3">
          {/* Nom du produit */}
          <h3 className="font-semibold text-base text-gray-900 line-clamp-2 min-h-[3rem] group-hover:text-orange-600 transition-colors">
            {product.name}
          </h3>

          {/* Note et avis */}
          {product.ratings > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 text-sm font-medium text-gray-700">
                  {product.ratings.toFixed(1)}
                </span>
              </div>
            </div>
          )}

          {/* Prix - CORRECTION DU BUG : Couleur solide et visible */}
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-orange-600">
              {product.price.toFixed(2)} €
            </p>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 text-sm">
            {product.stock > 0 ? (
              <span className="flex items-center text-green-600 font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 pulse-subtle" />
                En stock ({product.stock})
              </span>
            ) : (
              <span className="flex items-center text-red-600 font-medium">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                Rupture de stock
              </span>
            )}
          </div>

          {/* Bouton Ajouter au panier */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-sunset text-white rounded-lg hover:shadow-sunset-lg hover-lift transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:transform-none font-medium"
            aria-label="Ajouter au panier"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>
              {product.stock === 0 ? "Indisponible" : "Ajouter au panier"}
            </span>
          </button>
        </div>
      </Link>
    </article>
  );
};

export default ProductItem;
