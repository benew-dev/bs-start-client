import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Le titre est obligatoire"],
      trim: true,
      maxlength: [200, "Le titre ne peut pas dépasser 200 caractères"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [500, "L'extrait ne peut pas dépasser 500 caractères"],
    },
    content: {
      type: String,
      required: [true, "Le contenu est obligatoire"],
    },
    coverImage: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      set: (tags) => tags.map((tag) => tag.toLowerCase().trim()),
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Index composés pour les requêtes fréquentes
articleSchema.index({ isPublished: 1, publishedAt: -1 });
articleSchema.index({ tags: 1, isPublished: 1 });

// Middleware pre-save pour générer le slug et gérer publishedAt
articleSchema.pre("save", function () {
  // Générer le slug à partir du titre
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 100);

    // Ajouter un timestamp pour l'unicité
    this.slug = `${this.slug}-${Date.now().toString(36)}`;
  }

  // Mettre à jour publishedAt si on publie pour la première fois
  if (this.isModified("isPublished") && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // Mettre à jour updatedAt
  this.updatedAt = new Date();
});

// Méthode pour incrémenter les vues
articleSchema.methods.incrementViews = async function () {
  this.views += 1;
  await this.save({ validateBeforeSave: false });
  return this.views;
};

// Méthode statique pour trouver les articles publiés
articleSchema.statics.findPublished = function (options = {}) {
  const { page = 1, limit = 10, tag = null } = options;
  const skip = (page - 1) * limit;

  const query = { isPublished: true };
  if (tag) {
    query.tags = tag.toLowerCase();
  }

  return this.find(query)
    .populate("author", "name avatar")
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

// Méthode statique pour trouver un article par slug
articleSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug, isPublished: true })
    .populate("author", "name avatar")
    .lean();
};

export default mongoose.models.Article ||
  mongoose.model("Article", articleSchema);
