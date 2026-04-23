/**
 * Listings API — Individual Resource Routes
 *
 * GET    /api/listings/[id]  → Single listing detail (public)
 * PUT    /api/listings/[id]  → Update listing (Owner only)
 * DELETE /api/listings/[id]  → Delete listing (Owner only)
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Listing from "@/models/Listing";

/**
 * GET /api/listings/[id]
 * Get single listing with owner details
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    await dbConnect();

    const listing = await Listing.findById(id)
      .populate("owner", "name phone image email")
      .lean();

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Increment view count (fire and forget)
    Listing.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).exec();

    return NextResponse.json({ listing });
  } catch (error) {
    console.error("Error fetching listing:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/listings/[id]
 * Update listing or toggle status
 */
export async function PUT(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();

    const listing = await Listing.findById(id);

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Only the listing owner can update
    if (listing.owner.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "You can only update your own listings" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Prevent changing the owner
    delete body.owner;
    delete body._id;

    const updated = await Listing.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate("owner", "name phone image")
      .lean();

    return NextResponse.json({
      message: "Listing updated successfully",
      listing: updated,
    });
  } catch (error) {
    console.error("Error updating listing:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return NextResponse.json({ error: messages[0] }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/listings/[id]
 * Remove listing
 */
export async function DELETE(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();

    const listing = await Listing.findById(id);

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    if (listing.owner.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own listings" },
        { status: 403 }
      );
    }

    await Listing.findByIdAndDelete(id);

    return NextResponse.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Error deleting listing:", error);
    return NextResponse.json(
      { error: "Failed to delete listing" },
      { status: 500 }
    );
  }
}

export { PUT as PATCH };
