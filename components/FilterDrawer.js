"use client";

/**
 * FilterDrawer — Mobile-first slide-out filter panel
 *
 * Filters: Budget range, Tenant Type, Room Type, Area, Gas, Utilities
 */

import { useState } from "react";

const TENANT_TYPES = [
  { value: "", label: "All" },
  { value: "bachelor-boys", label: "Bachelor Boys" },
  { value: "bachelor-girls", label: "Bachelor Girls" },
  { value: "family", label: "Family Only" },
];

const ROOM_TYPES = [
  { value: "", label: "All" },
  { value: "seat", label: "Seat" },
  { value: "single-room", label: "Single Room" },
  { value: "shared-room", label: "Shared Room" },
  { value: "flat", label: "Flat" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price-low", label: "Price: Low → High" },
  { value: "price-high", label: "Price: High → Low" },
];

export default function FilterDrawer({ filters, onFilterChange, open, onClose }) {
  const [localFilters, setLocalFilters] = useState({ ...filters });

  const updateLocal = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const resetFilters = () => {
    const reset = {
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
    };
    setLocalFilters(reset);
    onFilterChange(reset);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className="fixed top-0 right-0 h-full z-50 overflow-y-auto"
        style={{
          width: "min(380px, 90vw)",
          background: "var(--surface)",
          boxShadow: open ? "var(--shadow-xl)" : "none",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        id="filter-drawer"
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between p-4"
          style={{
            background: "var(--surface)",
            borderBottom: "1px solid var(--border-light)",
          }}
        >
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            Filters
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ background: "var(--surface-hover)" }}
            aria-label="Close filters"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-4 flex flex-col gap-6">
          {/* Sort */}
          <FilterSection label="Sort By">
            <select
              value={localFilters.sort || "newest"}
              onChange={(e) => updateLocal("sort", e.target.value)}
              className="input-field"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FilterSection>

          {/* Budget Range */}
          <FilterSection label="Budget Range (৳)">
            <div className="flex gap-3">
              <input
                type="number"
                placeholder="Min"
                value={localFilters.minRent || ""}
                onChange={(e) => updateLocal("minRent", e.target.value)}
                className="input-field"
                min="0"
              />
              <input
                type="number"
                placeholder="Max"
                value={localFilters.maxRent || ""}
                onChange={(e) => updateLocal("maxRent", e.target.value)}
                className="input-field"
                min="0"
              />
            </div>
          </FilterSection>

          {/* Tenant Type */}
          <FilterSection label="Tenant Type">
            <div className="flex flex-wrap gap-2">
              {TENANT_TYPES.map((t) => (
                <ChipButton
                  key={t.value}
                  selected={localFilters.tenantType === t.value}
                  onClick={() => updateLocal("tenantType", t.value)}
                >
                  {t.label}
                </ChipButton>
              ))}
            </div>
          </FilterSection>

          {/* Room Type */}
          <FilterSection label="Room Type">
            <div className="flex flex-wrap gap-2">
              {ROOM_TYPES.map((r) => (
                <ChipButton
                  key={r.value}
                  selected={localFilters.roomType === r.value}
                  onClick={() => updateLocal("roomType", r.value)}
                >
                  {r.label}
                </ChipButton>
              ))}
            </div>
          </FilterSection>

          {/* Area */}
          <FilterSection label="Area / Neighborhood">
            <input
              type="text"
              placeholder="e.g., Uttara, Mirpur, Dhanmondi..."
              value={localFilters.area || ""}
              onChange={(e) => updateLocal("area", e.target.value)}
              className="input-field"
            />
          </FilterSection>

          {/* Gas Type */}
          <FilterSection label="Gas Type">
            <div className="flex flex-wrap gap-2">
              {[
                { value: "", label: "Any" },
                { value: "line", label: "🔥 Line Gas" },
                { value: "cylinder", label: "🛢️ Cylinder" },
              ].map((g) => (
                <ChipButton
                  key={g.value}
                  selected={localFilters.gasType === g.value}
                  onClick={() => updateLocal("gasType", g.value)}
                >
                  {g.label}
                </ChipButton>
              ))}
            </div>
          </FilterSection>

          {/* Boolean Toggles */}
          <FilterSection label="Amenities">
            <div className="flex flex-col gap-3">
              <ToggleRow
                label="⚡ IPS/Generator Backup"
                checked={localFilters.hasGeneratorOrIPS}
                onChange={(v) => updateLocal("hasGeneratorOrIPS", v)}
              />
              <ToggleRow
                label="💧 24/7 Water Supply"
                checked={localFilters.hasWaterSupply247}
                onChange={(v) => updateLocal("hasWaterSupply247", v)}
              />
              <ToggleRow
                label="🍽️ Meals Included"
                checked={localFilters.mealIncluded}
                onChange={(v) => updateLocal("mealIncluded", v)}
              />
            </div>
          </FilterSection>
        </div>

        {/* Actions */}
        <div
          className="sticky bottom-0 p-4 flex gap-3"
          style={{
            background: "var(--surface)",
            borderTop: "1px solid var(--border-light)",
          }}
        >
          <button
            onClick={resetFilters}
            className="btn-secondary flex-1"
            style={{ padding: "12px" }}
          >
            Reset
          </button>
          <button
            onClick={applyFilters}
            className="btn-primary flex-1"
            style={{ padding: "12px" }}
          >
            Apply Filters
          </button>
        </div>
      </aside>
    </>
  );
}

function FilterSection({ label, children }) {
  return (
    <div>
      <label
        className="block text-sm font-semibold mb-2"
        style={{ color: "var(--text-primary)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function ChipButton({ selected, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-full text-sm font-medium transition-all"
      style={{
        background: selected
          ? "linear-gradient(135deg, var(--primary), var(--primary-dark))"
          : "var(--surface-hover)",
        color: selected ? "var(--text-inverse)" : "var(--text-secondary)",
        border: selected ? "none" : "1px solid var(--border)",
      }}
    >
      {children}
    </button>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {label}
      </span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative w-11 h-6 rounded-full transition-colors"
        style={{
          background: checked ? "var(--primary)" : "var(--border)",
        }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
          style={{
            transform: checked ? "translateX(20px)" : "translateX(0)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        />
      </button>
    </label>
  );
}
