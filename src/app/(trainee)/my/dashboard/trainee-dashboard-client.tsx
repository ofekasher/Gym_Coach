"use client";
import Link from "next/link";
import { format, subDays, isToday } from "date-fns";
import { he } from "date-fns/locale";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { NotificationsBell } from "@/components/shared/notifications-panel";
import { ReadinessWidget } from "@/components/shared/readiness-widget";
import { getMuscleGymPhoto } from "@/lib/gym-photos";
import { Droplet, Scale, Zap, Salad, ClipboardList, Bot } from "lucide-react";

const BG = "transparent";
const CARD = { background: "#161B22", borderRadius: 28, border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 8px 24px rgba(0,0,0,0.35)" };
const GREEN = "#a8ff3e";

function ProgressRing({ pct }: { pct: number }) {
  const r = 42, circum = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
        <motion.circle
          cx="50" cy="50" r={r} fill="none" stroke="#a8ff3e" strokeWidth="9"
          strokeLinecap="round" strokeDasharray={circum}
          initial={{ strokeDashoffset: circum }}
          animate={{ strokeDashoffset: circum - (pct / 100) * circum }}
          transition={{ duration: 1, ease: "easeOut" }}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 20, color: "#fff" }}>
        {pct}%
      </div>
    </div>
  );
}


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
    return { label: weekDays[d.getDay()], date: d.getDate(), done: logSet.has(format(d, "yyyy-MM-dd")), today: isToday(d) };
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 700, marginBottom: 3 }}>
              {greeting} 👋
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em", color: "#fff" }}>{firstName}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/my/chat">
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1A1A1F", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </div>
            </Link>
            <NotificationsBell />
            <div style={{
              width: 48, height: 48, borderRadius: 16, flexShrink: 0, overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.12)", background: GREEN,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 900, color: "#08120a",
            }}>
              {firstName.charAt(0)}
            </div>
          </div>
        </div>

        {/* Calendar strip */}
        <div style={{ display: "flex", gap: 6, justifyContent: "space-between", marginBottom: 22 }}>
          {weekStatus.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>{d.label}</span>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: d.today ? 900 : 600,
                background: d.today ? GREEN : d.done ? "rgba(255,255,255,0.18)" : "transparent",
                color: d.today ? "#08120a" : d.done ? "#fff" : "rgba(255,255,255,0.4)",
                border: d.today || d.done ? "none" : "1px solid rgba(255,255,255,0.2)",
              }}>
                {d.date}
              </div>
            </div>
          ))}
        </div>

        {/* Weekly progress card */}
        {plan && (
          <div style={{ ...CARD, padding: 22, marginBottom: 16, minHeight: 144, display: "flex", alignItems: "center", gap: 20 }}>
            <ProgressRing pct={planProgressPct} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.01em", marginBottom: 4, color: "#fff" }}>{plan.name}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 12 }}>
                ביצעת {planSessionsDone} מתוך {planSessionsTotal || totalWorkouts} אימונים
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: GREEN }}>🔥 {streak}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>רצף ימים</div>
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>{totalWorkouts}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>אימונים</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Card - subdued dark card, green used as accent */}
        <div style={{ ...CARD, padding: "20px 20px 16px", marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>
            היי שלי
          </div>

          {/* 2 stat tiles */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { value: String(weeksInProgram), label: "שבועות בתוכנית" },
              { value: weightChange == null ? "—" : `${weightChange > 0 ? "+" : ""}${weightChange}`, label: "שינוי במשקל (ק״ג)" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: GREEN }}>{s.value}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2, lineHeight: 1.3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Metric tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          <div style={{ ...CARD, padding: "14px 16px" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>
              {totalWorkouts} <span style={{ fontSize: 12, fontWeight: 700, color: GREEN }}>אימונים הושלמו</span>
            </div>
            <div style={{ fontSize: 10, color: GREEN, fontWeight: 600, marginTop: 4 }}>השבוע</div>
          </div>
          <div style={{ ...CARD, padding: "14px 16px", position: "relative", cursor: "pointer" }} onClick={() => setShowWaterPicker(v => !v)}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}><Droplet size={11} /> מים היום</div>
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
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}><Scale size={11} /> משקל</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#93C5FD" }}>
                {currentWeight} <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>ק״ג</span>
              </div>
            </div>
          )}
          <div style={{ ...CARD, padding: "14px 16px" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}><Zap size={11} /> אימונים</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#34D399" }}>
              {totalWorkouts} <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>/חודש</span>
            </div>
          </div>
        </div>

        {/* Readiness check-in */}
        <ReadinessWidget />

        {/* Section 2 — Weekly workouts, FitBuddy style */}
        {plan && (
          <>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 12 }}>האימונים שלך השבוע:</div>
            <div style={{ marginBottom: 20 }}>
              {sessions.length === 0 ? (
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, padding: "16px 0" }}>המאמן שלך יוסיף תוכנית בקרוב</div>
              ) : sessions.slice(0, 3).map((session: any, idx: number) => {
                const done = idx < planSessionsDone;
                const isNext = idx === planSessionsDone;
                const muscles = Array.from(new Set(session.exercises?.map((e: any) => e.exercise?.muscleGroup).filter(Boolean) ?? [])).join(", ");
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Link href="/my/workout" style={{ textDecoration: "none" }}>
                      <div style={{
                        position: "relative", height: 176, borderRadius: 22, overflow: "hidden", marginBottom: 14,
                        backgroundImage: `url(${getMuscleGymPhoto(session.exercises?.[0]?.exercise?.muscleGroup)})`,
                        backgroundSize: "cover", backgroundPosition: "center",
                      }}>
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.28) 45%, rgba(0,0,0,0) 100%)" }} />
                        <span style={{
                          position: "absolute", top: 12, right: 12, width: 12, height: 12, borderRadius: "50%",
                          background: done ? GREEN : "rgba(255,255,255,0.4)", boxShadow: done ? `0 0 8px ${GREEN}` : "none",
                        }} />
                        {isNext && (
                          <div style={{
                            position: "absolute", top: 12, left: 12,
                            background: GREEN, color: "#08120a", fontSize: 12, fontWeight: 800,
                            padding: "5px 12px", borderRadius: 99,
                          }}>האימון הבא</div>
                        )}
                        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 16 }}>
                          {session.dayLabel && (
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", fontWeight: 600, textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>{session.dayLabel}</div>
                          )}
                          <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.01em", color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>
                            {session.name}
                          </div>
                          {muscles && (
                            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 2, textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>{muscles}</div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {/* Quick links */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Today task</span>
          <Link href="/my/nutrition" style={{ fontSize: 12, color: GREEN, fontWeight: 700, textDecoration: "none" }}>ראה הכל</Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { href: "/my/nutrition", icon: Salad, label: "מעקב תזונה", sub: "עדכן ארוחות היום", color: "linear-gradient(135deg,#065F46,#10B981)" },
            { href: "/my/checkin", icon: ClipboardList, label: "צ׳ק-אין שבועי", sub: "שקל ועדכן מדידות", color: "linear-gradient(135deg,#5ecc00,#a8ff3e)" },
            { href: "/my/ai", icon: Bot, label: "מאמן AI", sub: "שאל שאלה על אימון", color: "linear-gradient(135deg,#5ecc00,#a8ff3e)" },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{ ...CARD, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, background: item.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <item.icon size={20} color="#0a0a0a" />
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

      <Link href="/my/ai">
        <motion.div
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          className="fixed bottom-24 left-4 z-40 w-14 h-14 rounded-full bg-[#a8ff3e] flex items-center justify-center shadow-lg shadow-[#a8ff3e]/30"
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-full bg-[#a8ff3e]/30"
          />
          <Bot className="w-6 h-6 text-black" />
        </motion.div>
      </Link>
    </div>
  );
}
