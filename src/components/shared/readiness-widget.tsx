"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Moon, Battery, Dumbbell, CheckCircle2, X, Zap } from "lucide-react";

interface ReadinessData {
  sleep: number;
  energy: number;
  soreness: number;
  date: string;
}

function getRecommendation(score: number) {
  if (score >= 8) return { label: "אימון מלא 💪", color: "#10B981", bg: "rgba(16,185,129,0.1)", desc: "גוף מוכן 100% — תת הכל היום!" };
  if (score >= 6) return { label: "אימון רגיל", color: "#8B5CF6", bg: "rgba(139,92,246,0.1)", desc: "מצב טוב. אפשר להתאמן כרגיל." };
  if (score >= 4) return { label: "אימון קל 🌿", color: "#F59E0B", bg: "rgba(245,158,11,0.1)", desc: "הפחת עצימות ב-20%. תן לגוף להחלים." };
  return { label: "מנוחה פעילה", color: "#EF4444", bg: "rgba(239,68,68,0.1)", desc: "גוף עייף — הליכה/מתיחות בלבד." };
}

const FACTORS = [
  { key: "sleep" as const, label: "שינה", icon: Moon, question: "כמה ישנת?", low: "פחות מ-5 שעות", high: "יותר מ-8 שעות" },
  { key: "energy" as const, label: "אנרגיה", icon: Battery, question: "רמת האנרגיה שלך?", low: "עייף מאוד", high: "מלא אנרגיה" },
  { key: "soreness" as const, label: "שרירים", icon: Dumbbell, question: "כמה כואבים השרירים?", low: "כאב חמור", high: "אין כאב" },
];

export function ReadinessWidget() {
  const [state, setState] = useState<"collapsed" | "check" | "done">("collapsed");
  const [ratings, setRatings] = useState({ sleep: 0, energy: 0, soreness: 0 });
  const [saved, setSaved] = useState<ReadinessData | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("readiness_today");
      if (stored) {
        const data: ReadinessData = JSON.parse(stored);
        if (data.date === format(new Date(), "yyyy-MM-dd")) {
          setSaved(data);
          setState("done");
        }
      }
    } catch {}
  }, []);

  const score = ratings.sleep && ratings.energy && ratings.soreness
    ? Math.round((ratings.sleep + ratings.energy + ratings.soreness) / 3)
    : 0;

  const rec = getRecommendation(score);

  const save = () => {
    if (!score) return;
    const data: ReadinessData = { ...ratings, date: format(new Date(), "yyyy-MM-dd") };
    try { localStorage.setItem("readiness_today", JSON.stringify(data)); } catch {}
    setSaved(data);
    setState("done");
  };

  if (state === "done" && saved) {
    const s = Math.round((saved.sleep + saved.energy + saved.soreness) / 3);
    const r = getRecommendation(s);
    return (
      <div style={{ background: r.bg, border: `1px solid ${r.color}30`, borderRadius: 18, padding: "14px 16px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginBottom: 3 }}>מוכנות היום</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: r.color }}>{s}<span style={{ fontSize: 11 }}>/10</span></div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: r.color }}>{r.label}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{r.desc}</div>
              </div>
            </div>
          </div>
          <button onClick={() => { setState("collapsed"); setRatings({ sleep: 0, energy: 0, soreness: 0 }); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 4 }}>
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>
    );
  }

  if (state === "collapsed") {
    return (
      <button
        onClick={() => setState("check")}
        style={{
          width: "100%", background: "#1A1A1F", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 18, padding: "14px 16px", marginBottom: 14, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8, textAlign: "right",
        }}
      >
        <Zap style={{ width: 16, height: 16, color: "#60A5FA" }} />
        <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>בדיקת מוכנות יומית</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginRight: "auto" }}>30 שניות</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
    );
  }

  return (
    <div style={{ background: "#1A1A1F", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: "16px 16px", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Zap style={{ width: 16, height: 16, color: "#60A5FA" }} />
        <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>בדיקת מוכנות יומית</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginRight: "auto" }}>30 שניות</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {FACTORS.map(({ key, label, icon: Icon, low, high }) => (
          <div key={key}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Icon style={{ width: 13, height: 13, color: "#60A5FA" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{label}</span>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setRatings(r => ({ ...r, [key]: n }))} style={{
                  flex: 1, height: 32, borderRadius: 8, cursor: "pointer", border: "none",
                  background: ratings[key] >= n
                    ? `hsl(${(ratings[key] / 10) * 120}, 60%, 45%)`
                    : "rgba(255,255,255,0.06)",
                  transition: "all 0.1s",
                  fontSize: ratings[key] === n ? 11 : 0,
                  color: "#fff", fontWeight: 800,
                }}>
                  {ratings[key] === n ? n : ""}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{low}</span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{high}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Score preview */}
      {score > 0 && (
        <div style={{ marginTop: 14, padding: "10px 12px", background: rec.bg, borderRadius: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: rec.color }}>{score}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: rec.color }}>{rec.label}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{rec.desc}</div>
          </div>
        </div>
      )}

      <button
        onClick={save}
        disabled={!score}
        style={{
          marginTop: 12, width: "100%", height: 44, borderRadius: 12, cursor: score ? "pointer" : "not-allowed",
          background: score ? "linear-gradient(135deg,#2563EB,#1D4ED8)" : "rgba(255,255,255,0.05)",
          border: "none", color: score ? "#fff" : "rgba(255,255,255,0.3)",
          fontWeight: 700, fontSize: 14,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}
      >
        <CheckCircle2 style={{ width: 16, height: 16 }} />
        שמור בדיקת מוכנות
      </button>
    </div>
  );
}
