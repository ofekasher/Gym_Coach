"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Apple, Dumbbell, User } from "lucide-react";

const GREEN = "#a8ff3e";

const NAV = [
  { href: "/my/dashboard", label: "בית", Icon: Home },
  { href: "/my/workout", label: "אימון", Icon: Dumbbell },
  { href: "/my/nutrition", label: "תזונה", Icon: Apple },
  { href: "/my/profile", label: "חשבון", Icon: User },
];

export function TraineeBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      dir="rtl"
      style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480, zIndex: 50,
        background: "rgba(8,8,16,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", padding: "12px 8px 26px" }}>
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, minWidth: 52 }}>
                <Icon size={23} color={active ? GREEN : "rgba(255,255,255,0.45)"} />
                <span style={{ fontSize: 11, fontWeight: active ? 700 : 400, color: active ? GREEN : "rgba(255,255,255,0.45)" }}>{label}</span>
                {active && <span style={{ width: 5, height: 5, borderRadius: "50%", background: GREEN }} />}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
