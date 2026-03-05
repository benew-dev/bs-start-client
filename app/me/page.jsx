import { lazy, Suspense } from "react";

// Force dynamic rendering
export const dynamic = "force-dynamic";

const ProfileSkeleton = () => (
  <div className="animate-pulse space-y-6" aria-busy="true" aria-live="polite">
    {/* Skeleton pour les tabs */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex gap-4">
        <div className="h-10 bg-gray-200 rounded w-32"></div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>
    </div>

    {/* Skeleton pour le contenu */}
    <div className="space-y-4">
      <div className="h-10 bg-gray-200 rounded w-1/4 mb-6"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2.5"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2.5"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    </div>
    <span className="sr-only">Chargement du profil...</span>
  </div>
);

// Import du composant avec tabs
const ProfileWithTabs = lazy(() => import("@/components/auth/ProfileWithTabs"));

export const metadata = {
  title: "Buy It Now - Mon Profil",
  description: "Gérez votre compte, vos informations et vos favoris",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProfilePage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileWithTabs />
      </Suspense>
    </div>
  );
}
