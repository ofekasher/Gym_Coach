"use client";
import { useState, useEffect, useRef } from "react";
import { getVideoId } from "@/lib/exercise-videos";
import { ExerciseAnimationButton } from "@/components/shared/exercise-animation-modal";
import { getAlternatives, type AlternativeExercise } from "@/lib/exercise-alternatives";
import { getMuscleGymPhoto } from "@/lib/gym-photos";
import { ExerciseGifCard } from "@/components/shared/ExerciseGifCard";

function SwapModal({ exerciseName, muscleGroup, onSwap, onClose }: {
  exerciseName: string;
  muscleGroup: string;
  onSwap: (name: string) => void;
  onClose: () => void;
}) {
  const alts = getAlternatives(exerciseName, muscleGroup);
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: "#1A1A1F", borderRadius: "24px 24px 0 0",
        width: "100%", maxWidth: 480, padding: "20px 16px 40px",
        border: "1px solid rgba(255,255,255,0.08)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.15)", margin: "0 auto 14px" }} />
          <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>החלפת תרגיל</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
            במקום: <span style={{ color: GREEN }}>{exerciseName}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {alts.map((alt) => (
            <button key={alt.name} onClick={() => onSwap(alt.name)} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14, padding: "12px 14px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(168,255,62,0.4)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)"}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{alt.name}</span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99,
                  background: alt.equipment === "בית" ? "rgba(16,185,129,0.15)" : "rgba(59,130,246,0.15)",
                  color: alt.equipment === "בית" ? "#10B981" : "#3B82F6",
                }}>{alt.equipment}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99,
                  background: alt.difficulty === "קל" ? "rgba(52,211,153,0.12)" : alt.difficulty === "קשה" ? "rgba(248,113,113,0.12)" : "rgba(245,158,11,0.12)",
                  color: alt.difficulty === "קל" ? "#34D399" : alt.difficulty === "קשה" ? "#F87171" : "#F59E0B",
                }}>{alt.difficulty}</span>
              </div>
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{
          width: "100%", marginTop: 14, padding: "12px 0", borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
          color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>ביטול</button>
      </div>
    </div>
  );
}

const BG = "transparent";
const GREEN = "#a8ff3e";
const CARD = { background: "#161B22", borderRadius: 28, border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 8px 24px rgba(0,0,0,0.35)" };

const EXERCISE_INFO_FALLBACK: Record<string, { description: string; tip: string }> = {
  default: { description: "בצע את התרגיל בטכניקה נכונה ובקצב מבוקר.", tip: "שמור על גב ישר לאורך כל התנועה" },
};

function getExerciseInfo(ex: any): { description: string; tip: string } {
  const description = ex.exercise?.description || EXERCISE_INFO_FALLBACK.default.description;
  const tip = ex.exercise?.tips?.[0] || EXERCISE_INFO_FALLBACK.default.tip;
  return { description, tip };
}

function InfoModal({ ex, displayName, onClose }: { ex: any; displayName: string; onClose: () => void }) {
  const { description, tip } = getExerciseInfo(ex);
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: "#1A1A1F", borderRadius: "24px 24px 0 0",
        width: "100%", maxWidth: 480, padding: "20px 16px 40px",
        border: "1px solid rgba(255,255,255,0.08)",
      }} onClick={(e) => e.stopPropagation()} dir="rtl">
        <div style={{ width: 36, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.15)", margin: "0 auto 14px" }} />
        <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", textAlign: "center", marginBottom: 14 }}>{displayName}</div>
        <img
          src={getMuscleGymPhoto(ex.exercise?.muscleGroup)}
          alt={displayName}
          style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 16, marginBottom: 14 }}
        />
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, marginBottom: 12 }}>{description}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: GREEN, marginBottom: 10 }}>
          {ex.sets ?? 3} סטים × {ex.reps ?? 12} חזרות
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", background: "rgba(168,255,62,0.08)", borderRadius: 12, padding: "10px 12px", marginBottom: 16 }}>
          💡 טיפ: {tip}
        </div>
        <div style={{ marginBottom: 16 }}>
          <ExerciseGifCard exerciseName={ex.exercise?.name ?? displayName} />
        </div>
        <button onClick={onClose} style={{
          width: "100%", padding: "12px 0", borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
          color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>סגור</button>
      </div>
    </div>
  );
}

