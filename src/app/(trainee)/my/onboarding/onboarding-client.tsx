"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Check, Dumbbell, Target, User, Zap, Hand, Scale, Calendar, Rocket, Flame, Heart, PersonStanding, Sprout, Leaf, TreePine, Bot, BarChart3 } from "lucide-react";

const STEPS = [
  { id: "welcome", title: "ברוך הבא!", icon: Hand },
  { id: "goal", title: "מה המטרה שלך?", icon: Target },
  { id: "experience", title: "רמת ניסיון", icon: Dumbbell },
  { id: "body", title: "פרטי גוף", icon: Scale },
  { id: "days", title: "כמה ימים בשבוע?", icon: Calendar },
  { id: "done", title: "הכל מוכן!", icon: Rocket },
];

const GOALS = [
  { id: "muscle_gain", label: "עלייה במסה", icon: Dumbbell, desc: "בניית שריר ועלייה בכוח" },
  { id: "weight_loss", label: "ירידה במשקל", icon: Flame, desc: "שריפת שומן ועיצוב הגוף" },
  { id: "strength", label: "עוצמה", icon: Zap, desc: "הגדלת הכוח המקסימלי" },
  { id: "health", label: "בריאות כללית", icon: Heart, desc: "שיפור הכושר ואיכות החיים" },
  { id: "endurance", label: "סיבולת", icon: PersonStanding, desc: "שיפור הסיבולת הלבבית" },
];

const EXPERIENCE_LEVELS = [
  { id: "beginner", label: "מתחיל", desc: "פחות משנה", icon: Sprout },
  { id: "intermediate", label: "בינוני", desc: "1-3 שנים", icon: Leaf },
  { id: "advanced", label: "מתקדם", desc: "יותר מ-3 שנים", icon: TreePine },
];

