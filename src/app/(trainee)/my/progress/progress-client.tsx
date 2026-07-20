"use client";
import Link from "next/link";
import { format, subDays, addDays } from "date-fns";
import { useState } from "react";
import { MoreVertical, ChevronLeft, Dumbbell, Flame, Heart, Footprints, Droplet, Plus } from "lucide-react";

// Lior Fit v2 — Progress screen, copied exactly from Lior Fit v2.dc.html + the user-provided reference screenshot
const LIME = "#C6F53C";
const CARD = "#12160f";
const GRADIENT = "linear-gradient(105deg,#D2F84B 0%,#6FD668 52%,#35C877 100%)";
const MONTHS_HE = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
const WEEK_LABELS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

interface CheckIn { date: string; weight?: number | null }

export function ProgressClient({ checkIns, targetWeight, todayCalories }: { checkIns: CheckIn[]; targetWeight: number | null; todayCalories: number }) {
  const [dayOffset, setDayOffset] = useState(0);
  const today = addDays(new Date(), dayOffset);

  const strip = [-2, -1, 0, 1, 2, 3].map((n) => {
    const d = addDays(today, n);
    return { date: d, isToday: n === 0 };
  });

  const weightLogs = (checkIns ?? []).filter((c) => c.weight != null).map((c) => ({ date: c.date, weight: c.weight as number }));
  const currentWeight = weightLogs.length ? weightLogs[weightLogs.length - 1].weight : null;
  const firstWeight = weightLogs.length ? weightLogs[0].weight : null;
  const delta = currentWeight != null && firstWeight != null ? +(currentWeight - firstWeight).toFixed(1) : null;

  return (
    <div style={{ position: "relative", minHeight: "100vh", paddingBottom: 100 }} dir="rtl">
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 220,
        background: "radial-gradient(120% 90% at 50% 0%, rgba(88,196,72,0.28) 0%, rgba(8,11,7,0) 60%)",
        pointerEvents: "none",
      }} />
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 20px 12px", position: "relative" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <button style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <MoreVertical size={18} color="#fff" />
          </button>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>ההתקדמות שלי</span>
          <Link href="/my/dashboard" style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ChevronLeft size={18} color="#fff" />
          </Link>
        </div>

        {/* Month label */}
        <div style={{ textAlign: "center", fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)", marginBottom: 14 }}>
          {MONTHS_HE[today.getMonth()]} ({today.getFullYear()})
        </div>

        {/* Day strip with today pill */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 20, alignItems: "center" }}>
          {strip.map((s, i) => s.isToday ? (
            <div key={i} style={{ flexShrink: 0, height: 52, padding: "0 22px", borderRadius: 999, background: GRADIENT, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#0a1004" }}>היום, {format(s.date, "dd")} {MONTHS_HE[s.date.getMonth()]}</span>
            </div>
          ) : (
            <div key={i} style={{ flexShrink: 0, width: 52, height: 66, borderRadius: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{WEEK_LABELS[s.date.getDay()]}</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginTop: 3 }}>{format(s.date, "dd")}</span>
            </div>
          ))}
        </div>

        {/* Target weight */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          background: `radial-gradient(120% 160% at 100% 0%, rgba(88,196,72,0.22), rgba(18,22,15,0) 60%),${CARD}`,
          border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "14px 14px 14px 8px", marginBottom: 14,
        }}>
          <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#0a1004", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Dumbbell size={22} color={LIME} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>משקל יעד</div>
            <div style={{ fontSize: 20, fontWeight: 900, marginTop: 1, color: "#fff" }}>
              {targetWeight ?? "—"} <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>ק״ג</span>
            </div>
          </div>
          <Link href="/my/goal" style={{ background: GRADIENT, color: "#0a1004", fontSize: 14, fontWeight: 800, padding: "10px 20px", borderRadius: 999, textDecoration: "none" }}>עדכן</Link>
        </div>

        {/* Stat grid — real numbers where we track them; "—" where we honestly don't (heart rate / steps / water) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
          <div style={{ background: `radial-gradient(120% 120% at 100% 100%, rgba(88,196,72,0.16), rgba(18,22,15,0) 60%),${CARD}`, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 15, height: 150, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}><Flame size={16} color="rgba(255,255,255,0.7)" /><span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>קלוריות</span></div>
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}><span style={{ fontSize: 26, fontWeight: 900, color: "#fff" }}>{todayCalories.toLocaleString()}</span><span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>נאכלו</span></div>
          </div>
          <div style={{ background: `radial-gradient(120% 120% at 0% 100%, rgba(88,196,72,0.16), rgba(18,22,15,0) 60%),${CARD}`, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 15, height: 150, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}><Heart size={16} color="rgba(255,255,255,0.7)" /><span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>דופק</span></div>
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}><span style={{ fontSize: 26, fontWeight: 900, color: "#fff" }}>—</span><span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>bpm</span></div>
          </div>
          <div style={{ background: CARD, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 15, height: 104, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}><Droplet size={16} color="rgba(255,255,255,0.7)" /><span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>מים</span></div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}><span style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>—</span><span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>ליטר</span></div>
          </div>
          <div style={{ background: CARD, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 15, height: 104, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}><Footprints size={16} color="rgba(255,255,255,0.7)" /><span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>צעדים</span></div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}><span style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>—</span><span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>צעדים</span></div>
          </div>
        </div>

        {/* Weight chart — real WeeklyCheckIn history */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "rgba(255,255,255,0.85)" }}>מעקב משקל</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: LIME, letterSpacing: "-0.02em", marginTop: 2 }}>
              {currentWeight ?? "—"} <span style={{ fontSize: 15, color: "rgba(255,255,255,0.6)" }}>ק״ג</span>
            </div>
          </div>
          <Link href="/my/checkin" style={{ width: 34, height: 34, borderRadius: 12, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plus size={17} color={LIME} />
          </Link>
        </div>

        {weightLogs.length < 2 ? (
          <div style={{ background: CARD, borderRadius: 16, padding: 24, textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 10 }}>
            עדיין אין מספיק נתוני משקל — הם יופיעו כאן אחרי כמה צ׳ק-אין
          </div>
        ) : (
          <WeightChart logs={weightLogs} delta={delta} />
        )}

      </div>
    </div>
  );
}

