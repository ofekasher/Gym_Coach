"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, Clock } from "lucide-react";

// Lior Fit v2 — bottom nav (5 items, gradient center scan button), from Lior Fit v2.dc.html
const LIME = "#a8ff3e";
const GRADIENT = "linear-gradient(135deg,#D2F84B,#35C877)";

export function TraineeBottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const item = (href: string, label: string, icon: React.ReactNode) => (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, color: isActive(href) ? LIME : "rgba(255,255,255,0.45)" }}>
        {icon}
        <span style={{ fontSize: 11, fontWeight: isActive(href) ? 700 : 400 }}>{label}</span>
      </div>
    </Link>
  );

  return (
    <nav
      dir="rtl"
      style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480, zIndex: 50,
        background: "linear-gradient(to top,#0a1a0a 65%,rgba(10,26,10,0))",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "12px 26px 26px" }}>
        {/* עוד — far right (RTL first) */}
        {item("/my/profile", "עוד", <MoreHorizontal size={23} />)}

        {/* התקדמות */}
        {item("/my/progress", "התקדמות", <Clock size={22} />)}

        {/* Center FAB — quick start workout / scan */}
        <Link href="/my/workout" style={{ textDecoration: "none" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", background: LIME,
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4,
            boxShadow: "0 8px 24px rgba(168,255,62,0.35)",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0a1004" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" /><path d="M3 12h18" /></svg>
          </div>
        </Link>

        {/* ארוחות */}
        {item("/my/nutrition", "ארוחות", (
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11h16a8 8 0 0 1-16 0z" /><path d="M12 3v4" /></svg>
        ))}

        {/* בית — far left */}
        {item("/my/dashboard", "בית", isActive("/my/dashboard") ? (
          <svg width="23" height="23" viewBox="0 0 24 24" fill={LIME} stroke="none"><path d="M3 10.7 12 3l9 7.7V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></svg>
        ) : (
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.7 12 3l9 7.7V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></svg>
        ))}
      </div>
    </nav>
  );
}
