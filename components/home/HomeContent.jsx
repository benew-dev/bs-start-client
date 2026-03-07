"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Truck,
  RotateCcw,
  Tag,
  Headphones,
  Star,
  ArrowRight,
  ShoppingBag,
  Watch,
  Smartphone,
  Home,
  Dumbbell,
  Gem,
  Quote,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Données statiques de fallback (affichées quand une section n'est pas
// configurée en BDD)
// ─────────────────────────────────────────────────────────────────────────────

const FALLBACK_FEATURED = [
  {
    id: 1,
    name: "Sac en cuir véritable",
    category: "Accessoires",
    price: "89.99 €",
    originalPrice: "129.99 €",
    discount: "-31%",
    rating: 4.8,
    reviews: 142,
    image:
      "https://res.cloudinary.com/duzebhr9l/image/upload/v1760797628/buyitnow/products/umzsynq3p8hvaoli8jkc.jpg",
    badge: "Bestseller",
    badgeColor: "bg-orange-500",
    href: "/shop",
  },
  {
    id: 2,
    name: "Montre classique",
    category: "Bijoux & Montres",
    price: "59.99 €",
    originalPrice: "89.99 €",
    discount: "-33%",
    rating: 4.6,
    reviews: 87,
    image:
      "https://res.cloudinary.com/duzebhr9l/image/upload/v1760797698/buyitnow/products/hhr6m635axn9nqt0gynw.jpg",
    badge: "Nouveauté",
    badgeColor: "bg-pink-500",
    href: "/shop",
  },
  {
    id: 3,
    name: "Sneakers tendance",
    category: "Chaussures",
    price: "74.99 €",
    originalPrice: "99.99 €",
    discount: "-25%",
    rating: 4.9,
    reviews: 203,
    image:
      "https://res.cloudinary.com/duzebhr9l/image/upload/v1760799305/buyitnow/products/vq8vn3s70cb5wv4is7h0.jpg",
    badge: "Populaire",
    badgeColor: "bg-purple-500",
    href: "/shop",
  },
];

const FALLBACK_CATEGORIES = [
  {
    label: "Mode",
    icon: ShoppingBag,
    color: "orange",
    href: "/shop?category=mode",
  },
  {
    label: "Montres & Bijoux",
    icon: Watch,
    color: "pink",
    href: "/shop?category=bijoux",
  },
  {
    label: "Électronique",
    icon: Smartphone,
    color: "purple",
    href: "/shop?category=electronique",
  },
  {
    label: "Maison",
    icon: Home,
    color: "orange",
    href: "/shop?category=maison",
  },
  {
    label: "Sport",
    icon: Dumbbell,
    color: "pink",
    href: "/shop?category=sport",
  },
  {
    label: "Accessoires",
    icon: Gem,
    color: "purple",
    href: "/shop?category=accessoires",
  },
];

const FALLBACK_NEW_ARRIVALS = [
  {
    id: 4,
    name: "Veste en denim premium",
    category: "Vêtements",
    description:
      "Une coupe intemporelle taillée dans un denim de qualité supérieure. Parfaite pour toutes les saisons.",
    price: "64.99 €",
    originalPrice: "94.99 €",
    discount: "-32%",
    rating: 4.7,
    reviews: 156,
    image:
      "https://res.cloudinary.com/duzebhr9l/image/upload/v1760863316/buyitnow/products/qesnmyibwgromdien091.jpg",
    badge: "Nouveau",
    accent: "orange",
    href: "/shop",
  },
  {
    id: 5,
    name: "Lunettes de soleil",
    category: "Accessoires",
    description:
      "Protection UV400 et style contemporain. Une paire indispensable pour affronter le soleil avec élégance.",
    price: "39.99 €",
    originalPrice: "59.99 €",
    discount: "-33%",
    rating: 4.5,
    reviews: 94,
    image:
      "https://res.cloudinary.com/duzebhr9l/image/upload/v1760799022/buyitnow/products/rebakyhsr1zfkvz8r4jt.jpg",
    badge: "Tendance",
    accent: "pink",
    href: "/shop",
  },
];

const FALLBACK_ADVANTAGES = [
  {
    icon: Truck,
    title: "Livraison rapide",
    description:
      "Commandez avant 14h et recevez votre colis dès le lendemain partout en France.",
    color: "orange",
  },
  {
    icon: RotateCcw,
    title: "Retours gratuits",
    description:
      "Pas satisfait ? Retournez votre commande sous 30 jours, sans frais et sans questions.",
    color: "pink",
  },
  {
    icon: Tag,
    title: "Meilleur prix garanti",
    description:
      "Nous nous alignons sur tout prix inférieur trouvé ailleurs pour le même produit.",
    color: "purple",
  },
  {
    icon: Headphones,
    title: "Support 7j/7",
    description:
      "Notre équipe est disponible tous les jours pour répondre à toutes vos questions.",
    color: "orange",
  },
];

const FALLBACK_TESTIMONIALS = [
  {
    id: 1,
    name: "Sophie M.",
    location: "Paris",
    rating: 5,
    text: "Commande reçue en 24h, emballage soigné et produit exactement comme décrit. Je recommande vivement !",
    initials: "SM",
    accentColor: "bg-orange-500",
  },
  {
    id: 2,
    name: "Thomas R.",
    location: "Lyon",
    rating: 5,
    text: "Service client très réactif, j'avais une question sur ma commande et j'ai eu une réponse en moins d'une heure.",
    initials: "TR",
    accentColor: "bg-pink-500",
  },
  {
    id: 3,
    name: "Camille D.",
    location: "Bordeaux",
    rating: 4,
    text: "Excellent rapport qualité-prix. La veste que j'ai commandée est de très bonne qualité, bien mieux que ce que j'espérais.",
    initials: "CD",
    accentColor: "bg-purple-500",
  },
];

const FALLBACK_CTA = {
  eyebrow: "Offre de bienvenue",
  title: "Jusqu'à",
  highlight: "-40%",
  titleEnd: "sur vos premières commandes",
  description:
    "Inscrivez-vous aujourd'hui et profitez de promotions exclusives réservées à nos nouveaux membres.",
  primaryButtonText: "Créer un compte",
  primaryButtonLink: "/register",
  secondaryButtonText: "Explorer la boutique",
  secondaryButtonLink: "/shop",
};

// ─────────────────────────────────────────────────────────────────────────────
// Utilitaires de couleur Tailwind
// ─────────────────────────────────────────────────────────────────────────────

const COLOR_MAP = {
  orange: {
    bg: "bg-orange-100",
    text: "text-orange-600",
    border: "border-orange-200",
    hover: "hover:bg-orange-50 hover:border-orange-300",
  },
  pink: {
    bg: "bg-pink-100",
    text: "text-pink-600",
    border: "border-pink-200",
    hover: "hover:bg-pink-50 hover:border-pink-300",
  },
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-600",
    border: "border-purple-200",
    hover: "hover:bg-purple-50 hover:border-purple-300",
  },
  green: {
    bg: "bg-green-100",
    text: "text-green-600",
    border: "border-green-200",
    hover: "hover:bg-green-50 hover:border-green-300",
  },
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-600",
    border: "border-blue-200",
    hover: "hover:bg-blue-50 hover:border-blue-300",
  },
};

