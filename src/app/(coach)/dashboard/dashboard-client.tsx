"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, CheckCircle2, AlertTriangle, CalendarDays, Zap, UserPlus, LayoutTemplate, Dumbbell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { getMuscleGymPhoto } from "@/lib/gym-photos";
import { badgeForProgress, BADGE_CONFIG, type BadgeTier } from "@/lib/trainee-badge";

interface TraineeWithData {
  id: string;
  name: string | null;
  email?: string;
  checkIns: { date: Date; weight: number | null }[];
  workoutLogs: { date: Date; status: string }[];
  workoutPlans: { id: string; isActive: boolean; name?: string; template?: string }[];
  traineeProfile: {
    currentWeight: number | null; goals: string[]; height?: number | null;
    dateOfBirth?: Date | null; weeklyWorkouts?: number | null; dailyCalories?: number | null;
  } | null;
  nutritionPlans?: { calories: number; protein: number; carbs: number; fat: number }[];
  nutritionLogs?: { calories: number; protein: number | null; carbs: number | null; fat: number | null }[];
  waterLogs?: { amount: number }[];
}

interface Alert {
  id: string;
  type: string;
  message: string;
  createdAt: Date;
  trainee: { name: string | null; id: string };
}

interface Props {
  trainees: TraineeWithData[];
  alerts: Alert[];
  stats: { total: number; activeThisWeek: number; checkedInThisWeek: number; unreadAlerts: number };
}

const GREEN = "#b6ff4a";
const glassCard = "bg-[#111] border border-[#1e1e1e] rounded-[18px] hover:border-[#333] transition-all duration-200";

const TEMPLATE_LABELS: Record<string, string> = {
  FBW: "כל הגוף",
  UPPER_LOWER: "עליון/תחתון",
  PPL: "Push/Pull/Legs",
  AB: "A/B",
  CUSTOM: "מותאם אישית",
};

const alertTypeLabels: Record<string, string> = {
  LOW_CONSISTENCY: "עקביות נמוכה",
  NO_CHECKIN: "אין צ׳ק-אין",
  NO_WEIGHT_UPDATE: "אין עדכון משקל",
  NO_LOGIN: "לא התחבר",
  PLAN_UPDATE_NEEDED: "דרוש עדכון תוכנית",
};

const avatarColors = [GREEN, "#8B5CF6", "#3B82F6", "#F59E0B", "#F87171"];

// The design's 4 "שירותים" category cards are static navigation shortcuts, not
// per-trainee data — they route to the closest equivalent real screen we have.
const SERVICES = [
  { name: "תוכנית אימון", href: "/templates" },
  { name: "תפריט תזונה", href: "/trainees" },
  { name: "זמן תרגול", href: "/schedule" },
  { name: "תוכנית דיאטה", href: "/trainees" },
];

function progressForTrainee(t: TraineeWithData): number {
  return Math.min(100, t.workoutLogs.length * 20);
}

function ageFromDob(dob?: Date | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

function RingSmall({ pct, color, size = 56 }: { pct: number; color: string; size?: number }) {
  const r = 30, c = 2 * Math.PI * r;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#222" strokeWidth="8" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} transform="rotate(-90 36 36)" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[12px] font-extrabold text-white">{pct}%</span>
    </div>
  );
}

function MetricGauge({ value, target, unit, label }: { value: number; target: number; unit: string; label: string }) {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  const r = 30, c = 2 * Math.PI * r;
  return (
    <div className={`${glassCard} p-4`}>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-extrabold" style={{ color: "#e8e8e8" }}>{label}</span>
        <div className="relative w-12 h-12">
          <svg width="48" height="48" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r={r} fill="none" stroke="#222" strokeWidth="9" />
            <circle cx="36" cy="36" r={r} fill="none" stroke={GREEN} strokeWidth="9" strokeLinecap="round"
              strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} transform="rotate(-90 36 36)" />
          </svg>
        </div>
      </div>
      <div className="mt-2 font-black text-[22px] text-white">{value}/{target}</div>
      <div className="text-[11px] font-bold" style={{ color: "#888" }}>{unit}</div>
    </div>
  );
}

