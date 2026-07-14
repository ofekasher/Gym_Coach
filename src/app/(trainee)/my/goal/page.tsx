"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BackHeader } from "@/components/shared/back-header";
import { Flame, Dumbbell, Zap, PersonStanding } from "lucide-react";

const GREEN = "#a8ff3e";

const GOAL_TYPES = [
  { key: "הרזיה", icon: Flame, sub: "ירידה במשקל" },
  { key: "מסה", icon: Dumbbell, sub: "בניית שריר" },
  { key: "כוח", icon: Zap, sub: "הגדלת כוח מקסימלי" },
  { key: "כושר", icon: PersonStanding, sub: "שיפור סיבולת" },
] as const;

type GoalType = (typeof GOAL_TYPES)[number]["key"];

function bodyFatCategory(pct: number): string {
  if (pct < 10) return "אתלטי מאוד 🏆";
  if (pct < 15) return "אתלטי 💪";
  if (pct < 20) return "כושר טוב ✅";
  if (pct < 25) return "ממוצע";
  return "מעל הממוצע";
}

export default function GoalPage() {
  const [goalType, setGoalType] = useState<GoalType>("הרזיה");
  const [currentWeight, setCurrentWeight] = useState(79);
  const [targetWeight, setTargetWeight] = useState(73);
  const [targetBodyFat, setTargetBodyFat] = useState(15);
  const [targetDate, setTargetDate] = useState("");
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(3);
  const [dailyCalories, setDailyCalories] = useState(2000);
  const [dailySteps, setDailySteps] = useState(8000);
  const [motivation, setMotivation] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/trainee/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const p = data?.profile;
        if (!p) return;
        if (p.goal && GOAL_TYPES.some((g) => g.key === p.goal)) setGoalType(p.goal);
        if (p.currentWeight != null) setCurrentWeight(p.currentWeight);
        if (p.targetWeight != null) setTargetWeight(p.targetWeight);
        if (p.targetBodyFat != null) setTargetBodyFat(p.targetBodyFat);
        if (p.targetDate) setTargetDate(String(p.targetDate).slice(0, 10));
        if (p.weeklyWorkouts != null) setWeeklyWorkouts(p.weeklyWorkouts);
        if (p.dailyCalories != null) setDailyCalories(p.dailyCalories);
        if (p.dailySteps != null) setDailySteps(p.dailySteps);
        if (p.motivation) setMotivation(p.motivation);
      })
      .catch((err) => console.error("Failed to load profile", err));
  }, []);

  const weightDiff = targetWeight - currentWeight;
  const weightDiffLabel =
    weightDiff === 0
      ? "כבר ביעד! 🎯"
      : weightDiff > 0
      ? `לעלות ${weightDiff.toFixed(1).replace(/\.0$/, "")} ק"ג 🎯`
      : `להוריד ${Math.abs(weightDiff).toFixed(1).replace(/\.0$/, "")} ק"ג 🎯`;

  const weeksLeft = (() => {
    if (!targetDate) return null;
    const diffMs = new Date(targetDate).getTime() - Date.now();
    const weeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
    return weeks;
  })();

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/trainee/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: goalType,
          currentWeight,
          targetWeight,
          targetBodyFat,
          bodyFat: targetBodyFat,
          targetDate: targetDate || null,
          weeklyWorkouts,
          dailyCalories,
          dailySteps,
          motivation,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save goals", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: "#12121f", minHeight: "100vh" }} className="pb-20" dir="rtl">
      <BackHeader title="יעד" />
      <div className="max-w-sm mx-auto">
        {/* Section 1 — goal type selector */}
        <div className="mx-4 mt-6 mb-4 text-white font-bold text-[22px]">מה היעד שלך?</div>
        <div className="mx-4 grid grid-cols-2 gap-3">
          {GOAL_TYPES.map((g) => {
            const selected = goalType === g.key;
            return (
              <button
                key={g.key}
                onClick={() => setGoalType(g.key)}
                className={
                  selected
                    ? "bg-[#1c1c2e] border-2 border-[#a8ff3e] rounded-2xl p-4 flex flex-col items-center gap-2"
                    : "bg-[#1c1c2e] border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2"
                }
              >
                <g.icon size={32} className="text-white" />
                <span className="text-white font-bold text-sm">{g.key}</span>
                <span className="text-gray-400 text-xs">{g.sub}</span>
              </button>
            );
          })}
        </div>

        {/* Section 2 — quantitative goals */}
        <div className="bg-[#1c1c2e] rounded-2xl mx-4 mt-6 p-4">
          <div className="text-white font-bold text-lg mb-4">יעדים כמותיים</div>

          <div className="flex gap-3 mb-2">
            <div className="flex-1">
              <div className="text-gray-400 text-xs mb-1">משקל נוכחי</div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(Number(e.target.value))}
                  className="bg-[#12121f] border border-white/10 rounded-xl px-3 py-2 text-white w-full"
                />
                <span className="text-gray-400 text-xs">ק"ג</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-gray-400 text-xs mb-1">יעד משקל</div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(Number(e.target.value))}
                  className="bg-[#12121f] border border-white/10 rounded-xl px-3 py-2 text-white w-full"
                />
                <span className="text-gray-400 text-xs">ק"ג</span>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 my-3" />
          <div className="text-center font-bold" style={{ color: GREEN }}>{weightDiffLabel}</div>

          <div className="border-t border-white/10 my-4" />

          <div className="mb-1 text-white text-sm font-bold">יעד % שומן גוף</div>
          <input
            type="number"
            min={5}
            max={40}
            value={targetBodyFat}
            onChange={(e) => setTargetBodyFat(Number(e.target.value))}
            className="bg-[#12121f] border border-white/10 rounded-xl px-4 py-3 text-white w-full"
          />
          <div className="text-gray-400 text-xs mt-2">{bodyFatCategory(targetBodyFat)}</div>

          <div className="border-t border-white/10 my-4" />

          <div className="mb-1 text-white text-sm font-bold">תאריך יעד</div>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="bg-[#12121f] border border-white/10 rounded-xl px-4 py-3 text-white w-full"
          />
          {weeksLeft != null && (
            <div className="text-gray-400 text-xs mt-2">
              {weeksLeft > 0 ? `נשאר ${weeksLeft} שבועות` : "התאריך כבר עבר"}
            </div>
          )}
        </div>

        {/* Section 3 — weekly targets */}
        <div className="bg-[#1c1c2e] rounded-2xl mx-4 mt-4 p-4">
          <div className="text-white font-bold text-lg mb-4">יעדים שבועיים</div>

          <div className="mb-5">
            <div className="text-white text-sm mb-1">אימונים בשבוע</div>
            <input
              type="range"
              min={1}
              max={7}
              value={weeklyWorkouts}
              onChange={(e) => setWeeklyWorkouts(Number(e.target.value))}
              className="w-full accent-[#a8ff3e] h-2"
            />
            <div className="font-bold mt-1" style={{ color: GREEN }}>{weeklyWorkouts} אימונים בשבוע</div>
          </div>

          <div className="mb-5">
            <div className="text-white text-sm mb-1">קלוריות יומיות</div>
            <input
              type="range"
              min={1200}
              max={3500}
              step={50}
              value={dailyCalories}
              onChange={(e) => setDailyCalories(Number(e.target.value))}
              className="w-full accent-[#a8ff3e] h-2"
            />
            <div className="font-bold mt-1" style={{ color: GREEN }}>{dailyCalories.toLocaleString()} קלוריות ביום</div>
          </div>

          <div>
            <div className="text-white text-sm mb-1">צעדים יומיים</div>
            <input
              type="range"
              min={2000}
              max={15000}
              step={500}
              value={dailySteps}
              onChange={(e) => setDailySteps(Number(e.target.value))}
              className="w-full accent-[#a8ff3e] h-2"
            />
            <div className="font-bold mt-1" style={{ color: GREEN }}>{dailySteps.toLocaleString()} צעדים ביום</div>
          </div>
        </div>

        {/* Section 4 — motivation */}
        <div className="bg-[#1c1c2e] rounded-2xl mx-4 mt-4 p-4 mb-4">
          <div className="text-white font-bold text-lg mb-4">למה אתה עושה את זה?</div>
          <textarea
            value={motivation}
            onChange={(e) => setMotivation(e.target.value.slice(0, 200))}
            placeholder="כתוב את המוטיבציה שלך... (זה יישאר פרטי)"
            className="bg-[#12121f] border border-white/10 rounded-xl p-4 text-white w-full h-24 resize-none"
          />
          <div className="text-gray-400 text-xs text-left mt-1">{motivation.length}/200</div>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={save}
        disabled={saving}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm bg-[#a8ff3e] text-black font-bold py-4 rounded-2xl text-lg"
      >
        {saving ? "שומר..." : "שמור יעדים"}
      </button>

      {/* Success toast */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-36 left-1/2 -translate-x-1/2 bg-[#a8ff3e] text-black font-bold px-5 py-3 rounded-full text-sm"
          >
            היעדים נשמרו! 🎯
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
