"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Users, Dumbbell, Mail, LogOut, Menu, X, MessageCircle, CreditCard, Settings, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/dashboard",  label: "דשבורד",          icon: LayoutDashboard },
  { href: "/trainees",   label: "מתאמנים",          icon: Users },
  { href: "/schedule",   label: "לוח זמנים",        icon: CalendarDays },
  { href: "/chat",       label: "צ'אט",             icon: MessageCircle },
  { href: "/payments",   label: "תשלומים",          icon: CreditCard },
  { href: "/exercises",  label: "ספריית תרגילים",   icon: Dumbbell },
  { href: "/invite",     label: "הזמן מתאמן/ת",     icon: Mail },
  { href: "/settings",   label: "הגדרות",           icon: Settings },
];

const GREEN = "#a8ff3e";
const GREEN_DIM = "rgba(168,255,62,0.1)";
const SIDEBAR_BG = "#0f0f1a";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT_MUTED = "rgba(255,255,255,0.5)";

interface Props {
  user: { name?: string | null; email?: string | null };
}

export function CoachSidebar({ user }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ background: SIDEBAR_BG }}>
      {/* Logo */}
      <div className="px-4 pt-2 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: GREEN, boxShadow: `0 4px 20px ${GREEN}55` }}>
            <span className="text-lg">🏋️</span>
          </div>
          <div>
            <div className="font-extrabold text-[18px] text-white tracking-tight">Lior Fit</div>
            <div className="text-[11px]" style={{ color: TEXT_MUTED }}>המאמן האישי שלך</div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${BORDER}`, margin: "0 8px" }} />

      {/* Nav */}
      <nav className="flex-1 px-4 pt-4 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200"
              style={active
                ? { background: GREEN_DIM, color: GREEN, fontWeight: 700 }
                : { color: TEXT_MUTED, fontWeight: 500 }
              }
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.color = "rgba(255,255,255,0.8)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.color = TEXT_MUTED; e.currentTarget.style.background = "transparent"; } }}
            >
              <item.icon size={18} className="flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom profile */}
      <div className="p-4">
        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 14 }}>
          <div className="flex items-center gap-3 px-1 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: GREEN, color: "#0a0a0a" }}>
              {user.name?.[0] ?? "מ"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-[11px] truncate" style={{ color: TEXT_MUTED }}>מאמן ראשי</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all w-full"
            style={{ color: TEXT_MUTED }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#F87171"; e.currentTarget.style.background = "rgba(248,113,113,0.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = TEXT_MUTED; e.currentTarget.style.background = "transparent"; }}
          >
            <LogOut size={16} />
            <span>יציאה</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col fixed right-0 top-0 h-screen w-[220px] z-40"
        style={{ background: SIDEBAR_BG, borderLeft: `1px solid ${BORDER}` }}>
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-50 w-11 h-11 rounded-2xl flex items-center justify-center"
        style={{ background: SIDEBAR_BG, border: `1px solid ${BORDER}` }}
        aria-label="פתח תפריט"
      >
        <Menu size={20} style={{ color: GREEN }} />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
            />
            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed right-0 top-0 h-screen w-64 z-50 flex flex-col"
              style={{ background: SIDEBAR_BG, borderLeft: `1px solid ${BORDER}` }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-xl"
                style={{ background: "rgba(255,255,255,0.05)" }}
                aria-label="סגור תפריט"
              >
                <X size={16} style={{ color: TEXT_MUTED }} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
