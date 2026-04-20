"use client";

/**
 * Navbar — Mobile-first sticky navigation
 *
 * Features:
 *   - Glassmorphism sticky header
 *   - User avatar + role badge
 *   - Mobile hamburger menu
 *   - Quick-action buttons based on role
 */

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => pathname === path;

  return (
    <header className="sticky top-0 z-50 glass" style={{ borderBottom: "1px solid var(--border-light)" }}>
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
              color: "var(--text-inverse)",
              fontWeight: 800,
            }}
          >
            🏠
          </div>
          <span
            className="text-lg font-bold hidden sm:block"
            style={{ color: "var(--text-primary)" }}
          >
            বাসা <span style={{ color: "var(--primary)" }}>লাগবে</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink href="/" active={isActive("/")}>
            Home
          </NavLink>
          <NavLink href="/listings" active={isActive("/listings")}>
            Browse
          </NavLink>
          {session?.user?.role === "owner" && (
            <NavLink href="/dashboard" active={isActive("/dashboard")}>
              My Listings
            </NavLink>
          )}
        </div>

        {/* Auth Actions */}
        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full skeleton" />
          ) : session ? (
            <div className="flex items-center gap-3">
              {session.user.role === "owner" && (
                <Link
                  href="/listings/create"
                  className="btn-primary hidden sm:flex"
                  style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Post Ad
                </Link>
              )}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl transition-colors"
                style={{ background: menuOpen ? "var(--surface-hover)" : "transparent" }}
                id="user-menu-button"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: "linear-gradient(135deg, var(--primary-100), var(--primary-50))",
                    color: "var(--primary-dark)",
                  }}
                >
                  {session.user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="btn-secondary"
                style={{ padding: "8px 16px", fontSize: "0.85rem" }}
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="btn-primary"
                style={{ padding: "8px 16px", fontSize: "0.85rem" }}
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ background: menuOpen ? "var(--surface-hover)" : "transparent" }}
            onClick={() => setMenuOpen(!menuOpen)}
            id="mobile-menu-button"
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div
          className="absolute right-4 top-16 w-64 rounded-xl overflow-hidden animate-scale-in"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-xl)",
            zIndex: 100,
          }}
        >
          {session ? (
            <>
              <div className="p-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                  {session.user.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {session.user.email}
                </p>
                <span
                  className="badge mt-2"
                  style={{
                    background: session.user.role === "owner" ? "var(--primary-50)" : "rgba(0,201,167,0.1)",
                    color: session.user.role === "owner" ? "var(--primary)" : "var(--accent)",
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                  }}
                >
                  {session.user.role}
                </span>
              </div>

              <div className="py-2">
                <MenuLink href="/" onClick={() => setMenuOpen(false)}>
                  🏠 Home
                </MenuLink>
                <MenuLink href="/listings" onClick={() => setMenuOpen(false)}>
                  🔍 Browse Listings
                </MenuLink>
                {session.user.role === "owner" && (
                  <>
                    <MenuLink href="/dashboard" onClick={() => setMenuOpen(false)}>
                      📊 My Listings
                    </MenuLink>
                    <MenuLink href="/listings/create" onClick={() => setMenuOpen(false)}>
                      ➕ Post New Ad
                    </MenuLink>
                  </>
                )}
              </div>

              <div className="p-3" style={{ borderTop: "1px solid var(--border-light)" }}>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background: "rgba(255, 107, 74, 0.08)",
                    color: "var(--primary)",
                  }}
                  id="sign-out-button"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="py-2 md:hidden">
              <MenuLink href="/" onClick={() => setMenuOpen(false)}>
                🏠 Home
              </MenuLink>
              <MenuLink href="/listings" onClick={() => setMenuOpen(false)}>
                🔍 Browse Listings
              </MenuLink>
              <MenuLink href="/login" onClick={() => setMenuOpen(false)}>
                🔐 Log In
              </MenuLink>
              <MenuLink href="/register" onClick={() => setMenuOpen(false)}>
                ✨ Sign Up
              </MenuLink>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function NavLink({ href, active, children }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors no-underline"
      style={{
        background: active ? "var(--primary-50)" : "transparent",
        color: active ? "var(--primary)" : "var(--text-secondary)",
      }}
    >
      {children}
    </Link>
  );
}

function MenuLink({ href, onClick, children }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-2.5 text-sm font-medium transition-colors no-underline"
      style={{ color: "var(--text-secondary)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--surface-hover)";
        e.currentTarget.style.color = "var(--text-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--text-secondary)";
      }}
    >
      {children}
    </Link>
  );
}
