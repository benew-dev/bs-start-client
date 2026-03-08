import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import logger from "@/utils/logger";

/**
 * Schéma utilisateur avancé avec validation, indexation et méthodes d'instance
 * Compatible Mongoose 9
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true,
      maxLength: [50, "Name cannot exceed 50 characters"],
      minLength: [2, "Name should have at least 2 characters"],
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9\s._-]+$/.test(v);
        },
        message: (props) => `${props.value} contains invalid characters`,
      },
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      trim: true,
      lowercase: true,
      maxLength: [100, "Email cannot exceed 100 characters"],
      validate: {
        validator: function (v) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address`,
      },
    },
    phone: {
      type: String,
      required: [true, "Please enter your mobile number"],
      trim: true,
      validate: {
        validator: function (v) {
          return /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/.test(
            v,
          );
        },
        message: (props) => `${props.value} is not a valid phone number`,
      },
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minLength: [8, "Password must be at least 8 characters"],
      maxLength: [100, "Password cannot exceed 100 characters"],
      select: false,
      validate: {
        validator: function (v) {
          if (this.isModified("password")) {
            return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/.test(
              v,
            );
          }
          return true;
        },
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)",
      },
    },
    avatar: {
      public_id: {
        type: String,
        default: null,
      },
      url: {
        type: String,
        default: null,
        validate: {
          validator: function (v) {
            if (!v) return true;
            return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(
              v,
            );
          },
          message: "Invalid URL format",
        },
      },
    },
    address: {
      street: {
        type: String,
        required: false,
        default: null,
        trim: true,
        maxLength: [100, "L'adresse ne peut pas dépasser 100 caractères"],
        validate: {
          validator: function (v) {
            if (!v) return true;
            return /^[a-zA-Z0-9\s,.'°-]+$/.test(v);
          },
          message: (props) =>
            `${props.value} contient des caractères non autorisés`,
        },
      },
      city: {
        type: String,
        required: false,
        default: null,
        trim: true,
        maxLength: [
          50,
          "Le nom de la ville ne peut pas dépasser 50 caractères",
        ],
        validate: {
          validator: function (v) {
            if (!v) return true;
            return /^[a-zA-Z\s'-]+$/.test(v);
          },
          message: (props) => `${props.value} n'est pas un nom de ville valide`,
        },
      },
      country: {
        type: String,
        required: false,
        default: null,
        trim: true,
        maxLength: [50, "Le nom du pays ne peut pas dépasser 50 caractères"],
        index: true,
      },
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "Role must be user or admin",
      },
      default: "user",
      index: true,
    },
    favorites: {
      type: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          productName: {
            type: String,
            required: true,
            trim: true,
          },
          productImage: {
            public_id: {
              type: String,
              default: null,
            },
            url: {
              type: String,
              default: null,
            },
          },
          addedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
      validate: {
        validator: function (favorites) {
          return favorites.length <= 100;
        },
        message: "Maximum 100 favorites allowed",
      },
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: {
      updatedAt: "updatedAt",
      createdAt: false,
    },
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.loginAttempts;
        delete ret.lockUntil;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpire;
        delete ret.verificationToken;
        delete ret.__v;
        return ret;
      },
      virtuals: true,
    },
    toObject: { virtuals: true },
    collection: "users",
  },
);

// ═══════════════════════════════════════════════════════════════════════════
// INDEXES
// ═══════════════════════════════════════════════════════════════════════════

userSchema.index(
  { email: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } },
);
userSchema.index({ createdAt: -1 });
userSchema.index({ updatedAt: -1 });
userSchema.index({ phone: 1 }, { sparse: true });
userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ isActive: 1, lastLogin: -1 });
userSchema.index({ _id: 1, role: 1 });

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLEWARES - CORRIGÉS POUR MONGOOSE 9 (pas de next() avec async)
// ═══════════════════════════════════════════════════════════════════════════

// Middleware avant la sauvegarde - MONGOOSE 9 COMPATIBLE
userSchema.pre("save", async function () {
  // Si le mot de passe n'a pas été modifié, ne rien faire
  if (!this.isModified("password")) {
    return;
  }

  try {
    // Enregistrer la date de changement de mot de passe
    this.passwordChangedAt = Date.now() - 1000;

    // Hasher le mot de passe avec un coût adaptatif
    const saltRounds = process.env.NODE_ENV === "production" ? 12 : 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  } catch (error) {
    logger.error("Error hashing password", {
      userId: this._id,
      error: error.message,
    });
    // Relancer l'erreur pour que Mongoose l'attrape
    throw error;
  }
});

// Middleware avant la mise à jour - MONGOOSE 9 COMPATIBLE
userSchema.pre("findOneAndUpdate", function () {
  this.set({ updatedAt: Date.now() });
});

// ═══════════════════════════════════════════════════════════════════════════
// MÉTHODES D'INSTANCE
// ═══════════════════════════════════════════════════════════════════════════

// Méthode pour comparer le mot de passe
userSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    logger.error("Error comparing password", {
      userId: this._id,
      error: error.message,
    });
    return false;
  }
};

// Méthode pour vérifier si le compte est verrouillé
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Méthode pour incrémenter les tentatives de connexion échouées
userSchema.methods.incrementLoginAttempts = async function () {
  try {
    this.loginAttempts += 1;

    const MAX_LOGIN_ATTEMPTS = 5;
    const LOCK_TIME = 30 * 60 * 1000; // 30 minutes

    if (this.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      this.lockUntil = Date.now() + LOCK_TIME;
      logger.info("Account locked due to multiple failed attempts", {
        userId: this._id,
      });
    }

    return await this.save();
  } catch (error) {
    logger.error("Error incrementing login attempts", {
      userId: this._id,
      error: error.message,
    });
    return this;
  }
};

// Méthode pour réinitialiser les tentatives de connexion
userSchema.methods.resetLoginAttempts = async function () {
  try {
    this.loginAttempts = 0;
    this.lockUntil = null;
    this.lastLogin = Date.now();
    return await this.save();
  } catch (error) {
    logger.error("Error resetting login attempts", {
      userId: this._id,
      error: error.message,
    });
    return this;
  }
};

// Méthode pour vérifier si le mot de passe a changé après l'émission du token
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Méthode pour générer un token de réinitialisation de mot de passe
userSchema.methods.createPasswordResetToken = async function () {
  try {
    const crypto = require("crypto");
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await this.save({ validateBeforeSave: false });

    return resetToken;
  } catch (error) {
    logger.error("Error creating password reset token", {
      userId: this._id,
      error: error.message,
    });
    throw new Error("Failed to generate reset token");
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MÉTHODES STATIQUES
// ═══════════════════════════════════════════════════════════════════════════

// Rechercher un utilisateur par email
userSchema.statics.findByEmail = async function (
  email,
  includePassword = false,
) {
  try {
    return includePassword
      ? await this.findOne({ email: email.toLowerCase() }).select("+password")
      : await this.findOne({ email: email.toLowerCase() });
  } catch (error) {
    logger.error("Error finding user by email", {
      error: error.message,
      email: email.substring(0, 3) + "***",
    });
    return null;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// VIRTUALS
// ═══════════════════════════════════════════════════════════════════════════

userSchema.virtual("fullName").get(function () {
  return this.name;
});

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
