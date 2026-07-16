"use client";
import Link from "next/link";
import { format, subDays, isToday } from "date-fns";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getMuscleGymPhoto } from "@/lib/gym-photos";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";

const BG = "transparent";
const CARD = { background: "#161B22", borderRadius: 28, border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 8px 24px rgba(0,0,0,0.35)" };
const GREEN = "#a8ff3e";

function ProgressRing({ pct }: { pct: number }) {
  // r=82 in a 200 viewBox scaled to 118px, matching Lior Fit.dc.html exactly
  const r = 82, circum = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: 118, height: 118, flexShrink: 0 }}>
      <svg width="118" height="118" viewBox="0 0 200 200" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="16" />
        <motion.circle
          cx="100" cy="100" r={r} fill="none" stroke="#a8ff3e" strokeWidth="16"
          strokeLinecap="round" strokeDasharray={circum}
          initial={{ strokeDashoffset: circum }}
          animate={{ strokeDashoffset: circum - (pct / 100) * circum }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 26, color: "#fff" }}>
        <AnimatedNumber value={pct} />%
      </div>
    </div>
  );
}


export function TraineeDashboardClient({ user }: { user: any }) {
  const plan = user?.workoutPlans?.[0];

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
  const caloriesEaten = (user?.nutritionLogs ?? []).reduce((s: number, l: any) => s + (l.calories ?? 0), 0);
  const calorieGoal = user?.traineeProfile?.dailyCalories ?? 2700;
  const caloriePct = calorieGoal > 0 ? Math.min(100, Math.round((caloriesEaten / calorieGoal) * 100)) : 0;
  const sessions = plan?.sessions ?? [];

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

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "בוקר טוב" : h < 17 ? "צהריים טובים" : "ערב טוב");
    // Persist demo trainee ID so other pages (e.g. check-in) can use the correct key
    if (user?.id) {
      try { localStorage.setItem("demo_trainee_id", user.id); } catch {}
    }
  }, [user?.id]);

  return (
    <div style={{ background: BG, minHeight: "100vh", paddingBottom: 100 }} dir="rtl">
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px 0" }}>

        {/* Header — matches Lior Fit.dc.html exactly: greeting+name right, avatar square left, nothing else */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 700, marginBottom: 3 }}>
              {greeting} 👋
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em", color: "#fff" }}>{firstName}</div>
          </div>
          <div style={{
            width: 48, height: 48, borderRadius: 16, flexShrink: 0, overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.12)", background: GREEN,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 900, color: "#08120a",
          }}>
            {firstName.charAt(0)}
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

        {/* Daily calorie goal card */}
        <div style={{ ...CARD, padding: 22, marginBottom: 16, minHeight: 144, display: "flex", alignItems: "center", gap: 20 }}>
            <ProgressRing pct={caloriePct} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.01em", marginBottom: 4, color: "#fff" }}>היעד היומי</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginBottom: 14 }}>
                <AnimatedNumber value={caloriesEaten} /> מתוך {calorieGoal.toLocaleString()} קק״ל
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}><AnimatedNumber value={totalWorkouts} /></div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>אימונים</div>
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: GREEN }}><AnimatedNumber value={streak} /> 🔥</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>רצף ימים</div>
                </div>
              </div>
            </div>
          </div>

        {/* Weekly workouts — last element on the Home screen per Lior Fit.dc.html (no colon in the title there).
            Always rendered (with an empty-state) so a missing plan never silently disappears the whole section. */}
        <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginBottom: 12 }}>האימונים שלך השבוע</div>
        <div style={{ marginBottom: 20 }}>
          {(!plan || sessions.length === 0) ? (
            <div style={{ ...CARD, padding: 20, textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
              המאמן שלך עדיין לא הקצה תוכנית אימונים — היא תופיע כאן ברגע שתתווסף
            </div>
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

      </div>
    </div>
  );
}
