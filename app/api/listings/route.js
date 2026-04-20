/**
 * Listings API — Collection Routes
 *
 * GET  /api/listings  → Feed with filters (public)
 * POST /api/listings  → Create listing (Owner only)
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Listing from "@/models/Listing";
import User from "@/models/User";

/**
 * GET /api/listings
 *
 * Query params:
 *   - status: "available" | "rented" (default: "available")
 *   - tenantType: "bachelor-boys" | "bachelor-girls" | "family" | "any"
 *   - roomType: "seat" | "single-room" | "shared-room" | "flat"
 *   - area: string (partial match)
 *   - minRent: number
 *   - maxRent: number
 *   - gasType: "line" | "cylinder" | "none"
 *   - hasGeneratorOrIPS: "true"
 *   - hasWaterSupply247: "true"
 *   - mealIncluded: "true"
 *   - page: number (default: 1)
 *   - limit: number (default: 12)
 *   - sort: "newest" | "price-low" | "price-high" (default: "newest")
 */
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);

    // Build query filter
    const filter = {};

    // Default to showing only available listings
    filter.status = searchParams.get("status") || "available";

    // Tenant type filter
    const tenantType = searchParams.get("tenantType");
    if (tenantType) {
      // Show listings matching the filter OR marked as "any"
      filter.tenantType = { $in: [tenantType, "any"] };
    }

    // Room type filter
    const roomType = searchParams.get("roomType");
    if (roomType) {
      filter.roomType = roomType;
    }

    // Area filter (case-insensitive partial match)
    const area = searchParams.get("area");
    if (area) {
      filter["location.area"] = { $regex: area, $options: "i" };
    }

    // Budget range filter
    const minRent = searchParams.get("minRent");
    const maxRent = searchParams.get("maxRent");
    if (minRent || maxRent) {
      filter.rent = {};
      if (minRent) filter.rent.$gte = Number(minRent);
      if (maxRent) filter.rent.$lte = Number(maxRent);
    }

    // Gas type
    const gasType = searchParams.get("gasType");
    if (gasType) filter.gasType = gasType;

    // Boolean filters
    if (searchParams.get("hasGeneratorOrIPS") === "true") {
      filter.hasGeneratorOrIPS = true;
    }
    if (searchParams.get("hasWaterSupply247") === "true") {
      filter.hasWaterSupply247 = true;
    }
    if (searchParams.get("mealIncluded") === "true") {
      filter.mealIncluded = true;
    }

    // Pagination
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 12));
    const skip = (page - 1) * limit;

    // Sort
    const sortParam = searchParams.get("sort") || "newest";
    let sort = {};
    switch (sortParam) {
      case "price-low":
        sort = { rent: 1 };
        break;
      case "price-high":
        sort = { rent: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Execute query
    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("owner", "name phone image")
        .lean(),
      Listing.countDocuments(filter),
    ]);

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/listings
 * Create a new listing (Owner only)
 */
export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "owner") {
      return NextResponse.json(
        { error: "Only owners can create listings" },
        { status: 403 }
      );
    }

    await dbConnect();

    // Verify owner has a phone number
    const owner = await User.findById(session.user.id);
    if (!owner?.phone) {
      return NextResponse.json(
        { error: "Please add your phone number in profile settings before creating a listing" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const listing = await Listing.create({
      ...body,
      owner: session.user.id,
      status: "available",
    });

    return NextResponse.json(
      { message: "Listing created successfully", listing },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating listing:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return NextResponse.json({ error: messages[0] }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}
