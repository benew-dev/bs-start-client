"use client";

import { memo, useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import ResponsivePaginationComponent from "react-responsive-pagination";

const CustomPagination = memo(({ totalPages = 1 }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  // Calculer le numéro de page actuel de manière sécurisée
  const getCurrentPage = useCallback(() => {
    const pageParam = searchParams?.get("page");
    if (!pageParam) return 1;

    const parsedPage = parseInt(pageParam, 10);

    if (isNaN(parsedPage) || parsedPage < 1) {
      return 1;
    }

    return Math.min(parsedPage, Math.max(1, totalPages));
  }, [searchParams, totalPages]);

  const currentPage = getCurrentPage();

  // Réinitialiser l'état de navigation si l'URL change
  useEffect(() => {
    if (isNavigating) {
      setIsNavigating(false);
    }
  }, [searchParams]);

  // Gestion du changement de page avec feedback visuel
  const handlePageChange = useCallback(
    (newPage) => {
      if (isNavigating) return;

      if (newPage === currentPage) return;

      setIsNavigating(true);

      try {
        const params = new URLSearchParams(searchParams?.toString() || "");

        if (newPage === 1) {
          params.delete("page");
        } else {
          params.set("page", newPage.toString());
        }

        const query = params.toString();
        const path = query ? `${pathname}?${query}` : pathname;

        router.push(path);

        if (typeof window !== "undefined") {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      } catch (error) {
        console.error("Erreur de navigation:", error);
        setIsNavigating(false);
      }
    },
    [currentPage, searchParams, pathname, router, isNavigating],
  );

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex mt-8 justify-center" aria-live="polite">
      {isNavigating ? (
        <div className="flex items-center space-x-2 text-gradient-sunset">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-orange-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="font-semibold">
            Chargement de la page {currentPage}...
          </span>
        </div>
      ) : (
        <div className="pagination-sunset-wrapper">
          <ResponsivePaginationComponent
            current={currentPage}
            total={totalPages}
            onPageChange={handlePageChange}
            maxWidth={300}
            ariaPreviousLabel="Page précédente"
            ariaNextLabel="Page suivante"
            previousLabel="«"
            nextLabel="»"
          />

          {/* Styles personnalisés pour le thème Sunset */}
          <style jsx global>{`
            .pagination-sunset-wrapper .pagination {
              display: flex;
              list-style: none;
              padding: 0;
              margin: 0;
              gap: 0.5rem;
              align-items: center;
            }

            .pagination-sunset-wrapper .page-item {
              margin: 0;
            }

            .pagination-sunset-wrapper .page-link {
              display: flex;
              align-items: center;
              justify-content: center;
              min-width: 2.5rem;
              height: 2.5rem;
              padding: 0.5rem 0.75rem;
              border: 2px solid #fed7aa;
              background: white;
              color: #ea580c;
              font-weight: 600;
              border-radius: 0.5rem;
              cursor: pointer;
              transition: all 0.2s;
              text-decoration: none;
            }

            .pagination-sunset-wrapper .page-link:hover {
              background: linear-gradient(
                135deg,
                #f97316 0%,
                #ec4899 50%,
                #a855f7 100%
              );
              color: white;
              border-color: transparent;
              transform: translateY(-2px);
              box-shadow:
                0 10px 25px -5px rgba(249, 115, 22, 0.2),
                0 8px 10px -6px rgba(236, 72, 153, 0.2);
            }

            .pagination-sunset-wrapper .page-item.active .page-link {
              background: linear-gradient(
                135deg,
                #f97316 0%,
                #ec4899 50%,
                #a855f7 100%
              );
              color: white;
              border-color: transparent;
              box-shadow:
                0 10px 25px -5px rgba(249, 115, 22, 0.3),
                0 8px 10px -6px rgba(236, 72, 153, 0.3);
            }

            .pagination-sunset-wrapper .page-item.disabled .page-link {
              background: #f3f4f6;
              color: #9ca3af;
              border-color: #e5e7eb;
              cursor: not-allowed;
              opacity: 0.5;
            }

            .pagination-sunset-wrapper .page-item.disabled .page-link:hover {
              background: #f3f4f6;
              color: #9ca3af;
              border-color: #e5e7eb;
              transform: none;
              box-shadow: none;
            }

            /* Style pour les boutons précédent/suivant */
            .pagination-sunset-wrapper .page-item:first-child .page-link,
            .pagination-sunset-wrapper .page-item:last-child .page-link {
              font-size: 1.25rem;
              font-weight: bold;
              background: linear-gradient(
                135deg,
                #ffedd5 0%,
                #fce7f3 50%,
                #f3e8ff 100%
              );
              color: #ea580c;
            }

            .pagination-sunset-wrapper .page-item:first-child .page-link:hover,
            .pagination-sunset-wrapper .page-item:last-child .page-link:hover {
              background: linear-gradient(
                135deg,
                #f97316 0%,
                #ec4899 50%,
                #a855f7 100%
              );
              color: white;
            }

            /* Responsive */
            @media (max-width: 640px) {
              .pagination-sunset-wrapper .page-link {
                min-width: 2rem;
                height: 2rem;
                padding: 0.25rem 0.5rem;
                font-size: 0.875rem;
              }

              .pagination-sunset-wrapper .pagination {
                gap: 0.25rem;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
});

CustomPagination.displayName = "CustomPagination";

export default CustomPagination;