export function DashboardClient({ trainees, alerts, stats }: Props) {
  const [filter, setFilter] = useState<"ALL" | BadgeTier>("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(trainees[0]?.id ?? null);
  const selected = trainees.find(t => t.id === selectedId) ?? trainees[0] ?? null;

  const filteredTrainees = trainees.filter((t) => {
    if (filter === "ALL") return true;
    return badgeForProgress(progressForTrainee(t)) === filter;
  });

  // Programs grid — real distinct workout-plan templates currently in use across trainees
  // (WorkoutPlan.template enum), replacing the design's static image carousel with real data.
  const programCounts = new Map<string, number>();
  for (const t of trainees) {
    for (const p of t.workoutPlans) {
      if (!p.isActive) continue;
      const key = p.template ?? "CUSTOM";
      programCounts.set(key, (programCounts.get(key) ?? 0) + 1);
    }
  }
  const programs = Array.from(programCounts.entries()).map(([key, count]) => ({
    key, label: TEMPLATE_LABELS[key] ?? key, count,
  }));

  const todayList = [...trainees]
    .sort((a, b) => progressForTrainee(a) - progressForTrainee(b))
    .slice(0, 5);

  return (
    <div className="flex gap-6 lg:h-[calc(100vh-152px)] lg:overflow-hidden" dir="rtl">
      {/* Main content — fixed hero/metrics/programs/services, only the trainee grid scrolls internally */}
      <div className="flex-1 min-w-0 flex flex-col gap-3 relative lg:h-full lg:overflow-hidden">
        {/* Hero — matches Lior Fit Dashboard Design's dashboard hero exactly */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="relative h-[130px] rounded-[18px] overflow-hidden bg-[#141414] flex-shrink-0"
        >
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${getMuscleGymPhoto(undefined)})` }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(7,7,7,0.94) 0%, rgba(7,7,7,0.72) 42%, rgba(7,7,7,0.15) 100%)" }} />
          <div className="absolute inset-0 flex flex-col justify-center px-7">
            <div className="text-[10px] font-extrabold tracking-[2px]" style={{ color: GREEN }}>אימון קשה</div>
            <h2 className="mt-1 text-[23px] font-black leading-[1.02] text-white" style={{ letterSpacing: "-0.8px" }}>
              היה <span style={{ color: GREEN }}>חזק</span> · היה <span style={{ color: GREEN }}>יפה</span>
            </h2>
            <Link href="/templates">
              <button className="mt-3 font-extrabold text-[12.5px] rounded-[9px] px-[18px] py-[7px]" style={{ background: GREEN, color: "#0a0a0a" }}>
                לפרטים
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Metric cards — mirrors the design's motivational fitness-metric widgets (דופק/שריפת
            אנרגיה/אימון). This app has no wearable/heart-rate or calories-burned tracking, so
            these show real 0/0% rather than a fabricated number — same layout either way. */}
        <div className="grid gap-3.5 flex-shrink-0" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
          <div className="bg-[#111] border border-[#1e1e1e] rounded-[20px] p-4">
            <div className="flex items-center gap-2.5 mb-[18px]">
              <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,212,170,0.14)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1Z" /></svg>
              </div>
              <span className="text-sm font-extrabold" style={{ color: "#e8e8e8" }}>דופק</span>
            </div>
            <div className="flex items-center justify-between">
              <div><span className="font-black text-[34px]" style={{ letterSpacing: "-1px", color: "#fff" }}>0</span> <span className="text-[13px] font-bold" style={{ color: "#888" }}>BPM</span></div>
              <svg width="72" height="34" viewBox="0 0 72 34" fill="none" stroke="#00D4AA" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 17h68" opacity="0.35" /></svg>
            </div>
          </div>
          <div className="bg-[#111] border border-[#1e1e1e] rounded-[20px] p-4">
            <div className="flex items-center gap-2.5 mb-[18px]">
              <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,92,92,0.14)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff5c5c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3s5 4.5 5 9a5 5 0 0 1-10 0c0-1.5.5-2.8 1.3-3.8C8.7 9.9 12 9 12 3Z" /></svg>
              </div>
              <span className="text-sm font-extrabold" style={{ color: "#e8e8e8" }}>שריפת אנרגיה</span>
            </div>
            <div className="flex items-center justify-between">
              <div><span className="font-black text-[34px]" style={{ letterSpacing: "-1px", color: "#fff" }}>0</span> <span className="text-[13px] font-bold" style={{ color: "#888" }}>קק״ל</span></div>
              <RingSmall pct={0} color={GREEN} />
            </div>
          </div>
          <div className="bg-[#111] border border-[#1e1e1e] rounded-[20px] p-4">
            <div className="flex items-center gap-2.5 mb-[18px]">
              <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: "rgba(245,212,66,0.14)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5d442" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 8v8M17.5 8v8M4 10v4M20 10v4M6.5 12h11" /></svg>
              </div>
              <span className="text-sm font-extrabold" style={{ color: "#e8e8e8" }}>אימון</span>
            </div>
            <div className="flex items-center justify-between">
              <div><span className="font-black text-[34px]" style={{ letterSpacing: "-1px", color: "#fff" }}>0</span> <span className="text-[13px] font-bold" style={{ color: "#888" }}>דקות</span></div>
              <RingSmall pct={0} color={GREEN} />
            </div>
          </div>
        </div>

        {/* תוכניות אימון — real, from WorkoutPlan.template usage across trainees; CSS grid (never a carousel) */}
        <div className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-[18px] p-4 flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 className="text-[20px] font-extrabold flex items-center gap-2.5 text-white">
              <span className="w-[5px] h-5 rounded-[3px]" style={{ background: GREEN }} />
              תוכניות אימון
            </h2>
            <Link href="/templates" className="text-[13px] font-bold" style={{ color: GREEN }}>הצג הכל ←</Link>
          </div>
          {programs.length === 0 ? (
            <p className="text-sm py-4 text-center flex-1 flex items-center justify-center" style={{ color: "#666" }}>עדיין אין תוכניות אימון פעילות</p>
          ) : (
            <div className="grid gap-3.5 flex-1 min-h-0 items-center" style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))" }}>
              {programs.slice(0, 3).map((p) => (
                <div key={p.key} className="relative h-32 rounded-2xl overflow-hidden bg-[#141414]">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${getMuscleGymPhoto(undefined)})` }} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,8,8,0.75) 0%, rgba(8,8,8,0) 55%)" }} />
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 flex justify-center">
                    <span className="font-extrabold text-[13px] py-2 rounded-[9px] w-full text-center" style={{ background: GREEN, color: "#0a0a0a" }}>
                      {p.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* שירותים — static navigation shortcuts, matches design layout (grid of 4) */}
        <div className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-[18px] p-4 flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 className="text-[20px] font-extrabold flex items-center gap-2.5 text-white">
              <span className="w-[5px] h-5 rounded-[3px]" style={{ background: GREEN }} />
              שירותים
            </h2>
            <Link href="/exercises" className="text-[13px] font-bold" style={{ color: GREEN }}>הצג הכל ←</Link>
          </div>
          <div className="grid gap-3.5 flex-1 min-h-0 items-center" style={{ gridTemplateColumns: "repeat(4,minmax(0,1fr))" }}>
            {SERVICES.map((sv) => (
              <Link key={sv.name} href={sv.href}>
                <div className="cursor-pointer">
                  <div className="relative h-[92px] rounded-2xl overflow-hidden bg-[#141414]">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${getMuscleGymPhoto(undefined)})` }} />
                  </div>
                  <div className="mt-2.5 text-[13.5px] font-extrabold text-center text-white">{sv.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Title + filters + trainee grid — separate scroll region below the fixed dashboard blocks above */}
        <div className="flex-shrink-0 pt-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2.5">
              <span className="w-[5px] h-5 rounded-[3px]" style={{ background: GREEN }} />
              מתאמנים שלך ({trainees.length})
            </h2>
            <div className="flex gap-2">
              {([
                { key: "ALL", label: "הכל" },
                { key: "gold", label: "זהב" },
                { key: "silver", label: "כסף" },
                { key: "bronze", label: "ברונזה" },
                { key: "trial", label: "ניסיון" },
              ] as const).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className="rounded-full px-3 py-1 text-sm border transition-colors"
                  style={filter === f.key
                    ? (f.key === "ALL"
                      ? { background: "rgba(182,255,74,0.1)", borderColor: "rgba(182,255,74,0.3)", color: GREEN }
                      : { background: BADGE_CONFIG[f.key].bg, borderColor: "transparent", color: BADGE_CONFIG[f.key].color })
                    : { background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filteredTrainees.length === 0 ? (
            <div className={`${glassCard} text-center py-12`}>
              <p className="mb-4 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>עדיין אין מתאמנים</p>
              <Link href="/invite">
                <span className="inline-block rounded-full font-bold px-5 py-2.5 text-sm" style={{ background: GREEN, color: "#0a0a0a" }}>
                  הזמן מתאמן/ת ראשון/ה
                </span>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredTrainees.map((t, i) => {
                const progress = progressForTrainee(t);
                const cfg = BADGE_CONFIG[badgeForProgress(progress)];
                const lastCheckIn = t.checkIns[0];

                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className={`${glassCard} p-5`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{ background: avatarColors[i % avatarColors.length], color: "#0a0a0a" }}>
                        {t.name?.[0] ?? "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-white">{t.name}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                        </div>
                        {t.email && <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.3)" }}>{t.email}</p>}
                      </div>
                    </div>

                    <div className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {lastCheckIn
                        ? `אימון אחרון: ${formatDistanceToNow(lastCheckIn.date, { locale: he, addSuffix: true })}`
                        : "אין נתוני פעילות עדיין"}
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex-1 h-1.5 rounded-full bg-white/10">
                        <div className="h-full rounded-full" style={{ width: `${progress}%`, background: GREEN }} />
                      </div>
                      <span className="text-xs font-semibold" style={{ color: GREEN }}>{progress}%</span>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/trainees/${t.id}`} className="flex-1">
                        <span className="block text-center text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: GREEN, color: "#0a0a0a" }}>
                          פתח פרופיל ←
                        </span>
                      </Link>
                      <Link href="/chat" className="flex-1">
                        <span className="block text-center text-xs px-3 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}>
                          שלח הודעה
                        </span>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right aside — matches design's 340px RIGHT PANEL: selected-trainee metrics + today list + alerts + quick actions */}
      <div className="w-[340px] flex-shrink-0 space-y-5 relative hidden lg:block lg:h-full lg:overflow-y-auto">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[16px] font-extrabold" style={{ color: "#fff" }}>
              המדדים של {selected?.name ?? "—"}
            </h3>
            {selected && <Link href={`/trainees/${selected.id}`} className="text-[12px] font-bold" style={{ color: GREEN }}>פרופיל ←</Link>}
          </div>

          {/* Trainee selector chips */}
          <div className="flex gap-2.5 overflow-x-auto pb-1 mb-4">
            {trainees.length === 0 ? (
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>אין מתאמנים עדיין</span>
            ) : trainees.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                style={{
                  background: avatarColors[i % avatarColors.length], color: "#0a0a0a",
                  boxShadow: selected && t.id === selected.id ? `0 0 0 2px #0a0a0a, 0 0 0 4px ${GREEN}` : "none",
                }}
              >
                {t.name?.[0] ?? "?"}
              </button>
            ))}
          </div>

          {/* Body stats */}
          <div className={`${glassCard} p-[18px] flex justify-between mb-4`}>
            <div className="text-center flex-1">
              <div className="mx-auto w-9 h-9 rounded-[11px] flex items-center justify-center" style={{ background: "#1a1a1a" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M3 12h18" /></svg>
              </div>
              <div className="mt-2 font-black text-[16px]" style={{ color: GREEN }}>{selected?.traineeProfile?.currentWeight ?? "—"}</div>
              <div className="text-[11px] font-bold mt-0.5" style={{ color: "#888" }}>משקל</div>
            </div>
            <div className="text-center flex-1">
              <div className="mx-auto w-9 h-9 rounded-[11px] flex items-center justify-center" style={{ background: "#1a1a1a" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M8 7h8" /></svg>
              </div>
              <div className="mt-2 font-black text-[16px]" style={{ color: GREEN }}>{selected?.traineeProfile?.height ?? "—"}</div>
              <div className="text-[11px] font-bold mt-0.5" style={{ color: "#888" }}>גובה</div>
            </div>
            <div className="text-center flex-1">
              <div className="mx-auto w-9 h-9 rounded-[11px] flex items-center justify-center" style={{ background: "#1a1a1a" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.3 3-5.5 7-5.5s7 2.2 7 5.5" /></svg>
              </div>
              <div className="mt-2 font-black text-[16px]" style={{ color: GREEN }}>{ageFromDob(selected?.traineeProfile?.dateOfBirth) ?? "—"}</div>
              <div className="text-[11px] font-bold mt-0.5" style={{ color: "#888" }}>גיל</div>
            </div>
          </div>

          {/* Calorie ring + macros */}
          {(() => {
            const plan = selected?.nutritionPlans?.[0];
            if (!plan) {
              return (
                <div className={`${glassCard} py-6 px-4 text-center mb-4`}>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>אין תוכנית תזונה פעילה</p>
                </div>
              );
            }
            const logs = selected?.nutritionLogs ?? [];
            const consumed = logs.reduce((s, l) => s + (l.calories ?? 0), 0);
            const protein = logs.reduce((s, l) => s + (l.protein ?? 0), 0);
            const carbs = logs.reduce((s, l) => s + (l.carbs ?? 0), 0);
            const fat = logs.reduce((s, l) => s + (l.fat ?? 0), 0);
            const remaining = Math.max(0, plan.calories - consumed);
            const pct = plan.calories > 0 ? Math.min(100, Math.round((consumed / plan.calories) * 100)) : 0;
            const macros = [
              { label: "חלבון", cur: Math.round(protein), tgt: Math.round(plan.protein), color: GREEN },
              { label: "פחמימות", cur: Math.round(carbs), tgt: Math.round(plan.carbs), color: "#3B82F6" },
              { label: "שומן", cur: Math.round(fat), tgt: Math.round(plan.fat), color: "#f5d442" },
            ];
            const ringR = 30, ringC = 2 * Math.PI * ringR;
            return (
              <div className={`${glassCard} py-5 px-[18px] mb-4`}>
                <div className="flex items-center justify-between">
                  <div className="text-center"><div className="font-black text-[18px] text-white">{Math.round(consumed)}</div><div className="text-[11px] font-bold" style={{ color: "#888" }}>נצרך</div></div>
                  <div className="relative w-[104px] h-[104px]">
                    <svg width="104" height="104" viewBox="0 0 72 72">
                      <circle cx="36" cy="36" r={ringR} fill="none" stroke="#222" strokeWidth="7" />
                      <circle cx="36" cy="36" r={ringR} fill="none" stroke={GREEN} strokeWidth="7" strokeLinecap="round"
                        strokeDasharray={ringC} strokeDashoffset={ringC - (pct / 100) * ringC} transform="rotate(-90 36 36)" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-black text-[24px] leading-none text-white">{plan.calories}</span>
                      <span className="text-[10px] font-bold" style={{ color: "#888" }}>קק״ל</span>
                    </div>
                  </div>
                  <div className="text-center"><div className="font-black text-[18px] text-white">{Math.round(remaining)}</div><div className="text-[11px] font-bold" style={{ color: "#888" }}>נותר</div></div>
                </div>
                <div className="flex flex-col gap-3 mt-[18px]">
                  {macros.map(m => (
                    <div key={m.label}>
                      <div className="flex justify-between items-baseline mb-1.5">
                        <span className="text-[12.5px] font-extrabold" style={{ color: "#e8e8e8" }}>{m.label}</span>
                        <span className="text-[11px] font-bold" style={{ color: "#888" }}>{m.cur}/{m.tgt}ג׳ · נותרו {Math.max(0, m.tgt - m.cur)}ג׳</span>
                      </div>
                      <div className="h-[6px] rounded-full bg-[#242424] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${m.tgt > 0 ? Math.min(100, (m.cur / m.tgt) * 100) : 0}%`, background: m.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* שינה + מים — this app doesn't track sleep, so שינה always shows 0/8 (real empty
              state kept in the same slot/layout as the design, per explicit direction); מים is real WaterLog data. */}
          <div className="grid grid-cols-2 gap-3.5 mb-1">
            <MetricGauge value={0} target={8} unit="שעות" label="שינה" />
            <MetricGauge
              value={Math.round((selected?.waterLogs ?? []).reduce((s, w) => s + w.amount, 0) / 1000 * 10) / 10}
              target={5} unit="ליטר" label="מים"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-[18px] font-extrabold" style={{ color: "#fff" }}>התוכנית להיום</h2>
            <Link href="/schedule" className="text-[12.5px] font-bold" style={{ color: GREEN }}>לוח מלא ←</Link>
          </div>
          {todayList.length === 0 ? (
            <div className={`${glassCard} p-4 text-center`}>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>אין מתאמנים עדיין</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {todayList.map((t, i) => {
                const progress = progressForTrainee(t);
                return (
                  <button key={t.id} onClick={() => setSelectedId(t.id)} className="text-right w-full">
                    <div className="flex items-center gap-3 bg-[#111] border rounded-[14px] p-2.5 hover:border-[#333] transition-colors" style={{ borderColor: t.id === selectedId ? GREEN : "#1a1a1a" }}>
                      <div
                        className="w-[52px] h-[52px] rounded-[11px] flex items-center justify-center font-black text-lg flex-shrink-0"
                        style={{ background: avatarColors[i % avatarColors.length], color: "#0a0a0a" }}
                      >
                        {t.name?.[0] ?? "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-extrabold text-white truncate">{t.name}</div>
                        <div className="text-[11.5px] mt-0.5" style={{ color: "#888" }}>
                          {t.checkIns[0] ? `נבדק ${formatDistanceToNow(t.checkIns[0].date, { locale: he, addSuffix: true })}` : "אין צ׳ק-אין"}
                        </div>
                        <div className="h-[5px] rounded-full bg-[#242424] overflow-hidden mt-2">
                          <div className="h-full rounded-full" style={{ background: GREEN, width: `${progress}%` }} />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-[13px] font-extrabold mb-3 flex items-center gap-1.5" style={{ color: "#e8e8e8" }}>
            <Bell size={14} style={{ color: GREEN }} /> התראות
          </h3>
          {alerts.length === 0 ? (
            <div className={`${glassCard} p-4 text-center`}>
              <CheckCircle2 size={18} className="mx-auto mb-2" style={{ color: GREEN }} />
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>אין התראות פתוחות</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.slice(0, 4).map((alert) => (
                <Link key={alert.id} href={`/trainees/${alert.trainee.id}`}>
                  <div className="rounded-xl p-3 mb-0" style={{ background: "rgba(255,92,92,0.1)", border: "1px solid rgba(255,92,92,0.2)" }}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" style={{ color: "#ff5c5c" }} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white">{alert.trainee.name}</p>
                        <p className="text-[11px] line-clamp-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                          {alertTypeLabels[alert.type] ?? alert.message}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-[13px] font-extrabold mb-3 flex items-center gap-1.5" style={{ color: "#e8e8e8" }}>
            <Zap size={14} style={{ color: GREEN }} /> פעולות מהירות
          </h3>
          <div className="space-y-2">
            <Link href="/invite">
              <div className={`${glassCard} p-3 flex items-center gap-2 justify-center`}>
                <UserPlus size={14} style={{ color: GREEN }} />
                <span className="text-sm font-semibold text-white">הוסף מתאמן</span>
              </div>
            </Link>
            <Link href="/templates">
              <div className={`${glassCard} p-3 flex items-center gap-2 justify-center`}>
                <LayoutTemplate size={14} style={{ color: GREEN }} />
                <span className="text-sm font-semibold text-white">תבניות אימון</span>
              </div>
            </Link>
            <Link href="/exercises">
              <div className={`${glassCard} p-3 flex items-center gap-2 justify-center`}>
                <Dumbbell size={14} style={{ color: GREEN }} />
                <span className="text-sm font-semibold text-white">ספריית תרגילים</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
