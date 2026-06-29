"use client";
import { useState } from "react";
import { ChevronDown, Target, AlertTriangle, Lightbulb, Dumbbell, BarChart2 } from "lucide-react";

const MUSCLE_COLOR: Record<string, { bg: string; color: string; border: string }> = {
  "חזה": { bg: "rgba(239,68,68,0.1)", color: "#F87171", border: "rgba(239,68,68,0.2)" },
  "גב": { bg: "rgba(59,130,246,0.1)", color: "#60A5FA", border: "rgba(59,130,246,0.2)" },
  "רגליים": { bg: "rgba(16,185,129,0.1)", color: "#10B981", border: "rgba(16,185,129,0.2)" },
  "כתפיים": { bg: "rgba(245,197,24,0.1)", color: "#F5C518", border: "rgba(245,197,24,0.2)" },
  "זרועות": { bg: "rgba(139,92,246,0.1)", color: "#A78BFA", border: "rgba(139,92,246,0.2)" },
  "בטן": { bg: "rgba(245,158,11,0.1)", color: "#F59E0B", border: "rgba(245,158,11,0.2)" },
};

const DIFF_COLOR: Record<string, string> = { "קל": "#10B981", "בינוני": "#F5C518", "קשה": "#F87171" };

export function ExerciseCard({ exercise }: { exercise: any }) {
  const [open, setOpen] = useState(false);
  const c = MUSCLE_COLOR[exercise.muscleGroup] ?? { bg: "rgba(255,255,255,0.05)", color: "#fff", border: "rgba(255,255,255,0.1)" };

  return (
    <div style={{ background: "#1C1C1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, overflow: "hidden", transition: "border-color 0.2s" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(245,197,24,0.2)") as any}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)") as any}>

      {/* Header */}
      <button onClick={() => setOpen(!open)} style={{ width: "100%", padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", textAlign: "right" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: c.bg, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Dumbbell style={{ width: 18, height: 18, color: c.color }} />
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{exercise.name}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, borderRadius: 999, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{exercise.muscleGroup}</span>
              {exercise.difficulty && (
                <span style={{ background: "rgba(255,255,255,0.05)", color: DIFF_COLOR[exercise.difficulty] ?? "#fff", borderRadius: 999, padding: "2px 8px", fontSize: 10, fontWeight: 600 }}>{exercise.difficulty}</span>
              )}
              {exercise.equipment && (
                <span style={{ background: "rgba(255,255,255,0.04)", color: "#52525B", borderRadius: 999, padding: "2px 8px", fontSize: 10 }}>{exercise.equipment}</span>
              )}
            </div>
          </div>
        </div>
        <ChevronDown style={{ width: 16, height: 16, color: "#52525B", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
      </button>

      {/* Expanded */}
      {open && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 18px" }} dir="rtl">
          {exercise.description && (
            <p style={{ color: "#8D8D93", fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{exercise.description}</p>
          )}

          {exercise.howTo && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Target style={{ width: 14, height: 14, color: "#F5C518" }} />
                <span style={{ color: "#F5C518", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>איך מבצעים</span>
              </div>
              <div style={{ background: "#242428", borderRadius: 12, padding: "12px 14px" }}>
                {exercise.howTo.split("\n").map((step: string, i: number) => (
                  <div key={i} style={{ color: "#D1D5DB", fontSize: 13, lineHeight: 1.7 }}>{step}</div>
                ))}
              </div>
            </div>
          )}

          {exercise.tips?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Lightbulb style={{ width: 14, height: 14, color: "#10B981" }} />
                <span style={{ color: "#10B981", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>דגשים חשובים</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {exercise.tips.map((tip: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(16,185,129,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <span style={{ color: "#10B981", fontSize: 9, fontWeight: 800 }}>✓</span>
                    </div>
                    <span style={{ color: "#A1A1AA", fontSize: 13, lineHeight: 1.5 }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {exercise.commonMistakes?.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <AlertTriangle style={{ width: 14, height: 14, color: "#F87171" }} />
                <span style={{ color: "#F87171", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>טעויות נפוצות</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {exercise.commonMistakes.map((m: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <span style={{ color: "#F87171", fontSize: 10, fontWeight: 800 }}>✕</span>
                    </div>
                    <span style={{ color: "#A1A1AA", fontSize: 13, lineHeight: 1.5 }}>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
