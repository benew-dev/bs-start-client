"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import ReactStarsRating from "react-awesome-stars-rating";
import { getPriceQueryParams, isArrayEmpty } from "@/helpers/helpers";

const Filters = ({ categories, setLocalLoading }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // État local synchronisé avec les paramètres d'URL
  const [min, setMin] = useState(() => searchParams?.get("min") || "");
  const [max, setMax] = useState(() => searchParams?.get("max") || "");
  const [rating, setRating] = useState(
    () => parseFloat(searchParams?.get("ratings")) || 0,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mémoiser la valeur de catégorie actuelle
  const currentCategory = useMemo(
    () => searchParams?.get("category") || "",
    [searchParams],
  );

  // Synchroniser les états avec les paramètres d'URL
  useEffect(() => {
    setMin(searchParams?.get("min") || "");
    setMax(searchParams?.get("max") || "");
    setRating(parseFloat(searchParams?.get("ratings")) || 0);
  }, [searchParams]);

  // Validation des prix mémorisée
  const validatePrices = useCallback(async () => {
    if (min === "" && max === "") {
      throw new Error(
        "Veuillez renseigner au moins un des deux champs de prix",
      );
    }

    if (min !== "" && max !== "") {
      const minNum = Number(min);
      const maxNum = Number(max);

      if (isNaN(minNum) || isNaN(maxNum)) {
        throw new Error("Les valeurs de prix doivent être des nombres valides");
      }

      if (minNum > maxNum) {
        throw new Error("Le prix minimum doit être inférieur au prix maximum");
      }
    }
  }, [min, max]);

  // Gestionnaire de clic sur catégorie
  const handleCategoryClick = useCallback(
    (categoryId) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      setLocalLoading(true);

      try {
        const params = new URLSearchParams(searchParams?.toString() || "");

        if (params.get("category") === categoryId) {
          params.delete("category");
        } else {
          params.set("category", categoryId);
        }

        const path = `${pathname}?${params.toString()}`;
        setIsSubmitting(false);
        setLocalLoading(false);
        router.push(path);
      } catch (error) {
        console.error("Erreur lors de la sélection de catégorie:", error);
        toast.error("Une erreur est survenue lors du filtrage par catégorie");
        setLocalLoading(false);
        setIsSubmitting(false);
      }
    },
    [searchParams, router, setLocalLoading, pathname, isSubmitting],
  );

  // Gestionnaire pour appliquer les filtres de prix
  const handlePriceFilter = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLocalLoading(true);

    try {
      await validatePrices();

      let params = new URLSearchParams(searchParams?.toString() || "");

      params = getPriceQueryParams(params, "min", min);
      params = getPriceQueryParams(params, "max", max);

      const path = `${pathname}?${params.toString()}`;
      setIsSubmitting(false);
      setLocalLoading(false);
      router.push(path);
    } catch (error) {
      toast.error(
        error.message || "Une erreur est survenue avec les filtres de prix",
      );
      setLocalLoading(false);
      setIsSubmitting(false);
    }
  }, [
    min,
    max,
    searchParams,
    validatePrices,
    router,
    setLocalLoading,
    pathname,
    isSubmitting,
  ]);

  // ✅ MODIFIÉ : Gestionnaire pour le changement de rating avec application automatique
  const handleRatingChange = useCallback(
    (newRating) => {
      if (isSubmitting) return;

      // Arrondir à 0.5 (permet 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5)
      const roundedRating = Math.round(newRating * 2) / 2;
      setRating(roundedRating);

      // Appliquer le filtre automatiquement
      setIsSubmitting(true);
      setLocalLoading(true);

      try {
        const params = new URLSearchParams(searchParams?.toString() || "");

        if (roundedRating > 0) {
          params.set("ratings", roundedRating.toString());
        } else {
          params.delete("ratings");
        }

        const path = `${pathname}?${params.toString()}`;
        router.push(path);
      } catch (error) {
        toast.error("Une erreur est survenue avec le filtre de note");
      } finally {
        setIsSubmitting(false);
        setLocalLoading(false);
      }
    },
    [searchParams, router, setLocalLoading, pathname, isSubmitting],
  );

  // ✅ MODIFIÉ : Reset du rating avec application automatique
  const handleResetRating = useCallback(() => {
    setRating(0);
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.delete("ratings");
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  // Réinitialiser les filtres
  const resetFilters = useCallback(() => {
    setIsSubmitting(false);
    setLocalLoading(false);
    setMin("");
    setMax("");
    setRating(0);
    router.push(`${pathname}`);
  }, [router, setLocalLoading, pathname]);

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = useMemo(() => {
    return min || max || currentCategory || rating > 0;
  }, [min, max, currentCategory, rating]);

  return (
    <aside className="w-full">
      <div className="md:sticky md:top-20">
        {/* Header - Desktop uniquement */}
        <div className="hidden md:flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Filtres</h2>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-sm text-orange-600 cursor-pointer hover:text-orange-700 font-semibold transition-colors hover:underline"
              aria-label="Réinitialiser tous les filtres"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Contenu des filtres */}
        <div className="space-y-4">
          {/* Prix */}
          <div className="p-4 border border-gray-200 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold mb-3 text-gray-900">Prix (€)</h3>
            <div className="grid grid-cols-2 gap-x-2 mb-3">
              <div>
                <label
                  htmlFor="min-price"
                  className="text-xs text-gray-600 mb-1 block font-medium"
                >
                  Min
                </label>
                <input
                  id="min-price"
                  name="min"
                  className="appearance-none border border-gray-300 bg-white rounded-md py-2 px-3 hover:border-orange-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 w-full transition-all"
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={min}
                  onChange={(e) => setMin(e.target.value)}
                  aria-label="Prix minimum"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label
                  htmlFor="max-price"
                  className="text-xs text-gray-600 mb-1 block font-medium"
                >
                  Max
                </label>
                <input
                  id="max-price"
                  name="max"
                  className="appearance-none border border-gray-300 bg-white rounded-md py-2 px-3 hover:border-orange-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 w-full transition-all"
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={max}
                  onChange={(e) => setMax(e.target.value)}
                  aria-label="Prix maximum"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <button
              className={`w-full py-2 px-4 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-sunset hover:shadow-sunset-md hover-lift"
              } text-white cursor-pointer rounded-md transition-all font-semibold`}
              onClick={handlePriceFilter}
              aria-label="Appliquer les filtres de prix"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Chargement...
                </span>
              ) : (
                "Appliquer"
              )}
            </button>
          </div>

          {/* Catégories */}
          <div className="p-4 border border-gray-200 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold mb-3 text-gray-900">Catégories</h3>

            {isArrayEmpty(categories) ? (
              <div className="w-full text-center py-2">
                <p className="text-gray-500">Aucune catégorie disponible</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 hide-scrollbar">
                {categories?.map((category) => (
                  <button
                    key={category?._id}
                    className={`flex items-center w-full p-2 rounded-md transition-all cursor-pointer font-medium ${
                      currentCategory === category?._id
                        ? "bg-orange-50 text-orange-700 border-l-4 border-orange-500"
                        : "hover:bg-gray-50 text-gray-700 hover:text-orange-600"
                    }`}
                    onClick={() => handleCategoryClick(category?._id)}
                    aria-pressed={currentCategory === category?._id}
                    disabled={isSubmitting}
                  >
                    <span className="ml-2">{category?.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ✅ MODIFIÉ : Note (Ratings) - Application automatique au clic */}
          <div className="p-4 border border-gray-200 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold mb-3 text-gray-900">Note minimum</h3>

            <div className="flex flex-col items-center gap-3">
              <ReactStarsRating
                value={rating}
                isEdit={!isSubmitting}
                isHalf={true}
                primaryColor="#f97316"
                secondaryColor="#d1d5db"
                className="flex"
                starGap={6}
                count={5}
                size={28}
                onChange={handleRatingChange}
              />

              {rating > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-orange-600">
                    {rating.toFixed(1)} étoiles et plus
                  </span>
                  <button
                    onClick={handleResetRating}
                    className="text-xs text-gray-500 hover:text-red-600 underline"
                    disabled={isSubmitting}
                  >
                    Effacer
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bouton réinitialiser mobile */}
          {hasActiveFilters && (
            <div className="md:hidden">
              <button
                onClick={resetFilters}
                className="w-full py-2 text-center text-sm font-semibold text-red-600 hover:text-red-800 border border-red-200 cursor-pointer rounded-md hover:bg-red-50 transition-colors"
                aria-label="Réinitialiser tous les filtres"
                disabled={isSubmitting}
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Filters;
