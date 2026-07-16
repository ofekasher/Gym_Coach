"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, TrendingUp, Bell, CheckCircle2, AlertTriangle, ChevronLeft, Clock, CalendarDays, Zap, UserPlus, ClipboardList } from "lucide-react";
import { formatDistanceToNow, subDays } from "date-fns";
import { he } from "date-fns/locale";

interface TraineeWithData {
  id: string;
  name: string | null;
  email?: string;
  checkIns: { date: Date; weight: number | null }[];
  workoutLogs: { date: Date; status: string }[];
  workoutPlans: { id: string; isActive: boolean }[];
  traineeProfile: { currentWeight: number | null; goals: string[] } | null;
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
const PURPLE = "#6366f1";
const CARD = "bg-[#111] border border-[#1e1e1e] rounded-[20px]";

function getTraineeStatus(t: TraineeWithData): "green" | "yellow" | "red" {
  const weekAgo = subDays(new Date(), 7);
  const hasCheckIn = t.checkIns.some((c) => c.date >= weekAgo);
  const hasWorkout = t.workoutLogs.length > 0;
  if (hasCheckIn && hasWorkout) return "green";
  if (hasCheckIn || hasWorkout) return "yellow";
  return "red";
}

const statusConfig = {
  green: { label: "פעיל", bg: "bg-green-500/20", text: "text-green-400" },
  yellow: { label: "בינוני", bg: "bg-purple-500/20", text: "text-purple-400" },
  red: { label: "דורש מעקב", bg: "bg-red-500/20", text: "text-red-400" },
};

const alertTypeLabels: Record<string, string> = {
  LOW_CONSISTENCY: "עקביות נמוכה",
  NO_CHECKIN: "אין צ׳ק-אין",
  NO_WEIGHT_UPDATE: "אין עדכון משקל",
  NO_LOGIN: "לא התחבר",
  PLAN_UPDATE_NEEDED: "דרוש עדכון תוכנית",
};

const avatarColors = [GREEN, "#8B5CF6", "#3B82F6", "#F59E0B", "#F87171"];

const glassCard = "bg-[#111] border border-[#1e1e1e] rounded-[18px] hover:border-[#333] transition-all duration-200";

function progressForTrainee(t: TraineeWithData): number {
  const total = t.workoutPlans?.[0] ? t.workoutLogs.length : 0;
  return Math.min(100, t.workoutLogs.length * 20);
}

export function DashboardClient({ trainees, alerts, stats }: Props) {
  const [filter, setFilter] = useState<"ALL" | "green" | "red">("ALL");

  const statCards = [
    { label: "מתאמנים", sub: "סה\"כ", value: stats.total, icon: Users, color: GREEN, bg: "rgba(182,255,74,0.12)" },
    { label: "פעילים", sub: "השבוע", value: stats.activeThisWeek, icon: TrendingUp, color: PURPLE, bg: "rgba(99,102,241,0.15)" },
    { label: "צ׳ק-אין", sub: "השבוע", value: stats.checkedInThisWeek, icon: CheckCircle2, color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
    { label: "התראות", sub: "פתוחות", value: stats.unreadAlerts, icon: Bell, color: stats.unreadAlerts > 0 ? "#f87171" : GREEN, bg: "rgba(248,113,113,0.12)" },
  ];

  const filteredTrainees = trainees.filter((t) => {
    if (filter === "ALL") return true;
    return getTraineeStatus(t) === filter;
  });

  return (
    <div className="flex" dir="rtl">
      {/* Main content */}
      <div className="flex-1 space-y-6 relative">
        {/* Top bar — title/subtitle right, coach identity chip left, matches Lior Fit Dashboard Design */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[26px] font-black text-white" style={{ letterSpacing: "-0.8px" }}>דשבורד ראשי</h1>
            <p className="text-[12.5px] mt-1 font-medium" style={{ color: "#888" }}>סקירה כללית של כל המתאמנים שלך</p>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className={`${CARD} p-4`}
            >
              <div className="flex items-center gap-2.5 mb-[18px]">
                <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
                  <s.icon size={17} style={{ color: s.color }} />
                </div>
                <span className="text-sm font-extrabold" style={{ color: "#e8e8e8" }}>{s.label}</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="font-black text-[30px]" style={{ letterSpacing: "-1px", color: s.color === "#f87171" ? s.color : "#fff" }}>{s.value}</span>
                  <span className="text-[13px] font-bold mr-1.5" style={{ color: "#888" }}>{s.sub}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Title + filters */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white" style={{ fontFamily: "Assistant, sans-serif" }}>מתאמנים שלך ({trainees.length})</h2>
          <div className="flex gap-2">
            {([
              { key: "ALL", label: "הכל" },
              { key: "green", label: "פעיל" },
              { key: "red", label: "דורש מעקב" },
            ] as const).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="rounded-full px-3 py-1 text-sm border transition-colors"
                style={filter === f.key
                  ? { background: "rgba(182,255,74,0.1)", borderColor: "rgba(182,255,74,0.3)", color: GREEN }
                  : { background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Trainee cards grid */}
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
              const status = getTraineeStatus(t);
              const cfg = statusConfig[status];
              const lastCheckIn = t.checkIns[0];
              const progress = progressForTrainee(t);

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
                        <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
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

      {/* Right panel */}
      <div className="w-[300px] flex-shrink-0 mr-6 space-y-6 relative">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
            <CalendarDays size={13} /> היום
          </h3>
          <div className={`${glassCard} p-4 text-center`}>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>אין פגישות מתוזמנות היום</p>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
            <Bell size={13} /> התראות
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
                  <div className="rounded-xl p-3 mb-0" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" style={{ color: "#f87171" }} />
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
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
            <Zap size={13} /> פעולות מהירות
          </h3>
          <div className="space-y-2">
            <Link href="/invite">
              <div className={`${glassCard} p-3 flex items-center gap-2 justify-center`}>
                <UserPlus size={14} style={{ color: GREEN }} />
                <span className="text-sm font-semibold text-white">הוסף מתאמן</span>
              </div>
            </Link>
            <Link href="/trainees">
              <div className={`${glassCard} p-3 flex items-center gap-2 justify-center`}>
                <ClipboardList size={14} style={{ color: GREEN }} />
                <span className="text-sm font-semibold text-white">תוכנית חדשה</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
