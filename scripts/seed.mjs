/**
 * Database Seed Script — To-Let Dhaka
 *
 * Populates the database with realistic sample listings
 * for development and demo purposes.
 *
 * Usage: node scripts/seed.mjs
 *
 * Requires MONGODB_URI in .env.local
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Load env vars from .env.local ──────────────────────────
const envPath = resolve(__dirname, "../.env.local");
try {
  const envContent = readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      process.env[key.trim()] = valueParts.join("=").trim();
    }
  });
} catch {
  console.error("Could not read .env.local");
  process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI || MONGODB_URI.includes("<")) {
  console.error("❌ Please set a valid MONGODB_URI in .env.local first");
  process.exit(1);
}

// ─── Schemas (inline to avoid ESM import issues) ────────────
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    image: { type: String, default: null },
    role: { type: String, enum: ["seeker", "owner"], required: true },
    phone: { type: String, trim: true },
    phoneVerified: { type: Boolean, default: false },
    provider: { type: String, enum: ["credentials", "google"], default: "credentials" },
    providerId: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ListingSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    images: [{ url: { type: String, required: true }, publicId: { type: String, default: null } }],
    location: {
      street: { type: String, required: true, trim: true },
      area: { type: String, required: true, trim: true },
      thana: { type: String, trim: true, default: null },
      coordinates: { lat: { type: Number, default: null }, lng: { type: Number, default: null } },
    },
    rent: { type: Number, required: true },
    advanceDeposit: { type: Number, default: 0 },
    roomType: { type: String, enum: ["seat", "single-room", "shared-room", "flat"], required: true },
    tenantType: { type: String, enum: ["bachelor-boys", "bachelor-girls", "family", "any"], required: true },
    gasType: { type: String, enum: ["line", "cylinder", "none"], required: true },
    hasGeneratorOrIPS: { type: Boolean, default: false },
    hasWaterSupply247: { type: Boolean, default: false },
    hasCCTV: { type: Boolean, default: false },
    hasDarwan: { type: Boolean, default: false },
    gateLockTime: { type: String, trim: true, default: null },
    mealIncluded: { type: Boolean, default: false },
    floorLevel: { type: String, trim: true, default: null },
    status: { type: String, enum: ["available", "rented"], default: "available" },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Listing = mongoose.models.Listing || mongoose.model("Listing", ListingSchema);

// ─── Sample Data ────────────────────────────────────────────

// Placeholder images from picsum.photos for demo
const ROOM_IMAGES = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
  "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
  "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&q=80",
];

function getRandomImages(count = 3) {
  const shuffled = [...ROOM_IMAGES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((url) => ({ url }));
}

const SAMPLE_OWNERS = [
  { name: "Rahim Uddin", email: "rahim@demo.com", phone: "+8801712345678" },
  { name: "Fatema Khatun", email: "fatema@demo.com", phone: "+8801823456789" },
  { name: "Kamal Hossain", email: "kamal@demo.com", phone: "+8801934567890" },
  { name: "Nasreen Akter", email: "nasreen@demo.com", phone: "+8801645678901" },
];

const SAMPLE_SEEKERS = [
  { name: "Arif Rahman", email: "arif@demo.com" },
  { name: "Tasnim Jahan", email: "tasnim@demo.com" },
];

const SAMPLE_LISTINGS = [
  {
    title: "Spacious bachelor seat near BUET campus",
    description: "Well-ventilated seat in a shared room. Walking distance to BUET. Peaceful environment, ideal for engineering students. Rooftop access for studying.",
    roomType: "seat",
    tenantType: "bachelor-boys",
    location: { street: "New Paltan, Road 5", area: "Paltan", thana: "Paltan" },
    rent: 3500,
    advanceDeposit: 7000,
    gasType: "cylinder",
    hasGeneratorOrIPS: false,
    hasWaterSupply247: true,
    hasCCTV: false,
    hasDarwan: true,
    gateLockTime: "11:00 PM",
    mealIncluded: true,
    floorLevel: "3rd",
  },
  {
    title: "Single room with attached bath in Uttara",
    description: "Fully furnished single room with attached bathroom. Air-conditioned, high-speed WiFi included. Near Uttara Sector 7 bus stop.",
    roomType: "single-room",
    tenantType: "bachelor-boys",
    location: { street: "Sector 7, Road 12", area: "Uttara", thana: "Uttara West" },
    rent: 8000,
    advanceDeposit: 16000,
    gasType: "line",
    hasGeneratorOrIPS: true,
    hasWaterSupply247: true,
    hasCCTV: true,
    hasDarwan: true,
    gateLockTime: "No Lock",
    mealIncluded: false,
    floorLevel: "5th",
  },
  {
    title: "Female hostel seat — safe & clean in Dhanmondi",
    description: "Dedicated girls' hostel with 24/7 security. Home-cooked meals 3 times a day. Right next to Dhanmondi Lake. Study room available.",
    roomType: "seat",
    tenantType: "bachelor-girls",
    location: { street: "Road 27, Dhanmondi", area: "Dhanmondi", thana: "Dhanmondi" },
    rent: 5000,
    advanceDeposit: 10000,
    gasType: "line",
    hasGeneratorOrIPS: true,
    hasWaterSupply247: true,
    hasCCTV: true,
    hasDarwan: true,
    gateLockTime: "9:30 PM",
    mealIncluded: true,
    floorLevel: "2nd",
  },
  {
    title: "2BHK family flat in Mirpur DOHS",
    description: "Beautiful 2-bedroom flat in a secure DOHS area. Ideal for small families. Close to school and hospital. Underground parking.",
    roomType: "flat",
    tenantType: "family",
    location: { street: "Mirpur DOHS, Road 3", area: "Mirpur DOHS", thana: "Mirpur" },
    rent: 25000,
    advanceDeposit: 50000,
    gasType: "line",
    hasGeneratorOrIPS: true,
    hasWaterSupply247: true,
    hasCCTV: true,
    hasDarwan: true,
    gateLockTime: null,
    mealIncluded: false,
    floorLevel: "4th",
  },
  {
    title: "Budget shared room in Mohammadpur",
    description: "Affordable shared room (2 persons max). Perfect for students. Near Mohammadpur bus stand. Mosque and market within walking distance.",
    roomType: "shared-room",
    tenantType: "bachelor-boys",
    location: { street: "Iqbal Road", area: "Mohammadpur", thana: "Mohammadpur" },
    rent: 4000,
    advanceDeposit: 4000,
    gasType: "cylinder",
    hasGeneratorOrIPS: false,
    hasWaterSupply247: false,
    hasCCTV: false,
    hasDarwan: false,
    gateLockTime: "10:00 PM",
    mealIncluded: false,
    floorLevel: "Ground",
  },
  {
    title: "Premium single room with balcony — Gulshan",
    description: "Luxury single room in a modern building. Private balcony with city view. Elevator, parking, and gym access. Ideal for working professionals.",
    roomType: "single-room",
    tenantType: "any",
    location: { street: "Gulshan Avenue, Road 103", area: "Gulshan", thana: "Gulshan" },
    rent: 15000,
    advanceDeposit: 30000,
    gasType: "line",
    hasGeneratorOrIPS: true,
    hasWaterSupply247: true,
    hasCCTV: true,
    hasDarwan: true,
    gateLockTime: "No Lock",
    mealIncluded: false,
    floorLevel: "8th",
  },
  {
    title: "Girls' shared room near NSU campus",
    description: "Clean, well-maintained shared room for female students. Only 5 minutes walk from North South University. Kitchen access included.",
    roomType: "shared-room",
    tenantType: "bachelor-girls",
    location: { street: "Bashundhara R/A, Block D", area: "Bashundhara", thana: "Vatara" },
    rent: 4500,
    advanceDeposit: 9000,
    gasType: "line",
    hasGeneratorOrIPS: true,
    hasWaterSupply247: true,
    hasCCTV: true,
    hasDarwan: false,
    gateLockTime: "10:30 PM",
    mealIncluded: false,
    floorLevel: "3rd",
  },
  {
    title: "Mess seat with 3 meals — Banani",
    description: "Comfortable bachelor mess with homestyle meals. Spacious common room with TV. Laundry service available. Clean bathrooms maintained daily.",
    roomType: "seat",
    tenantType: "bachelor-boys",
    location: { street: "Banani Road 11", area: "Banani", thana: "Banani" },
    rent: 6500,
    advanceDeposit: 6500,
    gasType: "line",
    hasGeneratorOrIPS: true,
    hasWaterSupply247: true,
    hasCCTV: false,
    hasDarwan: true,
    gateLockTime: "11:30 PM",
    mealIncluded: true,
    floorLevel: "1st",
  },
  {
    title: "3BHK flat for family — Uttara Sector 10",
    description: "Spacious 3-bedroom apartment. Master bedroom with ensuite. Large kitchen, separate dining. Children's playground in the building.",
    roomType: "flat",
    tenantType: "family",
    location: { street: "Sector 10, Road 6", area: "Uttara", thana: "Uttara East" },
    rent: 30000,
    advanceDeposit: 60000,
    gasType: "line",
    hasGeneratorOrIPS: true,
    hasWaterSupply247: true,
    hasCCTV: true,
    hasDarwan: true,
    gateLockTime: null,
    mealIncluded: false,
    floorLevel: "6th+",
  },
  {
    title: "Budget bachelor seat — Mirpur 10",
    description: "Cheapest deal near Mirpur 10 roundabout. Perfect for students on a tight budget. Metro rail station just 2 minutes away.",
    roomType: "seat",
    tenantType: "bachelor-boys",
    location: { street: "Mirpur 10, Road 4", area: "Mirpur", thana: "Shah Ali" },
    rent: 2500,
    advanceDeposit: 2500,
    gasType: "cylinder",
    hasGeneratorOrIPS: false,
    hasWaterSupply247: false,
    hasCCTV: false,
    hasDarwan: false,
    gateLockTime: "10:00 PM",
    mealIncluded: false,
    floorLevel: "Ground",
  },
  {
    title: "Furnished studio flat — Tejgaon",
    description: "Modern studio apartment, fully furnished. Open kitchen concept. Great for single professionals or couples. Near Tejgaon industrial area.",
    roomType: "flat",
    tenantType: "any",
    location: { street: "Tejgaon Link Road", area: "Tejgaon", thana: "Tejgaon" },
    rent: 12000,
    advanceDeposit: 24000,
    gasType: "line",
    hasGeneratorOrIPS: true,
    hasWaterSupply247: true,
    hasCCTV: true,
    hasDarwan: false,
    gateLockTime: null,
    mealIncluded: false,
    floorLevel: "4th",
  },
  {
    title: "Girls' hostel with meals — Farmgate",
    description: "Safe and well-managed girls' hostel near Farmgate. Includes breakfast, lunch, and dinner. Close to bus stops for easy commute. WiFi included.",
    roomType: "seat",
    tenantType: "bachelor-girls",
    location: { street: "Green Road", area: "Farmgate", thana: "Tejturi Bazar" },
    rent: 5500,
    advanceDeposit: 11000,
    gasType: "line",
    hasGeneratorOrIPS: true,
    hasWaterSupply247: true,
    hasCCTV: true,
    hasDarwan: true,
    gateLockTime: "9:00 PM",
    mealIncluded: true,
    floorLevel: "2nd",
  },
];

// ─── Seed Function ──────────────────────────────────────────
async function seed() {
  console.log("🌱 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected!\n");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await User.deleteMany({});
  await Listing.deleteMany({});

  // Create demo password
  const hashedPassword = await bcrypt.hash("demo123", 12);

  // Create owners
  console.log("👤 Creating demo users...");
  const owners = [];
  for (const ownerData of SAMPLE_OWNERS) {
    const owner = await User.create({
      ...ownerData,
      password: hashedPassword,
      role: "owner",
      provider: "credentials",
      phoneVerified: true,
    });
    owners.push(owner);
    console.log(`   ✅ Owner: ${owner.name} (${owner.email})`);
  }

  // Create seekers
  for (const seekerData of SAMPLE_SEEKERS) {
    const seeker = await User.create({
      ...seekerData,
      password: hashedPassword,
      role: "seeker",
      provider: "credentials",
    });
    console.log(`   ✅ Seeker: ${seeker.name} (${seeker.email})`);
  }

  // Create listings
  console.log("\n🏠 Creating demo listings...");
  for (let i = 0; i < SAMPLE_LISTINGS.length; i++) {
    const listingData = SAMPLE_LISTINGS[i];
    const owner = owners[i % owners.length];

    const listing = await Listing.create({
      ...listingData,
      owner: owner._id,
      images: getRandomImages(Math.floor(Math.random() * 3) + 2),
      status: i === 4 ? "rented" : "available", // One rented listing for demo
      viewCount: Math.floor(Math.random() * 100) + 10,
    });
    console.log(`   ✅ "${listing.title}" — ৳${listing.rent}/mo (${listing.location.area})`);
  }

  console.log(`\n🎉 Seed complete!`);
  console.log(`   ${SAMPLE_OWNERS.length + SAMPLE_SEEKERS.length} users created`);
  console.log(`   ${SAMPLE_LISTINGS.length} listings created`);
  console.log(`\n📝 Demo credentials:`);
  console.log(`   Owners: rahim@demo.com / fatema@demo.com / kamal@demo.com / nasreen@demo.com`);
  console.log(`   Seekers: arif@demo.com / tasnim@demo.com`);
  console.log(`   Password (all): demo123\n`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
