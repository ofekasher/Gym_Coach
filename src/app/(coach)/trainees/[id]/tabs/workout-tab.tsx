"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Dumbbell, Edit2, Save, X, Loader2, Trash2, ChevronDown, ChevronUp, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TEMPLATE_LABELS: Record<string, string> = {
  FBW: "Full Body Workout", UPPER_LOWER: "Upper / Lower",
  PPL: "Push / Pull / Legs", AB: "A/B", CUSTOM: "מותאם אישית",
};

const S = {
  card: { background: "#161618", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, overflow: "hidden" as const },
  input: { background: "#1C1C1E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 13, padding: "7px 12px", outline: "none", width: "100%" },
  label: { color: "#48484A", fontSize: 10, fontWeight: 700 as const, textTransform: "uppercase" as const, letterSpacing: "0.05em", display: "block" as const, marginBottom: 4 },
  btnYellow: { background: "#a8ff3e", color: "#111", border: "none", borderRadius: 999, padding: "8px 18px", fontWeight: 800 as const, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
  btnGhost: { background: "rgba(255,255,255,0.05)", color: "#71717A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999, padding: "8px 16px", fontWeight: 700 as const, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
};

function ExerciseRow({ se, traineeId, onUpdate, onDelete }: {
  se: any; traineeId: string;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    sets: se.sets, reps: se.reps, weight: se.weight ?? "",
    rest: se.restTime ?? se.rest ?? "",
    techniqueNotes: se.techniqueNotes ?? "", priority: se.priority ?? 0, coachNote: se.coachNote ?? "",
  });
  const isDemo = traineeId.startsWith("demo-");

  const save = async () => {
    setSaving(true);
    try {
      if (isDemo) {
        onUpdate(se.id, form);
        setEditing(false);
      } else {
        const res = await fetch(`/api/coach/workout/exercise/${se.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
        });
        if (res.ok) { onUpdate(se.id, form); setEditing(false); }
      }
    } finally { setSaving(false); }
  };

  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "10px 0" }}>
      {editing ? (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
            {[
              { key: "sets", label: "סטים" }, { key: "reps", label: "חזרות" },
              { key: "weight", label: 'משקל (ק"ג)' }, { key: "rest", label: "מנוחה (שנ׳)" },
            ].map((f) => (
              <div key={f.key}>
                <label style={S.label}>{f.label}</label>
                <input type={f.key === "reps" ? "text" : "number"} style={S.input}
                  value={(form as any)[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={S.label}>הערות טכניקה</label>
            <input style={S.input} value={form.techniqueNotes} onChange={(e) => setForm({ ...form, techniqueNotes: e.target.value })} placeholder="הערות..." />
          </div>
          {/* Coach note */}
          <div style={{ marginBottom: 8 }}>
            <label style={S.label}>💬 דגש למתאמן</label>
            <input style={{ ...S.input, borderColor: "rgba(168,255,62,0.3)" }} value={form.coachNote}
              onChange={(e) => setForm({ ...form, coachNote: e.target.value })} placeholder="דגש שיוצג בולט..." />
          </div>
          {/* Priority stars */}
          <div style={{ marginBottom: 10 }}>
            <label style={S.label}>עדיפות</label>
            <div style={{ display: "flex", gap: 4 }}>
              {[1,2,3].map(s => (
                <button key={s} type="button" onClick={() => setForm(f => ({ ...f, priority: f.priority === s ? 0 : s }))}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>
                  <span style={{ color: form.priority >= s ? "#a8ff3e" : "#3F3F46" }}>★</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={save} disabled={saving} style={S.btnYellow}>
              {saving ? <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" /> : <Save style={{ width: 13, height: 13 }} />} שמור
            </button>
            <button onClick={() => setEditing(false)} style={S.btnGhost}><X style={{ width: 13, height: 13 }} /> ביטול</button>
            <button onClick={() => onDelete(se.id)} style={{ ...S.btnGhost, color: "#F87171", marginRight: "auto" }}>
              <Trash2 style={{ width: 13, height: 13 }} />
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <p style={{ color: "#E5E5E5", fontSize: 14, fontWeight: 600 }}>{se.exercise.name}</p>
                {(se.priority ?? 0) > 0 && (
                  <span style={{ color: "#a8ff3e", fontSize: 13, letterSpacing: -1 }}>
                    {"★".repeat(se.priority)}
                  </span>
                )}
              </div>
              {se.techniqueNotes && <p style={{ color: "#52525B", fontSize: 12, marginTop: 1 }}>{se.techniqueNotes}</p>}
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <span style={{ background: "rgba(255,255,255,0.06)", color: "#A1A1AA", borderRadius: 7, padding: "4px 8px", fontSize: 11 }}>{se.sets}×{se.reps}</span>
              {se.weight && <span style={{ background: "rgba(168,255,62,0.1)", color: "#a8ff3e", borderRadius: 7, padding: "4px 8px", fontSize: 11 }}>{se.weight}ק״ג</span>}
            </div>
            <button onClick={() => setEditing(true)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "5px 8px", cursor: "pointer" }}>
              <Edit2 style={{ width: 13, height: 13, color: "#71717A" }} />
            </button>
          </div>
          {se.coachNote && (
            <div style={{ background: "rgba(168,255,62,0.07)", border: "1px solid rgba(168,255,62,0.2)", borderRadius: 8, padding: "5px 10px", fontSize: 12, color: "#a8ff3e" }}>
              💬 {se.coachNote}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function esc(s: string | undefined | null): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function exportWorkoutPDF(plan: any, traineeName: string) {
  const html = `<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; padding: 32px; color: #111; direction: rtl; }
  h1 { font-size: 24px; margin-bottom: 4px; }
  .sub { color: #888; font-size: 13px; margin-bottom: 24px; }
  .session { break-inside: avoid; margin-bottom: 24px; border: 1px solid #e5e5e5; border-radius: 12px; padding: 16px; }
  .session-title { font-size: 16px; font-weight: 800; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #f5f5f5; padding: 8px 10px; text-align: right; font-weight: 700; }
  td { padding: 7px 10px; border-bottom: 1px solid #f0f0f0; }
  .coach-note { background: rgba(168,255,62,0.08); border-right: 3px solid #a8ff3e; padding: 6px 10px; margin-top: 6px; font-size: 12px; border-radius: 4px; }
  .stars { color: #a8ff3e; }
  @media print { body { padding: 16px; } }
</style></head><body>
<h1>תוכנית אימון — ${esc(traineeName)}</h1>
<div class="sub">${esc(plan.name)} · ${new Date().toLocaleDateString("he-IL")}</div>
${(plan.sessions ?? []).map((s: any) => `
<div class="session">
  <div class="session-title">${esc(s.name)} <span style="color:#888;font-size:12px;font-weight:400">${esc(s.dayLabel)}</span></div>
  <table>
    <tr><th>תרגיל</th><th>סטים</th><th>חזרות</th><th>משקל</th><th>מנוחה</th></tr>
    ${(s.exercises ?? []).map((e: any) => `
    <tr>
      <td>
        ${(e.priority ?? 0) > 0 ? `<span class="stars">${"★".repeat(Math.min(e.priority, 5))}</span> ` : ""}
        ${esc(e.exercise?.name ?? e.exerciseName)}
        ${e.coachNote ? `<div class="coach-note">&#x1F4AC; ${esc(e.coachNote)}</div>` : ""}
      </td>
      <td>${esc(String(e.sets ?? ""))}</td><td>${esc(String(e.reps ?? ""))}</td>
      <td>${e.weight ? esc(String(e.weight)) + " ק״ג" : "—"}</td>
      <td>${(e.restTime ?? e.rest) ? esc(String(e.restTime ?? e.rest)) + " שנ׳" : "—"}</td>
    </tr>`).join("")}
  </table>
</div>`).join("")}
</body></html>`;
  const w = window.open("", "_blank");
  if (!w) {
    alert("הדפדפן חסם את חלון ה-PDF. אנא אפשר חלונות קופצים ונסה שוב.");
    return;
  }
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
}

export function WorkoutTab({ trainee }: { trainee: any }) {
  const { toast } = useToast();
  const [plan, setPlan] = useState(() => {
    // Check localStorage for a demo plan saved by the workout builder
    try {
      const stored = typeof window !== "undefined" && localStorage.getItem(`demo_plan_${trainee.id}`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return trainee.workoutPlans?.[0];
  });
  const [openSession, setOpenSession] = useState<string | null>(null);
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);

  const isDemo = trainee.id.startsWith("demo-");

  useEffect(() => {
    if (!isDemo) return;
    try {
      const stored = localStorage.getItem(`demo_workout_log_${trainee.id}`);
      if (stored) setWorkoutLogs(JSON.parse(stored));
    } catch {}
  }, [isDemo, trainee.id]);

  const saveToLocalStorage = (updatedPlan: any) => {
    try { localStorage.setItem(`demo_plan_${trainee.id}`, JSON.stringify(updatedPlan)); } catch {}
  };

  const updateExercise = (sessionId: string, exId: string, data: any) => {
    setPlan((prev: any) => {
      const updated = {
        ...prev,
        sessions: prev.sessions.map((s: any) => s.id === sessionId
          ? { ...s, exercises: s.exercises.map((e: any) => e.id === exId ? { ...e, ...data } : e) }
          : s
        )
      };
      if (isDemo) saveToLocalStorage(updated);
      return updated;
    });
    toast({ title: "✓ עודכן בהצלחה" });
  };

  const deleteExercise = async (sessionId: string, exId: string) => {
    if (isDemo) {
      setPlan((prev: any) => {
        const updated = {
          ...prev,
          sessions: prev.sessions.map((s: any) => s.id === sessionId
            ? { ...s, exercises: s.exercises.filter((e: any) => e.id !== exId) }
            : s
          )
        };
        saveToLocalStorage(updated);
        return updated;
      });
      toast({ title: "תרגיל הוסר" });
      return;
    }
    const res = await fetch(`/api/coach/workout/exercise/${exId}`, { method: "DELETE" });
    if (res.ok) {
      setPlan((prev: any) => ({
        ...prev,
        sessions: prev.sessions.map((s: any) => s.id === sessionId
          ? { ...s, exercises: s.exercises.filter((e: any) => e.id !== exId) }
          : s
        )
      }));
      toast({ title: "תרגיל הוסר" });
    }
  };

  if (!plan) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(168,255,62,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Dumbbell style={{ width: 28, height: 28, color: "#a8ff3e" }} />
        </div>
        <p style={{ color: "#52525B", marginBottom: 20 }}>אין תוכנית אימון פעילה</p>
        <Link href={`/trainees/${trainee.id}/workout/new`}>
          <button style={S.btnYellow}><Plus style={{ width: 14, height: 14 }} />בנה תוכנית אימון</button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }} dir="rtl">
      {/* Plan header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, padding: "16px 18px", background: "#161618", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18 }}>
        <div>
          <h2 style={{ color: "#fff", fontSize: 17, fontWeight: 800, margin: 0 }}>{plan.name}</h2>
          <span style={{ background: "rgba(168,255,62,0.1)", color: "#a8ff3e", fontSize: 11, fontWeight: 700, borderRadius: 999, padding: "2px 10px" }}>{TEMPLATE_LABELS[plan.template] ?? plan.template}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => exportWorkoutPDF(plan, trainee.name ?? "")} style={{ ...S.btnGhost, padding: "8px 14px" }}>
            <FileDown style={{ width: 13, height: 13 }} />PDF
          </button>
          <Link href={`/trainees/${trainee.id}/workout/new`}>
            <button style={S.btnGhost}><Plus style={{ width: 13, height: 13 }} />תוכנית חדשה</button>
          </Link>
        </div>
      </div>

      {plan.sessions.map((session: any, idx: number) => {
        const isOpen = openSession === session.id;
        return (
          <div key={session.id} style={S.card}>
            <button onClick={() => setOpenSession(isOpen ? null : session.id)} style={{
              width: "100%", padding: "14px 18px", background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 12
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#a8ff3e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#111", flexShrink: 0 }}>
                {idx + 1}
              </div>
              <div style={{ flex: 1, textAlign: "right" }}>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 }}>{session.name}</p>
                <p style={{ color: "#52525B", fontSize: 12, margin: 0 }}>{session.dayLabel} • {session.exercises.length} תרגילים</p>
              </div>
              {isOpen ? <ChevronUp style={{ width: 16, height: 16, color: "#a8ff3e" }} /> : <ChevronDown style={{ width: 16, height: 16, color: "#48484A" }} />}
            </button>

            {isOpen && (
              <div style={{ padding: "0 18px 16px" }}>
                <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 4 }} />
                {session.exercises.map((se: any) => (
                  <ExerciseRow key={se.id} se={se} traineeId={trainee.id}
                    onUpdate={(id, data) => updateExercise(session.id, id, data)}
                    onDelete={(id) => deleteExercise(session.id, id)}
                  />
                ))}
                {session.exercises.length === 0 && <p style={{ color: "#52525B", fontSize: 13, padding: "12px 0", textAlign: "center" }}>אין תרגילים בסשן</p>}
              </div>
            )}
          </div>
        );
      })}

      {/* Demo workout log */}
      {isDemo && workoutLogs.length > 0 && (
        <div style={{ background: "#161618", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "16px 18px" }}>
          <p style={{ color: "#71717A", fontSize: 11, fontWeight: 700, marginBottom: 10 }}>אימונים שהושלמו לאחרונה</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {workoutLogs.slice(0, 5).map((log: any) => (
              <div key={log.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#1C1C1E", borderRadius: 10 }}>
                <div>
                  <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{log.sessionName || log.planName}</span>
                  <span style={{ color: "#52525B", fontSize: 11, marginRight: 8 }}>{log.exercisesCompleted}/{log.totalExercises} תרגילים · {log.totalSets} סטים</span>
                </div>
                <span style={{ color: "#48484A", fontSize: 11 }}>{new Date(log.date).toLocaleDateString("he-IL")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
