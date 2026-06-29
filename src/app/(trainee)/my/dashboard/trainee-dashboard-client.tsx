"use client";
import Link from "next/link";
import { format, subDays, isToday } from "date-fns";
import { he } from "date-fns/locale";
import { useState, useEffect } from "react";
import { NotificationsBell } from "@/components/shared/notifications-panel";
import { ReadinessWidget } from "@/components/shared/readiness-widget";

const BG = "#0E0E10";
const CARD = { background: "#1A1A1F", borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)" };

const MUSCLE_COLORS: Record<string, string> = {
  "חזה": "#8B5CF6", "כתפיים": "#3B82F6", "גב": "#10B981",
  "רגליים": "#F59E0B", "זרועות": "#F87171", "בטן": "#34D399",
};

const EXERCISE_BG: string[] = [
  "linear-gradient(145deg,#1a0a2e,#3d1a6e,#6b2fa0)",
  "linear-gradient(145deg,#0a1a2e,#1a3d6e,#2f6ba0)",
  "linear-gradient(145deg,#1a1a0a,#3d3a1a,#7a6020)",
  "linear-gradient(145deg,#0a2e1a,#1a6e3d,#20a060)",
  "linear-gradient(145deg,#2e0a1a,#6e1a3d,#a02060)",
];

