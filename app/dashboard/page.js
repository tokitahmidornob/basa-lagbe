"use client";

/**
 * Owner Dashboard — Manage your listings
 *
 * Features:
 *   - Overview stats (total, available, rented)
 *   - Listing cards with status toggle
 *   - Quick actions (edit, delete)
 */

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, listingId: null });

  useEffect(() => {
    if (session?.user?.role === "owner") {
      fetchMyListings();
    }
  }, [session]);

  const fetchMyListings = async () => {
    try {
      // Fetch all listings and filter client-side by owner
      // In production, add an /api/listings/mine endpoint
      const res = await fetch(`/api/listings?status=available&limit=50`);
      const availableData = await res.json();

      const res2 = await fetch(`/api/listings?status=rented&limit=50`);
      const rentedData = await res2.json();

      const allListings = [
        ...(availableData.listings || []),
        ...(rentedData.listings || []),
      ].filter((l) => {
        const ownerId = l.owner?._id || l.owner;
        return ownerId === session.user.id;
      });

      setListings(allListings);
    } catch (err) {
      console.error("Error fetching listings:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (listingId, currentStatus) => {
    setActionLoading(listingId);
    try {
      const newStatus = currentStatus === "available" ? "rented" : "available";
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setListings((prev) =>
          prev.map((l) =>
            l._id === listingId ? { ...l, status: newStatus } : l
          )
        );
      }
    } catch (err) {
      console.error("Toggle error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const executeDelete = async () => {
    const listingId = deleteModal.listingId;
    if (!listingId) return;

    setActionLoading(listingId);
    setDeleteModal({ isOpen: false, listingId: null });

    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setListings((prev) => prev.filter((l) => l._id !== listingId));
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Guards
  if (status === "loading") {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="w-8 h-8 border-3 rounded-full animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--primary)" }} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
        <div className="text-center">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Sign in required</h2>
          <Link href="/login?callbackUrl=/dashboard" className="btn-primary inline-flex mt-4">Sign In</Link>
        </div>
      </div>
    );
  }

  if (session.user.role !== "owner") {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
        <div className="text-center">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Owner Access Only</h2>
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>This dashboard is for property owners.</p>
          <Link href="/listings" className="btn-primary inline-flex">Browse Listings</Link>
        </div>
      </div>
    );
  }

  const availableCount = listings.filter((l) => l.status === "available").length;
  const rentedCount = listings.filter((l) => l.status === "rented").length;

  const roomTypeLabels = {
    seat: "Seat",
    "single-room": "Single Room",
    "shared-room": "Shared Room",
    flat: "Flat",
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8" style={{ background: "var(--background)" }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              My Listings
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Manage your properties on বাসা লাগবে
            </p>
          </div>
          <Link href="/listings/create" className="btn-primary" style={{ padding: "10px 18px", fontSize: "0.85rem" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Post New
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatCard label="Total" value={listings.length} color="var(--secondary)" />
          <StatCard label="Available" value={availableCount} color="var(--accent)" />
          <StatCard label="Rented" value={rentedCount} color="var(--primary)" />
        </div>

        {/* Listings */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-4">
                <div className="flex gap-4">
                  <div className="skeleton w-24 h-20 rounded-lg flex-shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="skeleton w-3/4 h-5 rounded" />
                    <div className="skeleton w-1/2 h-4 rounded" />
                    <div className="skeleton w-1/3 h-4 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📦</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              No listings yet
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              Post your first listing and start reaching tenants.
            </p>
            <Link href="/listings/create" className="btn-primary inline-flex">
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {listings.map((listing) => (
              <div key={listing._id} className="card p-4 animate-fade-in" id={`dashboard-listing-${listing._id}`}>
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-24 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    {listing.images?.[0]?.url ? (
                      <img
                        src={listing.images[0].url}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl" style={{ background: "var(--surface-hover)" }}>
                        🏠
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                        {listing.title}
                      </h3>
                      <span className={`badge flex-shrink-0 ${listing.status === "available" ? "badge-available" : "badge-rented"}`}>
                        {listing.status === "available" ? "Available" : "Rented"}
                      </span>
                    </div>

                    <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
                      📍 {listing.location?.area} • {roomTypeLabels[listing.roomType]}
                    </p>

                    <p className="font-bold text-sm" style={{ color: "var(--primary)" }}>
                      ৳{listing.rent?.toLocaleString("en-BD")}/mo
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => toggleStatus(listing._id, listing.status)}
                        disabled={actionLoading === listing._id}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        style={{
                          background: listing.status === "available" ? "rgba(255,107,74,0.1)" : "rgba(0,201,167,0.1)",
                          color: listing.status === "available" ? "var(--primary)" : "var(--accent)",
                        }}
                        id={`toggle-status-${listing._id}`}
                      >
                        {actionLoading === listing._id ? "..." : listing.status === "available" ? "Mark Rented" : "Mark Available"}
                      </button>

                      <Link
                        href={`/listings/${listing._id}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium no-underline transition-colors"
                        style={{
                          background: "var(--surface-hover)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        View
                      </Link>

                      <Link
                        href={`/listings/${listing._id}/edit`}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium no-underline transition-colors"
                        style={{
                          background: "var(--surface-hover)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => setDeleteModal({ isOpen: true, listingId: listing._id })}
                        disabled={actionLoading === listing._id}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        style={{
                          background: "rgba(255,59,48,0.08)",
                          color: "#FF3B30",
                        }}
                        id={`delete-listing-${listing._id}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="glass card max-w-sm w-full p-6 animate-scale-in" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="text-4xl mb-4 text-center">🗑️</div>
            <h3 className="text-lg font-bold text-center mb-2" style={{ color: "var(--text-primary)" }}>Delete Listing?</h3>
            <p className="text-sm text-center mb-6" style={{ color: "var(--text-secondary)" }}>
              This action cannot be undone. The listing will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, listingId: null })}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ background: "var(--surface-hover)", color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ background: "#FF3B30", color: "white" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="card p-4 text-center" style={{ cursor: "default" }}>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
    </div>
  );
}
