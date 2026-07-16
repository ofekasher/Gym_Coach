"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Search, Bell, MessageCircle, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";

const GREEN = "#b6ff4a";

const TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "בית", subtitle: "סקירה כללית של הפעילות שלך" },
  "/trainees": { title: "מתאמנים", subtitle: "כל המתאמנים שלך במקום אחד" },
  "/exercises": { title: "ספריית תרגילים", subtitle: "תרגילים לבניית תוכניות אימון" },
  "/templates": { title: "תבניות אימון", subtitle: "תבניות מוכנות ומותאמות אישית" },
  "/schedule": { title: "לוח שנה", subtitle: "האימונים השבועיים שלך" },
  "/chat": { title: "הודעות", subtitle: "שיחות עם המתאמנים שלך" },
  "/payments": { title: "תשלומים", subtitle: "מנויים וגבייה" },
  "/team": { title: "צוות מאמנים", subtitle: "ניהול הרשאות צוות" },
  "/settings": { title: "הגדרות", subtitle: "פרטי העסק והחשבון שלך" },
};

interface Notification {
  id: string;
  kind: "message" | "payment";
  title: string;
  body: string;
  createdAt: string;
  href: string;
  color: string;
}

interface Props {
  coachName?: string | null;
}

export function CoachHeader({ coachName }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const boxRef = useRef<HTMLDivElement>(null);

  const routeKey = "/" + (pathname?.split("/")[1] ?? "");
  const { title, subtitle } = TITLES[routeKey] ?? { title: "לוח בקרה", subtitle: "" };

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.notifications) setNotifications(data.notifications); })
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/trainees?q=${encodeURIComponent(query.trim())}`);
  };

  const markAllRead = () => setReadIds(new Set(notifications.map((n) => n.id)));
  const clickNotif = (n: Notification) => {
    setReadIds((prev) => new Set(prev).add(n.id));
    setOpen(false);
    router.push(n.href);
  };

  return (
    <div className="flex items-center justify-between gap-4 mb-6" dir="rtl">
      <div>
        <h1 className="lf-display text-[26px] font-black text-white" style={{ letterSpacing: "-0.6px" }}>{title}</h1>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: "#888" }}>{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <form onSubmit={submitSearch} className="relative hidden md:block">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#666" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש מתאמן"
            className="text-sm rounded-xl pr-9 pl-3 py-2 outline-none w-[200px]"
            style={{ background: "#141414", border: "1px solid #1e1e1e", color: "#fff" }}
          />
        </form>

        <div className="relative" ref={boxRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="relative w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "#141414", border: "1px solid #1e1e1e" }}
            aria-label="התראות"
          >
            <Bell size={17} style={{ color: "#aaa" }} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -left-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[10px] font-extrabold"
                style={{ background: GREEN, color: "#0a0a0a" }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div
              className="absolute left-0 top-12 z-50 rounded-2xl overflow-hidden"
              style={{ width: 360, background: "#111", border: "1px solid #1e1e1e", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}
            >
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #1e1e1e" }}>
                <span className="text-sm font-extrabold text-white">התראות</span>
                <button onClick={markAllRead} className="text-xs font-bold" style={{ color: GREEN }}>
                  סמן הכל כנקרא
                </button>
              </div>
              <div className="max-h-[360px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm" style={{ color: "#666" }}>אין התראות חדשות</div>
                ) : (
                  notifications.map((n) => {
                    const isRead = readIds.has(n.id);
                    return (
                      <button
                        key={n.id}
                        onClick={() => clickNotif(n)}
                        className="w-full flex items-start gap-3 px-4 py-3 text-right"
                        style={{ borderBottom: "1px solid #1a1a1a", background: isRead ? "transparent" : "rgba(182,255,74,0.03)" }}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: `${n.color}22`, color: n.color }}
                        >
                          {n.kind === "message" ? <MessageCircle size={14} /> : <AlertTriangle size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-bold text-white">{n.title}</div>
                          <div className="text-xs truncate mt-0.5" style={{ color: "#888" }}>{n.body}</div>
                          <div className="text-[10px] mt-1" style={{ color: "#555" }}>
                            {formatDistanceToNow(new Date(n.createdAt), { locale: he, addSuffix: true })}
                          </div>
                        </div>
                        {!isRead && <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: GREEN }} />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <Link href="/settings" className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5" style={{ background: "#141414", border: "1px solid #1e1e1e" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ background: GREEN, color: "#0a0a0a" }}>
            {coachName?.[0] ?? "מ"}
          </div>
          <div className="hidden sm:block text-right">
            <div className="text-xs font-bold text-white leading-tight">{coachName ?? "מאמן"}</div>
            <div className="text-[10px] leading-tight" style={{ color: "#666" }}>מאמן ראשי</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