function WeightChart({ logs, delta }: { logs: { date: string | Date; weight: number }[]; delta: number | null }) {
  const weights = logs.map((l) => l.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;
  const W = 320, H = 90;
  const pts = logs.map((l, i) => {
    const x = (i / (logs.length - 1)) * W;
    const y = H - ((l.weight - minW) / range) * (H - 10) - 5;
    return { x, y };
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${line} L ${W} ${H} L 0 ${H} Z`;
  const peak = pts.reduce((a, b) => (b.y < a.y ? b : a), pts[0]);

  return (
    <div style={{ position: "relative", height: 120, marginTop: 8 }}>
      <svg viewBox={`0 0 ${W} 120`} preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
        <defs>
          <linearGradient id="v2-wg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(198,245,60,0.35)" />
            <stop offset="1" stopColor="rgba(198,245,60,0)" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#v2-wg)" />
        <path d={line} fill="none" stroke={LIME} strokeWidth="2.6" strokeLinecap="round" />
      </svg>
      {delta != null && (
        <div style={{
          position: "absolute", top: Math.max(0, peak.y - 20), left: `${(peak.x / W) * 100}%`, transform: "translateX(-50%)",
          background: "#fff", color: "#0a1004", fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 8,
        }}>{delta > 0 ? "+" : ""}{delta} ק״ג</div>
      )}
      <div style={{ position: "absolute", top: 6, right: 2, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{Math.ceil(Math.max(...weights))}</div>
      <div style={{ position: "absolute", bottom: 26, right: 2, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{Math.floor(Math.min(...weights))}</div>
    </div>
  );
}