export function TraineeDashboardClient({ user }: { user: any }) {
  const plan = user?.workoutPlans?.[0];
  const lastCheckIn = user?.checkIns?.[0];
  const todayLog = user?.workoutLogs?.[0];

  const [greeting, setGreeting] = useState("שלום");
  const firstName = user?.name?.split(" ")[0] ?? "מתאמן";

  const logSet = new Set(
    (user?.workoutLogs ?? [])
      .filter((l: any) => l.status === "COMPLETED")
      .map((l: any) => format(new Date(l.date), "yyyy-MM-dd"))
  );

  const weekDays = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
  const weekStatus = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return { label: weekDays[d.getDay()], done: logSet.has(format(d, "yyyy-MM-dd")), today: isToday(d) };
  });

  const totalWorkouts = user?.workoutLogs?.filter((l: any) => l.status === "COMPLETED").length ?? 0;
  const currentWeight = lastCheckIn?.weight ?? user?.traineeProfile?.currentWeight ?? null;
  const sessions = plan?.sessions ?? [];
  const totalExercises = sessions.reduce((s: number, sess: any) => s + (sess.exercises?.length ?? 0), 0);

  const [todayKey, setTodayKey] = useState("");
  const [waterMl, setWaterMl] = useState(0);
  const [showWaterPicker, setShowWaterPicker] = useState(false);
  const WATER_STEPS = [50, 100, 150, 200, 250, 500];

  useEffect(() => {
    const now = new Date();
    const key = format(now, "yyyy-MM-dd");
    setTodayKey(key);
    const h = now.getHours();
    setGreeting(h < 12 ? "בוקר טוב" : h < 17 ? "צהריים טובים" : "ערב טוב");
    try {
      const stored = localStorage.getItem(`water_${key}`);
      if (stored) setWaterMl(Number(stored));
    } catch {}
  }, []);

  const addWater = (ml: number) => {
    setWaterMl(prev => {
      const next = Math.max(0, prev + ml);
      try { localStorage.setItem(`water_${todayKey}`, String(next)); } catch {}
      return next;
    });
    setShowWaterPicker(false);
  };

  const waterDisplay = waterMl >= 1000
    ? `${(waterMl / 1000).toFixed(waterMl % 1000 === 0 ? 0 : 1)}`
    : `${waterMl}`;
  const waterUnit = waterMl >= 1000 ? "ליטר" : "מ״ל";

  return (
    <div style={{ background: BG, minHeight: "100vh", paddingBottom: 100 }} dir="rtl">
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px 0" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 600, marginBottom: 2 }}>
              {greeting} 👋
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{firstName}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/my/chat">
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1A1A1F", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </div>
            </Link>
            <NotificationsBell />
          </div>
        </div>

        {/* Hero Card - purple gradient */}
        <div style={{
          background: "linear-gradient(135deg,#5B21B6 0%,#7C3AED 50%,#9B5CF6 100%)",
          borderRadius: 24, padding: "20px 20px 16px", marginBottom: 16,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -30, left: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <div style={{ position: "absolute", bottom: -20, right: 60, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 6 }}>
                התוכנית שלי<br/>להיום
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                {totalWorkouts} אימונים הושלמו
              </div>
            </div>
            {/* Progress ring */}
            <svg width="64" height="64" viewBox="0 0 64 64" style={{ position: "relative", zIndex: 1 }}>
              <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8"/>
              <circle cx="32" cy="32" r="26" fill="none" stroke="#fff" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${Math.min(totalWorkouts / 20, 1) * 163} 163`}
                transform="rotate(-90 32 32)"/>
              <text x="32" y="37" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff">
                {Math.round(Math.min(totalWorkouts / 20, 1) * 100)}%
              </text>
            </svg>
          </div>

          {/* Week strip */}
          <div style={{ display: "flex", gap: 6, marginTop: 16, position: "relative", zIndex: 1 }}>
            {weekStatus.map((d, i) => (
              <div key={i} style={{
                flex: 1, height: 36, borderRadius: 10, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 2,
                background: d.today ? "rgba(255,255,255,0.25)" : d.done ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
              }}>
                <span style={{ fontSize: 8, fontWeight: 600, color: d.today ? "#fff" : "rgba(255,255,255,0.5)" }}>{d.label}</span>
                {d.done && <div style={{ width: 4, height: 4, borderRadius: "50%", background: d.today ? "#fff" : "rgba(255,255,255,0.7)" }} />}
              </div>
            ))}
          </div>
        </div>

        {/* 4 Metric tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          <div style={{ ...CARD, padding: "14px 16px" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600, marginBottom: 6 }}>🔥 קלוריות נשרפו</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#F97316" }}>
              {totalWorkouts * 320} <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>Kcal</span>
            </div>
          </div>
          <div style={{ ...CARD, padding: "14px 16px", position: "relative", cursor: "pointer" }} onClick={() => setShowWaterPicker(v => !v)}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600, marginBottom: 6 }}>💧 מים היום</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#60A5FA" }}>
              {waterMl === 0 ? <span style={{ fontSize: 14, color: "rgba(255,255,255,0.2)" }}>הוסף +</span>
                : <>{waterDisplay} <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>{waterUnit}</span></>}
            </div>
            {showWaterPicker && (
              <div onClick={e => e.stopPropagation()} style={{
                position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 50,
                background: "#1A1A1F", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16,
                padding: 12, display: "flex", flexDirection: "column", gap: 6,
              }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textAlign: "center", marginBottom: 2 }}>הוסף מ״ל</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                  {WATER_STEPS.map(ml => (
                    <button key={ml} onClick={() => addWater(ml)} style={{
                      background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.2)",
                      borderRadius: 10, color: "#60A5FA", fontSize: 12, fontWeight: 700,
                      padding: "7px 4px", cursor: "pointer",
                    }}>+{ml}</button>
                  ))}
                </div>
                {waterMl > 0 && (
                  <button onClick={() => addWater(-waterMl)} style={{
                    background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 10,
                    color: "rgba(255,255,255,0.3)", fontSize: 10, padding: "5px", cursor: "pointer", marginTop: 2,
                  }}>איפוס</button>
                )}
              </div>
            )}
          </div>
          {currentWeight && (
            <div style={{ ...CARD, padding: "14px 16px" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600, marginBottom: 6 }}>⚖️ משקל</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#A78BFA" }}>
                {currentWeight} <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>ק״ג</span>
              </div>
            </div>
          )}
          <div style={{ ...CARD, padding: "14px 16px" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600, marginBottom: 6 }}>⚡ אימונים</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#34D399" }}>
              {totalWorkouts} <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>/חודש</span>
            </div>
          </div>
        </div>

        {/* Readiness check-in */}
        <ReadinessWidget />

        {/* Today's workout section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>
            {plan ? plan.name : "אין תוכנית פעילה"}
          </span>
          <Link href="/my/workout" style={{ fontSize: 12, color: "#8B5CF6", fontWeight: 700, textDecoration: "none" }}>ראה הכל</Link>
        </div>

        {/* Exercise cards with gradient bg */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {sessions.length === 0 ? (
            <div style={{ ...CARD, padding: 32, textAlign: "center" }}>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>המאמן שלך יוסיף תוכנית בקרוב</div>
            </div>
          ) : sessions.slice(0, 3).map((session: any, idx: number) => (
            <Link key={session.id} href="/my/workout" style={{ textDecoration: "none" }}>
              <div style={{
                borderRadius: 18, overflow: "hidden", position: "relative", height: 90,
                background: EXERCISE_BG[idx % EXERCISE_BG.length],
              }}>
                {/* overlay */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.15) 100%)" }} />
                {/* silhouette emoji */}
                <div style={{ position: "absolute", right: 12, bottom: 0, fontSize: 52, opacity: 0.18, filter: "grayscale(1)" }}>
                  {idx === 0 ? "🏋️" : idx === 1 ? "🤸" : "🦵"}
                </div>
                <div style={{ position: "relative", zIndex: 1, padding: "12px 14px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    {session.exercises?.[0]?.exercise?.muscleGroup && (
                      <span style={{
                        background: MUSCLE_COLORS[session.exercises[0].exercise.muscleGroup] ?? "#8B5CF6",
                        color: "#fff", borderRadius: 99, padding: "2px 10px", fontSize: 9, fontWeight: 800,
                      }}>
                        {session.exercises[0].exercise.muscleGroup}
                      </span>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{session.name}</div>
                    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>
                        {session.exercises?.length ?? 0} תרגילים
                      </span>
                      {session.dayLabel && (
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{session.dayLabel}</span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Play button */}
                <div style={{
                  position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                  width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="12" height="12" fill="#fff" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick links */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Today task</span>
          <Link href="/my/nutrition" style={{ fontSize: 12, color: "#8B5CF6", fontWeight: 700, textDecoration: "none" }}>ראה הכל</Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { href: "/my/nutrition", icon: "🥗", label: "מעקב תזונה", sub: "עדכן ארוחות היום", color: "linear-gradient(135deg,#065F46,#10B981)" },
            { href: "/my/checkin", icon: "📊", label: "צ׳ק-אין שבועי", sub: "שקל ועדכן מדידות", color: "linear-gradient(135deg,#1D4ED8,#3B82F6)" },
            { href: "/my/ai", icon: "🤖", label: "מאמן AI", sub: "שאל שאלה על אימון", color: "linear-gradient(135deg,#7C3AED,#9B5CF6)" },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{ ...CARD, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, background: item.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{item.sub}</div>
                </div>
                <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
