"use client";

/**
 * Listings Feed — Browse available rentals
 *
 * Features:
 *   - Responsive card grid
 *   - Filter drawer (mobile slide-out)
 *   - Active filter chips
 *   - Infinite-scroll-style pagination
 *   - Loading skeletons
 */

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ListingCard from "@/components/ListingCard";
import FilterDrawer from "@/components/FilterDrawer";

function ListingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    tenantType: searchParams.get("tenantType") || "",
    roomType: searchParams.get("roomType") || "",
    area: searchParams.get("area") || "",
    minRent: searchParams.get("minRent") || "",
    maxRent: searchParams.get("maxRent") || "",
    gasType: searchParams.get("gasType") || "",
    hasGeneratorOrIPS: searchParams.get("hasGeneratorOrIPS") === "true",
    hasWaterSupply247: searchParams.get("hasWaterSupply247") === "true",
    mealIncluded: searchParams.get("mealIncluded") === "true",
    sort: searchParams.get("sort") || "newest",
  });

  const buildQueryString = useCallback((filtersObj, page = 1) => {
    const params = new URLSearchParams();
    params.set("page", page.toString());

    if (filtersObj.tenantType) params.set("tenantType", filtersObj.tenantType);
    if (filtersObj.roomType) params.set("roomType", filtersObj.roomType);
    if (filtersObj.area) params.set("area", filtersObj.area);
    if (filtersObj.minRent) params.set("minRent", filtersObj.minRent);
    if (filtersObj.maxRent) params.set("maxRent", filtersObj.maxRent);
    if (filtersObj.gasType) params.set("gasType", filtersObj.gasType);
    if (filtersObj.hasGeneratorOrIPS) params.set("hasGeneratorOrIPS", "true");
    if (filtersObj.hasWaterSupply247) params.set("hasWaterSupply247", "true");
    if (filtersObj.mealIncluded) params.set("mealIncluded", "true");
    if (filtersObj.sort && filtersObj.sort !== "newest") params.set("sort", filtersObj.sort);

    return params.toString();
  }, []);

  const fetchListings = useCallback(
    async (filtersObj, page = 1, append = false) => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const qs = buildQueryString(filtersObj, page);
        const res = await fetch(`/api/listings?${qs}`);
        const data = await res.json();

        if (res.ok) {
          setListings((prev) => (append ? [...prev, ...data.listings] : data.listings));
          setPagination(data.pagination);
        }
      } catch (err) {
        console.error("Error fetching listings:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [buildQueryString]
  );

  // Initial load
  useEffect(() => {
    fetchListings(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchListings(newFilters);

    // Update URL
    const qs = buildQueryString(newFilters);
    router.replace(`/listings?${qs}`, { scroll: false });
  };

  // Load more
  const loadMore = () => {
    if (pagination?.hasMore) {
      fetchListings(filters, pagination.page + 1, true);
    }
  };

  // Active filter count
  const activeFilterCount = [
    filters.tenantType,
    filters.roomType,
    filters.area,
    filters.minRent,
    filters.maxRent,
    filters.gasType,
    filters.hasGeneratorOrIPS,
    filters.hasWaterSupply247,
    filters.mealIncluded,
  ].filter(Boolean).length;

  const filterLabels = {
    "bachelor-boys": "Bachelor Boys",
    "bachelor-girls": "Bachelor Girls",
    family: "Family",
    seat: "Seat",
    "single-room": "Single Room",
    "shared-room": "Shared Room",
    flat: "Flat",
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]" style={{ background: "var(--background)" }}>
      {/* Header */}
      <div
        className="sticky top-16 z-30 glass px-4 py-3"
        style={{ borderBottom: "1px solid var(--border-light)" }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              Available Listings
            </h1>
            {pagination && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {pagination.total} {pagination.total === 1 ? "listing" : "listings"} found
              </p>
            )}
          </div>

          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: activeFilterCount > 0 ? "var(--primary-50)" : "var(--surface)",
              color: activeFilterCount > 0 ? "var(--primary)" : "var(--text-secondary)",
              border: `1.5px solid ${activeFilterCount > 0 ? "var(--primary)" : "var(--border)"}`,
            }}
            id="open-filters-button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="20" y2="12" />
              <line x1="12" y1="18" x2="20" y2="18" />
              <circle cx="6" cy="12" r="2" fill="currentColor" />
              <circle cx="10" cy="18" r="2" fill="currentColor" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "var(--primary)", color: "white" }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="max-w-6xl mx-auto flex flex-wrap gap-2 mt-2">
            {filters.tenantType && (
              <ActiveChip
                label={filterLabels[filters.tenantType] || filters.tenantType}
                onRemove={() => handleFilterChange({ ...filters, tenantType: "" })}
              />
            )}
            {filters.roomType && (
              <ActiveChip
                label={filterLabels[filters.roomType] || filters.roomType}
                onRemove={() => handleFilterChange({ ...filters, roomType: "" })}
              />
            )}
            {filters.area && (
              <ActiveChip
                label={`📍 ${filters.area}`}
                onRemove={() => handleFilterChange({ ...filters, area: "" })}
              />
            )}
            {(filters.minRent || filters.maxRent) && (
              <ActiveChip
                label={`৳${filters.minRent || "0"} – ৳${filters.maxRent || "∞"}`}
                onRemove={() => handleFilterChange({ ...filters, minRent: "", maxRent: "" })}
              />
            )}
            {filters.gasType && (
              <ActiveChip
                label={filters.gasType === "line" ? "🔥 Line Gas" : "🛢️ Cylinder"}
                onRemove={() => handleFilterChange({ ...filters, gasType: "" })}
              />
            )}
            {filters.hasGeneratorOrIPS && (
              <ActiveChip
                label="⚡ IPS/Gen"
                onRemove={() => handleFilterChange({ ...filters, hasGeneratorOrIPS: false })}
              />
            )}
            {filters.hasWaterSupply247 && (
              <ActiveChip
                label="💧 24/7 Water"
                onRemove={() => handleFilterChange({ ...filters, hasWaterSupply247: false })}
              />
            )}
            {filters.mealIncluded && (
              <ActiveChip
                label="🍽️ Meals"
                onRemove={() => handleFilterChange({ ...filters, mealIncluded: false })}
              />
            )}
          </div>
        )}
      </div>

      {/* Listings Grid */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏚️</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              No listings found
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              Try adjusting your filters or search in a different area.
            </p>
            <button
              onClick={() =>
                handleFilterChange({
                  tenantType: "",
                  roomType: "",
                  area: "",
                  minRent: "",
                  maxRent: "",
                  gasType: "",
                  hasGeneratorOrIPS: false,
                  hasWaterSupply247: false,
                  mealIncluded: false,
                  sort: "newest",
                })
              }
              className="btn-primary"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing, index) => (
                <div
                  key={listing._id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>

            {/* Load More */}
            {pagination?.hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="btn-secondary"
                >
                  {loadingMore ? (
                    <>
                      <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      Loading...
                    </>
                  ) : (
                    `Load More (${listings.length} of ${pagination.total})`
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        filters={filters}
        onFilterChange={handleFilterChange}
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
      />
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-4" style={{ borderColor: "var(--border)", borderTopColor: "var(--primary)" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading listings...</p>
        </div>
      </div>
    }>
      <ListingsContent />
    </Suspense>
  );
}

function ActiveChip({ label, onRemove }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
      style={{
        background: "var(--primary-50)",
        color: "var(--primary-dark)",
        border: "1px solid var(--primary-100)",
      }}
    >
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 p-0.5 rounded-full transition-colors"
        style={{ background: "rgba(255,107,74,0.15)" }}
        aria-label={`Remove ${label} filter`}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton" style={{ aspectRatio: "16/10" }} />
      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between">
          <div className="skeleton w-24 h-6 rounded" />
          <div className="skeleton w-20 h-5 rounded-full" />
        </div>
        <div className="skeleton w-3/4 h-4 rounded" />
        <div className="skeleton w-1/2 h-3 rounded" />
        <div className="flex gap-2">
          <div className="skeleton w-16 h-5 rounded" />
          <div className="skeleton w-16 h-5 rounded" />
          <div className="skeleton w-16 h-5 rounded" />
        </div>
      </div>
    </div>
  );
}