const ACCENT_BG = {
  orange: "bg-orange-500",
  pink: "bg-pink-500",
  purple: "bg-purple-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
};

// ─────────────────────────────────────────────────────────────────────────────
// Composants partagés
// ─────────────────────────────────────────────────────────────────────────────

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= Math.round(rating)
              ? "text-orange-400 fill-orange-400"
              : "text-gray-300 fill-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  eyebrowColor = "text-orange-600",
  title,
  highlight,
  description,
}) {
  return (
    <div className="text-center mb-12">
      {eyebrow && (
        <p
          className={`text-sm font-medium uppercase tracking-wider mb-2 ${eyebrowColor}`}
        >
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
        {title}{" "}
        {highlight && <span className="text-gradient-sunset">{highlight}</span>}
      </h2>
      {description && (
        <p className="text-gray-500 max-w-xl mx-auto">{description}</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 1 — Coups de Cœur
// ─────────────────────────────────────────────────────────────────────────────

function FeaturedSection({ data }) {
  // Si données BDD disponibles → affichage dynamique
  if (data?.products?.length > 0) {
    const products = data.products.slice(0, data.limit || 3);
    return (
      <section className="py-16 md:py-20">
        <div className="container max-w-[1440px] mx-auto px-4">
          <SectionHeader
            eyebrow={data.eyebrow || "Sélection exclusive"}
            title={data.title || "Nos"}
            highlight={data.highlight || "Coups de Cœur"}
            description={data.description}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {products.map((item) => {
              const product = item.product;
              const imageUrl = product.images?.[0]?.url;
              const badgeClass = ACCENT_BG[item.badgeColor] || "bg-orange-500";
              const href = product.slug ? `/products/${product.slug}` : "/shop";

              return (
                <div
                  key={product._id}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-sunset-md transition-all duration-300 hover-lift border border-gray-100 flex flex-col"
                >
                  <div className="relative h-64 overflow-hidden shrink-0">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <ShoppingBag className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    {item.badge && (
                      <span
                        className={`absolute top-3 left-3 ${badgeClass} text-white text-xs font-semibold px-2.5 py-1 rounded-full`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-base font-semibold text-gray-800 mb-2">
                      {product.name}
                    </h3>
                    {product.ratings > 0 && (
                      <div className="flex items-center gap-1.5 mb-3">
                        <StarRating rating={product.ratings} />
                      </div>
                    )}
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-lg font-bold text-gray-900">
                        {product.price?.toFixed(2)} €
                      </span>
                    </div>
                    <Link
                      href={href}
                      className="mt-auto w-full block text-center py-2.5 text-sm font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-all"
                    >
                      Voir le produit
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-sunset text-white font-semibold rounded-lg hover:shadow-sunset-lg hover-lift transition-all"
            >
              Voir tous nos produits
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Fallback statique
  return (
    <section className="py-16 md:py-20">
      <div className="container max-w-[1440px] mx-auto px-4">
        <SectionHeader
          eyebrow="Sélection exclusive"
          title="Nos"
          highlight="Coups de Cœur"
          description="Des produits soigneusement sélectionnés pour vous offrir qualité et style au meilleur prix."
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {FALLBACK_FEATURED.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-sunset-md transition-all duration-300 hover-lift border border-gray-100 flex flex-col"
            >
              <div className="relative h-64 overflow-hidden shrink-0">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <span
                  className={`absolute top-3 left-3 ${product.badgeColor} text-white text-xs font-semibold px-2.5 py-1 rounded-full`}
                >
                  {product.badge}
                </span>
                <span className="absolute top-3 right-3 bg-white text-orange-600 text-xs font-bold px-2.5 py-1 rounded-full shadow">
                  {product.discount}
                </span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <p className="text-xs text-gray-400 mb-1">{product.category}</p>
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1.5 mb-3">
                  <StarRating rating={product.rating} />
                  <span className="text-xs text-gray-500">
                    ({product.reviews})
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-lg font-bold text-gray-900">
                    {product.price}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    {product.originalPrice}
                  </span>
                </div>
                <Link
                  href={product.href}
                  className="mt-auto w-full block text-center py-2.5 text-sm font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-all"
                >
                  Voir le produit
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-sunset text-white font-semibold rounded-lg hover:shadow-sunset-lg hover-lift transition-all"
          >
            Voir tous nos produits
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 2 — Catégories
// ─────────────────────────────────────────────────────────────────────────────

function CategoriesSection({ data }) {
  // Icônes par défaut disponibles pour les catégories BDD
  const ICON_MAP = {
    ShoppingBag,
    Watch,
    Smartphone,
    Home,
    Dumbbell,
    Gem,
  };

  if (data?.categories?.length > 0) {
    const cats = data.categories.slice(0, data.limit || 6);
    return (
      <section className="py-16 md:py-20 bg-sunset-light">
        <div className="container max-w-[1440px] mx-auto px-4">
          <SectionHeader
            eyebrow={data.eyebrow || "Explorez nos rayons"}
            eyebrowColor="text-pink-600"
            title={data.title || "Nos"}
            highlight={data.highlight || "Catégories"}
            description={data.description}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {cats.map((item, i) => {
              const color = item.color || "orange";
              const { bg, text, border, hover } =
                COLOR_MAP[color] || COLOR_MAP.orange;
              // Essayer de résoudre l'icône stockée, sinon ShoppingBag par défaut
              const Icon = ICON_MAP[item.icon] || ShoppingBag;
              const href = item.category.slug
                ? `/shop?category=${item.category.slug}`
                : "/shop";

              return (
                <Link
                  key={item.category._id || i}
                  href={href}
                  className={`flex flex-col items-center gap-3 p-5 bg-white rounded-xl border-2 ${border} ${hover} transition-all duration-300 hover-lift shadow-sm group`}
                >
                  <div
                    className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`w-6 h-6 ${text}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center leading-tight">
                    {item.category.categoryName}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Fallback statique
  return (
    <section className="py-16 md:py-20 bg-sunset-light">
      <div className="container max-w-[1440px] mx-auto px-4">
        <SectionHeader
          eyebrow="Explorez nos rayons"
          eyebrowColor="text-pink-600"
          title="Nos"
          highlight="Catégories"
          description="Trouvez exactement ce que vous cherchez parmi notre large sélection de produits."
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {FALLBACK_CATEGORIES.map((cat, i) => {
            const { bg, text, border, hover } = COLOR_MAP[cat.color];
            const Icon = cat.icon;
            return (
              <Link
                key={i}
                href={cat.href}
                className={`flex flex-col items-center gap-3 p-5 bg-white rounded-xl border-2 ${border} ${hover} transition-all duration-300 hover-lift shadow-sm group`}
              >
                <div
                  className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-6 h-6 ${text}`} />
                </div>
                <span className="text-sm font-medium text-gray-700 text-center leading-tight">
                  {cat.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 3 — Nouveautés
// ─────────────────────────────────────────────────────────────────────────────

function NewArrivalsSection({ data }) {
  if (data?.products?.length > 0) {
    const products = data.products.slice(0, data.limit || 2);
    return (
      <section className="py-16 md:py-20">
        <div className="container max-w-[1440px] mx-auto px-4">
          <SectionHeader
            eyebrow={data.eyebrow || "Vient d'arriver"}
            title={data.title || "Nouveautés de"}
            highlight={data.highlight || "la semaine"}
            description={data.description}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((item) => {
              const product = item.product;
              const imageUrl = product.images?.[0]?.url;
              const color = item.accentColor || "orange";
              const { bg, text } = COLOR_MAP[color] || COLOR_MAP.orange;
              const badgeClass = ACCENT_BG[color] || "bg-orange-500";
              const href = product.slug ? `/products/${product.slug}` : "/shop";

              return (
                <div
                  key={product._id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-sunset-md transition-all duration-300 border border-gray-100 flex flex-col sm:flex-row"
                >
                  <div className="relative sm:w-2/5 h-64 sm:h-auto overflow-hidden shrink-0">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 40vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <ShoppingBag className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    {item.badge && (
                      <span
                        className={`absolute top-3 left-3 ${bg} ${text} text-xs font-semibold px-2.5 py-1 rounded-full`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-6 flex flex-col justify-center flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    {item.customDescription && (
                      <p className="text-sm text-gray-500 leading-relaxed mb-4">
                        {item.customDescription}
                      </p>
                    )}
                    {product.ratings > 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        <StarRating rating={product.ratings} />
                      </div>
                    )}
                    <div className="flex items-baseline gap-2 mb-5">
                      <span className="text-2xl font-bold text-gray-900">
                        {product.price?.toFixed(2)} €
                      </span>
                    </div>
                    <Link
                      href={href}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-sunset text-white text-sm font-semibold rounded-lg hover:shadow-sunset-lg hover-lift transition-all self-start"
                    >
                      Découvrir
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Fallback statique
  return (
    <section className="py-16 md:py-20">
      <div className="container max-w-[1440px] mx-auto px-4">
        <SectionHeader
          eyebrow="Vient d'arriver"
          title="Nouveautés de"
          highlight="la semaine"
          description="Découvrez nos dernières arrivées, sélectionnées avec soin pour vous."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FALLBACK_NEW_ARRIVALS.map((product) => {
            const { bg, text } = COLOR_MAP[product.accent];
            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-sunset-md transition-all duration-300 border border-gray-100 flex flex-col sm:flex-row"
              >
                <div className="relative sm:w-2/5 h-64 sm:h-auto overflow-hidden shrink-0">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 40vw, 25vw"
                  />
                  <span
                    className={`absolute top-3 left-3 ${bg} ${text} text-xs font-semibold px-2.5 py-1 rounded-full`}
                  >
                    {product.badge}
                  </span>
                </div>
                <div className="p-6 flex flex-col justify-center flex-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                    {product.category}
                  </p>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">
                    {product.description}
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    <StarRating rating={product.rating} />
                    <span className="text-xs text-gray-500">
                      ({product.reviews} avis)
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-5">
                    <span className="text-2xl font-bold text-gray-900">
                      {product.price}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      {product.originalPrice}
                    </span>
                    <span
                      className={`text-xs font-bold ${text} ${bg} px-2 py-0.5 rounded-full`}
                    >
                      {product.discount}
                    </span>
                  </div>
                  <Link
                    href={product.href}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-sunset text-white text-sm font-semibold rounded-lg hover:shadow-sunset-lg hover-lift transition-all self-start"
                  >
                    Découvrir
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 4 — Avantages
// ─────────────────────────────────────────────────────────────────────────────

// Icônes disponibles pour les avantages BDD (l'admin stocke le nom de l'icône)
const ADVANTAGE_ICONS = {
  Truck,
  RotateCcw,
  Tag,
  Headphones,
  ShoppingBag,
  Star,
};

function AdvantagesSection({ data }) {
  if (data?.advantages?.length > 0) {
    return (
      <section className="py-16 md:py-20 bg-sunset-light">
        <div className="container max-w-[1440px] mx-auto px-4">
          <SectionHeader
            eyebrow={data.eyebrow || "Notre engagement"}
            eyebrowColor="text-pink-600"
            title={data.title || "Pourquoi choisir"}
            highlight={data.highlight || "Buy It Now ?"}
            description={data.description}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.advantages.map((adv, i) => {
              const color = adv.color || "orange";
              const { bg, text } = COLOR_MAP[color] || COLOR_MAP.orange;
              const Icon = ADVANTAGE_ICONS[adv.icon] || Headphones;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-sunset transition-all duration-300"
                >
                  <div
                    className={`w-14 h-14 ${bg} rounded-full flex items-center justify-center mb-4`}
                  >
                    <Icon className={`w-7 h-7 ${text}`} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    {adv.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {adv.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Fallback statique
  return (
    <section className="py-16 md:py-20 bg-sunset-light">
      <div className="container max-w-[1440px] mx-auto px-4">
        <SectionHeader
          eyebrow="Notre engagement"
          eyebrowColor="text-pink-600"
          title="Pourquoi choisir"
          highlight="Buy It Now ?"
          description="Nous mettons tout en œuvre pour vous offrir une expérience shopping irréprochable, de la commande à la livraison."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FALLBACK_ADVANTAGES.map((adv, i) => {
            const { bg, text } = COLOR_MAP[adv.color];
            const Icon = adv.icon;
            return (
              <div
                key={i}
                className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-sunset transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 ${bg} rounded-full flex items-center justify-center mb-4`}
                >
                  <Icon className={`w-7 h-7 ${text}`} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  {adv.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {adv.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 5 — Témoignages + CTA
// ─────────────────────────────────────────────────────────────────────────────

function TestimonialsSection({ data }) {
  if (data?.testimonials?.length > 0) {
    return (
      <div className="container max-w-[1440px] mx-auto px-4">
        <SectionHeader
          eyebrow={data.eyebrow || "Ils nous font confiance"}
          eyebrowColor="text-purple-600"
          title={data.title || "Ce que disent"}
          highlight={data.highlight || "nos clients"}
          description={data.description}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {data.testimonials.map((t, i) => {
            const accentBg = ACCENT_BG[t.accentColor] || "bg-orange-500";
            return (
              <div
                key={i}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-sunset transition-all duration-300 flex flex-col"
              >
                <Quote className="w-8 h-8 text-orange-200 mb-4 shrink-0" />
                <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-5">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div
                    className={`w-10 h-10 ${accentBg} rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0`}
                  >
                    {t.initials || t.name?.[0] || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {t.name}
                    </p>
                    {t.location && (
                      <p className="text-xs text-gray-400">{t.location}</p>
                    )}
                  </div>
                  <div className="ml-auto">
                    <StarRating rating={t.rating || 5} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Fallback statique
  return (
    <div className="container max-w-[1440px] mx-auto px-4">
      <SectionHeader
        eyebrow="Ils nous font confiance"
        eyebrowColor="text-purple-600"
        title="Ce que disent"
        highlight="nos clients"
        description="Des milliers de clients satisfaits. Voici ce qu'ils pensent de leur expérience Buy It Now."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {FALLBACK_TESTIMONIALS.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-sunset transition-all duration-300 flex flex-col"
          >
            <Quote className="w-8 h-8 text-orange-200 mb-4 shrink-0" />
            <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-5">
              "{t.text}"
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <div
                className={`w-10 h-10 ${t.accentColor} rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0`}
              >
                {t.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                <p className="text-xs text-gray-400">{t.location}</p>
              </div>
              <div className="ml-auto">
                <StarRating rating={t.rating} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CtaBanner({ data }) {
  const cta = data?.isActive !== false && data?.title ? data : FALLBACK_CTA;

  return (
    <div className="container max-w-[1440px] mx-auto px-4 pb-16">
      <div className="relative bg-gradient-sunset rounded-2xl overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-16 py-14">
          <div className="text-center md:text-left text-white">
            {cta.eyebrow && (
              <p className="text-sm font-medium uppercase tracking-wider text-white/80 mb-2">
                {cta.eyebrow}
              </p>
            )}
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              {cta.title}{" "}
              {cta.highlight && (
                <span className="text-yellow-300">{cta.highlight}</span>
              )}{" "}
              {cta.titleEnd}
            </h2>
            {cta.description && (
              <p className="text-white/80 text-lg max-w-md">
                {cta.description}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            {cta.primaryButtonText && (
              <Link
                href={cta.primaryButtonLink || "/register"}
                className="px-8 py-4 bg-white text-orange-600 font-bold rounded-lg hover:bg-orange-50 transition-all shadow-lg hover-lift text-center whitespace-nowrap"
              >
                {cta.primaryButtonText}
              </Link>
            )}
            {cta.secondaryButtonText && (
              <Link
                href={cta.secondaryButtonLink || "/shop"}
                className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all text-center whitespace-nowrap"
              >
                {cta.secondaryButtonText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────────────────────────

const HomeContent = ({ homePageData = {} }) => {
  const {
    featuredSection,
    categoriesSection,
    newArrivalsSection,
    advantagesSection,
    testimonialsSection,
    ctaSection,
  } = homePageData;

  return (
    <div className="bg-gray-50">
      <FeaturedSection data={featuredSection} />
      <CategoriesSection data={categoriesSection} />
      <NewArrivalsSection data={newArrivalsSection} />
      <AdvantagesSection data={advantagesSection} />

      <section className="py-16 md:py-20">
        <TestimonialsSection data={testimonialsSection} />
        <CtaBanner data={ctaSection} />
      </section>
    </div>
  );
};

export default HomeContent;
