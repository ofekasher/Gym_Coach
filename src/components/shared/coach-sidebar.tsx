"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Users, Dumbbell, Mail, LogOut, Menu, X, Zap, MessageCircle, CreditCard, Settings, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/dashboard",  label: "דאשבורד",        icon: LayoutDashboard },
  { href: "/trainees",   label: "מתאמנים",         icon: Users },
  { href: "/schedule",   label: "לוח זמנים",       icon: CalendarDays },
  { href: "/chat",       label: "צ'אט",            icon: MessageCircle },
  { href: "/payments",   label: "תשלומים",         icon: CreditCard },
  { href: "/exercises",  label: "ספריית תרגילים",  icon: Dumbbell },
  { href: "/invite",     label: "הזמן מתאמן/ת",    icon: Mail },
  { href: "/settings",   label: "הגדרות",          icon: Settings },
];

const SIDEBAR_BG  = "#111113";
const CARD_BG     = "#1A1A1F";
const PURPLE      = "#8B5CF6";
const PURPLE_DIM  = "rgba(139,92,246,0.12)";
const PURPLE_GLOW = "0 4px 20px rgba(139,92,246,0.35)";
const BORDER      = "rgba(255,255,255,0.06)";
const MUTED       = "#3F3F46";

interface Props {
  user: { name?: string | null; email?: string | null };
}

export function CoachSidebar({ user }: Props) {
  const pathname   = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ background: SIDEBAR_BG }}>

      {/* Logo */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#6D28D9,#8B5CF6)", boxShadow: PURPLE_GLOW }}>
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-white tracking-tight">FitCoach Pro</div>
            <div className="text-[10px] flex items-center gap-1" style={{ color: MUTED }}>
              <Zap className="w-2.5 h-2.5" style={{ color: PURPLE, fill: PURPLE }} />
              AI Powered
            </div>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="mx-4 mb-4 rounded-2xl p-3"
        style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 text-white"
            style={{ background: "linear-gradient(135deg,#6D28D9,#8B5CF6)" }}>
            {user.name?.[0] ?? "מ"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-[10px] truncate" style={{ color: MUTED }}>{user.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={active
                ? { background: PURPLE_DIM, color: PURPLE, fontWeight: 700,
                    borderRight: `2px solid ${PURPLE}` }
                : { color: MUTED }
              }
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = MUTED; }}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
              {active && (
                <span className="mr-auto w-1.5 h-1.5 rounded-full" style={{ background: PURPLE }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-3 pt-2">
        <div className="pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all w-full"
            style={{ color: MUTED }}
            onMouseEnter={e => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = MUTED; e.currentTarget.style.background = "transparent"; }}
          >
            <LogOut className="w-4 h-4" />
            <span>יציאה</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col fixed right-0 top-0 h-screen w-60 z-40"
        style={{ background: SIDEBAR_BG, borderLeft: `1px solid ${BORDER}` }}>
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-50 w-11 h-11 rounded-2xl flex items-center justify-center"
        style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
        aria-label="פתח תפריט"
      >
        <Menu className="w-5 h-5" style={{ color: PURPLE }} />
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
                style={{ background: CARD_BG }}
                aria-label="סגור תפריט"
              >
                <X className="w-4 h-4" style={{ color: MUTED }} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
