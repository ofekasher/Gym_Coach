"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Search, ChevronLeft, Loader2, Shuffle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// ─── Types ───────────────────────────────────────────────────────────────────
type SessionExercise = {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  weight?: number;
  restTime?: number;
  techniqueNotes?: string;
  priority?: number;  // 0-3 stars
  coachNote?: string;
};

type Session = { name: string; dayLabel: string; exercises: SessionExercise[] };

// ─── Template definitions ────────────────────────────────────────────────────
const TEMPLATES = [
  {
    value: "PPL", label: "Push / Pull / Legs",
    description: "3 ימי אימון — דחיפה, משיכה, רגליים",
    icon: "🔱", days: "3–6 ימים בשבוע",
    sessions: [
      { name: "Push 💪", dayLabel: "ראשון + רביעי", muscles: ["חזה", "כתפיים", "זרועות"] },
      { name: "Pull 🦾", dayLabel: "שני + חמישי", muscles: ["גב", "זרועות"] },
      { name: "Legs 🦵", dayLabel: "שישי", muscles: ["רגליים", "בטן"] },
    ],
  },
  {
    value: "UPPER_LOWER", label: "Upper / Lower",
    description: "פיצול עליון ותחתון — 4 אימונים בשבוע",
    icon: "⚡", days: "4 ימים בשבוע",
    sessions: [
      { name: "Upper A 💪", dayLabel: "ראשון", muscles: ["חזה", "גב", "כתפיים"] },
      { name: "Lower A 🦵", dayLabel: "שני", muscles: ["רגליים", "בטן"] },
      { name: "Upper B 🦾", dayLabel: "רביעי", muscles: ["חזה", "גב", "זרועות"] },
      { name: "Lower B 🔥", dayLabel: "חמישי", muscles: ["רגליים", "בטן"] },
    ],
  },
  {
    value: "FBW", label: "Full Body",
    description: "כל הגוף בכל אימון — מתאים למתחילים",
    icon: "🏋️", days: "3 ימים בשבוע",
    sessions: [
      { name: "Full Body A 🏋️", dayLabel: "ראשון", muscles: ["חזה", "גב", "רגליים"] },
      { name: "Full Body B 💪", dayLabel: "רביעי", muscles: ["כתפיים", "גב", "רגליים", "זרועות"] },
      { name: "Full Body C 🔥", dayLabel: "שישי", muscles: ["חזה", "רגליים", "בטן"] },
    ],
  },
  {
    value: "AB", label: "A / B",
    description: "שתי תוכניות לסירוגין",
    icon: "🔄", days: "2–4 ימים בשבוע",
    sessions: [
      { name: "אימון A 💪", dayLabel: "ראשון + חמישי", muscles: ["חזה", "כתפיים", "זרועות"] },
      { name: "אימון B 🦾", dayLabel: "שלישי + שבת", muscles: ["גב", "רגליים", "בטן"] },
    ],
  },
  {
    value: "CUSTOM", label: "מותאם אישית",
    description: "בנה תוכנית חופשית לפי הצורך",
    icon: "✏️", days: "לפי בחירתך",
    sessions: [
      { name: "אימון 1", dayLabel: "יום א׳", muscles: [] },
    ],
  },
];

const MUSCLE_GROUPS = ["כל השרירים", "חזה", "גב", "רגליים", "כתפיים", "זרועות", "בטן"];

// Default sets/reps/rest per muscle group
const MUSCLE_DEFAULTS: Record<string, { sets: number; reps: string; rest: number }> = {
  "חזה":    { sets: 4, reps: "8-10",  rest: 90 },
  "גב":     { sets: 4, reps: "8-10",  rest: 90 },
  "רגליים": { sets: 4, reps: "8-12",  rest: 120 },
  "כתפיים": { sets: 3, reps: "10-12", rest: 60 },
  "זרועות": { sets: 3, reps: "12-15", rest: 60 },
  "בטן":    { sets: 3, reps: "15-20", rest: 45 },
};

// ─── Helper: pick N random exercises from a pool ─────────────────────────────
function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function toSessionExercise(ex: any): SessionExercise {
  const d = MUSCLE_DEFAULTS[ex.muscleGroup] ?? { sets: 3, reps: "10-12", rest: 60 };
  return {
    exerciseId: ex.id, exerciseName: ex.name, muscleGroup: ex.muscleGroup,
    sets: d.sets, reps: d.reps, restTime: d.rest, priority: 0, coachNote: "",
  };
}

