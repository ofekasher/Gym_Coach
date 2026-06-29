"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, Edit2, User, Scale, Activity, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GOALS = [
  { value: "weight_loss", label: "ירידה במשקל" },
  { value: "muscle_gain", label: "בניית שריר" },
  { value: "endurance", label: "סיבולת" },
  { value: "strength", label: "כוח" },
  { value: "flexibility", label: "גמישות" },
  { value: "health", label: "בריאות כללית" },
];

const EXPERIENCE = [
  { value: "beginner", label: "מתחיל/ה" },
  { value: "intermediate", label: "בינוני/ת" },
  { value: "advanced", label: "מתקדם/ת" },
];

const schema = z.object({
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  height: z.union([z.number(), z.string()]).optional().transform((v) => (v === "" || v === undefined ? undefined : Number(v))),
  startingWeight: z.union([z.number(), z.string()]).optional().transform((v) => (v === "" || v === undefined ? undefined : Number(v))),
  currentWeight: z.union([z.number(), z.string()]).optional().transform((v) => (v === "" || v === undefined ? undefined : Number(v))),
  goals: z.array(z.string()),
  injuries: z.string().optional(),
  medicalConditions: z.string().optional(),
  limitations: z.string().optional(),
  medications: z.string().optional(),
  experience: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = {
  phone?: string; dateOfBirth?: string; gender?: string;
  height?: number; startingWeight?: number; currentWeight?: number;
  goals: string[]; injuries?: string; medicalConditions?: string;
  limitations?: string; medications?: string; experience?: string; notes?: string;
};

const S = {
  card: { background: "#161618", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "18px 20px", marginBottom: 14 },
  input: { background: "#1C1C1E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 14, padding: "11px 14px", outline: "none", width: "100%", boxSizing: "border-box" as const, transition: "border-color 0.15s" },
  label: { color: "#48484A", fontSize: 11, fontWeight: 700 as const, textTransform: "uppercase" as const, letterSpacing: "0.05em", display: "block" as const, marginBottom: 5 },
  textarea: { background: "#1C1C1E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 14, padding: "11px 14px", outline: "none", width: "100%", boxSizing: "border-box" as const, resize: "none" as const, minHeight: 80, fontFamily: "inherit" },
  sectionTitle: { color: "#fff", fontSize: 14, fontWeight: 800, margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 },
};

export function ProfileTab({ trainee }: { trainee: any }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const profile = trainee.traineeProfile;

  const { register, handleSubmit, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      phone: profile?.phone ?? "",
      dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().slice(0, 10) : "",
      gender: profile?.gender ?? "",
      height: profile?.height ?? undefined,
      startingWeight: profile?.startingWeight ?? undefined,
      currentWeight: profile?.currentWeight ?? undefined,
      goals: profile?.goals ?? [],
      injuries: profile?.injuries ?? "",
      medicalConditions: profile?.medicalConditions ?? "",
      limitations: profile?.limitations ?? "",
      medications: profile?.medications ?? "",
      experience: profile?.experience ?? "",
      notes: profile?.notes ?? "",
    },
  });

  const selectedGoals = watch("goals");

  const toggleGoal = (value: string) => {
    const current = selectedGoals ?? [];
    setValue("goals", current.includes(value) ? current.filter((g) => g !== value) : [...current, value]);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/trainees/${trainee.id}/profile`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      if (res.ok) toast({ title: "✓ הפרופיל עודכן בהצלחה" });
      else toast({ variant: "destructive", title: "שגיאה בשמירת הפרופיל" });
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} dir="rtl">
      {/* Personal */}
      <div style={S.card}>
        <h3 style={S.sectionTitle}><User style={{ width: 16, height: 16, color: "#F5C518" }} />פרטים אישיים</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "טלפון", name: "phone", type: "tel", placeholder: "050-0000000" },
            { label: "תאריך לידה", name: "dateOfBirth", type: "date", placeholder: "" },
          ].map((f) => (
            <div key={f.name}>
              <label style={S.label}>{f.label}</label>
              <input type={f.type} style={S.input} placeholder={f.placeholder} {...register(f.name as any)} />
            </div>
          ))}
          <div>
            <label style={S.label}>מגדר</label>
            <select style={{ ...S.input, cursor: "pointer" }} {...register("gender")}>
              <option value="">בחר/י</option>
              <option value="male">זכר</option>
              <option value="female">נקבה</option>
              <option value="other">אחר</option>
            </select>
          </div>
          <div>
            <label style={S.label}>{'גובה (ס"מ)'}</label>
            <input type="number" style={S.input} placeholder="170" {...register("height")} />
          </div>
        </div>
      </div>

      {/* Weight */}
      <div style={S.card}>
        <h3 style={S.sectionTitle}><Scale style={{ width: 16, height: 16, color: "#60A5FA" }} />משקל</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={S.label}>{'משקל התחלתי (ק"ג)'}</label>
            <input type="number" step="0.1" style={S.input} placeholder="75" {...register("startingWeight")} />
          </div>
          <div>
            <label style={S.label}>{'משקל נוכחי (ק"ג)'}</label>
            <input type="number" step="0.1" style={S.input} placeholder="72" {...register("currentWeight")} />
          </div>
        </div>
      </div>

      {/* Goals */}
      <div style={S.card}>
        <h3 style={S.sectionTitle}><Activity style={{ width: 16, height: 16, color: "#34D399" }} />מטרות ורמת ניסיון</h3>
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 14 }}>
          {GOALS.map((g) => (
            <button key={g.value} type="button" onClick={() => toggleGoal(g.value)} style={{
              padding: "7px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
              background: selectedGoals?.includes(g.value) ? "#F5C518" : "rgba(255,255,255,0.05)",
              color: selectedGoals?.includes(g.value) ? "#111" : "#71717A",
              border: `1px solid ${selectedGoals?.includes(g.value) ? "#F5C518" : "rgba(255,255,255,0.08)"}`,
            }}>{g.label}</button>
          ))}
        </div>
        <label style={S.label}>רמת ניסיון</label>
        <div style={{ display: "flex", gap: 6 }}>
          {EXPERIENCE.map((e) => (
            <button key={e.value} type="button" onClick={() => setValue("experience", e.value)} style={{
              flex: 1, padding: "8px 0", borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
              background: watch("experience") === e.value ? "#F5C518" : "rgba(255,255,255,0.05)",
              color: watch("experience") === e.value ? "#111" : "#71717A",
              border: `1px solid ${watch("experience") === e.value ? "#F5C518" : "rgba(255,255,255,0.08)"}`,
            }}>{e.label}</button>
          ))}
        </div>
      </div>

      {/* Medical */}
      <div style={S.card}>
        <h3 style={S.sectionTitle}><Heart style={{ width: 16, height: 16, color: "#F87171" }} />מידע רפואי</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "פציעות קיימות", name: "injuries", ph: "פציעות אם קיימות..." },
            { label: "מצבים רפואיים", name: "medicalConditions", ph: "מחלות רקע, מצבים כרוניים..." },
            { label: "מגבלות", name: "limitations", ph: "הגבלות תנועה, כאבים..." },
          ].map((f) => (
            <div key={f.name}>
              <label style={S.label}>{f.label}</label>
              <textarea style={S.textarea} placeholder={f.ph} {...register(f.name as any)} />
            </div>
          ))}
          <div>
            <label style={S.label}>תרופות</label>
            <input style={S.input} placeholder="תרופות שנוטל/ת..." {...register("medications")} />
          </div>
        </div>
      </div>

      {/* Coach notes */}
      <div style={S.card}>
        <h3 style={S.sectionTitle}><Edit2 style={{ width: 16, height: 16, color: "#A78BFA" }} />הערות מאמן (פרטי)</h3>
        <textarea style={{ ...S.textarea, minHeight: 100 }} placeholder="הערות פרטיות של המאמן..." {...register("notes")} />
      </div>

      <button type="submit" disabled={saving} style={{
        background: "#F5C518", color: "#111", border: "none", borderRadius: 999, padding: "13px 28px",
        fontWeight: 900, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
        boxShadow: "0 4px 20px rgba(245,197,24,0.3)", transition: "transform 0.15s",
      }}>
        {saving ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : <Save style={{ width: 16, height: 16 }} />}
        שמור שינויים
      </button>
    </form>
  );
}
