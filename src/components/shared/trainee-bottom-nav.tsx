"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";

// Lior Fit v2 — bottom nav (5 items, gradient center action), from Lior Fit v2.dc.html
const LIME = "#C6F53C";
const GRADIENT = "linear-gradient(135deg,#D2F84B,#35C877)";

const NAV = [
  { href: "/my/dashboard", label: "בית" },
  { href: "/my/nutrition", label: "ארוחות" },
];

export function TraineeBottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      dir="rtl"
      style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480, zIndex: 50,
        background: "linear-gradient(to top,#080b07 65%,rgba(8,11,7,0))",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "12px 26px 26px" }}>
        {/* בית */}
        <Link href={NAV[0].href} style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, color: isActive(NAV[0].href) ? LIME : "rgba(255,255,255,0.45)" }}>
            {isActive(NAV[0].href) ? (
              <svg width="23" height="23" viewBox="0 0 24 24" fill={LIME} stroke="none"><path d="M3 10.7 12 3l9 7.7V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></svg>
            ) : (
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.7 12 3l9 7.7V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></svg>
            )}
            <span style={{ fontSize: 11, fontWeight: isActive(NAV[0].href) ? 700 : 400 }}>{NAV[0].label}</span>
          </div>
        </Link>

        {/* ארוחות */}
        <Link href={NAV[1].href} style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, color: isActive(NAV[1].href) ? LIME : "rgba(255,255,255,0.45)" }}>
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11h16a8 8 0 0 1-16 0z" /><path d="M12 3v4" /></svg>
            <span style={{ fontSize: 11, fontWeight: isActive(NAV[1].href) ? 700 : 400 }}>{NAV[1].label}</span>
          </div>
        </Link>

        {/* Center FAB — quick start workout */}
        <Link href="/my/workout" style={{ textDecoration: "none" }}>
          <div style={{
            width: 58, height: 58, borderRadius: "50%", background: GRADIENT,
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6,
            boxShadow: "0 8px 24px rgba(120,220,90,0.35)",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a1004" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" /><path d="M3 12h18" /></svg>
          </div>
        </Link>

        {/* עוד */}
        <Link href="/my/profile" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, color: isActive("/my/profile") ? LIME : "rgba(255,255,255,0.45)" }}>
            <MoreHorizontal size={23} />
            <span style={{ fontSize: 11, fontWeight: isActive("/my/profile") ? 700 : 400 }}>עוד</span>
          </div>
        </Link>
      </div>
    </nav>
  );
}
