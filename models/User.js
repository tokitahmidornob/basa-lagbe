/**
 * User Model — To-Let Dhaka
 *
 * Supports two roles:
 *   - "seeker"  → Students/bachelors searching for rentals.
 *   - "owner"   → Landlords/property managers listing rentals.
 *
 * Owners are required to have a verified phone number so Seekers
 * can contact them via Click-to-Call and WhatsApp links.
 *
 * Authentication: Email/Password + Google SSO via NextAuth.js
 */

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    // ─── Identity ────────────────────────────────────────────
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      // Not required — Google SSO users won't have a password.
      select: false, // Exclude from queries by default for security.
      minlength: [6, "Password must be at least 6 characters"],
    },

    image: {
      type: String, // Profile picture URL (from Google SSO or uploaded).
      default: null,
    },

    // ─── Role ────────────────────────────────────────────────
    role: {
      type: String,
      enum: {
        values: ["seeker", "owner"],
        message: "Role must be either 'seeker' or 'owner'",
      },
      required: [true, "User role is required"],
    },

    // ─── Owner-Specific Fields ───────────────────────────────
    phone: {
      type: String,
      trim: true,
      // Bangladeshi phone format: +880XXXXXXXXXX or 01XXXXXXXXX
      match: [
        /^(\+880|0)1[3-9]\d{8}$/,
        "Please provide a valid Bangladeshi phone number (e.g., +8801XXXXXXXXX or 01XXXXXXXXX)",
      ],
      // Required only for owners — enforced at the application layer
      // during listing creation, not at the schema level, to allow
      // owners to register first and add phone later in profile.
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    // ─── Auth Provider Tracking ──────────────────────────────
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },

    providerId: {
      type: String, // Google account ID for SSO users.
      default: null,
    },

    // ─── Account Status ──────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically.
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ────────────────────────────────────────────────
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ phone: 1 }, { sparse: true });

// ─── Virtual: Listing Count (for Owner dashboard) ───────────
UserSchema.virtual("listings", {
  ref: "Listing",
  localField: "_id",
  foreignField: "owner",
  count: true,
});

// Prevent model recompilation on hot reload in dev
export default mongoose.models.User || mongoose.model("User", UserSchema);
