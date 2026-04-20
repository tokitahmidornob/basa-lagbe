"use client";

/**
 * Landing Page — To-Let Dhaka (বাসা লাগবে)
 *
 * Hero section with search, feature highlights, and CTA.
 * Mobile-first, visually striking.
 */

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchArea, setSearchArea] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchArea.trim()) params.set("area", searchArea.trim());
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <div>
      {/* ─── Hero Section ─────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, var(--secondary-dark) 0%, var(--secondary) 50%, var(--secondary-light) 100%)",
          minHeight: "85vh",
        }}
      >
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
            style={{ background: "var(--primary)" }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-10"
            style={{ background: "var(--accent)" }}
          />
          <div
            className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full opacity-5"
            style={{ background: "var(--primary-light)" }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-32 flex flex-col items-center text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 animate-fade-in"
            style={{
              background: "rgba(255, 107, 74, 0.15)",
              border: "1px solid rgba(255, 107, 74, 0.3)",
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--available)", animation: "pulse-glow 2s infinite" }} />
            <span className="text-xs font-medium" style={{ color: "var(--primary-light)" }}>
              Dhaka&apos;s Rental Marketplace
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-4 animate-slide-up"
            style={{ color: "var(--text-inverse)" }}
          >
            বাসা লাগবে?
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Find It Here.
            </span>
          </h1>

          <p
            className="text-base sm:text-lg max-w-xl mb-8 animate-slide-up"
            style={{ color: "rgba(255,255,255,0.65)", animationDelay: "0.1s" }}
          >
            Stop wandering Dhaka&apos;s streets in the summer heat. Find hostels, rooms & flats
            with filters built for <strong style={{ color: "rgba(255,255,255,0.9)" }}>students & bachelors</strong>.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="w-full max-w-lg mb-8 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div
              className="flex items-center gap-2 p-2 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div className="flex-1 flex items-center gap-2 px-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <input
                  type="text"
                  value={searchArea}
                  onChange={(e) => setSearchArea(e.target.value)}
                  placeholder="Search by area — Uttara, Mirpur, Dhanmondi..."
                  className="w-full bg-transparent border-none outline-none text-sm py-2"
                  style={{ color: "rgba(255,255,255,0.9)" }}
                  id="hero-search-input"
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: "10px 20px", borderRadius: "var(--radius-lg)", fontSize: "0.85rem" }}
                id="hero-search-button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Search
              </button>
            </div>
          </form>

          {/* Quick Filter Chips */}
          <div
            className="flex flex-wrap justify-center gap-2 mb-10 animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            {[
              { label: "Bachelor Boys", href: "/listings?tenantType=bachelor-boys" },
              { label: "Bachelor Girls", href: "/listings?tenantType=bachelor-girls" },
              { label: "Under ৳5,000", href: "/listings?maxRent=5000" },
              { label: "With Meals", href: "/listings?mealIncluded=true" },
            ].map((chip) => (
              <Link
                key={chip.label}
                href={chip.href}
                className="px-4 py-2 rounded-full text-xs font-medium no-underline transition-all"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,107,74,0.2)";
                  e.currentTarget.style.borderColor = "rgba(255,107,74,0.4)";
                  e.currentTarget.style.color = "var(--primary-light)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                }}
              >
                {chip.label}
              </Link>
            ))}
          </div>

          {/* Stats */}
          <div
            className="flex items-center gap-8 sm:gap-12 animate-fade-in"
            style={{ animationDelay: "0.5s" }}
          >
            {[
              { value: "500+", label: "Active Listings" },
              { value: "1.2K+", label: "Happy Seekers" },
              { value: "50+", label: "Areas Covered" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--primary-light)" }}>
                  {stat.value}
                </p>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Section ─────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: "var(--background)" }}>
        <div className="max-w-6xl mx-auto text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Built for <span style={{ color: "var(--primary)" }}>Dhaka</span>
          </h2>
          <p className="text-base max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
            Filters that actually matter for Dhaka&apos;s unique rental market.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: "🔥",
              title: "Gas Type Filter",
              description: "Line Gas or Cylinder? Know before you visit. No surprises.",
            },
            {
              icon: "⚡",
              title: "Load-Shedding Ready",
              description: "Filter for IPS/Generator backup. Critical in Dhaka summers.",
            },
            {
              icon: "💧",
              title: "Water Supply",
              description: "24/7 water supply filter. Because bucket-filling at 3AM isn't fun.",
            },
            {
              icon: "🔒",
              title: "Gate Lock Time",
              description: "Know when the gate locks. Perfect for night-owl students.",
            },
            {
              icon: "🍽️",
              title: "Meals Included",
              description: "Filter hostels with meal plans. One less thing to worry about.",
            },
            {
              icon: "👮",
              title: "Security Details",
              description: "CCTV and Darwan/Guard info upfront. Safety matters.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="card p-6 text-center sm:text-left"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 mx-auto sm:mx-0"
                style={{ background: "var(--primary-50)" }}
              >
                {feature.icon}
              </div>
              <h3 className="text-base font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                {feature.title}
              </h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Section ──────────────────────────────────────── */}
      <section
        className="py-20 px-4"
        style={{
          background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
        }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ color: "var(--text-inverse)" }}
          >
            Have a property to rent?
          </h2>
          <p
            className="text-base mb-8 opacity-80"
            style={{ color: "var(--text-inverse)" }}
          >
            List your property for free and reach thousands of students & bachelors looking for their next home.
          </p>
          <Link
            href={session ? "/listings/create" : "/register"}
            className="btn-secondary inline-flex"
            style={{
              background: "var(--text-inverse)",
              color: "var(--primary-dark)",
              border: "none",
              padding: "14px 32px",
              fontSize: "1rem",
            }}
            id="cta-post-listing"
          >
            {session ? "Post Your Listing" : "Get Started — It's Free"}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
