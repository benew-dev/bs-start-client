import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import dbConnect from "@/backend/config/dbConnect";
import HomePage from "@/backend/models/homepage";
import Product from "@/backend/models/product";
import Category from "@/backend/models/category";
import { captureException } from "@/monitoring/sentry";
import { withIntelligentRateLimit } from "@/utils/rateLimit";

/**
 * GET /api/homepage
 * Récupère toutes les données de la page d'accueil :
 * - sections[]         : hero slides
 * - featuredSection    : coups de cœur (avec produits populés)
 * - categoriesSection  : catégories (avec catégories populées)
 * - newArrivalsSection : nouveautés (avec produits populés)
 * - advantagesSection  : avantages
 * - testimonialsSection: témoignages
 * - ctaSection         : bandeau CTA final
 *
 * Rate limit : publicRead — 100 req/min anonyme, 200 req/min authentifié
 * Cache      : 1h (données rarement modifiées)
 */
export const GET = withIntelligentRateLimit(
  async function (req) {
    try {
      await dbConnect();

      const homePage = await HomePage.findOne()
        .populate(
          "featuredSection.products.product",
          "name price images slug ratings",
        )
        .populate(
          "newArrivalsSection.products.product",
          "name price images slug ratings",
        )
        .populate("categoriesSection.categories.category", "categoryName slug")
        .sort({ createdAt: -1 })
        .lean();

      // Aucune page configurée → réponse vide mais valide
      if (!homePage) {
        return NextResponse.json(
          {
            success: true,
            message: "No homepage configured",
            data: {
              sections: [],
              featuredSection: null,
              categoriesSection: null,
              newArrivalsSection: null,
              advantagesSection: null,
              testimonialsSection: null,
              ctaSection: null,
            },
            meta: {
              timestamp: new Date().toISOString(),
              hasData: false,
            },
          },
          { status: 200 },
        );
      }

      // ── Formatage hero slides ──────────────────────────────────────────
      // On garde public_id ET on ajoute publicId pour compatibilité Hero.jsx
      const formattedSections = (homePage.sections || []).map((section) => ({
        _id: section._id,
        title: section.title || "",
        subtitle: section.subtitle || "",
        text: section.text || "",
        image: {
          public_id: section.image?.public_id || "",
          publicId: section.image?.public_id || "",
          url: section.image?.url || "",
        },
      }));

      // ── Formatage sections actives uniquement ──────────────────────────
      const featuredSection = formatProductSection(homePage.featuredSection);
      const newArrivalsSection = formatProductSection(
        homePage.newArrivalsSection,
      );
      const categoriesSection = formatCategorySection(
        homePage.categoriesSection,
      );
      const advantagesSection = formatSimpleSection(homePage.advantagesSection);
      const testimonialsSection = formatSimpleSection(
        homePage.testimonialsSection,
      );
      const ctaSection = formatCtaSection(homePage.ctaSection);

      const responseData = {
        sections: formattedSections,
        featuredSection,
        categoriesSection,
        newArrivalsSection,
        advantagesSection,
        testimonialsSection,
        ctaSection,
      };

      // ETag basique pour cache conditionnel
      const dataHash = Buffer.from(JSON.stringify(responseData))
        .toString("base64")
        .substring(0, 20);

      return NextResponse.json(
        {
          success: true,
          data: responseData,
          meta: {
            timestamp: new Date().toISOString(),
            hasData: true,
            sectionsCount: formattedSections.length,
            etag: dataHash,
          },
        },
        {
          status: 200,
          headers: {
            "Cache-Control":
              "public, max-age=3600, stale-while-revalidate=7200",
            "CDN-Cache-Control": "max-age=7200",
            ETag: `"${dataHash}"`,
          },
        },
      );
    } catch (error) {
      console.error("HomePage GET error:", error.message);

      captureException(error, {
        tags: {
          component: "api",
          route: "homepage/GET",
          error_type: error.name,
        },
        extra: { message: error.message },
      });

      let status = 500;
      let message = "Failed to fetch homepage data";
      let code = "INTERNAL_ERROR";

      if (
        error.name === "MongoNetworkError" ||
        error.message?.includes("connection")
      ) {
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
    action: "publicRead",
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
      } catch {
        return {};
      }
    },
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de formatage
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retourne null si la section est absente ou inactive.
 * Formate les produits populés.
 */
function formatProductSection(section) {
  if (!section || section.isActive === false) return null;

  return {
    isActive: section.isActive ?? true,
    eyebrow: section.eyebrow || "",
    title: section.title || "",
    highlight: section.highlight || "",
    description: section.description || "",
    limit: section.limit || 3,
    products: (section.products || [])
      .filter((item) => item.product)
      .map((item) => ({
        product: {
          _id: item.product._id,
          name: item.product.name || "",
          price: item.product.price ?? 0,
          slug: item.product.slug || "",
          ratings: item.product.ratings ?? 0,
          images: item.product.images || [],
        },
        badge: item.badge || "",
        badgeColor: item.badgeColor || "orange",
        accentColor: item.accentColor || "orange",
        customDescription: item.customDescription || "",
      })),
  };
}

/**
 * Formate une section catégories avec populate.
 */
function formatCategorySection(section) {
  if (!section || section.isActive === false) return null;

  return {
    isActive: section.isActive ?? true,
    eyebrow: section.eyebrow || "",
    title: section.title || "",
    highlight: section.highlight || "",
    description: section.description || "",
    limit: section.limit || 6,
    categories: (section.categories || [])
      .filter((item) => item.category)
      .map((item) => ({
        category: {
          _id: item.category._id,
          categoryName: item.category.categoryName || "",
          slug: item.category.slug || "",
        },
        icon: item.icon || "",
        color: item.color || "orange",
      })),
  };
}

/**
 * Formate une section sans références (avantages, témoignages).
 */
function formatSimpleSection(section) {
  if (!section || section.isActive === false) return null;
  return section;
}

/**
 * Formate la section CTA.
 */
function formatCtaSection(section) {
  if (!section || section.isActive === false) return null;
  return section;
}
