"use client";

/**
 * Create Listing Form — Owner only
 *
 * Multi-section form with:
 *   - Basic info (title, description, room type)
 *   - Location
 *   - Pricing
 *   - Dhaka-specific tags
 *   - Image upload placeholders
 */

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateListingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageUrls, setImageUrls] = useState([""]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    roomType: "single-room",
    tenantType: "any",
    street: "",
    area: "",
    thana: "",
    googleMapsLink: "",
    rent: "",
    advanceDeposit: "",
    gasType: "line",
    hasGeneratorOrIPS: false,
    hasWaterSupply247: false,
    hasCCTV: false,
    hasDarwan: false,
    gateLockTime: "",
    mealIncluded: false,
    floorLevel: "",
  });

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Guard: Only owners can access
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
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Please sign in</h2>
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>You need to be logged in as an Owner to create listings.</p>
          <Link href="/login?callbackUrl=/listings/create" className="btn-primary inline-flex">Sign In</Link>
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
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>Only property owners can create listings.</p>
          <Link href="/listings" className="btn-primary inline-flex">Browse Listings</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Build images array from URLs
      const images = imageUrls
        .filter((url) => url.trim())
        .map((url) => ({ url: url.trim() }));

      if (images.length === 0) {
        setError("Please add at least 1 image URL");
        setLoading(false);
        return;
      }

      const payload = {
        title: form.title,
        description: form.description,
        roomType: form.roomType,
        tenantType: form.tenantType,
        location: {
          street: form.street,
          area: form.area,
          thana: form.thana || undefined,
        },
        rent: Number(form.rent),
        advanceDeposit: Number(form.advanceDeposit) || 0,
        gasType: form.gasType,
        hasGeneratorOrIPS: form.hasGeneratorOrIPS,
        hasWaterSupply247: form.hasWaterSupply247,
        hasCCTV: form.hasCCTV,
        hasDarwan: form.hasDarwan,
        gateLockTime: form.gateLockTime || null,
        mealIncluded: form.mealIncluded,
        floorLevel: form.floorLevel || null,
        googleMapsLink: form.googleMapsLink || null,
        images,
      };

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create listing");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addImageUrl = () => {
    if (imageUrls.length < 5) {
      setImageUrls([...imageUrls, ""]);
    }
  };

  const updateImageUrl = (index, value) => {
    const updated = [...imageUrls];
    updated[index] = value;
    setImageUrls(updated);
  };

  const removeImageUrl = (index) => {
    if (imageUrls.length > 1) {
      setImageUrls(imageUrls.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8" style={{ background: "var(--background)" }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm font-medium no-underline mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Post a New Listing
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Fill in the details to list your property on বাসা লাগবে
          </p>
        </div>

        {error && (
          <div
            className="mb-6 p-4 rounded-xl text-sm"
            style={{
              background: "rgba(255, 107, 74, 0.1)",
              color: "var(--primary)",
              border: "1px solid rgba(255, 107, 74, 0.2)",
            }}
            id="create-error"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* ── Basic Info ── */}
          <FormSection title="Basic Information" icon="📋">
            <div className="flex flex-col gap-4">
              <FormField label="Listing Title" required>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  className="input-field"
                  placeholder="e.g., Spacious bachelor seat near BUET"
                  required
                  id="listing-title"
                />
              </FormField>

              <FormField label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  className="input-field"
                  placeholder="Describe the room, environment, nearby landmarks..."
                  rows={4}
                  style={{ resize: "vertical" }}
                  id="listing-description"
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Room Type" required>
                  <select
                    value={form.roomType}
                    onChange={(e) => updateForm("roomType", e.target.value)}
                    className="input-field"
                    id="listing-room-type"
                  >
                    <option value="seat">Seat (Shared Bed-space)</option>
                    <option value="single-room">Single Room</option>
                    <option value="shared-room">Shared Room</option>
                    <option value="flat">Flat / Apartment</option>
                  </select>
                </FormField>

                <FormField label="Tenant Type" required>
                  <select
                    value={form.tenantType}
                    onChange={(e) => updateForm("tenantType", e.target.value)}
                    className="input-field"
                    id="listing-tenant-type"
                  >
                    <option value="any">Anyone Welcome</option>
                    <option value="bachelor-boys">Bachelor Boys Only</option>
                    <option value="bachelor-girls">Bachelor Girls Only</option>
                    <option value="family">Family Only</option>
                  </select>
                </FormField>
              </div>
            </div>
          </FormSection>

          {/* ── Location ── */}
          <FormSection title="Location" icon="📍">
            <div className="flex flex-col gap-4">
              <FormField label="Area / Neighborhood" required>
                <input
                  type="text"
                  value={form.area}
                  onChange={(e) => updateForm("area", e.target.value)}
                  className="input-field"
                  placeholder="e.g., Uttara, Mirpur, Dhanmondi"
                  required
                  id="listing-area"
                />
              </FormField>

              <FormField label="Street / Road" required>
                <input
                  type="text"
                  value={form.street}
                  onChange={(e) => updateForm("street", e.target.value)}
                  className="input-field"
                  placeholder="e.g., Road 7, Sector 3"
                  required
                  id="listing-street"
                />
              </FormField>

              <FormField label="Thana (Optional)">
                <input
                  type="text"
                  value={form.thana}
                  onChange={(e) => updateForm("thana", e.target.value)}
                  className="input-field"
                  placeholder="e.g., Uttara West"
                  id="listing-thana"
                />
              </FormField>

              <FormField label="Google Maps Link">
                <input
                  type="url"
                  value={form.googleMapsLink}
                  onChange={(e) => updateForm("googleMapsLink", e.target.value)}
                  className="input-field"
                  placeholder="https://maps.app.goo.gl/..."
                  id="listing-google-maps"
                />
                <p
                  className="mt-1.5 text-xs flex items-start gap-1.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  <span>💡</span>
                  <span>Open Google Maps, drop a pin on your exact house, click &quot;Share&quot;, and paste the link here.</span>
                </p>
              </FormField>
            </div>
          </FormSection>

          {/* ── Pricing ── */}
          <FormSection title="Pricing (BDT)" icon="💰">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Monthly Rent (৳)" required>
                <input
                  type="number"
                  value={form.rent}
                  onChange={(e) => updateForm("rent", e.target.value)}
                  className="input-field"
                  placeholder="e.g., 5000"
                  min="0"
                  required
                  id="listing-rent"
                />
              </FormField>

              <FormField label="Advance Deposit (৳)">
                <input
                  type="number"
                  value={form.advanceDeposit}
                  onChange={(e) => updateForm("advanceDeposit", e.target.value)}
                  className="input-field"
                  placeholder="e.g., 10000"
                  min="0"
                  id="listing-advance"
                />
              </FormField>
            </div>
          </FormSection>

          {/* ── Dhaka-Specific Tags ── */}
          <FormSection title="Property Details" icon="🏠">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Gas Type" required>
                  <select
                    value={form.gasType}
                    onChange={(e) => updateForm("gasType", e.target.value)}
                    className="input-field"
                    id="listing-gas-type"
                  >
                    <option value="line">🔥 Line Gas</option>
                    <option value="cylinder">🛢️ Cylinder Gas</option>
                    <option value="none">No Gas</option>
                  </select>
                </FormField>

                <FormField label="Floor Level">
                  <input
                    type="text"
                    value={form.floorLevel}
                    onChange={(e) => updateForm("floorLevel", e.target.value)}
                    className="input-field"
                    placeholder="e.g., Ground, 3rd, 6th+"
                    id="listing-floor"
                  />
                </FormField>
              </div>

              <FormField label="Gate Lock Time">
                <input
                  type="text"
                  value={form.gateLockTime}
                  onChange={(e) => updateForm("gateLockTime", e.target.value)}
                  className="input-field"
                  placeholder="e.g., 10:00 PM, 11:30 PM, No Lock"
                  id="listing-gate-lock"
                />
              </FormField>

              {/* Boolean Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: "hasGeneratorOrIPS", label: "⚡ IPS/Generator Backup" },
                  { key: "hasWaterSupply247", label: "💧 24/7 Water Supply" },
                  { key: "hasCCTV", label: "📹 CCTV Security" },
                  { key: "hasDarwan", label: "👮 Darwan/Guard" },
                  { key: "mealIncluded", label: "🍽️ Meals Included" },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors"
                    style={{
                      background: form[key] ? "var(--primary-50)" : "var(--surface-hover)",
                      border: `1.5px solid ${form[key] ? "var(--primary)" : "var(--border)"}`,
                    }}
                  >
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {label}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={form[key]}
                      onClick={() => updateForm(key, !form[key])}
                      className="relative w-11 h-6 rounded-full transition-colors"
                      style={{ background: form[key] ? "var(--primary)" : "var(--border)" }}
                    >
                      <span
                        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                        style={{
                          transform: form[key] ? "translateX(20px)" : "translateX(0)",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }}
                      />
                    </button>
                  </label>
                ))}
              </div>
            </div>
          </FormSection>

          {/* ── Images ── */}
          <FormSection title="Images" icon="📸">
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              Add image URLs for your property (1–5 images). Tip: Upload to Imgur or Cloudinary first.
            </p>
            <div className="flex flex-col gap-3">
              {imageUrls.map((url, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateImageUrl(i, e.target.value)}
                    className="input-field flex-1"
                    placeholder={`Image URL ${i + 1}`}
                    id={`listing-image-${i}`}
                  />
                  {imageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageUrl(i)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ background: "rgba(255,107,74,0.1)", color: "var(--primary)" }}
                      aria-label="Remove image"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              {imageUrls.length < 5 && (
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="btn-secondary text-sm"
                  style={{ padding: "10px" }}
                >
                  + Add Another Image
                </button>
              )}
            </div>
          </FormSection>

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
            style={{ padding: "16px", fontSize: "1rem" }}
            id="create-listing-submit"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                🚀 Publish Listing
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function FormSection({ title, icon, children }) {
  return (
    <div className="card p-5 sm:p-6">
      <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
        <span>{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
        {label}
        {required && <span style={{ color: "var(--primary)" }}> *</span>}
      </label>
      {children}
    </div>
  );
}
