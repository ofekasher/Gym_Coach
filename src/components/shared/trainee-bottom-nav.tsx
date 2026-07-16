"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Apple, Dumbbell, User } from "lucide-react";

const NAV = [
  { href: "/my/dashboard", label: "בית", Icon: Home },
  { href: "/my/nutrition", label: "תזונה", Icon: Apple },
  { href: "/my/workout", label: "אימונים", Icon: Dumbbell },
  { href: "/my/profile", label: "פרופיל", Icon: User },
];

export function TraineeBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      dir="rtl"
      style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480, zIndex: 50,
        background: "#1c1c2e", borderTop: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", padding: "12px 8px" }}>
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 52 }}>
                <Icon size={24} color={active ? "#fff" : "#6b7280"} />
                <span style={{ fontSize: 11, color: active ? "#fff" : "#6b7280" }}>{label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
