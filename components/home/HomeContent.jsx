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

// ─── Données statiques ────────────────────────────────────────────────────────

// Section 1 — 3 premiers produits
const featuredProducts = [
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
  },
];

// Section 3 — 2 produits en avant
const newArrivals = [
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
  },
];

// Section 2 — Catégories
const categories = [
  { label: "Mode", icon: ShoppingBag, color: "orange", href: "/shop?category=mode" },
  { label: "Montres & Bijoux", icon: Watch, color: "pink", href: "/shop?category=bijoux" },
  { label: "Électronique", icon: Smartphone, color: "purple", href: "/shop?category=electronique" },
  { label: "Maison", icon: Home, color: "orange", href: "/shop?category=maison" },
  { label: "Sport", icon: Dumbbell, color: "pink", href: "/shop?category=sport" },
  { label: "Accessoires", icon: Gem, color: "purple", href: "/shop?category=accessoires" },
];

// Section 4 — Avantages
const advantages = [
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

// Section 5 — Témoignages
const testimonials = [
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

const colorMap = {
  orange: { bg: "bg-orange-100", text: "text-orange-600", border: "border-orange-200", hover: "hover:bg-orange-50 hover:border-orange-300" },
  pink:   { bg: "bg-pink-100",   text: "text-pink-600",   border: "border-pink-200",   hover: "hover:bg-pink-50 hover:border-pink-300" },
  purple: { bg: "bg-purple-100", text: "text-purple-600", border: "border-purple-200", hover: "hover:bg-purple-50 hover:border-purple-300" },
};

// ─── Sous-composants ──────────────────────────────────────────────────────────

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

function SectionHeader({ eyebrow, eyebrowColor = "text-orange-600", title, highlight, description }) {
  return (
    <div className="text-center mb-12">
      <p className={`text-sm font-medium uppercase tracking-wider mb-2 ${eyebrowColor}`}>
        {eyebrow}
      </p>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
        {title} <span className="text-gradient-sunset">{highlight}</span>
      </h2>
      {description && (
        <p className="text-gray-500 max-w-xl mx-auto">{description}</p>
      )}
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

const HomeContent = () => {
  return (
    <div className="bg-gray-50">

      {/* ── Section 1 : Nos Coups de Cœur (3 images) ─────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="container max-w-[1440px] mx-auto px-4">
          <SectionHeader
            eyebrow="Sélection exclusive"
            title="Nos"
            highlight="Coups de Cœur"
            description="Des produits soigneusement sélectionnés pour vous offrir qualité et style au meilleur prix."
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
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
                  <span className={`absolute top-3 left-3 ${product.badgeColor} text-white text-xs font-semibold px-2.5 py-1 rounded-full`}>
                    {product.badge}
                  </span>
                  <span className="absolute top-3 right-3 bg-white text-orange-600 text-xs font-bold px-2.5 py-1 rounded-full shadow">
                    {product.discount}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs text-gray-400 mb-1">{product.category}</p>
                  <h3 className="text-base font-semibold text-gray-800 mb-2">{product.name}</h3>
                  <div className="flex items-center gap-1.5 mb-3">
                    <StarRating rating={product.rating} />
                    <span className="text-xs text-gray-500">({product.reviews})</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-lg font-bold text-gray-900">{product.price}</span>
                    <span className="text-sm text-gray-400 line-through">{product.originalPrice}</span>
                  </div>
                  <Link
                    href="/shop"
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

      {/* ── Section 2 : Catégories populaires ────────────────────────────── */}
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
            {categories.map((cat, i) => {
              const { bg, text, border, hover } = colorMap[cat.color];
              const Icon = cat.icon;
              return (
                <Link
                  key={i}
                  href={cat.href}
                  className={`flex flex-col items-center gap-3 p-5 bg-white rounded-xl border-2 ${border} ${hover} transition-all duration-300 hover-lift shadow-sm group`}
                >
                  <div className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
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

      {/* ── Section 3 : Nouveautés (2 images) ────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="container max-w-[1440px] mx-auto px-4">
          <SectionHeader
            eyebrow="Vient d'arriver"
            title="Nouveautés de"
            highlight="la semaine"
            description="Découvrez nos dernières arrivées, sélectionnées avec soin pour vous."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {newArrivals.map((product) => {
              const { bg, text } = colorMap[product.accent];
              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-sunset-md transition-all duration-300 border border-gray-100 flex flex-col sm:flex-row"
                >
                  {/* Image */}
                  <div className="relative sm:w-2/5 h-64 sm:h-auto overflow-hidden shrink-0">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 40vw, 25vw"
                    />
                    <span className={`absolute top-3 left-3 ${bg} ${text} text-xs font-semibold px-2.5 py-1 rounded-full`}>
                      {product.badge}
                    </span>
                  </div>

                  {/* Infos */}
                  <div className="p-6 flex flex-col justify-center flex-1">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">{product.category}</p>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">{product.description}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <StarRating rating={product.rating} />
                      <span className="text-xs text-gray-500">({product.reviews} avis)</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-5">
                      <span className="text-2xl font-bold text-gray-900">{product.price}</span>
                      <span className="text-sm text-gray-400 line-through">{product.originalPrice}</span>
                      <span className={`text-xs font-bold ${text} ${bg} px-2 py-0.5 rounded-full`}>
                        {product.discount}
                      </span>
                    </div>
                    <Link
                      href="/shop"
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

      {/* ── Section 4 : Pourquoi Buy It Now ───────────────────────────────── */}
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
            {advantages.map((adv, i) => {
              const { bg, text } = colorMap[adv.color];
              const Icon = adv.icon;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-sunset transition-all duration-300"
                >
                  <div className={`w-14 h-14 ${bg} rounded-full flex items-center justify-center mb-4`}>
                    <Icon className={`w-7 h-7 ${text}`} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{adv.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{adv.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 5 : Témoignages + CTA ────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="container max-w-[1440px] mx-auto px-4">
          <SectionHeader
            eyebrow="Ils nous font confiance"
            eyebrowColor="text-purple-600"
            title="Ce que disent"
            highlight="nos clients"
            description="Des milliers de clients satisfaits. Voici ce qu'ils pensent de leur expérience Buy It Now."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-sunset transition-all duration-300 flex flex-col"
              >
                {/* Icône quote */}
                <Quote className="w-8 h-8 text-orange-200 mb-4 shrink-0" />

                {/* Texte */}
                <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-5">
                  "{t.text}"
                </p>

                {/* Auteur */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className={`w-10 h-10 ${t.accentColor} rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0`}>
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

          {/* Bannière CTA */}
          <div className="relative bg-gradient-sunset rounded-2xl overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-16 py-14">
              <div className="text-center md:text-left text-white">
                <p className="text-sm font-medium uppercase tracking-wider text-white/80 mb-2">
                  Offre de bienvenue
                </p>
                <h2 className="text-3xl md:text-4xl font-bold mb-3">
                  Jusqu'à <span className="text-yellow-300">-40%</span> sur vos premières commandes
                </h2>
                <p className="text-white/80 text-lg max-w-md">
                  Inscrivez-vous aujourd'hui et profitez de promotions exclusives réservées à nos nouveaux membres.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link
                  href="/register"
                  className="px-8 py-4 bg-white text-orange-600 font-bold rounded-lg hover:bg-orange-50 transition-all shadow-lg hover-lift text-center whitespace-nowrap"
                >
                  Créer un compte
                </Link>
                <Link
                  href="/shop"
                  className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all text-center whitespace-nowrap"
                >
                  Explorer la boutique
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomeContent;
