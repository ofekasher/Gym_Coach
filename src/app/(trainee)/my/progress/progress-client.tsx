"use client";
import Link from "next/link";
import { format, addDays } from "date-fns";
import { useState } from "react";
import { ChevronLeft, MoreVertical, Dumbbell, Flame, Heart, Footprints, Droplet, Plus } from "lucide-react";

const MONTHS_HE = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
const WEEK_LABELS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

// Hardcoded — no wearable/sensor data source exists yet for these
const HARDCODED = { calories: 234, heartRate: 65, steps: 3422 };

interface CheckIn { date: string | Date; weight?: number | null }

function EKGLine() {
  return (
    <svg viewBox="0 0 120 40" className="w-full h-10">
      <path
        d="M0,20 L20,20 L25,5 L30,35 L35,20 L50,20 L55,8 L60,32 L65,20 L80,20 L85,10 L90,30 L95,20 L120,20"
        fill="none"
        stroke="#a8ff3e"
        strokeWidth="2"
        className="animate-pulse"
      />
    </svg>
  );
}

function StatCard({ icon, label, value, unit }: { icon: React.ReactNode; label: string; value: string; unit: string }) {
  return (
    <div className="bg-[#0f1f0f] border border-[#a8ff3e]/15 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-white/60 text-xs">{label}</span>
        {icon}
      </div>
      <EKGLine />
      <div className="mt-1">
        <span className="text-white font-black text-2xl">{value}</span>
        <span className="text-white/50 text-xs mr-1">{unit}</span>
      </div>
    </div>
  );
}

export function ProgressClient({ checkIns, targetWeight, waterMl }: { checkIns: CheckIn[]; targetWeight: number | null; waterMl: number }) {
  const [dayOffset, setDayOffset] = useState(0);
  const today = addDays(new Date(), dayOffset);
  const strip = [-2, -1, 0, 1, 2, 3].map((n) => ({ date: addDays(today, n), isToday: n === 0 }));

  const weightLogs = (checkIns ?? []).filter((c) => c.weight != null).map((c) => ({ date: c.date, weight: c.weight as number }));
  const currentWeight = weightLogs.length ? weightLogs[weightLogs.length - 1].weight : null;

  const waterLiters = (waterMl / 1000).toFixed(1).replace(/\.0$/, "");

  return (
    <div dir="rtl" style={{ fontFamily: "Assistant, sans-serif" }} className="bg-[#0a1a0a] min-h-screen pb-20">
      <div className="max-w-md mx-auto px-4 pt-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <button className="w-10 h-10 rounded-full bg-[#1a2a1a] flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <span className="text-white font-bold text-lg">ההתקדמות שלי</span>
          <button className="w-10 h-10 rounded-full bg-[#1a2a1a] flex items-center justify-center">
            <MoreVertical className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="text-center text-white/50 text-sm mb-4">{MONTHS_HE[today.getMonth()]} ({today.getFullYear()})</div>

        {/* Date strip */}
        <div className="flex gap-2 overflow-x-auto mb-5 pb-1">
          {strip.map((s, i) =>
            s.isToday ? (
              <div key={i} className="flex-shrink-0 bg-[#a8ff3e] text-black font-bold px-5 py-3 rounded-full flex items-center">
                <span className="text-sm">היום, {format(s.date, "dd")} {MONTHS_HE[s.date.getMonth()]}</span>
              </div>
            ) : (
              <div key={i} className="flex-shrink-0 bg-[#1a2a1a] text-white/60 px-4 py-3 rounded-full border border-[#a8ff3e]/10 flex flex-col items-center gap-1 min-w-[52px]">
                <span className="text-xs">{WEEK_LABELS[s.date.getDay()]}</span>
                <span className="text-sm font-bold text-white">{format(s.date, "dd")}</span>
              </div>
            )
          )}
        </div>

        {/* Target weight */}
        <div className="bg-[#0f1f0f] border border-[#a8ff3e]/20 rounded-2xl p-4 flex items-center justify-between mb-5">
          <Link href="/my/goal" className="bg-[#a8ff3e] text-black font-bold px-4 py-2 rounded-full text-sm">עדכן</Link>
          <div className="text-center">
            <div className="text-white font-bold text-2xl">{targetWeight ?? "—"} ק"ג</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="bg-[#1a2a1a] rounded-xl p-2">
              <Dumbbell className="w-5 h-5" style={{ color: "#a8ff3e" }} />
            </div>
            <span className="text-white/60 text-xs">משקל יעד</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <StatCard icon={<Flame className="w-4 h-4 text-white/60" />} label="קלוריות" value={HARDCODED.calories.toLocaleString()} unit="נשרפו" />
          <StatCard icon={<Heart className="w-4 h-4 text-white/60" />} label="דופק" value={String(HARDCODED.heartRate)} unit="bpm" />
          <StatCard icon={<Footprints className="w-4 h-4 text-white/60" />} label="צעדים" value={HARDCODED.steps.toLocaleString()} unit="צעדים" />
          <StatCard icon={<Droplet className="w-4 h-4 text-white/60" />} label="מים" value={waterLiters} unit="ליטר" />
        </div>

        {/* Weight tracker */}
        <div className="bg-[#0f1f0f] border border-[#a8ff3e]/15 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <button className="bg-[#1a2a1a] border border-[#a8ff3e]/20 rounded-full w-10 h-10 flex items-center justify-center">
              <Plus className="w-4 h-4" style={{ color: "#a8ff3e" }} />
            </button>
            <span className="text-white font-bold">מעקב משקל</span>
          </div>
          <div className="text-[#a8ff3e] text-3xl font-black mb-2">{currentWeight ?? "—"} ק"ג</div>
          <WeightChart logs={weightLogs} />
        </div>

      </div>
    </div>
  );
}

function WeightChart({ logs }: { logs: { date: string | Date; weight: number }[] }) {
  if (logs.length < 2) {
    return (
      <div className="relative h-32 flex items-center justify-center text-white/30 text-xs">
        עדיין אין מספיק נתוני משקל
      </div>
    );
  }

  const weights = logs.map((l) => l.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;
  const W = 300, H = 100;
  const pts = logs.map((l, i) => {
    const x = (i / (logs.length - 1)) * W;
    const y = H - 20 - ((l.weight - minW) / range) * (H - 40);
    return { x, y };
  });
  const line = "M" + pts.map((p) => `${p.x},${p.y}`).join(" L");
  const area = `${line} L${W},${H} L0,${H} Z`;
  const last = pts[pts.length - 1];
  const delta = +(weights[weights.length - 1] - weights[0]).toFixed(1);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32">
        <defs>
          <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a8ff3e" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#a8ff3e" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#weightGrad)" stroke="none" />
        <path d={line} fill="none" stroke="#a8ff3e" strokeWidth="2.5" />
      </svg>
      <div className="absolute top-0 right-0 text-white/30 text-[11px]">{Math.ceil(maxW)}</div>
      <div className="absolute bottom-5 right-0 text-white/30 text-[11px]">{Math.floor(minW)}</div>
      <div
        className="absolute bg-white text-black text-[11px] font-bold px-2 py-1 rounded-full"
        style={{ left: `${(last.x / W) * 100}%`, top: Math.max(0, last.y - 28), transform: "translateX(-50%)" }}
      >
        {delta > 0 ? "+" : ""}{delta} ק"ג
      </div>
    </div>
  );
}
