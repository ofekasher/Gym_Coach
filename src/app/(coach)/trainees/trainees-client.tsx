"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, ChevronLeft } from "lucide-react";
import { subDays } from "date-fns";

interface Trainee {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  traineeProfile: { currentWeight: number | null; goals: string[] } | null;
  checkIns: { date: Date; weight: number | null }[];
  workoutPlans: { id: string }[];
  workoutLogs?: { date: Date; status: string }[];
}

const GOAL_LABELS: Record<string, string> = {
  weight_loss: "ירידה במשקל",
  muscle_gain: "בניית שריר",
  endurance: "סיבולת",
  strength: "כוח",
  flexibility: "גמישות",
  health: "בריאות כללית",
};

const GREEN = "#b6ff4a";
const avatarColors = [GREEN, "#8B5CF6", "#3B82F6", "#F59E0B", "#F87171"];

type StatusKey = "green" | "yellow" | "red";
const STATUS_CONFIG: Record<StatusKey, { label: string; color: string; bg: string }> = {
  green: { label: "פעיל", color: "#b6ff4a", bg: "rgba(182,255,74,0.12)" },
  yellow: { label: "בינוני", color: "#f5d442", bg: "rgba(245,212,66,0.12)" },
  red: { label: "דורש מעקב", color: "#ff5c5c", bg: "rgba(255,92,92,0.12)" },
};

function getStatus(t: Trainee): StatusKey {
  const weekAgo = subDays(new Date(), 7);
  const hasCheckIn = t.checkIns.some((c) => c.date >= weekAgo);
  const hasWorkout = (t.workoutLogs ?? []).length > 0;
  if (hasCheckIn && hasWorkout) return "green";
  if (hasCheckIn || hasWorkout) return "yellow";
  return "red";
}

function progressFor(t: Trainee): number {
  return Math.min(100, (t.workoutLogs ?? []).length * 20);
}

const FILTERS: { key: "ALL" | StatusKey; label: string }[] = [
  { key: "ALL", label: "הכל" },
  { key: "green", label: "פעיל" },
  { key: "yellow", label: "בינוני" },
  { key: "red", label: "דורש מעקב" },
];

export function TraineesClient({ trainees }: { trainees: Trainee[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | StatusKey>("ALL");

  const filtered = trainees.filter((t) => {
    const matchesSearch =
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || getStatus(t) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5 min-h-screen bg-[#070707]" dir="rtl">
      <div>
        <h1 className="text-[26px] font-black text-white" style={{ letterSpacing: "-0.8px" }}>מתאמנים</h1>
        <p className="text-[12.5px] mt-1 font-medium" style={{ color: "#888" }}>{trainees.length} מתאמנים סה״כ</p>
      </div>

      {/* Search + status filters — matches Lior Fit Dashboard Design's TRAINEES LIST view exactly */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[17px] h-[17px]" style={{ color: "#888" }} />
          <input
            placeholder="חיפוש מתאמן..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pr-11 pl-3.5 bg-[#141414] border border-[#2a2a2a] rounded-xl text-sm text-white placeholder:text-white/30 outline-none"
          />
        </div>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className="rounded-full px-4 py-2 text-[13px] font-bold border transition-colors flex-shrink-0"
            style={statusFilter === f.key
              ? { background: STATUS_CONFIG[f.key === "ALL" ? "green" : f.key]?.bg ?? GREEN, borderColor: "transparent", color: f.key === "ALL" ? "#0a0a0a" : STATUS_CONFIG[f.key].color }
              : { background: "#141414", borderColor: "#2a2a2a", color: "rgba(255,255,255,0.6)" }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-[18px] text-center py-16">
          <p className="text-white/50 mb-4">
            {search ? "לא נמצאו תוצאות" : "עדיין אין מתאמנים"}
          </p>
          {!search && (
            <Link href="/invite">
              <span className="inline-block font-bold px-4 py-2 rounded-xl text-sm" style={{ background: GREEN, color: "#0a0a0a" }}>
                הזמן מתאמן/ת ראשון/ה
              </span>
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((t, i) => {
            const status = getStatus(t);
            const cfg = STATUS_CONFIG[status];
            const progress = progressFor(t);
            return (
              <Link key={t.id} href={`/trainees/${t.id}`}>
                <div className="flex items-center gap-4 bg-[#141414] border border-[#1e1e1e] rounded-2xl px-[18px] py-3.5 cursor-pointer hover:border-[#333] transition-colors">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl flex-shrink-0"
                    style={{ background: avatarColors[i % avatarColors.length], color: "#0a0a0a" }}
                  >
                    {t.name?.[0] ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-[16px] font-extrabold text-white truncate">{t.name}</h3>
                      <span
                        className="text-[10.5px] font-extrabold px-2.5 py-[3px] rounded-full flex-shrink-0"
                        style={{ color: cfg.color, background: cfg.bg }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <div className="mt-1 text-[12.5px] truncate" style={{ color: "#888" }}>
                      {t.traineeProfile?.goals?.[0] ? (GOAL_LABELS[t.traineeProfile.goals[0]] ?? t.traineeProfile.goals[0]) : "ללא יעד"} · {t.email}
                    </div>
                  </div>
                  <div className="w-40 flex-shrink-0 hidden sm:block">
                    <div className="flex justify-between mb-1.5 text-xs">
                      <span style={{ color: "#888" }}>התקדמות</span>
                      <span className="font-extrabold" style={{ color: cfg.color }}>{progress}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-[#242424] overflow-hidden">
                      <div className="h-full rounded-full" style={{ background: cfg.color, width: `${progress}%` }} />
                    </div>
                  </div>
                  <ChevronLeft className="w-[18px] h-[18px] flex-shrink-0" style={{ color: "#666" }} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
