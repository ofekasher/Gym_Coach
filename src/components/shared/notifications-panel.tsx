"use client";
import { useState } from "react";
import { X, Bell, MessageCircle, Dumbbell, Apple, Trophy, Info } from "lucide-react";

export interface Notification {
  id: string;
  type: "message" | "workout" | "nutrition" | "achievement" | "info";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const ICON_MAP = {
  message: MessageCircle,
  workout: Dumbbell,
  nutrition: Apple,
  achievement: Trophy,
  info: Info,
};

const COLOR_MAP = {
  message: "#8B5CF6",
  workout: "#10B981",
  nutrition: "#F59E0B",
  achievement: "#F97316",
  info: "#3B82F6",
};

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "n1", type: "message", read: false,
    title: "הודעה מהמאמן",
    body: "אבי, עשית עבודה מעולה השבוע! זכור להגדיל את המשקל בלחיצת חזה ל-77.5 ק״ג באימון הבא.",
    time: "לפני שעה",
  },
  {
    id: "n2", type: "workout", read: false,
    title: "תזכורת אימון",
    body: "יש לך Push Day היום! 3 ✅ אימונים הושלמו השבוע — עוד אחד ותגיע ליעד שלך.",
    time: "לפני 3 שעות",
  },
  {
    id: "n3", type: "achievement", read: true,
    title: "שיא אישי חדש! 🏆",
    body: "הגעת ל-100 ק״ג בסקוואט! זה שיא אישי חדש. המאמן גאה בך.",
    time: "אתמול",
  },
  {
    id: "n4", type: "nutrition", read: true,
    title: "תזכורת תזונה",
    body: "אל תשכח לאכול את ארוחת הערב — חלבון חשוב לשחזור השרירים לאחר האימון.",
    time: "לפני 2 ימים",
  },
  {
    id: "n5", type: "info", read: true,
    title: "צ׳ק-אין שבועי",
    body: "שלח עדכון משקל השבוע. המאמן ממתין לנתונים שלך.",
    time: "לפני 3 ימים",
  },
];

interface Props {
  initialNotifications?: Notification[];
}

export function NotificationsBell({ initialNotifications = DEMO_NOTIFICATIONS }: Props) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <>
      {/* Bell button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "#1A1A1F",
          border: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", position: "relative",
        }}
      >
        <Bell style={{ width: 18, height: 18, stroke: "rgba(255,255,255,0.5)" }} />
        {unreadCount > 0 && (
          <div style={{
            position: "absolute", top: -2, right: -2,
            width: 16, height: 16, borderRadius: "50%",
            background: "#7C3AED",
            border: "2px solid #0E0E10",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, fontWeight: 800, color: "#fff",
          }}>
            {unreadCount}
          </div>
        )}
      </button>

      {/* Panel overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9998,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: "absolute", top: 0, left: 0, right: 0,
              background: "#111114",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0 0 24px 24px",
              maxHeight: "80vh",
              overflow: "hidden",
              display: "flex", flexDirection: "column",
            }}
          >
            {/* Header */}
            <div style={{ padding: "16px 18px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Bell style={{ width: 16, height: 16, color: "#A78BFA" }} />
                <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>התראות</span>
                {unreadCount > 0 && (
                  <span style={{ fontSize: 11, background: "rgba(124,58,237,0.2)", color: "#A78BFA", borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>{unreadCount} חדשות</span>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ background: "none", border: "none", color: "#8B5CF6", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    סמן הכל כנקרא
                  </button>
                )}
                <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>

            {/* List */}
            <div style={{ overflowY: "auto", flex: 1 }}>
              {notifications.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>אין התראות</div>
              ) : notifications.map(n => {
                const Icon = ICON_MAP[n.type];
                const color = COLOR_MAP[n.type];
                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    style={{
                      padding: "14px 18px",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      display: "flex", gap: 12, alignItems: "flex-start",
                      background: n.read ? "transparent" : "rgba(124,58,237,0.05)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                      <Icon style={{ width: 16, height: 16, color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: n.read ? 600 : 800, color: n.read ? "rgba(255,255,255,0.7)" : "#fff" }}>{n.title}</span>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>{n.time}</span>
                      </div>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, margin: "4px 0 0" }}>{n.body}</p>
                    </div>
                    {!n.read && (
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#7C3AED", flexShrink: 0, marginTop: 6 }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
