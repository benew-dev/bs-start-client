import Hero from "@/components/home/Hero";
import HomeContent from "@/components/home/HomeContent";

export const metadata = {
  title: "Buy It Now - Votre boutique en ligne de confiance",
  description:
    "Découvrez des milliers de produits de qualité à des prix imbattables. Livraison rapide et paiement sécurisé.",
};

/**
 * Récupère les données de la page d'accueil depuis l'API
 * Version optimisée avec cache long (les données changent rarement)
 *
 * @returns {Promise<Object>} Données de la homepage avec sections ou valeurs par défaut
 */
const getHomePageData = async () => {
  const empty = {
    sections: [],
    featuredSection: null,
    categoriesSection: null,
    newArrivalsSection: null,
    advantagesSection: null,
    testimonialsSection: null,
    ctaSection: null,
  };

  try {
    const apiUrl = `${
      process.env.API_URL || "https://bs-start-client.vercel.app"
    }/api/homepage`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(apiUrl, {
      signal: controller.signal,
      next: {
        revalidate: 3600, // Cache Next.js de 1h
        tags: ["homepage"],
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error(`HomePage API error: ${res.status} ${res.statusText}`);
      return empty;
    }

    const body = await res.json();

    if (!body.success || !body.data) {
      console.error("HomePage API invalid response:", body);
      return empty;
    }

    // Normaliser : garantir que chaque clé existe
    return {
      sections: body.data.sections ?? [],
      featuredSection: body.data.featuredSection ?? null,
      categoriesSection: body.data.categoriesSection ?? null,
      newArrivalsSection: body.data.newArrivalsSection ?? null,
      advantagesSection: body.data.advantagesSection ?? null,
      testimonialsSection: body.data.testimonialsSection ?? null,
      ctaSection: body.data.ctaSection ?? null,
    };
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("HomePage API timeout (5s)");
    } else {
      console.error("HomePage API network error:", error.message);
    }
    return empty;
  }
};

export default async function Home() {
  const homePageData = await getHomePageData();

  if (process.env.NODE_ENV === "development") {
    console.log("HomePage data fetched:", {
      heroSlides: homePageData.sections.length,
      featured: !!homePageData.featuredSection,
      categories: !!homePageData.categoriesSection,
      newArrivals: !!homePageData.newArrivalsSection,
      advantages: !!homePageData.advantagesSection,
      testimonials: !!homePageData.testimonialsSection,
      cta: !!homePageData.ctaSection,
    });
  }

  return (
    <>
      {/* Hero carousel — lit homePageData.sections */}
      <Hero homePageData={homePageData} />

      {/* Contenu dynamique — lit toutes les autres sections */}
      <HomeContent homePageData={homePageData} />
    </>
  );
}
