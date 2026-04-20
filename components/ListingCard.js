"use client";

/**
 * ListingCard — Compact property card for the feed.
 *
 * Displays: image, rent, area, room type, tenant type, key tags.
 * Mobile-first with smooth hover animations.
 */

import Link from "next/link";

export default function ListingCard({ listing }) {
  const {
    _id,
    title,
    images,
    rent,
    advanceDeposit,
    roomType,
    tenantType,
    location,
    gasType,
    hasGeneratorOrIPS,
    hasWaterSupply247,
    floorLevel,
    mealIncluded,
    status,
    createdAt,
  } = listing;

  const roomTypeLabels = {
    seat: "Seat",
    "single-room": "Single Room",
    "shared-room": "Shared Room",
    flat: "Flat",
  };

  const tenantTypeLabels = {
    "bachelor-boys": "Bachelor Boys",
    "bachelor-girls": "Bachelor Girls",
    family: "Family",
    any: "Any",
  };

  const tenantTypeColors = {
    "bachelor-boys": { bg: "rgba(59, 130, 246, 0.1)", color: "#3B82F6" },
    "bachelor-girls": { bg: "rgba(236, 72, 153, 0.1)", color: "#EC4899" },
    family: { bg: "rgba(34, 197, 94, 0.1)", color: "#22C55E" },
    any: { bg: "rgba(139, 92, 246, 0.1)", color: "#8B5CF6" },
  };

  const timeAgo = getTimeAgo(createdAt);
  const imageUrl = images?.[0]?.url || "/placeholder-room.jpg";

  return (
    <Link href={`/listings/${_id}`} className="no-underline" id={`listing-card-${_id}`}>
      <article className="card overflow-hidden group cursor-pointer">
        {/* Image */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "16/10" }}>
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span className={`badge ${status === "available" ? "badge-available" : "badge-rented"}`}>
              ● {status === "available" ? "Available" : "Rented"}
            </span>
          </div>

          {/* Room Type Badge */}
          <div className="absolute top-3 right-3">
            <span
              className="badge"
              style={{ background: "rgba(0,0,0,0.6)", color: "#fff", backdropFilter: "blur(4px)" }}
            >
              {roomTypeLabels[roomType]}
            </span>
          </div>

          {/* Image Count */}
          {images?.length > 1 && (
            <div className="absolute bottom-3 right-3">
              <span
                className="badge"
                style={{ background: "rgba(0,0,0,0.6)", color: "#fff", backdropFilter: "blur(4px)" }}
              >
                📷 {images.length}
              </span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div
            className="absolute inset-x-0 bottom-0 h-20"
            style={{
              background: "linear-gradient(transparent, rgba(0,0,0,0.4))",
            }}
          />
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Rent + Location */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p
                className="text-xl font-bold"
                style={{ color: "var(--primary)" }}
              >
                ৳{rent?.toLocaleString("en-BD")}
                <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>
                  /mo
                </span>
              </p>
              {advanceDeposit > 0 && (
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  Advance: ৳{advanceDeposit?.toLocaleString("en-BD")}
                </p>
              )}
            </div>
            <span
              className="badge"
              style={{
                background: tenantTypeColors[tenantType]?.bg,
                color: tenantTypeColors[tenantType]?.color,
                fontSize: "0.7rem",
              }}
            >
              {tenantTypeLabels[tenantType]}
            </span>
          </div>

          {/* Title */}
          <h3
            className="font-semibold text-sm mb-1 line-clamp-1"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h3>

          {/* Area */}
          <p className="text-xs mb-3 flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {location?.area}
            {location?.street && `, ${location.street}`}
          </p>

          {/* Quick Tags */}
          <div className="flex flex-wrap gap-1.5">
            <QuickTag icon="🔥" label={gasType === "line" ? "Line Gas" : gasType === "cylinder" ? "Cylinder" : "No Gas"} />
            {hasGeneratorOrIPS && <QuickTag icon="⚡" label="IPS/Gen" />}
            {hasWaterSupply247 && <QuickTag icon="💧" label="24/7 Water" />}
            {mealIncluded && <QuickTag icon="🍽️" label="Meals" />}
            {floorLevel && <QuickTag icon="🏢" label={`${floorLevel} Floor`} />}
          </div>

          {/* Footer */}
          <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--border-light)" }}>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {timeAgo}
            </span>
            <span
              className="text-xs font-medium flex items-center gap-1 transition-colors"
              style={{ color: "var(--primary)" }}
            >
              View Details
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function QuickTag({ icon, label }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs"
      style={{
        background: "var(--surface-hover)",
        color: "var(--text-secondary)",
        fontSize: "0.7rem",
      }}
    >
      {icon} {label}
    </span>
  );
}

function getTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-BD", { day: "numeric", month: "short" });
}
