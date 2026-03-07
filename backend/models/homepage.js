import mongoose from "mongoose";

// ─────────────────────────────────────────────────────────────────────────────
// Sous-schéma : Hero Slide
// ─────────────────────────────────────────────────────────────────────────────
const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Le titre est requis"],
    minLength: [3, "Le titre doit contenir au moins 3 caractères"],
    trim: true,
  },
  subtitle: {
    type: String,
    required: [true, "Le sous-titre est requis"],
    minLength: [3, "Le sous-titre doit contenir au moins 3 caractères"],
    trim: true,
  },
  text: {
    type: String,
    required: [true, "Le texte est requis"],
    minLength: [10, "Le texte doit contenir au moins 10 caractères"],
    trim: true,
  },
  image: {
    public_id: {
      type: String,
      required: [true, "L'image est requise"],
    },
    url: {
      type: String,
      required: [true, "L'URL de l'image est requise"],
    },
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Sous-schéma : Produit avec métadonnées d'affichage
// ─────────────────────────────────────────────────────────────────────────────
const sectionProductSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Le produit est requis"],
    },
    badge: { type: String, trim: true, default: "" },
    badgeColor: {
      type: String,
      enum: ["orange", "pink", "purple", "green", "blue"],
      default: "orange",
    },
    accentColor: {
      type: String,
      enum: ["orange", "pink", "purple", "green", "blue"],
      default: "orange",
    },
    customDescription: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

// ─────────────────────────────────────────────────────────────────────────────
// Sous-schéma : Catégorie avec métadonnées d'affichage
// ─────────────────────────────────────────────────────────────────────────────
const sectionCategorySchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "La catégorie est requise"],
    },
    icon: { type: String, trim: true, default: "" },
    color: {
      type: String,
      enum: ["orange", "pink", "purple", "green", "blue"],
      default: "orange",
    },
  },
  { _id: false },
);

// ─────────────────────────────────────────────────────────────────────────────
// Sous-schéma : Avantage
// ─────────────────────────────────────────────────────────────────────────────
const advantageSchema = new mongoose.Schema(
  {
    icon: { type: String, trim: true, default: "" },
    title: {
      type: String,
      required: [true, "Le titre de l'avantage est requis"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "La description de l'avantage est requise"],
      trim: true,
    },
    color: {
      type: String,
      enum: ["orange", "pink", "purple", "green", "blue"],
      default: "orange",
    },
  },
  { _id: false },
);

// ─────────────────────────────────────────────────────────────────────────────
// Sous-schéma : Témoignage
// ─────────────────────────────────────────────────────────────────────────────
const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom est requis"],
      trim: true,
    },
    location: { type: String, trim: true, default: "" },
    initials: { type: String, trim: true, default: "" },
    rating: {
      type: Number,
      min: [1, "Note minimum : 1"],
      max: [5, "Note maximum : 5"],
      default: 5,
    },
    text: {
      type: String,
      required: [true, "Le texte du témoignage est requis"],
      trim: true,
    },
    accentColor: {
      type: String,
      enum: ["orange", "pink", "purple", "green", "blue"],
      default: "orange",
    },
  },
  { _id: false },
);

// ─────────────────────────────────────────────────────────────────────────────
// Sous-schéma générique : en-tête de section (champs communs)
// ─────────────────────────────────────────────────────────────────────────────
const sectionHeaderFields = {
  isActive: { type: Boolean, default: true },
  eyebrow: { type: String, trim: true, default: "" },
  title: { type: String, trim: true, default: "" },
  highlight: { type: String, trim: true, default: "" },
  description: { type: String, trim: true, default: "" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Schéma principal : HomePage
// ─────────────────────────────────────────────────────────────────────────────
const homePageSchema = new mongoose.Schema(
  {
    // ── Hero slides ────────────────────────────────────────────────────────
    sections: {
      type: [sectionSchema],
      validate: {
        validator: (sections) => sections.length >= 0 && sections.length <= 3,
        message: "Maximum 3 slides hero autorisés",
      },
      default: [],
    },

    // ── Section Coups de Cœur ──────────────────────────────────────────────
    featuredSection: {
      ...sectionHeaderFields,
      products: {
        type: [sectionProductSchema],
        default: [],
      },
      limit: { type: Number, min: 1, max: 12, default: 3 },
    },

    // ── Section Catégories ─────────────────────────────────────────────────
    categoriesSection: {
      ...sectionHeaderFields,
      categories: {
        type: [sectionCategorySchema],
        default: [],
      },
      limit: { type: Number, min: 1, max: 12, default: 6 },
    },

    // ── Section Nouveautés ─────────────────────────────────────────────────
    newArrivalsSection: {
      ...sectionHeaderFields,
      products: {
        type: [sectionProductSchema],
        default: [],
      },
      limit: { type: Number, min: 1, max: 12, default: 2 },
    },

    // ── Section Avantages ──────────────────────────────────────────────────
    advantagesSection: {
      ...sectionHeaderFields,
      advantages: {
        type: [advantageSchema],
        validate: {
          validator: (arr) => arr.length <= 8,
          message: "Maximum 8 avantages autorisés",
        },
        default: [],
      },
    },

    // ── Section Témoignages ────────────────────────────────────────────────
    testimonialsSection: {
      ...sectionHeaderFields,
      testimonials: {
        type: [testimonialSchema],
        validate: {
          validator: (arr) => arr.length <= 10,
          message: "Maximum 10 témoignages autorisés",
        },
        default: [],
      },
    },

    // ── Section CTA Final ──────────────────────────────────────────────────
    ctaSection: {
      isActive: { type: Boolean, default: true },
      eyebrow: { type: String, trim: true, default: "" },
      title: { type: String, trim: true, default: "" },
      highlight: { type: String, trim: true, default: "" },
      titleEnd: { type: String, trim: true, default: "" },
      description: { type: String, trim: true, default: "" },
      primaryButtonText: { type: String, trim: true, default: "" },
      primaryButtonLink: { type: String, trim: true, default: "" },
      secondaryButtonText: { type: String, trim: true, default: "" },
      secondaryButtonLink: { type: String, trim: true, default: "" },
    },
  },
  {
    timestamps: true,
  },
);

// ── Guard : un seul document HomePage autorisé ────────────────────────────
homePageSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await mongoose.models.HomePage.countDocuments();
    if (count >= 1) {
      throw new Error(
        "Un seul document HomePage est autorisé. Modifiez le document existant.",
      );
    }
  }
});

export default mongoose.models.HomePage ||
  mongoose.model("HomePage", homePageSchema);