// Auto-fill sessions: 2-3 exercises per muscle group per session
function autoFillSessions(
  templateSessions: typeof TEMPLATES[0]["sessions"],
  allExercises: any[]
): Session[] {
  return templateSessions.map(s => {
    const exercises: SessionExercise[] = [];
    s.muscles.forEach((mg, idx) => {
      const pool = allExercises.filter(ex => ex.muscleGroup === mg);
      const count = idx === 0 ? 3 : 2; // primary muscle gets 3 exercises
      pickRandom(pool, count).forEach(ex => exercises.push(toSessionExercise(ex)));
    });
    return { name: s.name, dayLabel: s.dayLabel, exercises };
  });
}

// ─── Main component ──────────────────────────────────────────────────────────
export function WorkoutBuilderClient({ trainee, exercises, coachId }: {
  trainee: { id: string; name: string | null };
  exercises: any[];
  coachId: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<"template" | "build">("template");
  const [template, setTemplate] = useState("");
  const [planName, setPlanName] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState(0);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("כל השרירים");
  const [saving, setSaving] = useState(false);

  // ── Template selection ──────────────────────────────────────────────────────
  const handleSelectTemplate = (t: typeof TEMPLATES[0], withAutoFill: boolean) => {
    setTemplate(t.value);
    setPlanName(`תוכנית ${t.label} — ${trainee.name}`);
    const newSessions = withAutoFill && t.value !== "CUSTOM"
      ? autoFillSessions(t.sessions, exercises)
      : t.sessions.map(s => ({ name: s.name, dayLabel: s.dayLabel, exercises: [] }));
    setSessions(newSessions);
    setStep("build");
  };

  const handleRandomPlan = () => {
    const randomTemplate = TEMPLATES.find(t => t.value === "PPL")!;
    setTemplate("PPL");
    setPlanName(`תוכנית רנדומלית — ${trainee.name}`);
    setSessions(autoFillSessions(randomTemplate.sessions, exercises));
    setStep("build");
    toast({ title: "🎲 תוכנית נוצרה!", description: "תוכנית PPL עם תרגילים רנדומליים" });
  };

  // ── Exercise management ─────────────────────────────────────────────────────
  const filteredExercises = exercises.filter(ex => {
    const matchSearch = ex.name.toLowerCase().includes(exerciseSearch.toLowerCase());
    const matchMuscle = muscleFilter === "כל השרירים" || ex.muscleGroup === muscleFilter;
    return matchSearch && matchMuscle;
  });

  const isInCurrentSession = (exId: string) =>
    sessions[activeSession]?.exercises.some(e => e.exerciseId === exId);

  const addExercise = (ex: any) => {
    if (isInCurrentSession(ex.id)) return;
    setSessions(prev => {
      const next = [...prev];
      next[activeSession] = {
        ...next[activeSession],
        exercises: [...next[activeSession].exercises, toSessionExercise(ex)],
      };
      return next;
    });
  };

  const removeExercise = (sessionIdx: number, exIdx: number) => {
    setSessions(prev => {
      const next = [...prev];
      next[sessionIdx].exercises = next[sessionIdx].exercises.filter((_, i) => i !== exIdx);
      return next;
    });
  };

  const updateExercise = (sessionIdx: number, exIdx: number, field: string, value: any) => {
    setSessions(prev => {
      const next = [...prev];
      const exs = [...next[sessionIdx].exercises];
      exs[exIdx] = { ...exs[exIdx], [field]: value };
      next[sessionIdx] = { ...next[sessionIdx], exercises: exs };
      return next;
    });
  };

  // Randomize exercises for the current session
  const randomizeSession = () => {
    const templateDef = TEMPLATES.find(t => t.value === template);
    const sessionDef = templateDef?.sessions[activeSession % templateDef.sessions.length];
    if (!sessionDef) return;
    const newExercises: SessionExercise[] = [];
    sessionDef.muscles.forEach((mg, idx) => {
      const pool = exercises.filter(ex => ex.muscleGroup === mg);
      const count = idx === 0 ? 3 : 2;
      pickRandom(pool, count).forEach(ex => newExercises.push(toSessionExercise(ex)));
    });
    setSessions(prev => {
      const next = [...prev];
      next[activeSession] = { ...next[activeSession], exercises: newExercises };
      return next;
    });
    toast({ title: "🎲 תרגילים הוחלפו!" });
  };

  // ── Save plan ───────────────────────────────────────────────────────────────
  const savePlan = async () => {
    if (!planName.trim()) return toast({ variant: "destructive", title: "יש להזין שם לתוכנית" });

    if (trainee.id.startsWith("demo-") || coachId.startsWith("demo-")) {
      const demoPlan = {
        id: `demo-plan-${Date.now()}`,
        name: planName, template, isActive: true,
        createdAt: new Date().toISOString(),
        sessions: sessions.map((s, i) => ({
          id: `demo-s-${i}`,
          name: s.name, dayLabel: s.dayLabel, order: i,
          exercises: s.exercises.map((ex, j) => ({
            id: `demo-se-${i}-${j}`,
            exerciseId: ex.exerciseId,
            exercise: { id: ex.exerciseId, name: ex.exerciseName, muscleGroup: ex.muscleGroup },
            sets: ex.sets, reps: ex.reps, weight: ex.weight, restTime: ex.restTime,
            techniqueNotes: ex.techniqueNotes, priority: ex.priority ?? 0, coachNote: ex.coachNote ?? "", order: j,
          })),
        })),
      };
      try { localStorage.setItem(`demo_plan_${trainee.id}`, JSON.stringify(demoPlan)); } catch {}
      toast({ title: "✓ תוכנית האימון נשמרה!", description: "התוכנית תוצג בפרופיל המתאמן" });
      router.push(`/trainees/${trainee.id}`);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/workout/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ traineeId: trainee.id, coachId, name: planName, template, sessions }),
      });
      if (res.ok) {
        toast({ title: "✓ תוכנית האימון נשמרה!" });
        router.push(`/trainees/${trainee.id}`);
      } else {
        toast({ variant: "destructive", title: "שגיאה בשמירת התוכנית" });
      }
    } finally { setSaving(false); }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // STEP 1 — Template selection
  // ════════════════════════════════════════════════════════════════════════════
  if (step === "template") {
    return (
      <div style={{ maxWidth: 680, margin: "0 auto" }} dir="rtl">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <button onClick={() => router.back()}
            style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ChevronLeft style={{ width: 18, height: 18, color: "#A1A1AA" }} />
          </button>
          <div>
            <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 900, margin: 0 }}>בחר תוכנית אימון</h1>
            <p style={{ color: "#52525B", fontSize: 13, margin: "3px 0 0" }}>עבור {trainee.name}</p>
          </div>
        </div>

        {/* Random plan button */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={handleRandomPlan}
            style={{
              width: "100%", marginBottom: 16, padding: "18px 20px", borderRadius: 18, cursor: "pointer",
              background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
              border: "none", display: "flex", alignItems: "center", gap: 14,
              boxShadow: "0 8px 32px rgba(124,58,237,0.35)",
            }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
              🎲
            </div>
            <div style={{ textAlign: "right", flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>תוכנית רנדומלית</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 }}>מערכת תבחר תרגילים אוטומטית עבורך</div>
            </div>
            <Shuffle style={{ width: 20, height: 20, color: "rgba(255,255,255,0.7)" }} />
          </button>
        </motion.div>

        <p style={{ color: "#52525B", fontSize: 12, textAlign: "center", marginBottom: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          — או בחר תבנית —
        </p>

        {/* Template cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TEMPLATES.map((t, i) => (
            <motion.div key={t.value} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <div style={{
                background: "#161618", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18,
                overflow: "hidden",
              }}>
                {/* Main row */}
                <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ fontSize: 26, flexShrink: 0 }}>{t.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{t.label}</div>
                    <div style={{ color: "#52525B", fontSize: 12, marginTop: 2 }}>{t.description}</div>
                    <div style={{ color: "#F5C518", fontSize: 11, fontWeight: 700, marginTop: 4 }}>📅 {t.days}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                    {t.value !== "CUSTOM" && (
                      <button
                        onClick={() => handleSelectTemplate(t, true)}
                        style={{ background: "#F5C518", color: "#111", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 800, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" as const }}>
                        <Zap style={{ width: 13, height: 13 }} /> עם תרגילים
                      </button>
                    )}
                    <button
                      onClick={() => handleSelectTemplate(t, false)}
                      style={{ background: "rgba(255,255,255,0.06)", color: "#A1A1AA", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "7px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" as const }}>
                      {t.value === "CUSTOM" ? "בנה ידנית" : "ריק (ידני)"}
                    </button>
                  </div>
                </div>

                {/* Session preview */}
                {t.value !== "CUSTOM" && (
                  <div style={{ padding: "0 18px 14px", display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                    {t.sessions.map(s => (
                      <span key={s.name} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "3px 10px", fontSize: 11, color: "#71717A" }}>
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // STEP 2 — Build
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }} dir="rtl">
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setStep("template")}
            style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ChevronLeft style={{ width: 18, height: 18, color: "#A1A1AA" }} />
          </button>
          <input
            value={planName}
            onChange={e => setPlanName(e.target.value)}
            style={{ background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 18, fontWeight: 800, minWidth: 200 }}
          />
        </div>
        <Button onClick={savePlan} disabled={saving} style={{ background: "#F5C518", color: "#111", fontWeight: 800, borderRadius: 12, padding: "10px 22px" }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          שמור תוכנית
        </Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 18 }}>

        {/* ── Left: Sessions ────────────────────────────────────────────────── */}
        <div>
          {/* Session tabs */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 14 }}>
            {sessions.map((s, i) => (
              <button key={i} onClick={() => setActiveSession(i)}
                style={{
                  padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer", whiteSpace: "nowrap" as const,
                  fontWeight: 700, fontSize: 13, transition: "all 0.15s",
                  background: activeSession === i ? "#F5C518" : "rgba(255,255,255,0.06)",
                  color: activeSession === i ? "#111" : "#71717A",
                }}>
                {s.name}
              </button>
            ))}
            <button
              onClick={() => { setSessions([...sessions, { name: `אימון ${sessions.length + 1}`, dayLabel: "", exercises: [] }]); setActiveSession(sessions.length); }}
              style={{ padding: "8px 12px", borderRadius: 10, border: "1px dashed rgba(255,255,255,0.15)", background: "transparent", color: "#52525B", cursor: "pointer" }}>
              <Plus style={{ width: 15, height: 15 }} />
            </button>
          </div>

          {/* Session header */}
          <div style={{ background: "#161618", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "14px 18px", marginBottom: 12, display: "flex", gap: 10, alignItems: "center" }}>
            <input
              value={sessions[activeSession]?.name ?? ""}
              onChange={e => setSessions(prev => { const n = [...prev]; n[activeSession] = { ...n[activeSession], name: e.target.value }; return n; })}
              style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 700, padding: "7px 12px", outline: "none" }}
              placeholder="שם הסשן"
            />
            <input
              value={sessions[activeSession]?.dayLabel ?? ""}
              onChange={e => setSessions(prev => { const n = [...prev]; n[activeSession] = { ...n[activeSession], dayLabel: e.target.value }; return n; })}
              style={{ width: 120, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#A1A1AA", fontSize: 13, padding: "7px 12px", outline: "none" }}
              placeholder="יום האימון"
            />
            <button onClick={randomizeSession}
              title="רנדם תרגילים לסשן זה"
              style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#8B5CF6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shuffle style={{ width: 16, height: 16 }} />
            </button>
          </div>

          {/* Exercise list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <AnimatePresence>
              {(sessions[activeSession]?.exercises ?? []).map((ex, j) => (
                <motion.div key={`${ex.exerciseId}-${j}`}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                  style={{ background: "#161618", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "14px 16px" }}>

                  {/* Exercise header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: "#E5E5E5", fontSize: 14, fontWeight: 700 }}>{ex.exerciseName}</span>
                      <span style={{ color: "#52525B", fontSize: 11, marginRight: 8 }}>{ex.muscleGroup}</span>
                    </div>
                    {/* Stars */}
                    <div style={{ display: "flex", gap: 2 }}>
                      {[1, 2, 3].map(star => (
                        <button key={star} type="button"
                          onClick={() => updateExercise(activeSession, j, "priority", ex.priority === star ? 0 : star)}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 }}>
                          <span style={{ color: (ex.priority ?? 0) >= star ? "#F5C518" : "#3F3F46" }}>★</span>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => removeExercise(activeSession, j)}
                      style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Trash2 style={{ width: 13, height: 13, color: "#F87171" }} />
                    </button>
                  </div>

                  {/* Sets/Reps row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                    {[
                      { key: "sets", label: "סטים", type: "number" },
                      { key: "reps", label: "חזרות", type: "text" },
                      { key: "weight", label: "משקל ק״ג", type: "number" },
                      { key: "restTime", label: "מנוחה שנ׳", type: "number" },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ color: "#48484A", fontSize: 10, fontWeight: 700, display: "block", marginBottom: 3 }}>{f.label}</label>
                        <input type={f.type}
                          value={(ex as any)[f.key] ?? ""}
                          onChange={e => updateExercise(activeSession, j, f.key, f.type === "number" ? (e.target.value ? +e.target.value : undefined) : e.target.value)}
                          style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 13, padding: "6px 10px", outline: "none" }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  <input
                    value={ex.techniqueNotes ?? ""}
                    onChange={e => updateExercise(activeSession, j, "techniqueNotes", e.target.value)}
                    placeholder="הערות טכניקה..."
                    style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, color: "#A1A1AA", fontSize: 12, padding: "6px 10px", outline: "none", marginBottom: 6, boxSizing: "border-box" }}
                  />
                  <input
                    value={ex.coachNote ?? ""}
                    onChange={e => updateExercise(activeSession, j, "coachNote", e.target.value)}
                    placeholder="💬 דגש למתאמן (יוצג בולט)..."
                    style={{ width: "100%", background: "rgba(245,197,24,0.04)", border: "1px solid rgba(245,197,24,0.2)", borderRadius: 8, color: "#F5C518", fontSize: 12, padding: "6px 10px", outline: "none", boxSizing: "border-box" }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {(sessions[activeSession]?.exercises.length ?? 0) === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#3F3F46", fontSize: 14 }}>
                לחץ על תרגיל בספרייה להוספה →
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Exercise library ───────────────────────────────────────── */}
        <div style={{ position: "sticky", top: 80, alignSelf: "start" }}>
          <div style={{ background: "#161618", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: 16 }}>
            <p style={{ color: "#fff", fontWeight: 800, fontSize: 14, marginBottom: 12 }}>ספריית תרגילים</p>

            {/* Search */}
            <div style={{ position: "relative", marginBottom: 10 }}>
              <Search style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#52525B" }} />
              <input
                value={exerciseSearch}
                onChange={e => setExerciseSearch(e.target.value)}
                placeholder="חיפוש..."
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#fff", fontSize: 13, padding: "8px 34px 8px 12px", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* Muscle filter */}
            <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 4, marginBottom: 12 }}>
              {MUSCLE_GROUPS.map(mg => (
                <button key={mg} onClick={() => setMuscleFilter(mg)}
                  style={{
                    padding: "4px 10px", borderRadius: 99, border: "none", cursor: "pointer", whiteSpace: "nowrap" as const,
                    fontSize: 11, fontWeight: 700,
                    background: muscleFilter === mg ? "#8B5CF6" : "rgba(255,255,255,0.05)",
                    color: muscleFilter === mg ? "#fff" : "#71717A",
                  }}>
                  {mg === "כל השרירים" ? "הכל" : mg}
                </button>
              ))}
            </div>

            {/* Exercise list */}
            <div style={{ maxHeight: 520, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
              {filteredExercises.slice(0, 40).map(ex => {
                const added = isInCurrentSession(ex.id);
                return (
                  <button key={ex.id} onClick={() => addExercise(ex)}
                    disabled={added}
                    style={{
                      width: "100%", textAlign: "right", padding: "9px 12px", borderRadius: 10, cursor: added ? "default" : "pointer",
                      background: added ? "rgba(245,197,24,0.06)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${added ? "rgba(245,197,24,0.2)" : "rgba(255,255,255,0.06)"}`,
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                    }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: added ? "#F5C518" : "#E5E5E5", fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{ex.name}</div>
                      <div style={{ color: "#52525B", fontSize: 10 }}>{ex.muscleGroup} · {ex.equipment}</div>
                    </div>
                    {added
                      ? <span style={{ color: "#F5C518", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>✓</span>
                      : <Plus style={{ width: 14, height: 14, color: "#52525B", flexShrink: 0 }} />
                    }
                  </button>
                );
              })}
              {filteredExercises.length === 0 && (
                <p style={{ color: "#52525B", fontSize: 13, textAlign: "center", padding: 16 }}>לא נמצאו תרגילים</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