function getMusclePhoto(muscleGroup: string | undefined, idx: number): string {
  return getMuscleGymPhoto(muscleGroup);
}

type Effort = "קל" | "בינוני" | "כבד";
const EFFORT_CONFIG: Record<Effort, { color: string; bg: string; emoji: string }> = {
  "קל":     { color: "#34D399", bg: "rgba(52,211,153,0.15)",  emoji: "😊" },
  "בינוני": { color: "#F59E0B", bg: "rgba(245,158,11,0.15)",  emoji: "💪" },
  "כבד":    { color: "#F87171", bg: "rgba(248,113,113,0.15)", emoji: "🔥" },
};

interface SetLog { weight: string; reps: string; effort: Effort; done: boolean }

function RestTimer({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [left, setLeft] = useState(seconds);
  const ref = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    ref.current = setInterval(() => {
      setLeft((l) => { if (l <= 1) { clearInterval(ref.current!); onDone(); return 0; } return l - 1; });
    }, 1000);
    return () => clearInterval(ref.current!);
  }, []);
  const pct = (left / seconds) * 100;
  const r = 38, cx = 44, cy = 44, stroke = 6, circum = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0" }}>
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke}/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={GREEN} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={`${(pct / 100) * circum} ${circum}`}
          transform={`rotate(-90 ${cx} ${cy})`}/>
        <text x={cx} y={cy + 6} textAnchor="middle" fontSize="18" fontWeight="800" fill="#fff">{left}s</text>
      </svg>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>מנוחה</div>
      <button onClick={onDone} style={{
        marginTop: 10, padding: "6px 20px", borderRadius: 99, border: "none", cursor: "pointer",
        background: "rgba(168,255,62,0.2)", color: GREEN, fontSize: 12, fontWeight: 700,
      }}>דלג</button>
    </div>
  );
}

