"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Dumbbell, Trophy } from "lucide-react";
import { getAlternatives, type AlternativeExercise } from "@/lib/exercise-alternatives";
import { getMuscleGymPhoto } from "@/lib/gym-photos";
import { ExerciseGifCard } from "@/components/shared/ExerciseGifCard";
import { useRestTimer } from "@/hooks/use-rest-timer";

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

interface SetLog { weight: string; reps: string; effort: Effort; done: boolean }

// Matches Lior Fit.dc.html's rest timer bar exactly (⏱️ מנוחה בין סטים / +15 שניות / דלג ⏭),
// driven by the useRestTimer hook from code/useRestTimer.ts.
function RestTimerBar({ label, progress, onAdd, onSkip }: { label: string; progress: number; onAdd: () => void; onSkip: () => void }) {
  return (
    <div style={{ background: "rgba(168,255,62,0.1)", border: "1px solid rgba(168,255,62,0.35)", borderRadius: 16, padding: "14px 16px", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15 }}>⏱️</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>מנוחה בין סטים</span>
        </div>
        <span style={{ fontSize: 22, fontWeight: 900, color: GREEN, fontVariantNumeric: "tabular-nums" }}>{label}</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.1)", overflow: "hidden", marginBottom: 12 }}>
        <div style={{ height: "100%", width: `${progress}%`, background: GREEN, transition: "width 1s linear" }} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onAdd} style={{
          flex: 1, background: "rgba(255,255,255,0.08)", borderRadius: 11, height: 40, border: "none",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", cursor: "pointer",
        }}>+15 שניות</button>
        <button onClick={onSkip} style={{
          flex: 1, background: GREEN, color: "#08120a", borderRadius: 11, height: 40, border: "none",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, cursor: "pointer",
        }}>דלג ⏭</button>
      </div>
    </div>
  );
}

function SheetSetRow({
  setNum, log, onChange, onDone,
}: {
  setNum: number;
  log: SetLog;
  onChange: (field: keyof SetLog, val: any) => void;
  onDone: () => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 10 }}>
      <button onClick={onDone} style={{
        width: 24, height: 24, borderRadius: 7, flexShrink: 0, cursor: "pointer", marginBottom: 8,
        background: log.done ? GREEN : "transparent",
        border: log.done ? "none" : "1.5px solid rgba(255,255,255,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {log.done && <svg width="14" height="14" fill="none" stroke="#08120a" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>משקל (ק״ג)</div>
        <input
          type="number" inputMode="numeric" value={log.weight} placeholder="0"
          onChange={(e) => onChange("weight", e.target.value)}
          className="lf-input"
          style={{
            width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12, color: "#fff", fontSize: 17, fontWeight: 800, textAlign: "center",
            padding: "10px 12px", outline: "none", boxSizing: "border-box",
          }}
        />
      </div>
      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 18, fontWeight: 700, marginBottom: 10 }}>×</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>חזרות</div>
        <input
          type="number" inputMode="numeric" value={log.reps} placeholder="12"
          onChange={(e) => onChange("reps", e.target.value)}
          style={{
            width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12, color: "#fff", fontSize: 17, fontWeight: 800, textAlign: "center",
            padding: "10px 12px", outline: "none", boxSizing: "border-box",
          }}
        />
      </div>
      <span style={{
        width: 24, height: 24, borderRadius: "50%", flexShrink: 0, marginBottom: 8,
        background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)",
        fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center",
      }}>{setNum}</span>
    </div>
  );
}