export function OnboardingClient() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    goals: [] as string[],
    experience: "",
    height: "",
    weight: "",
    targetWeight: "",
    daysPerWeek: 3,
    gender: "" as "male" | "female" | "",
  });

  const current = STEPS[step];
  const progress = (step / (STEPS.length - 1)) * 100;

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const finish = async () => {
    setSaving(true);
    // Demo mode: just save to localStorage and redirect
    try {
      localStorage.setItem("trainee_onboarding", JSON.stringify({ ...form, completedAt: new Date().toISOString() }));
    } catch {}
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    router.push("/my/dashboard");
  };

  const C = { background: "#12160f", borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)" };

  return (
    <div style={{ minHeight: "100vh", background: "#0E0E10", display: "flex", flexDirection: "column" }} dir="rtl">
      {/* Progress bar */}
      <div style={{ height: 3, background: "rgba(255,255,255,0.06)" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#2563EB,#93C5FD)", transition: "width 0.4s ease", borderRadius: 2 }} />
      </div>

      {/* Step counter */}
      {step > 0 && step < STEPS.length - 1 && (
        <div style={{ padding: "14px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={back} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
            <ChevronRight style={{ width: 16, height: 16 }} /> חזרה
          </button>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>שלב {step} מתוך {STEPS.length - 2}</span>
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "20px 20px 100px", maxWidth: 460, margin: "0 auto", width: "100%" }}>

        {/* Step icon + title */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><current.icon size={44} color="#fff" /></div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>{current.title}</div>
          {step === 0 && <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>נשאל כמה שאלות קצרות כדי להתאים לך חוויה אישית</p>}
        </div>

        {/* ── WELCOME ── */}
        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { icon: Target, title: "תוכנית אישית", desc: "מאמן שיתאים לך תוכנית ייחודית" },
              { icon: BarChart3, title: "מעקב התקדמות", desc: "רואה שיאים אישיים וגרפים בזמן אמת" },
              { icon: Bot, title: "AI לכושר", desc: "עונה על שאלות ועוזר לך בכל שלב" },
            ].map(f => (
              <div key={f.title} style={{ ...C, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ flexShrink: 0 }}><f.icon size={22} color="#fff" /></div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── GOAL ── */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {GOALS.map(g => {
              const selected = form.goals.includes(g.id);
              return (
                <button key={g.id} onClick={() => {
                  setForm(f => ({
                    ...f,
                    goals: selected ? f.goals.filter(x => x !== g.id) : [...f.goals, g.id]
                  }));
                }} style={{
                  background: selected ? "rgba(124,58,237,0.15)" : "#12160f",
                  border: `1px solid ${selected ? "#2563EB" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 16,
                  padding: "14px 16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  textAlign: "right",
                  transition: "all 0.15s",
                }}>
                  <g.icon size={22} color="#fff" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{g.label}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{g.desc}</div>
                  </div>
                  {selected && <Check style={{ width: 18, height: 18, color: "#93C5FD", flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        )}

        {/* ── EXPERIENCE ── */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {EXPERIENCE_LEVELS.map(e => {
              const selected = form.experience === e.id;
              return (
                <button key={e.id} onClick={() => setForm(f => ({ ...f, experience: e.id }))} style={{
                  background: selected ? "rgba(124,58,237,0.15)" : "#12160f",
                  border: `1px solid ${selected ? "#2563EB" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 16,
                  padding: "18px 20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  textAlign: "right",
                  transition: "all 0.15s",
                }}>
                  <e.icon size={28} color="#fff" />
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{e.label}</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{e.desc}</div>
                  </div>
                  {selected && <Check style={{ width: 20, height: 20, color: "#93C5FD", marginRight: "auto" }} />}
                </button>
              );
            })}
          </div>
        )}

        {/* ── BODY ── */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Gender */}
            <div>
              <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 8 }}>מין</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[{ id: "male", label: "זכר" }, { id: "female", label: "נקבה" }].map(g => (
                  <button key={g.id} onClick={() => setForm(f => ({ ...f, gender: g.id as any }))} style={{
                    flex: 1, padding: "12px", borderRadius: 12, cursor: "pointer",
                    background: form.gender === g.id ? "rgba(124,58,237,0.15)" : "#12160f",
                    border: `1px solid ${form.gender === g.id ? "#2563EB" : "rgba(255,255,255,0.07)"}`,
                    color: form.gender === g.id ? "#fff" : "rgba(255,255,255,0.5)",
                    fontWeight: form.gender === g.id ? 700 : 500,
                    fontSize: 14,
                    transition: "all 0.15s",
                  }}>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {[
              { field: "height", label: "גובה (ס״מ)", placeholder: "175" },
              { field: "weight", label: "משקל נוכחי (ק״ג)", placeholder: "75" },
              { field: "targetWeight", label: "משקל יעד (ק״ג)", placeholder: "70" },
            ].map(({ field, label, placeholder }) => (
              <div key={field}>
                <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 8 }}>{label}</label>
                <input
                  type="number"
                  value={(form as any)[field]}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  placeholder={placeholder}
                  style={{
                    width: "100%",
                    background: "#12160f",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14,
                    height: 50,
                    padding: "0 16px",
                    color: "#fff",
                    fontSize: 16,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── DAYS ── */}
        {step === 4 && (
          <div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textAlign: "center", marginBottom: 24 }}>כמה ימים בשבוע תוכל/י להתאמן?</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
              {[2, 3, 4, 5, 6].map(d => (
                <button key={d} onClick={() => setForm(f => ({ ...f, daysPerWeek: d }))} style={{
                  width: 64, height: 64, borderRadius: 18, cursor: "pointer",
                  background: form.daysPerWeek === d ? "linear-gradient(135deg,#2563EB,#93C5FD)" : "#12160f",
                  border: `1px solid ${form.daysPerWeek === d ? "#2563EB" : "rgba(255,255,255,0.08)"}`,
                  color: "#fff", fontSize: 22, fontWeight: 800,
                  boxShadow: form.daysPerWeek === d ? "0 4px 20px rgba(124,58,237,0.4)" : "none",
                  transition: "all 0.15s",
                }}>
                  {d}
                </button>
              ))}
            </div>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, textAlign: "center", marginTop: 16 }}>
              {form.daysPerWeek} ימים בשבוע
            </p>
          </div>
        )}

        {/* ── DONE ── */}
        {step === STEPS.length - 1 && (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
              {form.goals.length > 0
                ? `המטרה שלך: ${form.goals.map(g => GOALS.find(x => x.id === g)?.label).join(", ")}`
                : "הפרופיל שלך מוכן!"}
              <br />המאמן שלך יוכל עכשיו לבנות לך תוכנית אישית.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
              {[
                { label: "ניסיון", value: EXPERIENCE_LEVELS.find(e => e.id === form.experience)?.label ?? "לא צוין" },
                { label: "ימי אימון", value: `${form.daysPerWeek} ימים/שבוע` },
                { label: "גובה", value: form.height ? `${form.height} ס״מ` : "לא צוין" },
                { label: "משקל", value: form.weight ? `${form.weight} ק״ג` : "לא צוין" },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", background: "#12160f", borderRadius: 12 }}>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{label}</span>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ marginTop: 32 }}>
          {step < STEPS.length - 1 ? (
            <button onClick={next} style={{
              width: "100%",
              height: 54,
              background: "linear-gradient(135deg,#2563EB,#1E3A8A)",
              border: "none",
              borderRadius: 16,
              color: "#fff",
              fontWeight: 800,
              fontSize: 16,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 4px 24px rgba(124,58,237,0.4)",
            }}>
              {step === 0 ? "בואו נתחיל!" : "הבא"}
              <ChevronLeft style={{ width: 18, height: 18 }} />
            </button>
          ) : (
            <button onClick={finish} disabled={saving} style={{
              width: "100%",
              height: 54,
              background: saving ? "rgba(124,58,237,0.4)" : "linear-gradient(135deg,#2563EB,#1E3A8A)",
              border: "none",
              borderRadius: 16,
              color: "#fff",
              fontWeight: 800,
              fontSize: 16,
              cursor: saving ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 4px 24px rgba(124,58,237,0.4)",
            }}>
              {saving ? "שומר..." : "כניסה לאפליקציה 🚀"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
