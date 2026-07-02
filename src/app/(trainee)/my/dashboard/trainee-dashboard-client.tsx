"use client";
import Link from "next/link";
import { format, subDays, isToday } from "date-fns";
import { he } from "date-fns/locale";
import { useState, useEffect } from "react";
import { NotificationsBell } from "@/components/shared/notifications-panel";
import { ReadinessWidget } from "@/components/shared/readiness-widget";
import { getMuscleGymPhoto } from "@/lib/gym-photos";

const BG = "transparent";
const CARD = { background: "#161B22", borderRadius: 28, border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 8px 24px rgba(0,0,0,0.35)" };


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

  // Weeks in program: since plan start (or account creation if no plan)
  const programStart = plan?.startDate ?? user?.createdAt;
  const weeksInProgram = programStart
    ? Math.max(1, Math.ceil((Date.now() - new Date(programStart).getTime()) / (7 * 24 * 60 * 60 * 1000)))
    : 0;

  // Weight change: current vs starting weight
  const startingWeight = user?.traineeProfile?.startingWeight ?? null;
  const weightChange = currentWeight != null && startingWeight != null
    ? Math.round((currentWeight - startingWeight) * 10) / 10
    : null;

  // Current streak: consecutive days (including today) with a completed workout
  let streak = 0;
  for (let i = 0; i < 90; i++) {
    const d = subDays(new Date(), i);
    if (logSet.has(format(d, "yyyy-MM-dd"))) { streak++; continue; }
    if (i === 0) continue; // today not logged yet, don't break the streak
    break;
  }

  // Progress within current plan session (e.g. "אימון 2 מתוך 5")
  const planSessionsTotal = sessions.length;
  const planSessionsDone = Math.min(totalWorkouts, planSessionsTotal || totalWorkouts);
  const planProgressPct = planSessionsTotal > 0 ? Math.round((planSessionsDone / planSessionsTotal) * 100) : 0;

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
    // Persist demo trainee ID so other pages (e.g. check-in) can use the correct key
    if (user?.id) {
      try { localStorage.setItem("demo_trainee_id", user.id); } catch {}
    }
  }, [user?.id]);

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

        {/* Hero Card - FitBuddy-style: subdued dark card, blue used only as accent */}
        <div style={{ ...CARD, padding: "20px 20px 16px", marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>
            היי שלי
          </div>

          {/* 4 stat tiles */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
            {[
              { value: String(weeksInProgram), label: "שבועות בתוכנית" },
              { value: weightChange == null ? "—" : `${weightChange > 0 ? "+" : ""}${weightChange}`, label: "שינוי במשקל (ק״ג)" },
              { value: String(totalWorkouts), label: "אימונים הושלמו" },
              { value: String(streak), label: "רצף ימים 🔥" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#3B82F6" }}>{s.value}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2, lineHeight: 1.3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Week strip */}
          <div style={{ display: "flex", gap: 6 }}>
            {weekStatus.map((d, i) => (
              <div key={i} style={{
                flex: 1, height: 36, borderRadius: 10, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 2,
                background: d.today ? "rgba(59,130,246,0.25)" : d.done ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.04)",
              }}>
                <span style={{ fontSize: 8, fontWeight: 600, color: d.today ? "#fff" : "rgba(255,255,255,0.4)" }}>{d.label}</span>
                {d.done && <div style={{ width: 4, height: 4, borderRadius: "50%", background: d.today ? "#fff" : "#3B82F6" }} />}
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
              <div style={{ fontSize: 22, fontWeight: 800, color: "#93C5FD" }}>
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

        {/* Plan progress card — FitBuddy style: centered title, thin bar, %, subtitle */}
        {plan && (
          <div style={{ ...CARD, padding: "20px 20px", marginBottom: 20, textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 14 }}>{plan.name}</div>
            <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.08)", marginBottom: 10 }}>
              <div style={{ height: "100%", borderRadius: 99, width: `${planProgressPct}%`, background: "#3B82F6", transition: "width 0.5s ease" }} />
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginBottom: 16 }}>{planProgressPct}%</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 18 }}>
              בוצעו {planSessionsDone} אימונים מתוך {planSessionsTotal || totalWorkouts}
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", textAlign: "right", marginBottom: 12 }}>התוכנית השבועית שלך:</div>

            {/* Weekly plan list — photo thumbnail left, day+muscles middle, status dot right */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {sessions.length === 0 ? (
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, padding: "16px 0" }}>המאמן שלך יוסיף תוכנית בקרוב</div>
              ) : sessions.slice(0, 3).map((session: any, idx: number) => (
                <Link key={session.id} href="/my/workout" style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "#1E242D", borderRadius: 18, overflow: "hidden",
                    display: "flex", alignItems: "center", gap: 12, padding: 8,
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: 14, flexShrink: 0,
                      backgroundImage: `url(${getMuscleGymPhoto(session.exercises?.[0]?.exercise?.muscleGroup)})`,
                      backgroundSize: "cover", backgroundPosition: "center",
                    }} />
                    <div style={{ flex: 1, textAlign: "right" }}>
                      {session.dayLabel && (
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{session.dayLabel}</div>
                      )}
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginTop: 2 }}>
                        {session.name}
                        {session.exercises?.[0]?.exercise?.muscleGroup && (
                          <span style={{ fontWeight: 400, color: "rgba(255,255,255,0.5)" }}>
                            {" "}— {Array.from(new Set(session.exercises.map((e: any) => e.exercise?.muscleGroup).filter(Boolean))).join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{
                      width: 12, height: 12, borderRadius: "50%", flexShrink: 0, marginLeft: 8,
                      background: idx < planSessionsDone ? "#3B82F6" : "rgba(255,255,255,0.15)",
                    }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick links */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Today task</span>
          <Link href="/my/nutrition" style={{ fontSize: 12, color: "#3B82F6", fontWeight: 700, textDecoration: "none" }}>ראה הכל</Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { href: "/my/nutrition", icon: "🥗", label: "מעקב תזונה", sub: "עדכן ארוחות היום", color: "linear-gradient(135deg,#065F46,#10B981)" },
            { href: "/my/checkin", icon: "📊", label: "צ׳ק-אין שבועי", sub: "שקל ועדכן מדידות", color: "linear-gradient(135deg,#1D4ED8,#3B82F6)" },
            { href: "/my/ai", icon: "🤖", label: "מאמן AI", sub: "שאל שאלה על אימון", color: "linear-gradient(135deg,#2563EB,#60A5FA)" },
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
