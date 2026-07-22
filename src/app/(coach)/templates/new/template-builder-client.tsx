"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Search, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GREEN = "#b6ff4a";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "FBW", label: "כל הגוף" },
  { value: "UPPER_LOWER", label: "עליון/תחתון" },
  { value: "PPL", label: "Push/Pull/Legs" },
  { value: "AB", label: "A/B" },
  { value: "CUSTOM", label: "מותאם אישית" },
];

type ExerciseRow = { exerciseId: string; name: string; sets: number; reps: string };
type Day = { name: string; dayLabel: string; exercises: ExerciseRow[] };

export function TemplateBuilderClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("CUSTOM");
  const [days, setDays] = useState<Day[]>([{ name: "אימון 1", dayLabel: "יום א׳", exercises: [] }]);
  const [pickerDayIdx, setPickerDayIdx] = useState<number | null>(null);
  const [exerciseLib, setExerciseLib] = useState<{ id: string; name: string; muscleGroup: string }[]>([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/exercises").then((r) => (r.ok ? r.json() : [])).then(setExerciseLib).catch(() => {});
  }, []);

  const filteredLib = useMemo(
    () => exerciseLib.filter((e) => e.name.toLowerCase().includes(search.toLowerCase())),
    [exerciseLib, search]
  );

  const addDay = () => setDays((d) => [...d, { name: `אימון ${d.length + 1}`, dayLabel: "", exercises: [] }]);
  const removeDay = (i: number) => setDays((d) => d.filter((_, idx) => idx !== i));
  const updateDay = (i: number, field: "name" | "dayLabel", val: string) =>
    setDays((d) => d.map((day, idx) => (idx === i ? { ...day, [field]: val } : day)));

  const addExercise = (dayIdx: number, ex: { id: string; name: string }) => {
    setDays((d) =>
      d.map((day, idx) =>
        idx === dayIdx ? { ...day, exercises: [...day.exercises, { exerciseId: ex.id, name: ex.name, sets: 3, reps: "12" }] } : day
      )
    );
    setPickerDayIdx(null);
    setSearch("");
  };

  const removeExercise = (dayIdx: number, exIdx: number) =>
    setDays((d) => d.map((day, idx) => (idx === dayIdx ? { ...day, exercises: day.exercises.filter((_, j) => j !== exIdx) } : day)));

  const moveExercise = (dayIdx: number, exIdx: number, direction: -1 | 1) =>
    setDays((d) =>
      d.map((day, idx) => {
        if (idx !== dayIdx) return day;
        const target = exIdx + direction;
        if (target < 0 || target >= day.exercises.length) return day;
        const exercises = [...day.exercises];
        [exercises[exIdx], exercises[target]] = [exercises[target], exercises[exIdx]];
        return { ...day, exercises };
      })
    );

  const updateExercise = (dayIdx: number, exIdx: number, field: "sets" | "reps", val: string) =>
    setDays((d) =>
      d.map((day, idx) =>
        idx === dayIdx
          ? { ...day, exercises: day.exercises.map((e, j) => (j === exIdx ? { ...e, [field]: field === "sets" ? Number(val) || 0 : val } : e)) }
          : day
      )
    );

  const save = async () => {
    if (!name.trim()) return toast({ variant: "destructive", title: "יש להזין שם לתבנית" });
    setSaving(true);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, days }),
      });
      if (res.ok) {
        toast({ title: "התבנית נשמרה!" });
        router.push("/templates");
      } else {
        toast({ variant: "destructive", title: "שגיאה בשמירה" });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 min-h-screen bg-[#070707] max-w-2xl" dir="rtl">
      <h1 className="text-[26px] font-black text-white" style={{ letterSpacing: "-0.8px" }}>תבנית חדשה</h1>

      <div className="bg-[#141414] border border-[#1e1e1e] rounded-[18px] p-5">
        <div className="text-[11.5px] font-bold mb-1.5" style={{ color: "#aaa" }}>שם התבנית</div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="לדוגמה: Full Body מתחילים"
          className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-3.5 py-3 text-white text-[15px] font-extrabold mb-4 outline-none"
        />
        <div className="text-[11.5px] font-bold mb-2.5" style={{ color: "#aaa" }}>סוג פיצול</div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className="rounded-full px-3.5 py-1.5 text-[13px] font-bold border"
              style={category === c.value ? { background: GREEN, color: "#0a0a0a", borderColor: "transparent" } : { background: "#1c1c1c", color: "#e8e8e8", borderColor: "#2a2a2a" }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {days.map((day, dayIdx) => (
          <div key={dayIdx} className="bg-[#141414] border border-[#1e1e1e] rounded-[16px] p-4">
            <div className="flex items-center gap-2 mb-3">
              <input
                value={day.name}
                onChange={(e) => updateDay(dayIdx, "name", e.target.value)}
                className="flex-1 min-w-0 bg-[#0d0d0d] border border-[#2a2a2a] rounded-[10px] px-3 py-2 text-white text-sm font-extrabold outline-none"
              />
              <input
                value={day.dayLabel}
                onChange={(e) => updateDay(dayIdx, "dayLabel", e.target.value)}
                placeholder="יום..."
                className="w-28 flex-shrink-0 bg-[#0d0d0d] border border-[#2a2a2a] rounded-[10px] px-3 py-2 text-white text-sm outline-none"
              />
              {days.length > 1 && (
                <button onClick={() => removeDay(dayIdx)} className="flex-shrink-0" style={{ color: "#ff5c5c" }}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2 mb-2">
              {day.exercises.map((ex, exIdx) => (
                <div key={exIdx} className="bg-[#0d0d0d] border border-[#222] rounded-[10px] p-2.5 flex items-center gap-2">
                  <div className="flex flex-col flex-shrink-0" style={{ color: "#666" }}>
                    <button onClick={() => moveExercise(dayIdx, exIdx, -1)} disabled={exIdx === 0} className="disabled:opacity-25" aria-label="הזז למעלה">
                      <ChevronUp size={14} />
                    </button>
                    <button onClick={() => moveExercise(dayIdx, exIdx, 1)} disabled={exIdx === day.exercises.length - 1} className="disabled:opacity-25" aria-label="הזז למטה">
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <span className="flex-1 min-w-0 text-[13px] font-bold text-white truncate">{ex.name}</span>
                  <input
                    type="number"
                    value={ex.sets}
                    onChange={(e) => updateExercise(dayIdx, exIdx, "sets", e.target.value)}
                    className="w-11 flex-shrink-0 bg-[#141414] border border-[#2a2a2a] rounded-[9px] px-1 py-1.5 text-white text-[13px] text-center outline-none"
                  />
                  <span style={{ color: "#666" }}>×</span>
                  <input
                    value={ex.reps}
                    onChange={(e) => updateExercise(dayIdx, exIdx, "reps", e.target.value)}
                    className="w-14 flex-shrink-0 bg-[#141414] border border-[#2a2a2a] rounded-[9px] px-1 py-1.5 text-white text-[13px] text-center outline-none"
                  />
                  <button onClick={() => removeExercise(dayIdx, exIdx)} className="flex-shrink-0" style={{ color: "#ff5c5c" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setPickerDayIdx(dayIdx)}
              className="w-full bg-[#1c1c1c] rounded-[9px] py-2 text-[12.5px] font-bold flex items-center justify-center gap-1.5"
              style={{ color: GREEN, border: "1px solid #2a2a2a" }}
            >
              <Plus size={14} /> הוסף תרגיל
            </button>
          </div>
        ))}
        <button onClick={addDay} className="w-full bg-[#141414] border border-dashed border-[#333] rounded-[14px] py-3 text-sm font-bold text-white/70">
          + הוסף יום אימון
        </button>
      </div>

      <button onClick={save} disabled={saving} className="w-full rounded-xl py-3.5 font-black text-[15px] flex items-center justify-center gap-2" style={{ background: GREEN, color: "#0a0a0a" }}>
        {saving && <Loader2 size={16} className="animate-spin" />} שמור תבנית
      </button>

      {/* Exercise picker drawer — matches design's EXERCISE PICKER modal */}
      {pickerDayIdx !== null && (
        <div className="fixed inset-0 z-50 flex justify-start" style={{ background: "rgba(0,0,0,0.66)" }} onClick={() => setPickerDayIdx(null)}>
          <div
            className="h-full overflow-y-auto p-7"
            style={{ width: 460, maxWidth: "92vw", background: "#0f0f0f", borderLeft: "1px solid #222" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[22px] font-black text-white mb-4">בחר תרגיל</h2>
            <div className="relative mb-4">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[17px] h-[17px]" style={{ color: "#888" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="חפש תרגיל..."
                autoFocus
                className="w-full h-11 pr-11 pl-3.5 bg-[#141414] border border-[#2a2a2a] rounded-xl text-sm text-white outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              {filteredLib.map((e) => (
                <div
                  key={e.id}
                  onClick={() => addExercise(pickerDayIdx, e)}
                  className="flex items-center gap-3 bg-[#141414] border border-[#1e1e1e] rounded-[13px] px-3.5 py-3 cursor-pointer hover:border-[#333]"
                >
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white">{e.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "#888" }}>{e.muscleGroup}</div>
                  </div>
                  <div className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center flex-shrink-0" style={{ background: "rgba(182,255,74,0.12)", color: GREEN }}>
                    <Plus size={16} strokeWidth={2.6} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