function ExerciseSheet({
  ex, displayName, sets, prValue, lastLabel, resting, restLabel, restProgress, doneCount,
  onClose, onPRChange, onSetChange, onSetDone, onAddSet, onComplete, onRestAdd, onRestSkip,
}: {
  ex: any; displayName: string; sets: SetLog[]; prValue: number; lastLabel: string;
  resting: boolean; restLabel: string; restProgress: number; doneCount: number;
  onClose: () => void; onPRChange: (val: string) => void;
  onSetChange: (idx: number, field: keyof SetLog, val: any) => void;
  onSetDone: (idx: number) => void; onAddSet: () => void; onComplete: () => void;
  onRestAdd: () => void; onRestSkip: () => void;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(3,3,8,0.72)", backdropFilter: "blur(3px)" }} />
      <motion.div
        dir="rtl"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        style={{
          position: "relative", background: "#12121c", borderTopLeftRadius: 28, borderTopRightRadius: 28,
          maxHeight: "90%", overflowY: "auto", padding: "10px 20px 30px",
        }}
      >
        <div style={{ width: 40, height: 5, borderRadius: 99, background: "rgba(255,255,255,0.2)", margin: "6px auto 14px" }} />

        {/* Media — video if the exercise library has a confirmed one, otherwise the exercise image/fallback */}
        <div style={{ position: "relative", height: 190, borderRadius: 20, overflow: "hidden", background: "#000", marginBottom: 6 }}>
          {ex.exercise?.videoUrl ? (
            <video
              src={ex.exercise.videoUrl}
              muted loop autoPlay playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${ex.exercise?.imageUrl || getMuscleGymPhoto(ex.exercise?.muscleGroup)})`,
              backgroundSize: "cover", backgroundPosition: "center",
            }} />
          )}
          <div style={{
            position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.6)", color: GREEN,
            fontSize: 11, fontWeight: 800, padding: "5px 10px", borderRadius: 99,
          }}>▶ הדגמה</div>
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
          לולאת הדגמה — תנוחת התחלה וסיום
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{displayName}</div>
            {ex.exercise?.nameEn && (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginTop: 2 }} dir="ltr">{ex.exercise.nameEn}</div>
            )}
          </div>
          <button onClick={onClose} style={{
            width: 34, height: 34, borderRadius: 11, background: "rgba(255,255,255,0.08)", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        {/* Tags — muscle group, equipment, level */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {[ex.exercise?.muscleGroup, ex.exercise?.equipment, ex.exercise?.difficulty].filter(Boolean).map((tag: string, i: number) => (
            <span key={i} style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.06)", padding: "4px 11px", borderRadius: 99 }}>{tag}</span>
          ))}
        </div>

        {/* Cues — critical technique tips, from the exercise library's tips[] */}
        {ex.exercise?.tips?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 8 }}>💡 דגשים</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {ex.exercise.tips.map((cue: string, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: GREEN, fontSize: 14, lineHeight: "20px", flexShrink: 0 }}>●</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>{cue}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions — numbered steps, from the exercise library's howTo (stored "1. ...\n2. ..." style) */}
        {ex.exercise?.howTo && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 8 }}>איך מבצעים</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {ex.exercise.howTo.split("\n").map((step: string, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>{step.replace(/^\d+\.\s*/, "")}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(168,255,62,0.08)", border: "1px solid rgba(168,255,62,0.25)",
          borderRadius: 16, padding: "14px 16px", marginBottom: 14,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>🏆 שיא אישי</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>הכי כבד שהרמת</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="number" inputMode="numeric" value={prValue || ""} placeholder="0"
              onChange={(e) => onPRChange(e.target.value)}
              style={{
                width: 64, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12, color: "#fff", fontSize: 17, fontWeight: 800, textAlign: "center",
                padding: "10px 8px", outline: "none", boxSizing: "border-box",
              }}
            />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>ק״ג</span>
          </div>
        </div>

        {lastLabel && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "11px 14px", marginBottom: 20,
          }}>
            <span style={{ fontSize: 13 }}>↩︎</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>בפעם שעברה:</span>
            <span style={{ fontSize: 13, color: "#fff", fontWeight: 800 }}>{lastLabel}</span>
          </div>
        )}

        {resting && (
          <RestTimerBar label={restLabel} progress={restProgress} onAdd={onRestAdd} onSkip={onRestSkip} />
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>הסטים שלי</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: GREEN }}>{doneCount}/{sets.length} סטים</div>
        </div>

        <div style={{ marginBottom: 14 }}>
          {sets.map((s, si) => (
            <SheetSetRow
              key={si}
              setNum={si + 1}
              log={s}
              onChange={(field, val) => onSetChange(si, field, val)}
              onDone={() => onSetDone(si)}
            />
          ))}
        </div>

        <button onClick={onAddSet} style={{
          width: "100%", border: "1.5px dashed rgba(255,255,255,0.2)", borderRadius: 14, height: 46,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.7)", cursor: "pointer",
          background: "transparent", marginBottom: 20,
        }}>+ הוסף סט</button>

        <button onClick={onComplete} style={{
          width: "100%", background: GREEN, color: "#08120a", borderRadius: 16, height: 54, border: "none",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          fontSize: 17, fontWeight: 900, cursor: "pointer",
        }}>השלם תרגיל ✓</button>
      </motion.div>
    </div>
  );
}

function makeDefaultSets(count: number, reps: number): SetLog[] {
  return Array.from({ length: count }, () => ({ weight: "", reps: String(reps), effort: "בינוני" as Effort, done: false }));
}

export function WorkoutLoggingClient({ plan, userId, exerciseHistory = {} }: { plan: any; userId: string; exerciseHistory?: Record<string, { pr: number; lastLabel: string }> }) {
  const sessions = plan?.sessions ?? [];
  const [sessionIdx, setSessionIdx] = useState(0);
  const [exStatus, setExStatus] = useState<Record<string, "pending" | "active" | "done" | "skip">>({});
  const [setLogs, setSetLogs] = useState<Record<string, SetLog[]>>({});
  const [restForExId, setRestForExId] = useState<string | null>(null);
  const restTimer = useRestTimer(90);
  const [workoutDone, setWorkoutDone] = useState(false);
  const [swapFor, setSwapFor] = useState<{ exId: string; name: string; muscleGroup: string } | null>(null);
  const [swappedNames, setSwappedNames] = useState<Record<string, string>>({});
  const [infoFor, setInfoFor] = useState<{ ex: any; displayName: string } | null>(null);
  const [finishingWorkout, setFinishingWorkout] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [sheetForId, setSheetForId] = useState<string | null>(null);
  const [prByEx, setPrByEx] = useState<Record<string, number>>({});

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

  function doneSet(exId: string, setIdx: number, restSeconds: number, weight?: string) {
    updateSet(exId, setIdx, "done", true);
    setRestForExId(exId);
    restTimer.start(restSeconds || 90);
    const w = parseFloat(weight ?? "");
    if (!isNaN(w)) {
      setPrByEx((prev) => ({ ...prev, [exId]: Math.max(prev[exId] ?? 0, w) }));
    }
  }

  function getPr(ex: any): number {
    if (prByEx[ex.id] != null) return prByEx[ex.id];
    return exerciseHistory[ex.exerciseId]?.pr ?? 0;
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
    restTimer.skip();
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

    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: [GREEN, "#ffffff", "#6366f1"], scalar: 1.2 });
    setTimeout(() => confetti({ particleCount: 80, spread: 120, origin: { y: 0.5 }, colors: [GREEN, "#ffffff"] }), 300);
  }

  if (!plan) {
    return (
      <div style={{ background: BG, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }} dir="rtl">
        <Dumbbell size={40} style={{ marginBottom: 16, color: "rgba(255,255,255,0.3)" }} />
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
        <div style={{ background: "#1c1c2e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: 32, textAlign: "center", maxWidth: 300, width: "100%" }}>
          <Trophy size={48} color={GREEN} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 8 }}>כל הכבוד!</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>סיימת את האימון</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { label: "תרגילים", value: `${doneCount}/${exercises.length}` },
              { label: "סטים הושלמו", value: String(totalSets) },
              { label: "סטים כבד", value: String(heavySets) },
              { label: "עצימות", value: heavySets > totalSets / 2 ? "גבוהה" : "בינונית" },
            ].map((s) => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "10px 0" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: GREEN }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <button onClick={() => { setExStatus({}); setWorkoutDone(false); setSetLogs({}); }} style={{
            padding: "12px 32px", borderRadius: 99, border: "none",
            background: GREEN, color: "#08120a", fontSize: 13, fontWeight: 800, cursor: "pointer",
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
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Full-bleed hero — matches Lior Fit.dc.html exactly: 224px image, day label + dots top, big uppercase name + muscle pills bottom */}
        <div style={{ position: "relative", height: 224, overflow: "hidden" }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${getMuscleGymPhoto(exercises[0]?.exercise?.muscleGroup)})`,
            backgroundSize: "cover", backgroundPosition: "center",
          }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #080810 2%, rgba(8,8,16,0.4) 45%, rgba(8,8,16,0.2) 100%)" }} />
          <div style={{ position: "absolute", top: 60, right: 20, left: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 600, textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>{session?.dayLabel ?? ""}</span>
            <div style={{ display: "flex", gap: 5 }}>
              {sessions.slice(0, 3).map((_s: any, i: number) => (
                <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: i === sessionIdx ? GREEN : "rgba(255,255,255,0.35)" }} />
              ))}
            </div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "0 20px 16px" }}>
            <div style={{ fontSize: 40, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", lineHeight: 1, color: "#fff", textShadow: "0 3px 16px rgba(0,0,0,0.8)" }}>
              {session?.name ?? ""}
            </div>
            <div style={{ display: "flex", gap: 7, marginTop: 12, flexWrap: "wrap" }}>
              {muscleGroups.map((m) => (
                <span key={m as string} style={{ background: "rgba(255,255,255,0.14)", backdropFilter: "blur(8px)", color: "#fff", fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 99 }}>{m as string}</span>
              ))}
            </div>
          </div>
        </div>

      <div style={{ padding: "16px 20px 14px" }}>

        {/* Session pills — matches Lior Fit.dc.html exactly: height 38, 0 18px, active=ACCENT/dark, inactive=rgba(255,255,255,0.08) */}
        {sessions.length > 1 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 18, overflowX: "auto" }}>
            {sessions.map((s: any, i: number) => (
              <button key={s.id} onClick={() => { setSessionIdx(i); setExStatus({}); setSetLogs({}); }} style={{
                flexShrink: 0, height: 38, padding: "0 18px", borderRadius: 999, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 14,
                background: i === sessionIdx ? GREEN : "rgba(255,255,255,0.08)",
                color: i === sessionIdx ? "#08120a" : "rgba(255,255,255,0.6)",
              }}>{s.name}</button>
            ))}
          </div>
        )}

        {/* Progress — matches Lior Fit.dc.html exactly: label first (right), count second in ACCENT (left) */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>התקדמות אימון</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: GREEN }}>{doneCount}/{exercises.length}</span>
          </div>
          <div style={{ height: 8, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 99, width: `${totalPct}%`, background: GREEN, transition: "width 0.4s ease" }}/>
          </div>
        </div>

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

            const hist = exerciseHistory[ex.exerciseId];
            const prValueForCard = hist?.pr && hist.pr > 0 ? hist.pr : (prByEx[ex.id] ?? 0);
            const prLabel = prValueForCard > 0 ? `${prValueForCard} ק״ג` : "משקל גוף";
            const lastLabel = hist?.lastLabel || "—";

            return (
              <div key={ex.id} style={{
                background: "#1c1c2e", borderRadius: 20, padding: 14,
                borderLeft: `4px solid ${isDone ? GREEN : "transparent"}`,
                transition: "border-color .15s",
              }}>
                {/* Card header — thumbnail first in DOM so it renders on the right in RTL, matching Lior Fit.dc.html exactly */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 13 }}>
                  {/* Thumbnail — 78x78, radius 16, matches Lior Fit.dc.html exactly */}
                  <div
                    onClick={() => setInfoFor({ ex, displayName })}
                    style={{
                      width: 78, height: 78, borderRadius: 16, flexShrink: 0, cursor: "pointer", overflow: "hidden",
                      backgroundImage: `url(${getMusclePhoto(ex.exercise?.muscleGroup, idx)})`,
                      backgroundSize: "cover", backgroundPosition: "center",
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <span style={{ width: 22, height: 22, borderRadius: 7, background: "rgba(168,255,62,0.14)", color: GREEN, fontSize: 12, fontWeight: 800, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{idx + 1}</span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: isDone ? "rgba(255,255,255,0.55)" : "#fff" }}>{displayName}</span>
                      {swappedNames[ex.id] && (
                        <span style={{ fontSize: 9, fontWeight: 700, color: GREEN, background: "rgba(168,255,62,0.2)", padding: "2px 6px", borderRadius: 99 }}>הוחלף</span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
                      {ex.sets ?? 3} סטים × {ex.reps ?? 12} חזרות
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 4 }}>
                      <span style={{ fontSize: 12, color: GREEN, fontWeight: 700 }}>🏆 שיא: {prLabel}</span>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>↩︎ בפעם שעברה: {lastLabel}</span>
                    </div>

                    {/* onOpen / החלף row — matches Lior Fit.dc.html exactly: both content-sized, side by side, start button first (right) */}
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button
                        onClick={() => { if (isDone) return; initSets(ex); setSheetForId(ex.id); }}
                        style={{
                          height: 38, padding: "0 16px", borderRadius: 12, border: "none", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800,
                          background: isDone ? "rgba(168,255,62,0.14)" : GREEN,
                          color: isDone ? GREEN : "#08120a",
                        }}
                      >
                        {isDone ? (
                          <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg> הושלם</>
                        ) : (
                          <><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8z" /></svg> התחל תרגיל</>
                        )}
                      </button>
                      <button
                        disabled={isDone || isSkip}
                        onClick={() => setSwapFor({ exId: ex.id, name: displayName, muscleGroup: ex.exercise?.muscleGroup ?? "" })}
                        style={{
                          height: 38, padding: "0 16px", borderRadius: 12, cursor: isDone || isSkip ? "default" : "pointer",
                          border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
                          color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 700,
                          opacity: isDone || isSkip ? 0.4 : 1,
                        }}
                      >החלף</button>
                    </div>
                  </div>
                </div>

                {isSkip && (
                  <div style={{ padding: "8px 0 0", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>⏭ דולג</div>
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

      {sheetForId && (() => {
        const ex = exercises.find((e: any) => e.id === sheetForId);
        if (!ex) return null;
        const sets = setLogs[ex.id] ?? [];
        const displayName = swappedNames[ex.id] ?? ex.exercise?.name ?? "תרגיל";
        const hist = exerciseHistory[ex.exerciseId];
        return (
          <ExerciseSheet
            ex={ex}
            displayName={displayName}
            sets={sets}
            prValue={getPr(ex)}
            lastLabel={hist?.lastLabel ?? ""}
            resting={restForExId === ex.id && restTimer.rest.active}
            restLabel={restTimer.label}
            restProgress={restTimer.progress}
            doneCount={sets.filter((s) => s.done).length}
            onClose={() => setSheetForId(null)}
            onPRChange={(val) => setPrByEx((prev) => ({ ...prev, [ex.id]: Number(val) || 0 }))}
            onSetChange={(idx, field, val) => updateSet(ex.id, idx, field, val)}
            onSetDone={(idx) => doneSet(ex.id, idx, ex.restSeconds ?? 90, sets[idx]?.weight)}
            onAddSet={() => addSet(ex.id, ex)}
            onComplete={() => { completeExercise(ex.id); setSheetForId(null); }}
            onRestAdd={() => restTimer.add(15)}
            onRestSkip={() => restTimer.skip()}
          />
        );
      })()}

        {doneCount > 0 && (
          <motion.button
            onClick={finishWorkout}
            disabled={finishingWorkout}
            animate={finishingWorkout ? {} : {
              boxShadow: [
                "0 0 0 0 rgba(168,255,62,0.4)",
                "0 0 0 12px rgba(168,255,62,0)",
                "0 0 0 0 rgba(168,255,62,0)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              width: "100%", marginTop: 20, padding: "16px 0", borderRadius: 18, border: "none", cursor: finishingWorkout ? "default" : "pointer",
              background: GREEN, color: "#08120a", fontSize: 15, fontWeight: 900,
              opacity: finishingWorkout ? 0.7 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
            {finishingWorkout ? "שומר..." : <><Trophy size={18} /> סיים אימון ({doneCount}/{exercises.length})</>}
          </motion.button>
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
    </div>
  );
}
