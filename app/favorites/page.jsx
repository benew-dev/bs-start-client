import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth";
import { headers } from "next/headers";
import FavoriteProducts from "@/components/auth/FavoriteProducts";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Métadonnées pour SEO
export const metadata = {
  title: "Buy It Now - Mes Favoris",
  description: "Gérez vos produits favoris",
  robots: {
    index: false,
    follow: false,
  },
};

// Skeleton de chargement
const FavoritesSkeleton = () => (
  <div className="animate-pulse space-y-6" aria-busy="true" aria-live="polite">
    {/* Header skeleton */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-pink-100 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/6"></div>
        </div>
      </div>
    </div>

    {/* Grid skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="w-full h-48 bg-gray-200"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="flex gap-2">
              <div className="flex-1 h-10 bg-gray-200 rounded"></div>
              <div className="w-10 h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
    <span className="sr-only">Chargement des favoris...</span>
  </div>
);

/**
 * Page des favoris - Server Component
 * Vérifie l'authentification avant d'afficher le client component
 */
export default async function FavoritesPage() {
  // Vérifier l'authentification
  let user;
  try {
    const headersList = await headers();
    user = await getAuthenticatedUser(headersList);
  } catch (error) {
    console.error("Authentication error in favorites page", {
      error: error.message,
      route: "/favorites",
    });
    redirect("/error?code=auth_error");
  }

  // Rediriger vers login si non connecté
  if (!user) {
    const callbackPath = encodeURIComponent("/favorites");
    return redirect(`/login?callbackUrl=${callbackPath}`);
  }

  return (
    <>
      {/* Header de la page */}
      <section className="flex flex-row py-3 sm:py-7 bg-blue-100 print:hidden">
        <div className="container max-w-[var(--breakpoint-xl)] mx-auto px-4">
          <h2 className="font-medium text-2xl text-slate-800">MES FAVORIS</h2>
        </div>
      </section>

      {/* Contenu principal */}
      <section className="py-6 md:py-10">
        <div className="container max-w-[var(--breakpoint-xl)] mx-auto px-4">
          <div className="flex justify-center items-center flex-col md:flex-row -mx-4">
            <main className="md:w-2/3 lg:w-3/4 px-4 w-full">
              <article className="border border-gray-200 bg-white shadow-sm rounded-md mb-5 p-3 lg:p-5">
                <Suspense fallback={<FavoritesSkeleton />}>
                  <FavoriteProducts />
                </Suspense>
              </article>
            </main>
          </div>
        </div>
      </section>
    </>
  );
}