function SetRow({
  setNum, log, onChange, onDone,
}: {
  setNum: number;
  log: SetLog;
  onChange: (field: keyof SetLog, val: any) => void;
  onDone: () => void;
}) {
  return (
    <div style={{
      background: log.done ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.03)",
      borderRadius: 14, padding: "10px 12px", marginBottom: 8,
      border: log.done ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(255,255,255,0.05)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Set number */}
        <div style={{
          width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
          background: log.done ? "#10B981" : "rgba(168,255,62,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 800, color: log.done ? "#fff" : "#3B82F6",
        }}>
          {log.done
            ? <svg width="12" height="12" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            : setNum}
        </div>

        {/* Weight */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 2 }}>משקל (ק״ג)</div>
          <input
            type="number" value={log.weight} placeholder="0"
            onChange={(e) => onChange("weight", e.target.value)}
            style={{
              width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 700,
              padding: "6px 8px", outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Reps */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 2 }}>חזרות</div>
          <input
            type="number" value={log.reps} placeholder="12"
            onChange={(e) => onChange("reps", e.target.value)}
            style={{
              width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 700,
              padding: "6px 8px", outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Done button */}
        <button onClick={onDone} style={{
          flexShrink: 0, width: 36, height: 36, borderRadius: 10, border: "none", cursor: "pointer",
          background: log.done ? "#10B981" : "rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginTop: 14,
        }}>
          {log.done
            ? <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          }
        </button>
      </div>

      {/* Effort selector */}
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        {(["קל", "בינוני", "כבד"] as Effort[]).map((e) => {
          const cfg = EFFORT_CONFIG[e];
          const active = log.effort === e;
          return (
            <button key={e} onClick={() => onChange("effort", e)} style={{
              flex: 1, padding: "5px 0", borderRadius: 8, border: "none", cursor: "pointer",
              background: active ? cfg.bg : "rgba(255,255,255,0.04)",
              color: active ? cfg.color : "rgba(255,255,255,0.3)",
              fontSize: 11, fontWeight: active ? 700 : 500,
              transition: "all 0.15s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
            }}>
              <span style={{ fontSize: 13 }}>{cfg.emoji}</span> {e}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function VideoPlayer({ videoId, title }: { videoId: string; title: string }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ marginBottom: 12 }}>
      {!show ? (
        <button onClick={() => setShow(true)} style={{
          width: "100%", borderRadius: 12, border: "1px solid rgba(59,130,246,0.25)",
          background: "rgba(59,130,246,0.07)", padding: "10px 14px",
          display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
        }}>
          {/* Thumbnail */}
          <div style={{
            width: 64, height: 40, borderRadius: 8, overflow: "hidden",
            background: "#000", flexShrink: 0, position: "relative",
          }}>
            <img
              src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
              alt={title}
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
            />
            {/* Play icon */}
            <div style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.9)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="8" height="10" fill="#111" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: GREEN }}>סרטון הדרכה</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{title}</div>
          </div>
        </button>
      ) : (
        <div style={{ borderRadius: 12, overflow: "hidden", position: "relative" }}>
          <iframe
            width="100%"
            height="195"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ display: "block" }}
          />
          <button onClick={() => setShow(false)} style={{
            position: "absolute", top: 6, left: 6, width: 28, height: 28, borderRadius: "50%",
            background: "rgba(0,0,0,0.7)", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="10" height="10" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

function makeDefaultSets(count: number, reps: number): SetLog[] {
  return Array.from({ length: count }, () => ({ weight: "", reps: String(reps), effort: "בינוני" as Effort, done: false }));
}

export function WorkoutLoggingClient({ plan, userId }: { plan: any; userId: string }) {
  const sessions = plan?.sessions ?? [];
  const [sessionIdx, setSessionIdx] = useState(0);
  const [exStatus, setExStatus] = useState<Record<string, "pending" | "active" | "done" | "skip">>({});
  const [setLogs, setSetLogs] = useState<Record<string, SetLog[]>>({});
  const [restingFor, setRestingFor] = useState<string | null>(null);
  const [workoutDone, setWorkoutDone] = useState(false);
  const [swapFor, setSwapFor] = useState<{ exId: string; name: string; muscleGroup: string } | null>(null);
  const [swappedNames, setSwappedNames] = useState<Record<string, string>>({});
  const [infoFor, setInfoFor] = useState<{ ex: any; displayName: string } | null>(null);
  const [finishingWorkout, setFinishingWorkout] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const session = sessions[sessionIdx];
  const exercises = session?.exercises ?? [];
  const muscleGroups = Array.from(new Set(exercises.map((e: any) => e.exercise?.muscleGroup).filter(Boolean)));
  const doneCount = exercises.filter((e: any) => exStatus[e.id] === "done" || exStatus[e.id] === "skip").length;
  const totalPct = exercises.length > 0 ? Math.round((doneCount / exercises.length) * 100) : 0;

  function initSets(ex: any) {
    if (!setLogs[ex.id]) {
      const count = ex.sets ?? 3;
      const reps = ex.reps ?? 12;
      setSetLogs((prev) => ({ ...prev, [ex.id]: makeDefaultSets(count, reps) }));
    }
    setExStatus((s) => ({ ...s, [ex.id]: "active" }));
  }

  function updateSet(exId: string, setIdx: number, field: keyof SetLog, val: any) {
    setSetLogs((prev) => {
      const arr = [...(prev[exId] ?? [])];
      arr[setIdx] = { ...arr[setIdx], [field]: val };
      return { ...prev, [exId]: arr };
    });
  }

  function doneSet(exId: string, setIdx: number, restSeconds: number) {
    updateSet(exId, setIdx, "done", true);
    setRestingFor(`${exId}-${setIdx}`);
    setTimeout(() => setRestingFor(null), (restSeconds || 60) * 1000);
  }

  function addSet(exId: string, ex: any) {
    setSetLogs((prev) => {
      const arr = [...(prev[exId] ?? [])];
      arr.push({ weight: arr[arr.length - 1]?.weight ?? "", reps: String(ex.reps ?? 12), effort: "בינוני", done: false });
      return { ...prev, [exId]: arr };
    });
  }

  function completeExercise(exId: string) {
    setExStatus((s) => ({ ...s, [exId]: "done" }));
    setRestingFor(null);
  }

  function skipExercise(exId: string) {
    setExStatus((s) => ({ ...s, [exId]: "skip" }));
  }

  async function finishWorkout() {
    setFinishingWorkout(true);

    // Build the payload the real POST /api/workout/log route expects:
    // { traineeId, sessionId, status, exerciseLogs: [{ exerciseId, sets, reps, weight }] }
    const exerciseLogs = exercises
      .filter((ex: any) => exStatus[ex.id] === "done")
      .map((ex: any) => {
        const sets = (setLogs[ex.id] ?? []).filter((s) => s.done);
        const weights = sets.map((s) => parseFloat(s.weight)).filter((w) => !isNaN(w));
        return {
          exerciseId: ex.exerciseId,
          sets: sets.length,
          reps: sets[sets.length - 1]?.reps ?? "",
          weight: weights.length ? Math.max(...weights) : undefined,
        };
      });

    try {
      const res = await fetch("/api/workout/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          traineeId: userId,
          sessionId: session?.id,
          status: "COMPLETED",
          exerciseLogs,
        }),
      });
      if (!res.ok) console.error("Failed to save workout to DB");
    } catch (err) {
      console.error("Workout save error:", err);
    }

    // Keep localStorage as a fallback/local history cache
    try {
      const key = `demo_workout_log_${userId}`;
      const existing = JSON.parse(localStorage.getItem(key) ?? "[]");
      const entry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        sessionName: session?.name ?? "",
        planName: plan?.name ?? "",
        exercisesCompleted: doneCount,
        totalExercises: exercises.length,
        totalSets: Object.values(setLogs).flat().filter((s: any) => s.done).length,
        status: "COMPLETED",
      };
      localStorage.setItem(key, JSON.stringify([entry, ...existing.slice(0, 29)]));
    } catch {}

    setFinishingWorkout(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
    setWorkoutDone(true);
  }

  if (!plan) {
    return (
      <div style={{ background: BG, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }} dir="rtl">
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏋️</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>אין תוכנית אימון פעילה</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>המאמן שלך יוסיף תוכנית בקרוב</div>
      </div>
    );
  }

  if (workoutDone) {
    const totalSets = Object.values(setLogs).flat().filter((s) => s.done).length;
    const heavySets = Object.values(setLogs).flat().filter((s) => s.done && s.effort === "כבד").length;
    return (
      <div style={{ background: BG, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }} dir="rtl">
        <div style={{ background: "linear-gradient(135deg,#1E3A8A,#2563EB)", borderRadius: 24, padding: 32, textAlign: "center", maxWidth: 300, width: "100%" }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🏆</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 8 }}>כל הכבוד!</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>סיימת את האימון</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { label: "תרגילים", value: `${doneCount}/${exercises.length}` },
              { label: "סטים הושלמו", value: String(totalSets) },
              { label: 'סטים כבד 🔥', value: String(heavySets) },
              { label: "עצימות", value: heavySets > totalSets / 2 ? "גבוהה" : "בינונית" },
            ].map((s) => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 0" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <button onClick={() => { setExStatus({}); setWorkoutDone(false); setSetLogs({}); }} style={{
            padding: "12px 32px", borderRadius: 99, border: "none",
            background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>אימון חדש</button>
        </div>

        {saveToast && (
          <div style={{
            position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
            background: GREEN, color: "#0a0a0a", fontWeight: 800, fontSize: 14,
            padding: "10px 20px", borderRadius: 999, zIndex: 100,
          }}>
            האימון נשמר! 💪
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ background: BG, minHeight: "100vh", paddingBottom: 120 }} dir="rtl">
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px 0" }}>

        {/* FitBuddy-style hero header */}
        {session && (
          <div style={{
            position: "relative", height: 160, borderRadius: 20, overflow: "hidden", marginBottom: 20,
            backgroundImage: `url(${getMuscleGymPhoto(exercises[0]?.exercise?.muscleGroup)})`,
            backgroundSize: "cover", backgroundPosition: "center",
          }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
            <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 14 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", textAlign: "right" }}>{session.dayLabel ?? ""}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", textAlign: "center" }}>{session.name}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
                {muscleGroups.map((m) => (
                  <span key={m as string} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 11, padding: "4px 12px", borderRadius: 99 }}>{m as string}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>אימון</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{plan.name}</div>
        </div>

        {sessions.length > 1 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
            {sessions.map((s: any, i: number) => (
              <button key={s.id} onClick={() => { setSessionIdx(i); setExStatus({}); setSetLogs({}); }} style={{
                flexShrink: 0, padding: "8px 16px", borderRadius: 99, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12,
                background: i === sessionIdx ? GREEN : "#1A1A1F",
                color: i === sessionIdx ? "#0a0a0a" : "rgba(255,255,255,0.4)",
              }}>{s.name}</button>
            ))}
          </div>
        )}

        {/* Progress */}
        <div style={{ ...CARD, padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{session?.name}</span>
            <span style={{ fontSize: 12, color: GREEN, fontWeight: 700 }}>{totalPct}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.07)" }}>
            <div style={{ height: "100%", borderRadius: 99, width: `${totalPct}%`, background: `linear-gradient(to left,${GREEN},#5ecc00)`, transition: "width 0.4s ease" }}/>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>{doneCount} / {exercises.length} תרגילים</div>
        </div>

        {/* Rest timer */}
        {restingFor && (
          <div style={{ ...CARD, marginBottom: 16 }}>
            <RestTimer seconds={60} onDone={() => setRestingFor(null)}/>
          </div>
        )}

        {/* Exercises */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {exercises.map((ex: any, idx: number) => {
            const status = exStatus[ex.id] ?? "pending";
            const isActive = status === "active";
            const isDone = status === "done";
            const isSkip = status === "skip";
            const sets = setLogs[ex.id] ?? [];
            const doneSets = sets.filter((s) => s.done).length;
            const displayName = swappedNames[ex.id] ?? ex.exercise?.name ?? `תרגיל ${idx + 1}`;

            return (
              <div key={ex.id} style={{
                borderRadius: 26, overflow: "hidden",
                border: isDone ? "1px solid rgba(16,185,129,0.3)" : isActive ? "1px solid rgba(168,255,62,0.4)" : "1px solid rgba(255,255,255,0.05)",
                background: "#161B22",
                boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
              }}>
                {/* Photo header */}
                <div style={{
                  height: 78, position: "relative",
                  backgroundImage: `url(${getMusclePhoto(ex.exercise?.muscleGroup, idx)})`,
                  backgroundSize: "cover", backgroundPosition: "center",
                }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,rgba(10,14,20,0.88),rgba(10,14,20,0.25))" }}/>
                  <div style={{ position: "relative", zIndex: 1, padding: "12px 14px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{displayName}</div>
                        {swappedNames[ex.id] && (
                          <span style={{ fontSize: 9, fontWeight: 700, color: GREEN, background: "rgba(168,255,62,0.2)", padding: "2px 6px", borderRadius: 99 }}>הוחלף</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                        {ex.sets ?? 3} סטים × {ex.reps ?? 12} חזרות
                        {isActive && sets.length > 0 && ` · ${doneSets}/${sets.length} הושלמו`}
                      </div>
                    </div>
                    {/* Info button */}
                    <button onClick={() => setInfoFor({ ex, displayName })} style={{
                      width: 32, height: 32, borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)",
                      background: "rgba(255,255,255,0.08)", cursor: "pointer", flexShrink: 0, marginLeft: 6,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 800,
                    }} title="מידע על התרגיל">?</button>
                    {/* Swap button */}
                    {!isDone && !isSkip && (
                      <button onClick={() => setSwapFor({ exId: ex.id, name: displayName, muscleGroup: ex.exercise?.muscleGroup ?? "" })} style={{
                        width: 32, height: 32, borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)",
                        background: "rgba(255,255,255,0.08)", cursor: "pointer", flexShrink: 0, marginLeft: 6,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }} title="החלף תרגיל">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.2" strokeLinecap="round">
                          <path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/>
                        </svg>
                      </button>
                    )}
                    {/* Demo animation button */}
                    <ExerciseAnimationButton
                      exerciseName={displayName}
                      muscleGroup={ex.exercise?.muscleGroup ?? ""}
                      videoId={ex.exercise?.videoUrl ?? null}
                    />
                    <div style={{ marginRight: 8,
                      width: 32, height: 32, borderRadius: "50%",
                      background: isDone ? "#10B981" : isSkip ? "rgba(255,255,255,0.1)" : isActive ? GREEN : "rgba(255,255,255,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {isDone && <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
                      {isSkip && <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                      {isActive && <span style={{ fontSize: 10, fontWeight: 800, color: "#0a0a0a" }}>{doneSets}/{sets.length}</span>}
                      {status === "pending" && <span style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.4)" }}>{idx + 1}</span>}
                    </div>
                  </div>
                </div>

                {/* Active: per-set rows */}
                {isActive && (
                  <div style={{ padding: "12px 14px" }}>
                    {/* Video tutorial */}
                    {(() => {
                      const vid = getVideoId(ex.exercise?.name ?? "", ex.exercise?.videoUrl);
                      return vid ? <VideoPlayer videoId={vid} title={ex.exercise?.name ?? ""} /> : null;
                    })()}
                    {sets.map((s, si) => (
                      <SetRow
                        key={si}
                        setNum={si + 1}
                        log={s}
                        onChange={(field, val) => updateSet(ex.id, si, field, val)}
                        onDone={() => doneSet(ex.id, si, ex.restSeconds ?? 60)}
                      />
                    ))}

                    {/* Add set */}
                    <button onClick={() => addSet(ex.id, ex)} style={{
                      width: "100%", padding: "8px 0", borderRadius: 10,
                      border: "1px dashed rgba(168,255,62,0.3)", background: "transparent",
                      color: GREEN, fontSize: 12, fontWeight: 700, cursor: "pointer", marginBottom: 10,
                    }}>+ הוסף סט</button>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => completeExercise(ex.id)} style={{
                        flex: 2, padding: "11px 0", borderRadius: 13, border: "none", cursor: "pointer",
                        background: "#10B981", color: "#fff", fontSize: 13, fontWeight: 700,
                      }}>✓ סיים תרגיל</button>
                      <button onClick={() => skipExercise(ex.id)} style={{
                        flex: 1, padding: "11px 0", borderRadius: 13,
                        border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
                        color: "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: 600, cursor: "pointer",
                      }}>דלג</button>
                    </div>
                  </div>
                )}

                {status === "pending" && (
                  <button onClick={() => initSets(ex)} style={{
                    width: "100%", padding: "12px 16px", border: "none", cursor: "pointer",
                    background: "transparent", textAlign: "right", fontSize: 12, color: GREEN, fontWeight: 700,
                  }}>התחל תרגיל →</button>
                )}

                {isDone && (
                  <div style={{ padding: "8px 14px", fontSize: 11, color: "#10B981" }}>
                    ✓ {doneSets} סטים הושלמו · {sets.filter(s=>s.effort==="כבד").length > 0 ? `${sets.filter(s=>s.effort==="כבד").length} כבד 🔥` : ""}
                  </div>
                )}
                {isSkip && (
                  <div style={{ padding: "8px 14px", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>⏭ דולג</div>
                )}
              </div>
            );
          })}
        </div>

      {infoFor && (
        <InfoModal ex={infoFor.ex} displayName={infoFor.displayName} onClose={() => setInfoFor(null)} />
      )}

      {swapFor && (
        <SwapModal
          exerciseName={swapFor.name}
          muscleGroup={swapFor.muscleGroup}
          onSwap={(newName) => {
            setSwappedNames(prev => ({ ...prev, [swapFor.exId]: newName }));
            setSwapFor(null);
          }}
          onClose={() => setSwapFor(null)}
        />
      )}

        {doneCount > 0 && (
          <button onClick={finishWorkout} disabled={finishingWorkout} style={{
            width: "100%", marginTop: 20, padding: "16px 0", borderRadius: 18, border: "none", cursor: finishingWorkout ? "default" : "pointer",
            background: "linear-gradient(135deg,#1E3A8A,#2563EB)", color: "#fff", fontSize: 15, fontWeight: 800,
            opacity: finishingWorkout ? 0.7 : 1,
          }}>
            {finishingWorkout ? "שומר..." : `🏆 סיים אימון (${doneCount}/${exercises.length})`}
          </button>
        )}

        {saveToast && (
          <div style={{
            position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
            background: GREEN, color: "#0a0a0a", fontWeight: 800, fontSize: 14,
            padding: "10px 20px", borderRadius: 999, zIndex: 100,
          }}>
            האימון נשמר! 💪
          </div>
        )}
      </div>
    </div>
  );
}
