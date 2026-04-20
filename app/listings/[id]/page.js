"use client";

/**
 * Listing Detail Page
 *
 * Full listing view with:
 *   - Image gallery
 *   - All Dhaka-specific tags
 *   - Owner contact: Click-to-Call & WhatsApp buttons
 */

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ListingDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`/api/listings/${id}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Listing not found");
          return;
        }

        setListing(data.listing);
      } catch (err) {
        setError("Failed to load listing");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="text-center">
          <div
            className="w-10 h-10 border-3 rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: "var(--border)", borderTopColor: "var(--primary)" }}
          />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading listing...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
        <div className="text-center">
          <div className="text-5xl mb-4">😔</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            {error || "Listing not found"}
          </h2>
          <Link href="/listings" className="btn-primary mt-4 inline-flex">
            ← Back to Listings
          </Link>
        </div>
      </div>
    );
  }

  const owner = listing.owner || {};
  const phone = owner.phone || "";
  const cleanPhone = phone.replace(/[^0-9+]/g, "");
  const whatsappPhone = cleanPhone.startsWith("+") ? cleanPhone.slice(1) : (cleanPhone.startsWith("0") ? `88${cleanPhone}` : cleanPhone);

  const roomTypeLabels = {
    seat: "Seat (Shared Bed-space)",
    "single-room": "Single Room",
    "shared-room": "Shared Room",
    flat: "Full Flat/Apartment",
  };

  const tenantTypeLabels = {
    "bachelor-boys": "Bachelor Boys Only",
    "bachelor-girls": "Bachelor Girls Only",
    family: "Family Only",
    any: "Anyone Welcome",
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]" style={{ background: "var(--background)" }}>
      <div className="max-w-4xl mx-auto">
        {/* Image Gallery */}
        <div className="relative">
          {/* Main Image */}
          <div className="relative overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
            {listing.images?.length > 0 ? (
              <img
                src={listing.images[activeImage]?.url}
                alt={`${listing.title} — Photo ${activeImage + 1}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl" style={{ background: "var(--surface-hover)" }}>
                🏠
              </div>
            )}

            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(4px)",
                color: "white",
              }}
              aria-label="Go back"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <span className={`badge ${listing.status === "available" ? "badge-available" : "badge-rented"}`} style={{ fontSize: "0.8rem", padding: "6px 14px" }}>
                ● {listing.status === "available" ? "Available" : "Rented Out"}
              </span>
            </div>

            {/* Image Counter */}
            {listing.images?.length > 1 && (
              <div
                className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-sm font-medium"
                style={{ background: "rgba(0,0,0,0.6)", color: "white" }}
              >
                {activeImage + 1} / {listing.images.length}
              </div>
            )}

            {/* Nav Arrows */}
            {listing.images?.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage((prev) => (prev > 0 ? prev - 1 : listing.images.length - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.4)", color: "white" }}
                  aria-label="Previous image"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button
                  onClick={() => setActiveImage((prev) => (prev < listing.images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.4)", color: "white" }}
                  aria-label="Next image"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 6 15 12 9 18"/></svg>
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {listing.images?.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto" style={{ background: "var(--surface)" }}>
              {listing.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className="flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden transition-all"
                  style={{
                    border: i === activeImage ? "2px solid var(--primary)" : "2px solid transparent",
                    opacity: i === activeImage ? 1 : 0.6,
                  }}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-4 py-6">
          {/* Price + Title */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-3xl font-extrabold" style={{ color: "var(--primary)" }}>
                ৳{listing.rent?.toLocaleString("en-BD")}
                <span className="text-sm font-normal" style={{ color: "var(--text-muted)" }}>/month</span>
              </p>
              {listing.advanceDeposit > 0 && (
                <span
                  className="badge"
                  style={{ background: "var(--surface-hover)", color: "var(--text-secondary)", fontSize: "0.75rem" }}
                >
                  Advance: ৳{listing.advanceDeposit?.toLocaleString("en-BD")}
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              {listing.title}
            </h1>
            <p className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {listing.location?.street && `${listing.location.street}, `}
              {listing.location?.area}
              {listing.location?.thana && `, ${listing.location.thana}`}
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <InfoCard icon="🏠" label="Room Type" value={roomTypeLabels[listing.roomType]} />
            <InfoCard icon="👥" label="Tenant Type" value={tenantTypeLabels[listing.tenantType]} />
            <InfoCard icon="🏢" label="Floor" value={listing.floorLevel ? `${listing.floorLevel} Floor` : "Not specified"} />
            <InfoCard icon="🔥" label="Gas" value={listing.gasType === "line" ? "Line Gas" : listing.gasType === "cylinder" ? "Cylinder Gas" : "No Gas"} />
          </div>

          {/* Amenities & Features */}
          <div className="card p-5 mb-6">
            <h2 className="text-base font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              Amenities & Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AmenityRow icon="⚡" label="IPS/Generator Backup" value={listing.hasGeneratorOrIPS} />
              <AmenityRow icon="💧" label="24/7 Water Supply" value={listing.hasWaterSupply247} />
              <AmenityRow icon="📹" label="CCTV Security" value={listing.hasCCTV} />
              <AmenityRow icon="👮" label="Darwan/Guard" value={listing.hasDarwan} />
              <AmenityRow icon="🍽️" label="Meals Included" value={listing.mealIncluded} />
              <AmenityRow
                icon="🔒"
                label="Gate Lock Time"
                value={listing.gateLockTime}
                isText
              />
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="card p-5 mb-6">
              <h2 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>
                Description
              </h2>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
                {listing.description}
              </p>
            </div>
          )}

          {/* Owner Info */}
          <div className="card p-5 mb-6">
            <h2 className="text-base font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              Listed By
            </h2>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                style={{
                  background: "linear-gradient(135deg, var(--primary-100), var(--primary-50))",
                  color: "var(--primary)",
                }}
              >
                {owner.name?.[0]?.toUpperCase() || "O"}
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                  {owner.name || "Property Owner"}
                </p>
                {phone && (
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Google Maps Button */}
          {listing.googleMapsLink && (
            <a
              href={listing.googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-4 mb-6 flex items-center justify-center gap-3 no-underline transition-all group"
              style={{
                background: "linear-gradient(135deg, var(--secondary), var(--secondary-light))",
                color: "var(--text-inverse)",
                border: "none",
                cursor: "pointer",
              }}
              id="google-maps-button"
            >
              <span className="text-xl transition-transform group-hover:scale-110">📍</span>
              <span className="font-semibold text-sm">Get Directions on Google Maps</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-60">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}

          {/* Contact Buttons — Sticky on Mobile */}
          {phone && listing.status === "available" && (
            <div
              className="fixed bottom-0 left-0 right-0 p-4 flex gap-3 sm:static sm:p-0 sm:mb-8"
              style={{
                background: "var(--surface)",
                borderTop: "1px solid var(--border-light)",
                boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
              }}
              id="contact-buttons"
            >
              <a
                href={`tel:${cleanPhone}`}
                className="btn-primary flex-1 text-center no-underline"
                style={{ padding: "14px" }}
                id="call-button"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
                Call Now
              </a>
              <a
                href={`https://wa.me/${whatsappPhone}?text=Hi, I'm interested in your listing "${listing.title}" on বাসা লাগবে.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center no-underline flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all"
                style={{
                  background: "#25D366",
                  color: "white",
                  padding: "14px",
                  fontSize: "0.95rem",
                }}
                id="whatsapp-button"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          )}

          {/* Spacer for fixed bottom bar on mobile */}
          {phone && listing.status === "available" && (
            <div className="h-20 sm:hidden" />
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="card p-3.5 flex items-center gap-3" style={{ cursor: "default" }}>
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{value}</p>
      </div>
    </div>
  );
}

function AmenityRow({ icon, label, value, isText = false }) {
  return (
    <div className="flex items-center justify-between py-2 px-1" style={{ borderBottom: "1px solid var(--border-light)" }}>
      <span className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
        <span>{icon}</span>
        {label}
      </span>
      {isText ? (
        <span className="text-sm font-medium" style={{ color: value ? "var(--text-primary)" : "var(--text-muted)" }}>
          {value || "N/A"}
        </span>
      ) : (
        <span
          className="text-sm font-bold"
          style={{ color: value ? "var(--accent)" : "var(--text-muted)" }}
        >
          {value ? "✓ Yes" : "✗ No"}
        </span>
      )}
    </div>
  );
}
