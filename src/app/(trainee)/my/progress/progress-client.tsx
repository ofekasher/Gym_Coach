"use client";
import Link from "next/link";
import { format, addDays } from "date-fns";
import { useState } from "react";
import { ChevronLeft, MoreVertical, Dumbbell, Flame, Heart, Footprints, Droplet, Plus } from "lucide-react";

// Lior Fit v2 — Progress screen, copied exactly from "Lior Fit v2.dc.html" (verified directly against
// the Claude Design project — this is the only Progress screen that actually exists there).
const LIME = "#a8ff3e";
const CARD = "#0f1f0f";
const GRADIENT = "linear-gradient(105deg,#D2F84B 0%,#6FD668 52%,#35C877 100%)";
const MONTHS_HE = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
const WEEK_LABELS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

// No wearable/sensor integration exists yet — these three stay hardcoded per explicit instruction,
// clearly commented so nobody mistakes them for real tracked data later.
const HARDCODED = { calories: 234, heartRate: 65, steps: 3422 };

interface CheckIn { date: string | Date; weight?: number | null }

function Waveform({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 120 40" preserveAspectRatio="none" style={{ width: "100%", flex: 1 }}>
      <path d={d} fill="none" stroke={LIME} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProgressClient({ checkIns, targetWeight, waterMl, todayCalories }: {
  checkIns: CheckIn[]; targetWeight: number | null; waterMl: number; todayCalories: number;
}) {
  const [dayOffset, setDayOffset] = useState(0);
  const today = addDays(new Date(), dayOffset);
  const strip = [-2, -1, 0, 1, 2, 3].map((n) => ({ date: addDays(today, n), isToday: n === 0 }));

  const weightLogs = (checkIns ?? []).filter((c) => c.weight != null).map((c) => ({ date: c.date, weight: c.weight as number }));
  const currentWeight = weightLogs.length ? weightLogs[weightLogs.length - 1].weight : null;
  const waterLiters = (waterMl / 1000).toFixed(1).replace(/\.0$/, "");

  return (
    <div dir="rtl" style={{ position: "relative", minHeight: "100vh", paddingBottom: 100 }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 220,
        background: "radial-gradient(120% 90% at 50% 0%, rgba(88,196,72,0.28) 0%, rgba(10,26,10,0) 60%)",
        pointerEvents: "none",
      }} />
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 20px 12px", position: "relative" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <Link href="/my/profile" style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ChevronLeft size={18} color="#fff" />
          </Link>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>ההתקדמות שלי</span>
          <button style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <MoreVertical size={18} color="#fff" />
          </button>
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

        {/* Target weight — icon right, value center, gradient button left (matches dc.html DOM order exactly) */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          background: `radial-gradient(120% 160% at 100% 0%, rgba(88,196,72,0.22), rgba(15,31,15,0) 60%),${CARD}`,
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

        {/* Stat grid — calories (real, top-right) / heart-rate (hardcoded, top-left) / water (real, bottom-right) / steps (hardcoded, bottom-left) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
          <div style={{ background: `radial-gradient(120% 120% at 100% 100%, rgba(88,196,72,0.16), rgba(15,31,15,0) 60%),${CARD}`, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 15, height: 150, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}><Flame size={16} color="rgba(255,255,255,0.7)" /><span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>קלוריות</span></div>
            <Waveform d="M0 30 L14 30 L22 16 L30 16 L38 26 L48 26 L56 12 L64 12 L72 28 L82 28 L90 10 L98 24 L120 24" />
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}><span style={{ fontSize: 26, fontWeight: 900, color: "#fff" }}>{todayCalories.toLocaleString()}</span><span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>נאכלו</span></div>
          </div>
          <div style={{ background: `radial-gradient(120% 120% at 0% 100%, rgba(88,196,72,0.16), rgba(15,31,15,0) 60%),${CARD}`, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 15, height: 150, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}><Heart size={16} color="rgba(255,255,255,0.7)" /><span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>דופק</span></div>
            <Waveform d="M0 22 L18 22 L24 22 L30 14 L36 28 L42 10 L48 30 L54 20 L72 20 L80 20 L86 8 L92 32 L100 18 L120 18" />
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}><span style={{ fontSize: 26, fontWeight: 900, color: "#fff" }}>{HARDCODED.heartRate}</span><span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>bpm</span></div>
          </div>
          <div style={{ background: CARD, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 15, height: 104, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}><Droplet size={16} color="rgba(255,255,255,0.7)" /><span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>מים</span></div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}><span style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>{waterLiters}</span><span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>ליטר</span></div>
          </div>
          <div style={{ background: CARD, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 15, height: 104, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}><Footprints size={16} color="rgba(255,255,255,0.7)" /><span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>צעדים</span></div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}><span style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>{HARDCODED.steps.toLocaleString()}</span><span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>צעדים</span></div>
          </div>
        </div>

        {/* Weight chart — title+value grouped on the right, "+" button top-left, matching dc.html exactly */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "rgba(255,255,255,0.85)" }}>מעקב משקל</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: LIME, letterSpacing: "-0.02em", marginTop: 2 }}>
              {currentWeight ?? "—"} <span style={{ fontSize: 15, color: "rgba(255,255,255,0.6)" }}>ק״ג</span>
            </div>
          </div>
          <Link href="/my/checkin" style={{ width: 34, height: 34, borderRadius: 12, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plus size={17} color={LIME} strokeWidth={2.4} />
          </Link>
        </div>

        {weightLogs.length < 2 ? (
          <div style={{ background: CARD, borderRadius: 16, padding: 24, textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 10 }}>
            עדיין אין מספיק נתוני משקל — הם יופיעו כאן אחרי כמה צ׳ק-אין
          </div>
        ) : (
          <WeightChart logs={weightLogs} />
        )}

      </div>
    </div>
  );
}

function WeightChart({ logs }: { logs: { date: string | Date; weight: number }[] }) {
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
  const delta = +(weights[weights.length - 1] - weights[0]).toFixed(1);
  const peak = pts.reduce((a, b) => (b.y < a.y ? b : a), pts[0]);

  return (
    <div style={{ position: "relative", height: 120, marginTop: 8 }}>
      <svg viewBox={`0 0 ${W} 120`} preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
        <defs>
          <linearGradient id="v2-wg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(168,255,62,0.35)" />
            <stop offset="1" stopColor="rgba(168,255,62,0)" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#v2-wg)" />
        <path d={line} fill="none" stroke={LIME} strokeWidth="2.6" strokeLinecap="round" />
      </svg>
      <div style={{
        position: "absolute", top: Math.max(0, peak.y - 20), left: `${(peak.x / W) * 100}%`, transform: "translateX(-50%)",
        background: "#fff", color: "#0a1004", fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 8,
      }}>{delta > 0 ? "+" : ""}{delta} ק״ג</div>
      <div style={{ position: "absolute", top: 6, right: 2, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{Math.ceil(maxW)}</div>
      <div style={{ position: "absolute", bottom: 26, right: 2, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{Math.floor(minW)}</div>
    </div>
  );
}
