"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, TrendingUp, Bell, CheckCircle2, AlertTriangle, ChevronLeft, Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, subDays } from "date-fns";
import { he } from "date-fns/locale";

interface TraineeWithData {
  id: string;
  name: string | null;
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

function getTraineeStatus(t: TraineeWithData): "green" | "yellow" | "red" {
  const weekAgo = subDays(new Date(), 7);
  const hasCheckIn = t.checkIns.some((c) => c.date >= weekAgo);
  const hasWorkout = t.workoutLogs.length > 0;
  if (hasCheckIn && hasWorkout) return "green";
  if (hasCheckIn || hasWorkout) return "yellow";
  return "red";
}

const statusConfig = {
  green: { label: "פעיל", style: { background: "rgba(16,185,129,0.12)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)" }, dot: "#10B981" },
  yellow: { label: "בינוני", style: { background: "rgba(139,92,246,0.12)", color: "#8B5CF6", border: "1px solid rgba(139,92,246,0.2)" }, dot: "#8B5CF6" },
  red: { label: "דורש מעקב", style: { background: "rgba(239,68,68,0.12)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }, dot: "#EF4444" },
};

const alertTypeLabels: Record<string, string> = {
  LOW_CONSISTENCY: "עקביות נמוכה",
  NO_CHECKIN: "אין צ׳ק-אין",
  NO_WEIGHT_UPDATE: "אין עדכון משקל",
  NO_LOGIN: "לא התחבר",
  PLAN_UPDATE_NEEDED: "דרוש עדכון תוכנית",
};

const avatarColors = ["#8B5CF6", "#10B981", "#3B82F6", "#F59E0B", "#F87171"];

export function DashboardClient({ trainees, alerts, stats }: Props) {
  const statCards = [
    { label: "סה״כ מתאמנים", value: stats.total, icon: Users, iconColor: "#8B5CF6", iconBg: "rgba(139,92,246,0.12)", sub: "רשומים במערכת" },
    { label: "פעילים השבוע", value: stats.activeThisWeek, icon: TrendingUp, iconColor: "#10B981", iconBg: "rgba(16,185,129,0.12)", sub: `${Math.round((stats.activeThisWeek / Math.max(stats.total, 1)) * 100)}% מהבסיס` },
    { label: "צ׳ק-אין השבוע", value: stats.checkedInThisWeek, icon: CheckCircle2, iconColor: "#3B82F6", iconBg: "rgba(59,130,246,0.12)", sub: `מתוך ${stats.total}` },
    { label: "התראות פתוחות", value: stats.unreadAlerts, icon: Bell, iconColor: "#EF4444", iconBg: "rgba(239,68,68,0.12)", sub: "דורשות מענה" },
  ];

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold mb-2"
            style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)", color: "#8B5CF6" }}>
            <Zap className="w-3 h-3 fill-current" />
            AI POWERED
          </div>
          <h1 className="text-2xl font-extrabold text-white">דאשבורד ראשי</h1>
          <p className="text-sm mt-0.5" style={{ color: "#52525B" }}>סקירה כללית של כל המתאמנים שלך</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="rounded-2xl p-5" style={{ background: "#1C1C1E", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.iconBg }}>
                  <s.icon className="w-4 h-4" style={{ color: s.iconColor }} />
                </div>
                <span className="text-2xl font-extrabold text-white">{s.value}</span>
              </div>
              <p className="text-xs font-semibold text-white">{s.label}</p>
              <p className="text-[11px] mt-0.5" style={{ color: "#52525B" }}>{s.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trainees */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">המתאמנים שלי</h2>
            <Link href="/trainees">
              <Button variant="ghost" size="sm" className="gap-1 rounded-xl text-xs hover:bg-zinc-800"
                style={{ color: "#8B5CF6" }}>
                כל המתאמנים <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {trainees.length === 0 ? (
            <div className="rounded-2xl text-center py-12" style={{ background: "#1C1C1E", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="mb-4 text-sm" style={{ color: "#52525B" }}>עדיין אין מתאמנים</p>
              <Link href="/invite">
                <Button className="rounded-full font-bold" style={{ background: "#8B5CF6", color: "#111" }}>
                  הזמן מתאמן/ת ראשון/ה
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {trainees.slice(0, 8).map((t, i) => {
                const status = getTraineeStatus(t);
                const cfg = statusConfig[status];
                const lastCheckIn = t.checkIns[0];
                const weightDiff = t.checkIns.length >= 2
                  ? (t.checkIns[0].weight ?? 0) - (t.checkIns[1].weight ?? 0)
                  : null;

                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.35 }}
                  >
                    <Link href={`/trainees/${t.id}`}>
                      <div className="rounded-2xl p-4 transition-all cursor-pointer group"
                        style={{ background: "#1C1C1E", border: "1px solid rgba(255,255,255,0.07)" }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.2)")}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-black font-bold text-sm flex-shrink-0"
                            style={{ background: avatarColors[i % avatarColors.length] }}>
                            {t.name?.[0] ?? "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm text-white">{t.name}</p>
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                style={cfg.style}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                                {cfg.label}
                              </span>
                            </div>
                            <div className="flex gap-3 mt-1 text-[11px]" style={{ color: "#52525B" }}>
                              <span>{t.workoutLogs.length} אימונים</span>
                              {lastCheckIn && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDistanceToNow(lastCheckIn.date, { locale: he, addSuffix: true })}
                                </span>
                              )}
                              {weightDiff !== null && (
                                <span style={{ color: weightDiff < 0 ? "#10B981" : weightDiff > 0 ? "#EF4444" : "#52525B", fontWeight: 500 }}>
                                  {weightDiff > 0 ? "+" : ""}{weightDiff.toFixed(1)} ק״ג
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronLeft className="w-4 h-4 flex-shrink-0 transition-colors"
                            style={{ color: "#3A3A3C" }} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Alerts */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)" }}>
              <Bell className="w-3.5 h-3.5" style={{ color: "#EF4444" }} />
            </div>
            התראות
            {alerts.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                {alerts.length}
              </span>
            )}
          </h2>

          {alerts.length === 0 ? (
            <div className="rounded-2xl text-center py-10" style={{ background: "#1C1C1E", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "rgba(16,185,129,0.12)" }}>
                <CheckCircle2 className="w-5 h-5" style={{ color: "#10B981" }} />
              </div>
              <p className="text-sm" style={{ color: "#52525B" }}>אין התראות פתוחות</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert, i) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link href={`/trainees/${alert.trainee.id}`}>
                    <div className="rounded-2xl p-4 transition-all cursor-pointer"
                      style={{ background: "#1C1C1E", border: "1px solid rgba(139,92,246,0.1)" }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.1)")}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: "rgba(139,92,246,0.12)" }}>
                          <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#8B5CF6" }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold" style={{ color: "#8B5CF6" }}>{alertTypeLabels[alert.type] ?? alert.type}</p>
                          <p className="text-xs font-semibold text-white mt-0.5">{alert.trainee.name}</p>
                          <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: "#52525B" }}>{alert.message}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
