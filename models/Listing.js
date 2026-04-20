/**
 * Listing Model — To-Let Dhaka
 *
 * Represents a single rental property listing. Designed around the
 * hyper-local rental ecosystem of Dhaka, Bangladesh, with fields
 * that capture the specific data points renters care about:
 *
 *   - Tenant type restrictions (Bachelor Boys/Girls, Family, Any)
 *   - Gas type (Line Gas vs. Cylinder — a major cost/lifestyle factor)
 *   - Power backup (IPS/Generator — critical during Dhaka load-shedding)
 *   - Water supply reliability
 *   - Security infrastructure (CCTV, Darwan/Guard)
 *   - Gate lock policy (common in bachelor accommodations)
 *   - Meal inclusion (common in hostels/messes)
 *   - Floor level (no-elevator buildings are the norm)
 */

import mongoose from "mongoose";

const ListingSchema = new mongoose.Schema(
  {
    // ─── Owner Reference ─────────────────────────────────────
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Listing must belong to an owner"],
      index: true,
    },

    // ─── Property Title & Description ────────────────────────
    title: {
      type: String,
      required: [true, "Listing title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      default: "",
    },

    // ─── Images ──────────────────────────────────────────────
    // Array of image URLs (Cloudinary/S3). Min 1, Max 5.
    images: {
      type: [
        {
          url: {
            type: String,
            required: true,
          },
          publicId: {
            type: String, // Cloudinary public_id for deletion.
            default: null,
          },
        },
      ],
      validate: {
        validator: function (arr) {
          return arr.length >= 1 && arr.length <= 5;
        },
        message: "A listing must have between 1 and 5 images",
      },
    },

    // ─── Location ────────────────────────────────────────────
    location: {
      // Free-text street/landmark for display
      street: {
        type: String,
        required: [true, "Street/Road name is required"],
        trim: true,
        maxlength: [200, "Street address cannot exceed 200 characters"],
      },

      // Area/Neighborhood — indexed for filtering
      area: {
        type: String,
        required: [true, "Area/Neighborhood is required"],
        trim: true,
        maxlength: [100, "Area name cannot exceed 100 characters"],
        index: true,
      },

      // Optional: City sub-district for future expansion
      thana: {
        type: String,
        trim: true,
        default: null,
      },

      // Optional GPS coordinates for future map integration
      coordinates: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
      },
    },

    // ─── Pricing ─────────────────────────────────────────────
    rent: {
      type: Number,
      required: [true, "Monthly rent amount is required"],
      min: [0, "Rent cannot be negative"],
    },

    advanceDeposit: {
      type: Number,
      default: 0,
      min: [0, "Advance deposit cannot be negative"],
    },

    // ─── Room Classification ─────────────────────────────────
    roomType: {
      type: String,
      enum: {
        values: ["seat", "single-room", "shared-room", "flat"],
        message:
          "Room type must be: seat, single-room, shared-room, or flat",
      },
      required: [true, "Room type is required"],
      index: true,
    },

    // ─── Dhaka-Specific Tags ─────────────────────────────────

    // Who can rent this property?
    tenantType: {
      type: String,
      enum: {
        values: ["bachelor-boys", "bachelor-girls", "family", "any"],
        message:
          "Tenant type must be: bachelor-boys, bachelor-girls, family, or any",
      },
      required: [true, "Tenant type preference is required"],
      index: true,
    },

    // ── Utilities ──
    gasType: {
      type: String,
      enum: {
        values: ["line", "cylinder", "none"],
        message: "Gas type must be: line, cylinder, or none",
      },
      required: [true, "Gas type is required"],
    },

    hasGeneratorOrIPS: {
      type: Boolean,
      default: false,
    },

    hasWaterSupply247: {
      type: Boolean,
      default: false,
    },

    // ── Security ──
    hasCCTV: {
      type: Boolean,
      default: false,
    },

    hasDarwan: {
      type: Boolean,
      // "Darwan" = building guard/gatekeeper — very common term in Dhaka
      default: false,
    },

    // ── Rules ──
    gateLockTime: {
      type: String,
      // e.g., "10:00 PM", "11:30 PM", "No Lock"
      trim: true,
      default: null,
    },

    mealIncluded: {
      type: Boolean,
      default: false,
    },

    // ── Environment ──
    floorLevel: {
      type: String,
      // e.g., "Ground", "1st", "2nd", "3rd", "4th", "5th", "6th+"
      trim: true,
      default: null,
    },

    // ── Google Maps ──
    googleMapsLink: {
      type: String,
      trim: true,
      default: null,
    },

    // ─── Listing Status ──────────────────────────────────────
    status: {
      type: String,
      enum: {
        values: ["available", "rented"],
        message: "Status must be: available or rented",
      },
      default: "available",
      index: true,
    },

    // ─── Engagement Metrics (future use) ─────────────────────
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Compound Indexes for Common Query Patterns ─────────────
// Seekers typically filter by: status + tenantType + area + rent range
ListingSchema.index({ status: 1, tenantType: 1, "location.area": 1 });
ListingSchema.index({ status: 1, rent: 1 });
ListingSchema.index({ status: 1, roomType: 1 });
ListingSchema.index({ owner: 1, status: 1 });
ListingSchema.index({ createdAt: -1 }); // For newest-first feed sorting

// ─── Virtual: Owner Details ─────────────────────────────────
ListingSchema.virtual("ownerDetails", {
  ref: "User",
  localField: "owner",
  foreignField: "_id",
  justOne: true,
});

// Prevent model recompilation on hot reload in dev
export default mongoose.models.Listing ||
  mongoose.model("Listing", ListingSchema);
