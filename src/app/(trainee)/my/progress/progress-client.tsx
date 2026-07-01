"use client";
import { format } from "date-fns";
import { useState } from "react";
import { Trophy, TrendingUp, Dumbbell, Scale, Camera, Plus, Lock } from "lucide-react";

const CARD = { background: "#1A1A1F", borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)" };

// Demo exercise history data
const DEMO_EXERCISE_HISTORY = [
  {
    name: "לחיצת חזה",
    muscleGroup: "חזה",
    logs: [
      { date: "2024-02-01", weight: 60, reps: 10, sets: 4 },
      { date: "2024-02-15", weight: 65, reps: 8, sets: 4 },
      { date: "2024-03-01", weight: 70, reps: 8, sets: 4 },
      { date: "2024-03-15", weight: 72.5, reps: 6, sets: 4 },
      { date: "2024-04-01", weight: 75, reps: 6, sets: 5 },
    ],
  },
  {
    name: "סקוואט",
    muscleGroup: "רגליים",
    logs: [
      { date: "2024-02-01", weight: 80, reps: 8, sets: 4 },
      { date: "2024-02-15", weight: 85, reps: 8, sets: 4 },
      { date: "2024-03-01", weight: 90, reps: 6, sets: 5 },
      { date: "2024-03-20", weight: 97.5, reps: 5, sets: 5 },
      { date: "2024-04-01", weight: 100, reps: 5, sets: 5 },
    ],
  },
  {
    name: "דדליפט",
    muscleGroup: "גב",
    logs: [
      { date: "2024-02-01", weight: 90, reps: 6, sets: 4 },
      { date: "2024-02-20", weight: 100, reps: 5, sets: 4 },
      { date: "2024-03-10", weight: 107.5, reps: 4, sets: 4 },
      { date: "2024-04-01", weight: 115, reps: 3, sets: 4 },
    ],
  },
  {
    name: "לחיצת כתפיים",
    muscleGroup: "כתפיים",
    logs: [
      { date: "2024-02-05", weight: 40, reps: 10, sets: 3 },
      { date: "2024-02-19", weight: 42.5, reps: 10, sets: 3 },
      { date: "2024-03-05", weight: 45, reps: 8, sets: 4 },
      { date: "2024-04-01", weight: 50, reps: 8, sets: 4 },
    ],
  },
  {
    name: "מתח",
    muscleGroup: "גב",
    logs: [
      { date: "2024-02-01", weight: 0, reps: 6, sets: 3 },
      { date: "2024-02-20", weight: 0, reps: 8, sets: 3 },
      { date: "2024-03-10", weight: 0, reps: 10, sets: 4 },
      { date: "2024-04-01", weight: 10, reps: 8, sets: 4 },
    ],
  },
  {
    name: "כפיפת מרפקים",
    muscleGroup: "זרועות",
    logs: [
      { date: "2024-02-05", weight: 12, reps: 12, sets: 3 },
      { date: "2024-02-22", weight: 14, reps: 10, sets: 3 },
      { date: "2024-03-15", weight: 16, reps: 10, sets: 4 },
      { date: "2024-04-01", weight: 18, reps: 8, sets: 4 },
    ],
  },
];

const MUSCLE_COLORS: Record<string, string> = {
  חזה: "#3B82F6",
  גב: "#3B82F6",
  רגליים: "#10B981",
  כתפיים: "#F59E0B",
  זרועות: "#EC4899",
  בטן: "#EF4444",
};

function MiniBarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80, marginTop: 8 }}>
      {data.map((d, i) => {
        const pct = d.value / max;
        const isMax = d.value === max;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: 9, color: isMax ? "#93C5FD" : "rgba(255,255,255,0.3)", fontWeight: isMax ? 700 : 400 }}>
              {d.value > 0 ? d.value : ""}
            </div>
            <div style={{
              width: "100%", borderRadius: "4px 4px 2px 2px",
              height: `${Math.max(pct * 56, d.value > 0 ? 8 : 3)}px`,
              background: isMax ? "linear-gradient(to top,#1D4ED8,#60A5FA)" : d.value > 0 ? "rgba(59,130,246,0.35)" : "rgba(255,255,255,0.05)",
              transition: "height 0.4s ease",
            }} />
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function WeightLineChart({ logs }: { logs: { date: string; weight: number }[] }) {
  if (logs.length < 2) return null;
  const weights = logs.map(l => l.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;
  const W = 260, H = 60;
  const pts = logs.map((l, i) => {
    const x = (i / (logs.length - 1)) * W;
    const y = H - ((l.weight - minW) / range) * (H - 10) - 5;
    return `${x},${y}`;
  });
  const pr = weights[weights.length - 1];
  const isPRSession = pr === maxW;

  return (
    <div style={{ marginTop: 10 }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        <polyline
          points={pts.join(" ")}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {logs.map((l, i) => {
          const [x, y] = pts[i].split(",").map(Number);
          const isPR = l.weight === maxW;
          return (
            <circle key={i} cx={x} cy={y} r={isPR ? 4 : 2.5}
              fill={isPR ? "#93C5FD" : "#1D4ED8"}
              stroke={isPR ? "#fff" : "none"}
              strokeWidth={isPR ? 1.5 : 0}
            />
          );
        })}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{format(new Date(logs[0].date), "MM/yy")}</span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{format(new Date(logs[logs.length - 1].date), "MM/yy")}</span>
      </div>
    </div>
  );
}

export function ProgressClient({ checkIns, workoutLogs, user }: { checkIns: any[]; workoutLogs: any[]; user: any }) {
  const [tab, setTab] = useState<"body" | "exercises" | "photos">("body");
  const [photoUploading, setPhotoUploading] = useState(false);

  // Demo progress photos (month → front/side/back)
  const DEMO_PHOTOS = [
    {
      month: "פברואר 2024", date: "01/02/2024",
      front: "https://via.placeholder.com/160x200/1a0a2e/A78BFA?text=Front",
      side: "https://via.placeholder.com/160x200/0a1a2e/8B5CF6?text=Side",
      notes: "התחלת תוכנית PPL — משקל 82 ק״ג",
    },
    {
      month: "מרץ 2024", date: "01/03/2024",
      front: "https://via.placeholder.com/160x200/1a1a0a/F59E0B?text=Front",
      side: "https://via.placeholder.com/160x200/0a2e0a/34D399?text=Side",
      notes: "חודש שני — ירידה של 1.5 ק״ג, עלייה בכוח",
    },
    {
      month: "אפריל 2024", date: "01/04/2024",
      front: "https://via.placeholder.com/160x200/2e0a1a/F87171?text=Front",
      side: "https://via.placeholder.com/160x200/1a0a2e/A78BFA?text=Side",
      notes: "חודש שלישי — 79 ק״ג, שיפור ניכר",
    },
  ];
  const profile = user?.traineeProfile;

  const sortedCheckIns = [...(checkIns ?? [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const latest = sortedCheckIns[sortedCheckIns.length - 1];

  const currentWeight = latest?.weight ?? profile?.currentWeight ?? null;
  const goalWeight = profile?.goalWeight ?? null;
  const startWeight = profile?.startWeight ?? sortedCheckIns[0]?.weight ?? currentWeight;
  const weightDiff = currentWeight && startWeight ? (startWeight - currentWeight) : null;
  const toGoal = currentWeight && goalWeight ? Math.abs(currentWeight - goalWeight) : null;

  const weeklyWorkouts = (() => {
    const days = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      const key = format(d, "yyyy-MM-dd");
      const count = (workoutLogs ?? []).filter((l: any) => format(new Date(l.date), "yyyy-MM-dd") === key).length;
      return { label: days[d.getDay()], value: count };
    });
  })();

  const totalWorkouts = (workoutLogs ?? []).filter((l: any) => l.status === "COMPLETED").length;
  const consistencyPct = Math.round(Math.min(totalWorkouts / 20, 1) * 100);

  return (
    <div style={{ background: "#0E0E10", minHeight: "100vh", paddingBottom: 100 }} dir="rtl">
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px 0" }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>הנתונים שלי</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>מעקב התקדמות</div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 4 }}>
          {[
            { key: "body", label: "גוף ומשקל", Icon: Scale },
            { key: "exercises", label: "שיאים אישיים", Icon: Trophy },
          { key: "photos", label: "תמונות", Icon: Camera },
          ].map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setTab(key as any)} style={{
              flex: 1,
              padding: "10px 8px",
              borderRadius: 10,
              border: "none",
              background: tab === key ? "#2563EB" : "transparent",
              color: tab === key ? "#fff" : "rgba(255,255,255,0.4)",
              fontWeight: tab === key ? 700 : 500,
              fontSize: 13,
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "all 0.2s",
            }}>
              <Icon style={{ width: 14, height: 14 }} />
              {label}
            </button>
          ))}
        </div>

        {/* ──── BODY TAB ──── */}
        {tab === "body" && (
          <>
            {/* Weight hero */}
            <div style={{
              background: "linear-gradient(135deg,#1E3A8A 0%,#2563EB 50%,#60A5FA 100%)",
              borderRadius: 24, padding: "20px 20px", marginBottom: 16, position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: 4 }}>משקל נוכחי</div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                    {currentWeight ?? "---"}<span style={{ fontSize: 14, fontWeight: 500, marginRight: 4 }}>ק״ג</span>
                  </div>
                  {weightDiff !== null && (
                    <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 12, color: weightDiff > 0 ? "#34D399" : "#F87171", fontWeight: 700 }}>
                        {weightDiff > 0 ? "▼" : "▲"} {Math.abs(weightDiff).toFixed(1)} ק״ג
                      </span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>מההתחלה</span>
                    </div>
                  )}
                </div>
                {goalWeight && (
                  <div style={{ textAlign: "center", background: "rgba(255,255,255,0.12)", borderRadius: 14, padding: "10px 14px" }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>יעד</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{goalWeight}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>ק״ג</div>
                    {toGoal !== null && <div style={{ fontSize: 10, color: "#34D399", marginTop: 4, fontWeight: 700 }}>{toGoal.toFixed(1)} נשאר</div>}
                  </div>
                )}
              </div>
            </div>

            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { label: "ירידה במשקל", value: weightDiff != null ? `${Math.abs(weightDiff).toFixed(1)} ק״ג` : "--", color: "#34D399", icon: "📉" },
                { label: "אימונים סה״כ", value: String(totalWorkouts), color: "#3B82F6", icon: "⚡" },
                { label: "ממוצע קלוריות", value: "1,850", color: "#F59E0B", icon: "🔥" },
                { label: "עקביות", value: `${consistencyPct}%`, color: "#60A5FA", icon: "🎯" },
              ].map((s) => (
                <div key={s.label} style={{ ...CARD, padding: "14px 16px" }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2, fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Weekly bar chart */}
            <div style={{ ...CARD, padding: "16px 18px", marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>אימונים השבוע</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{weeklyWorkouts.reduce((s, d) => s + d.value, 0)} אימונים ב-7 ימים</div>
              <MiniBarChart data={weeklyWorkouts} />
            </div>

            {/* Weight history */}
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 12 }}>היסטוריית משקל</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sortedCheckIns.length === 0 ? (
                <div style={{ ...CARD, padding: 24, textAlign: "center" }}>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>אין צ׳ק-אינים עדיין</div>
                </div>
              ) : [...sortedCheckIns].reverse().slice(0, 8).map((c: any, i: number) => {
                const prevC = [...sortedCheckIns].reverse()[i + 1];
                const diff = prevC?.weight ? (c.weight - prevC.weight) : null;
                return (
                  <div key={c.id ?? i} style={{ ...CARD, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(59,130,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#3B82F6" }}>⚖️</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{c.weight} ק״ג</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{c.date ? format(new Date(c.date), "dd/MM/yyyy") : ""}</div>
                      </div>
                    </div>
                    {diff !== null && (
                      <span style={{ fontSize: 12, fontWeight: 700, color: diff < 0 ? "#34D399" : diff > 0 ? "#F87171" : "rgba(255,255,255,0.3)" }}>
                        {diff > 0 ? "+" : ""}{diff.toFixed(1)} ק״ג
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ──── PHOTOS TAB ──── */}
        {tab === "photos" && (
          <>
            {/* Upload button */}
            <button
              onClick={async () => {
                setPhotoUploading(true);
                await new Promise(r => setTimeout(r, 1200));
                setPhotoUploading(false);
              }}
              style={{
                width: "100%", height: 52, marginBottom: 20, borderRadius: 16,
                background: "linear-gradient(135deg,#2563EB,#1E3A8A)",
                border: "none", color: "#fff", fontWeight: 700, fontSize: 14,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
              }}
            >
              {photoUploading ? (
                <span>מעלה...</span>
              ) : (
                <>
                  <Camera style={{ width: 18, height: 18 }} />
                  העלה תמונת התקדמות חדשה
                </>
              )}
            </button>

            {/* Info banner */}
            <div style={{ ...CARD, padding: "12px 14px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <Lock style={{ width: 14, height: 14, color: "#3B82F6", flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.5 }}>
                תמונות נשמרות בצורה מוצפנת ופרטית. רק המאמן שלך יכול לראות אותן.
              </p>
            </div>

            {/* Photo timeline */}
            <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <Camera style={{ width: 14, height: 14, color: "#3B82F6" }} />
              היסטוריית תמונות ({DEMO_PHOTOS.length} חודשים)
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {DEMO_PHOTOS.map((p, i) => (
                <div key={i} style={{ ...CARD, padding: "14px 14px", overflow: "hidden" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{p.month}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{p.date}</div>
                    </div>
                    {i === DEMO_PHOTOS.length - 1 && (
                      <span style={{ fontSize: 10, background: "rgba(124,58,237,0.2)", color: "#93C5FD", borderRadius: 20, padding: "3px 9px", fontWeight: 700 }}>עכשיו</span>
                    )}
                    {i === 0 && (
                      <span style={{ fontSize: 10, background: "rgba(16,185,129,0.15)", color: "#34D399", borderRadius: 20, padding: "3px 9px", fontWeight: 700 }}>לפני</span>
                    )}
                  </div>

                  {/* Photos grid */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    {[
                      { label: "קדמי", url: p.front, bg: "#1a0a2e" },
                      { label: "צדדי", url: p.side, bg: "#0a1a2e" },
                    ].map(photo => (
                      <div key={photo.label} style={{ flex: 1, borderRadius: 12, overflow: "hidden", aspectRatio: "4/5", background: photo.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6 }}>
                        <Camera style={{ width: 24, height: 24, color: "rgba(167,139,250,0.4)" }} />
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{photo.label}</span>
                      </div>
                    ))}
                    {/* Add button */}
                    <div style={{ width: 80, borderRadius: 12, border: "2px dashed rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4, cursor: "pointer" }}>
                      <Plus style={{ width: 18, height: 18, color: "rgba(255,255,255,0.2)" }} />
                      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>הוסף</span>
                    </div>
                  </div>

                  {p.notes && (
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.5, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 8 }}>
                      📝 {p.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Before/After comparison */}
            <div style={{ marginTop: 20, fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 14 }}>
              השוואת לפני/אחרי
            </div>
            <div style={{ ...CARD, padding: "14px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ borderRadius: 12, background: "linear-gradient(135deg,#1a0a2e,#3d1a6e)", aspectRatio: "3/4", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                    <Camera style={{ width: 28, height: 28, color: "rgba(167,139,250,0.4)" }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#34D399" }}>לפני</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>פברואר 2024 • 82 ק״ג</div>
                </div>
                <div style={{ width: 1, background: "rgba(255,255,255,0.08)", alignSelf: "stretch" }} />
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ borderRadius: 12, background: "linear-gradient(135deg,#2e0a1a,#6e1a3d)", aspectRatio: "3/4", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                    <Camera style={{ width: 28, height: 28, color: "rgba(248,113,113,0.4)" }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#93C5FD" }}>אחרי</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>אפריל 2024 • 79 ק״ג</div>
                </div>
              </div>
              <div style={{ background: "rgba(124,58,237,0.1)", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#93C5FD" }}>▼ 3 ק״ג</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginRight: 8 }}>ב-3 חודשים</span>
              </div>
            </div>
          </>
        )}

        {/* ──── EXERCISES TAB ──── */}
        {tab === "exercises" && (
          <>
            {/* PR Summary */}
            <div style={{ background: "linear-gradient(135deg,#1E1B4B,#2D1B69)", borderRadius: 20, padding: "18px 20px", marginBottom: 20, border: "1px solid rgba(59,130,246,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Trophy style={{ width: 18, height: 18, color: "#93C5FD" }} />
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>שיאים אישיים</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {DEMO_EXERCISE_HISTORY.slice(0, 3).map(ex => {
                  const pr = Math.max(...ex.logs.map(l => l.weight));
                  return (
                    <div key={ex.name} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "10px 10px", textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: "#93C5FD" }}>
                        {pr > 0 ? `${pr}` : ex.logs[ex.logs.length - 1].reps}
                        <span style={{ fontSize: 9, fontWeight: 400, color: "rgba(255,255,255,0.4)", marginRight: 2 }}>{pr > 0 ? "ק״ג" : "חז'"}</span>
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2, fontWeight: 600 }}>{ex.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Exercise progress cards */}
            <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 14 }}>התקדמות לפי תרגיל</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {DEMO_EXERCISE_HISTORY.map(ex => {
                const pr = Math.max(...ex.logs.map(l => l.weight));
                const latest = ex.logs[ex.logs.length - 1];
                const prev = ex.logs[ex.logs.length - 2];
                const diff = latest && prev ? latest.weight - prev.weight : 0;
                const color = MUSCLE_COLORS[ex.muscleGroup] ?? "#3B82F6";

                return (
                  <div key={ex.name} style={{ ...CARD, padding: "16px 16px", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{ex.name}</span>
                          {latest.weight === pr && pr > 0 && (
                            <span style={{ fontSize: 9, background: "rgba(167,139,250,0.2)", color: "#93C5FD", borderRadius: 6, padding: "2px 7px", fontWeight: 700 }}>🏆 שיא</span>
                          )}
                        </div>
                        <span style={{ fontSize: 10, color, background: `${color}18`, borderRadius: 6, padding: "2px 7px", fontWeight: 600, display: "inline-block", marginTop: 3 }}>{ex.muscleGroup}</span>
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                          {pr > 0 ? pr : latest.reps}<span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginRight: 2 }}>{pr > 0 ? "ק״ג" : "חז'"}</span>
                        </div>
                        {diff !== 0 && (
                          <div style={{ fontSize: 11, fontWeight: 700, color: diff > 0 ? "#34D399" : "#F87171", textAlign: "left" }}>
                            {diff > 0 ? "+" : ""}{diff}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mini line chart */}
                    <WeightLineChart logs={ex.logs.map(l => ({ date: l.date, weight: l.weight || l.reps }))} />

                    {/* Log history */}
                    <div style={{ marginTop: 10, display: "flex", gap: 6, overflowX: "auto" }}>
                      {ex.logs.slice(-4).map((l, i) => (
                        <div key={i} style={{ flex: 1, minWidth: 56, background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "6px 6px", textAlign: "center" }}>
                          <div style={{ fontSize: 12, fontWeight: 800, color: (l.weight || l.reps) === pr ? "#93C5FD" : "#fff" }}>
                            {l.weight > 0 ? l.weight : l.reps}
                            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", marginRight: 1 }}>{l.weight > 0 ? "ק" : "×"}</span>
                          </div>
                          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{format(new Date(l.date), "MM/dd")}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 1RM calculator hint */}
            <div style={{ ...CARD, padding: "14px 16px", marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingUp style={{ width: 18, height: 18, color: "#3B82F6" }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>חישוב 1RM</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>לחיצת חזה: ~95 ק״ג | סקוואט: ~128 ק״ג</div>
              </div>
            </div>

            {/* Weekly Volume */}
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <Dumbbell style={{ width: 14, height: 14, color: "#3B82F6" }} />
                נפח שבועי (סטים לפי שריר)
              </div>
              <div style={{ ...CARD, padding: "16px" }}>
                {[
                  { muscle: "חזה", sets: 16, target: 20 },
                  { muscle: "גב", sets: 18, target: 20 },
                  { muscle: "כתפיים", sets: 12, target: 16 },
                  { muscle: "רגליים", sets: 20, target: 20 },
                  { muscle: "זרועות", sets: 10, target: 12 },
                  { muscle: "בטן", sets: 8, target: 12 },
                ].map(({ muscle, sets, target }) => {
                  const pct = Math.min(sets / target, 1);
                  const color = MUSCLE_COLORS[muscle] ?? "#3B82F6";
                  return (
                    <div key={muscle} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#F4F4F5" }}>{muscle}</span>
                        <span style={{ fontSize: 12, color: pct >= 1 ? "#34D399" : "rgba(255,255,255,0.4)" }}>
                          {sets} / {target} סטים {pct >= 1 ? "✓" : ""}
                        </span>
                      </div>
                      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                        <div style={{ height: "100%", width: `${pct * 100}%`, background: color, borderRadius: 3, transition: "width 0.5s ease" }} />
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop: 8, padding: "8px 0 0", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>סה״כ נפח שבועי</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#93C5FD" }}>84 סטים</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
