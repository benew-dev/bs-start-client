import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import dbConnect from "@/backend/config/dbConnect";
import HomePage from "@/backend/models/homepage";
import { captureException } from "@/monitoring/sentry";
import { withIntelligentRateLimit } from "@/utils/rateLimit";

/**
 * GET /api/homepage
 * Récupère les données de la page d'accueil avec les 3 sections
 * Rate limit: Configuration intelligente - publicRead (100 req/min) ou authenticatedRead (200 req/min)
 *
 * Headers de sécurité gérés par next.config.mjs pour /api/homepage :
 * - Cache-Control: public, max-age=3600, stale-while-revalidate=7200
 * - CDN-Cache-Control: max-age=7200
 * - X-Content-Type-Options: nosniff
 * - Vary: Accept-Encoding
 *
 * Headers globaux de sécurité (toutes routes) :
 * - Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
 * - X-Frame-Options: SAMEORIGIN
 * - Referrer-Policy: strict-origin-when-cross-origin
 * - Permissions-Policy: [configuration restrictive]
 * - Content-Security-Policy: [configuration complète]
 *
 * Note: Les données de la homepage sont publiques avec cache long
 * car elles changent rarement
 */
export const GET = withIntelligentRateLimit(
  async function (req) {
    try {
      // Connexion DB
      await dbConnect();

      // Récupérer la page d'accueil (prendre la plus récente)
      const homePage = await HomePage.findOne()
        .select("sections")
        .sort({ createdAt: -1 })
        .lean();

      // Si aucune page d'accueil n'existe
      if (!homePage) {
        return NextResponse.json(
          {
            success: true,
            message: "No homepage configured",
            data: {
              sections: [],
            },
            meta: {
              timestamp: new Date().toISOString(),
              hasData: false,
              sectionsCount: 0,
            },
          },
          { status: 200 },
        );
      }

      // Formater les sections
      const formattedSections = (homePage.sections || []).map((section) => ({
        title: section.title || "",
        subtitle: section.subtitle || "",
        text: section.text || "",
        image: {
          publicId: section.image?.public_id || "",
          url: section.image?.url || "",
        },
      }));

      // Préparer la réponse
      const responseData = {
        sections: formattedSections,
      };

      // Calculer un hash simple pour l'ETag (optionnel)
      const dataHash = Buffer.from(JSON.stringify(responseData))
        .toString("base64")
        .substring(0, 20);

      // Headers de cache pour la homepage (change rarement)
      const cacheHeaders = {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=7200", // 1h cache, 2h stale
        "CDN-Cache-Control": "max-age=7200", // 2h pour CDN
        ETag: `"${dataHash}"`,
      };

      return NextResponse.json(
        {
          success: true,
          data: responseData,
          meta: {
            timestamp: new Date().toISOString(),
            cached: true,
            cacheMaxAge: 3600,
            etag: dataHash,
            hasData: true,
            sectionsCount: formattedSections.length,
          },
        },
        {
          status: 200,
          headers: cacheHeaders,
        },
      );
    } catch (error) {
      console.error("HomePage fetch error:", error.message);

      // Capturer seulement les vraies erreurs système
      captureException(error, {
        tags: {
          component: "api",
          route: "homepage/GET",
          error_type: error.name,
        },
        extra: {
          message: error.message,
          stack: error.stack,
        },
      });

      // Gestion améliorée des erreurs
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
    action: "publicRead", // Données publiques - 100 req/min anonyme, 200 req/min authentifié
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
          "[HOMEPAGE] Error extracting user from JWT:",
          error.message,
        );
        return {};
      }
    },
  },
);
