"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/my/dashboard", label: "בית", icon: (active: boolean) => (
    <svg width="22" height="22" fill="none" stroke={active ? "#8B5CF6" : "rgba(255,255,255,0.3)"} strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )},
  { href: "/my/workout", label: "אימון", icon: (active: boolean) => (
    <svg width="22" height="22" fill="none" stroke={active ? "#8B5CF6" : "rgba(255,255,255,0.3)"} strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M6.5 6.5h11M6.5 17.5h11M3 12h18M6 3v18M18 3v18" strokeLinecap="round"/>
    </svg>
  )},
  { href: "/my/nutrition", label: "תזונה", icon: (active: boolean) => (
    <svg width="22" height="22" fill="none" stroke={active ? "#8B5CF6" : "rgba(255,255,255,0.3)"} strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M12 2a7 7 0 017 7c0 4-3 6-4 9H9c-1-3-4-5-4-9a7 7 0 017-7z"/><path d="M9 21h6M12 21v-4"/>
    </svg>
  )},
  { href: "/my/progress", label: "נתונים", icon: (active: boolean) => (
    <svg width="22" height="22" fill="none" stroke={active ? "#8B5CF6" : "rgba(255,255,255,0.3)"} strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round"/>
    </svg>
  )},
  { href: "/my/ai", label: "AI", icon: (active: boolean) => (
    <svg width="22" height="22" fill="none" stroke={active ? "#8B5CF6" : "rgba(255,255,255,0.3)"} strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  )},
];

export function TraineeBottomNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
      background: "rgba(14,14,16,0.95)", backdropFilter: "blur(20px)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", padding: "10px 8px 16px", maxWidth: 480, margin: "0 auto" }}>
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 52 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: active ? "rgba(139,92,246,0.15)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}>
                  {item.icon(active)}
                </div>
                <span style={{
                  fontSize: 10, fontWeight: active ? 700 : 500,
                  color: active ? "#8B5CF6" : "rgba(255,255,255,0.3)",
                  transition: "color 0.2s",
                }}>{item.label}</span>
                {active && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#8B5CF6", marginTop: -2 }} />}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
