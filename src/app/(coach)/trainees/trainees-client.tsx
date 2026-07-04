"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, UserPlus, ChevronLeft } from "lucide-react";

interface Trainee {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  traineeProfile: { currentWeight: number | null; goals: string[] } | null;
  checkIns: { date: Date; weight: number | null }[];
  workoutPlans: { id: string }[];
}

const GOAL_LABELS: Record<string, string> = {
  weight_loss: "ירידה במשקל",
  muscle_gain: "בניית שריר",
  endurance: "סיבולת",
  strength: "כוח",
  flexibility: "גמישות",
  health: "בריאות כללית",
};

const GREEN = "#a8ff3e";
const glassCard = "backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-2xl";

export function TraineesClient({ trainees }: { trainees: Trainee[] }) {
  const [search, setSearch] = useState("");

  const filtered = trainees.filter(
    (t) =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 min-h-screen bg-[#080810]" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">המתאמנים שלי</h1>
          <p className="text-sm text-white/50">{trainees.length} מתאמנים סה״כ</p>
        </div>
        <Link href="/invite">
          <span className="inline-flex items-center gap-2 bg-[#a8ff3e] text-black font-bold px-4 py-2 rounded-xl text-sm">
            <UserPlus className="w-4 h-4" />
            הזמן מתאמן/ת
          </span>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          placeholder="חיפוש לפי שם או אימייל..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pr-10 pl-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/30 outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <div className={`${glassCard} text-center py-16`}>
          <p className="text-white/50 mb-4">
            {search ? "לא נמצאו תוצאות" : "עדיין אין מתאמנים"}
          </p>
          {!search && (
            <Link href="/invite">
              <span className="inline-block bg-[#a8ff3e] text-black font-bold px-4 py-2 rounded-xl text-sm">
                הזמן מתאמן/ת ראשון/ה
              </span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/trainees/${t.id}`}>
                <div className={`${glassCard} p-5 hover:bg-white/[0.07] transition-all duration-200 cursor-pointer group`}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold flex-shrink-0 bg-[#a8ff3e] text-black">
                      {t.name?.[0] ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm text-white">{t.name}</p>
                          <p className="text-xs text-white/30">{t.email}</p>
                        </div>
                        <ChevronLeft className="w-4 h-4 text-white/30 group-hover:text-[#a8ff3e] transition-colors flex-shrink-0 mt-0.5" />
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {t.workoutPlans.length > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-white/70">יש תוכנית אימון</span>
                        )}
                        {t.checkIns.length > 0 && t.checkIns[0].weight && (
                          <span className="text-xs px-2 py-0.5 rounded-full border border-white/[0.1] text-white/50">{t.checkIns[0].weight} ק״ג</span>
                        )}
                        {t.traineeProfile?.goals.slice(0, 2).map((g) => (
                          <span key={g} className="text-xs px-2 py-0.5 rounded-full border border-white/[0.1] text-white/50">{GOAL_LABELS[g] ?? g}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
