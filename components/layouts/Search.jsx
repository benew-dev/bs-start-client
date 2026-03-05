"use client";

import { useState, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Search as SearchIcon } from "lucide-react";

// Fonction de debounce pour limiter les requêtes
const useDebounce = (fn, delay) => {
  const timeoutRef = useRef(null);

  return useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        fn(...args);
      }, delay);
    },
    [fn, delay],
  );
};

const Search = ({ setLoading }) => {
  const [keyword, setKeyword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef(null);

  const handleKeywordChange = useCallback((e) => {
    const value = e.target.value;
    setKeyword(value);
  }, []);

  const submitHandler = useCallback(
    async (e) => {
      if (e) e.preventDefault();

      if (isSubmitting) return;
      setIsSubmitting(true);
      setLoading(true);

      try {
        if (!keyword || keyword.trim() === "") {
          toast.error("Veuillez entrer un terme de recherche");
          setLoading(false);
          setIsSubmitting(false);
          return;
        }

        setLoading(false);
        setIsSubmitting(false);

        router.push(
          `${pathname}?keyword=${encodeURIComponent(keyword.trim())}`,
        );

        setLoading(false);
        setIsSubmitting(false);
      } catch (error) {
        if (error.inner && error.inner.length) {
          error.inner.forEach((err) => {
            toast.error(err.message);
          });
        } else {
          toast.error(
            error.message || "Une erreur est survenue lors de la recherche",
          );
        }

        setLoading?.(false);
        setIsSubmitting(false);
      }
    },
    [keyword, router, setLoading, pathname, isSubmitting],
  );

  const debouncedSubmit = useDebounce(submitHandler, 300);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        debouncedSubmit(e);
      }
    },
    [debouncedSubmit],
  );

  return (
    <form
      className="flex flex-nowrap items-center w-full"
      onSubmit={(e) => {
        e.preventDefault();
        debouncedSubmit(e);
      }}
      role="search"
      aria-label="Rechercher des produits"
    >
      <input
        ref={inputRef}
        className="grow appearance-none border border-gray-300 bg-white rounded-md mr-2 py-2 px-2 md:px-3 hover:border-orange-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-sm md:text-base transition-all placeholder-gray-400"
        type="search"
        placeholder="Rechercher..."
        value={keyword}
        onChange={handleKeywordChange}
        onKeyDown={handleKeyDown}
        aria-label="Terme de recherche"
        disabled={isSubmitting}
        required
      />
      <button
        type="button"
        className={`p-2 md:px-4 md:py-2 inline-flex items-center justify-center border-2 border-transparent ${
          isSubmitting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-sunset hover:shadow-sunset-md hover-lift"
        } text-white rounded-md transition-all flex-shrink-0`}
        onClick={debouncedSubmit}
        disabled={isSubmitting}
        aria-label="Lancer la recherche"
      >
        {isSubmitting ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <SearchIcon className="w-5 h-5" />
        )}
      </button>
    </form>
  );
};

export default Search;
