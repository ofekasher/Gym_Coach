"use client";
import Link from "next/link";
import { format, subDays, addDays, isToday, isPast } from "date-fns";
import { useState, useEffect } from "react";
import { getMuscleGymPhoto } from "@/lib/gym-photos";

// Lior Fit v2 design tokens — from "Lior Fit v2.dc.html" (claude.ai/design), copied exactly
const LIME = "#a8ff3e";
const BG_DARK = "#0a1a0a";
const CARD = "#0f1f0f";
const GRADIENT_CTA = "linear-gradient(105deg,#D2F84B 0%,#6FD668 55%,#35C877 100%)";
const MARK_COLOR: Record<string, string> = { red: "#ff5a5a", check: LIME, yellow: "#FFC93D" };

const CATEGORIES = [
  { k: "all", label: "הכל" },
  { k: "fat", label: "חיטוב" },
  { k: "yoga", label: "יוגה" },
  { k: "muscle", label: "מסת שריר" },
];

const MONTHS_HE = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

export function TraineeDashboardClient({ user }: { user: any }) {
  const plan = user?.workoutPlans?.[0];
  const firstName = user?.name?.split(" ")[0] ?? "מתאמן";
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedCat, setSelectedCat] = useState("all");

  const logSet = new Set(
    (user?.workoutLogs ?? [])
      .filter((l: any) => l.status === "COMPLETED")
      .map((l: any) => format(new Date(l.date), "yyyy-MM-dd"))
  );

  const weekDays = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
  const anchor = addDays(new Date(), weekOffset * 7);
  const homeDays = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(anchor, anchor.getDay() - i);
    const done = logSet.has(format(d, "yyyy-MM-dd"));
    const today = isToday(d);
    const mark = today ? undefined : done ? "check" : isPast(d) ? "red" : undefined;
    return { d: weekDays[d.getDay()], n: format(d, "dd"), today, mark };
  });

  const sessions = plan?.sessions ?? [];
  const totalWorkouts = user?.workoutLogs?.filter((l: any) => l.status === "COMPLETED").length ?? 0;
  const planSessionsTotal = sessions.length;
  const planSessionsDone = Math.min(totalWorkouts, planSessionsTotal || totalWorkouts);
  const weeklyPct = planSessionsTotal > 0 ? Math.round((planSessionsDone / planSessionsTotal) * 100) : 0;

  const now = new Date();
  const monthLabel = `${MONTHS_HE[now.getMonth()]} (${now.getFullYear()})`;

  useEffect(() => {
    if (user?.id) {
      try { localStorage.setItem("demo_trainee_id", user.id); } catch {}
    }
  }, [user?.id]);

  return (
    <div style={{ position: "relative", minHeight: "100vh", paddingBottom: 100 }} dir="rtl">
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 20px 12px", position: "relative" }}>

        {/* Header — greeting + serif-accent heading, fire button + avatar */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", marginBottom: 2 }}>שלום {firstName} 👋</div>
            <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.05, color: "#fff" }}>
              בונים <span className="lf-serif" style={{ color: LIME, fontSize: 33 }}>הרגלים טובים</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginTop: 4 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>🔥</div>
            <div style={{
              width: 44, height: 44, borderRadius: "50%", overflow: "hidden", border: `2px solid ${LIME}`,
              background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 900, color: LIME,
            }}>
              {firstName.charAt(0)}
            </div>
          </div>
        </div>

        {/* Month + week nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, padding: "0 4px" }}>
          <button onClick={() => setWeekOffset((w) => w - 1)} style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          </button>
          <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{monthLabel}</div>
          <button onClick={() => setWeekOffset((w) => w + 1)} style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
        </div>

        {/* Day pills */}
        <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginBottom: 22 }}>
          {homeDays.map((d, i) => (
            <div key={i} style={{
              position: "relative", flex: 1, minWidth: 0, display: "flex", flexDirection: "column",
              alignItems: "center", gap: 8, padding: "12px 0 10px", borderRadius: 999,
              background: d.today ? "transparent" : "rgba(255,255,255,0.03)",
              border: `1px solid ${d.today ? "transparent" : "rgba(255,255,255,0.07)"}`,
            }}>
              <div style={{ position: "absolute", top: 5, width: 6, height: 6, borderRadius: "50%", background: d.mark ? MARK_COLOR[d.mark] : "transparent" }} />
              <span style={{ fontSize: 12, color: d.today ? LIME : "rgba(255,255,255,0.45)", fontWeight: d.today ? 700 : 500 }}>{d.d}</span>
              <div style={{ width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: d.today ? `2px solid ${LIME}` : "2px solid transparent", color: "#fff" }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{d.n}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Challenge banner — real weekly-plan progress bound to the design's exact layout */}
        {planSessionsTotal > 0 && (
          <div style={{ background: GRADIENT_CTA, borderRadius: 22, padding: "8px 8px 8px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
            <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#0a1004", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={LIME} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M6 4h12v5a6 6 0 0 1-12 0z" /><path d="M9 21h6M12 15v6" /></svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#0a1004", marginBottom: 6 }}>יעד השבוע</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(10,16,4,0.65)" }}>הושלם</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#0a1004" }}>{planSessionsDone}/{planSessionsTotal} · {weeklyPct}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: "rgba(10,16,4,0.18)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${weeklyPct}%`, background: "#0a1004", borderRadius: 999 }} />
              </div>
            </div>
            <Link href="/my/workout" style={{ width: 44, height: 44, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a1004" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M8 7h9v9" /></svg>
            </Link>
          </div>
        )}

        {/* Category chips */}
        <div style={{ display: "flex", gap: 10, overflowX: "auto", marginBottom: 18, paddingBottom: 2 }}>
          {CATEGORIES.map((c) => {
            const sel = selectedCat === c.k;
            return (
              <button key={c.k} onClick={() => setSelectedCat(c.k)} style={{
                flexShrink: 0, padding: "11px 22px", borderRadius: 999, fontSize: 14, fontWeight: 700, cursor: "pointer",
                background: sel ? "transparent" : "#171c15",
                border: `1.5px solid ${sel ? LIME : "transparent"}`,
                color: sel ? LIME : "rgba(255,255,255,0.7)",
              }}>{c.label}</button>
            );
          })}
        </div>

        {/* Workout cards — real upcoming sessions */}
        <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4, margin: "0 -20px", paddingRight: 20, paddingLeft: 20 }}>
          {sessions.length === 0 ? (
            <div style={{ background: CARD, borderRadius: 20, padding: 20, textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 13, width: "100%" }}>
              המאמן שלך עדיין לא הקצה תוכנית אימונים — היא תופיע כאן ברגע שתתווסף
            </div>
          ) : sessions.slice(0, 3).map((session: any) => {
            const muscles = Array.from(new Set(session.exercises?.map((e: any) => e.exercise?.muscleGroup).filter(Boolean) ?? []));
            const minutes = Math.max(15, (session.exercises?.length ?? 0) * 5);
            return (
              <Link key={session.id} href="/my/workout/preview" style={{ textDecoration: "none", flexShrink: 0 }}>
                <div style={{
                  position: "relative", width: 250, height: 290, borderRadius: 24, overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.06)",
                  backgroundImage: `url(${getMuscleGymPhoto(session.exercises?.[0]?.exercise?.muscleGroup)})`,
                  backgroundSize: "cover", backgroundPosition: "center",
                }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,26,10,0.92) 8%, rgba(10,26,10,0.1) 55%)" }} />
                  <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(10,16,4,0.55)", backdropFilter: "blur(6px)", border: "1px solid rgba(168,255,62,0.4)", borderRadius: 999, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={LIME} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                    <span style={{ fontSize: 12, fontWeight: 700, color: LIME }}>{minutes} דק׳</span>
                  </div>
                  <div style={{ position: "absolute", top: 12, left: 12, width: 36, height: 36, borderRadius: "50%", background: "rgba(10,16,4,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z" /></svg>
                  </div>
                  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "16px 16px 18px" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.01em", color: "#fff" }}>{session.name}</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 3 }}>{muscles.join(", ") || session.dayLabel}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
