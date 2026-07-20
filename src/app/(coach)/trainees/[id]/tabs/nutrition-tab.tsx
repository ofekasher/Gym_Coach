"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, Apple, Edit2, Save, X, Loader2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConfirm } from "@/components/shared/confirm-dialog";

const PREF_LABELS: Record<string, string> = {
  kosher: "כשר", vegetarian: "צמחוני", vegan: "טבעוני",
  "gluten-free": "ללא גלוטן", "lactose-free": "ללא לקטוז",
};

const S = {
  input: { background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 13, padding: "7px 12px", outline: "none", width: "100%" },
  label: { color: "#48484A", fontSize: 10, fontWeight: 700 as const, textTransform: "uppercase" as const, letterSpacing: "0.05em", display: "block" as const, marginBottom: 4 },
  btnYellow: { background: "#b6ff4a", color: "#111", border: "none", borderRadius: 999, padding: "8px 18px", fontWeight: 800 as const, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
  btnGhost: { background: "rgba(255,255,255,0.05)", color: "#71717A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999, padding: "8px 16px", fontWeight: 700 as const, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
};

function FoodItemRow({ item, onUpdate, onDelete, isDemo }: { item: any; onUpdate: (id: string, data: any) => void; onDelete: (id: string) => void; isDemo?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: item.name, quantity: item.quantity, unit: item.unit, calories: item.calories, protein: item.protein ?? 0, carbs: item.carbs ?? 0, fat: item.fat ?? 0 });

  const save = async () => {
    setSaving(true);
    try {
      if (isDemo) {
        onUpdate(item.id, form);
        setEditing(false);
      } else {
        const res = await fetch(`/api/coach/nutrition/food/${item.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
        });
        if (res.ok) { onUpdate(item.id, form); setEditing(false); }
      }
    } finally { setSaving(false); }
  };

  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "10px 0" }}>
      {editing ? (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div><label style={S.label}>שם</label><input style={S.input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label style={S.label}>כמות</label><input type="number" style={S.input} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} /></div>
            <div><label style={S.label}>יחידה</label><input style={S.input} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 10 }}>
            {[{ key: "calories", label: "קק״ל" }, { key: "protein", label: "חלבון" }, { key: "carbs", label: "פחמימות" }, { key: "fat", label: "שומן" }].map((f) => (
              <div key={f.key}><label style={S.label}>{f.label}</label><input type="number" style={S.input} value={(form as any)[f.key]} onChange={(e) => setForm({ ...form, [f.key]: +e.target.value })} /></div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={save} disabled={saving} style={S.btnYellow}>
              {saving ? <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" /> : <Save style={{ width: 13, height: 13 }} />} שמור
            </button>
            <button onClick={() => setEditing(false)} style={S.btnGhost}><X style={{ width: 13, height: 13 }} /></button>
            <button aria-label={`הסר פריט: ${item.name}`} onClick={() => onDelete(item.id)} style={{ ...S.btnGhost, color: "#F87171", marginRight: "auto" }}><Trash2 style={{ width: 13, height: 13 }} /></button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <span style={{ color: "#E5E5E5", fontSize: 14 }}>{item.name}</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" as const }}>
            <span style={{ background: "rgba(255,255,255,0.06)", color: "#A1A1AA", borderRadius: 7, padding: "3px 8px", fontSize: 11 }}>{item.quantity} {item.unit}</span>
            <span style={{ background: "rgba(182,255,74,0.1)", color: "#b6ff4a", borderRadius: 7, padding: "3px 8px", fontSize: 11 }}>{item.calories} קק״ל</span>
            {item.protein > 0 && <span style={{ background: "rgba(248,113,113,0.1)", color: "#F87171", borderRadius: 7, padding: "3px 8px", fontSize: 11 }}>ח׳: {item.protein}ג</span>}
          </div>
          <button onClick={() => setEditing(true)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "5px 8px", cursor: "pointer" }}>
            <Edit2 style={{ width: 13, height: 13, color: "#71717A" }} />
          </button>
        </div>
      )}
    </div>
  );
}

export function NutritionTab({ trainee }: { trainee: any }) {
  const { toast } = useToast();
  const confirm = useConfirm();
  const isDemo = trainee.id.startsWith("demo-");
  const [plan, setPlan] = useState(() => {
    try {
      const stored = typeof window !== "undefined" && localStorage.getItem(`demo_nutrition_${trainee.id}`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return trainee.nutritionPlans?.[0] ?? null;
  });

  const saveDemoNutrition = (updatedPlan: any) => {
    try { localStorage.setItem(`demo_nutrition_${trainee.id}`, JSON.stringify(updatedPlan)); } catch {}
  };
  const [openMeal, setOpenMeal] = useState<string | null>(null);
  const [editMacros, setEditMacros] = useState(false);
  const [savingMacros, setSavingMacros] = useState(false);
  const [macros, setMacros] = useState({ calories: plan?.calories ?? 0, protein: plan?.protein ?? 0, carbs: plan?.carbs ?? 0, fat: plan?.fat ?? 0 });

  if (!plan) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(182,255,74,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Apple style={{ width: 28, height: 28, color: "#b6ff4a" }} />
        </div>
        <p style={{ color: "#52525B", marginBottom: 20 }}>אין תוכנית תזונה פעילה</p>
        <Link href={`/trainees/${trainee.id}/nutrition/new`}>
          <button style={S.btnYellow}><Plus style={{ width: 14, height: 14 }} />בנה תוכנית תזונה</button>
        </Link>
      </div>
    );
  }

  const saveMacros = async () => {
    setSavingMacros(true);
    try {
      if (isDemo) {
        setPlan((p: any) => { const u = { ...p, ...macros }; saveDemoNutrition(u); return u; });
        setEditMacros(false); toast({ title: "✓ יעדי מאקרו עודכנו" });
      } else {
        const res = await fetch(`/api/coach/nutrition/plan/${plan.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(macros)
        });
        if (res.ok) { setPlan((p: any) => ({ ...p, ...macros })); setEditMacros(false); toast({ title: "✓ יעדי מאקרו עודכנו" }); }
      }
    } finally { setSavingMacros(false); }
  };

  const updateFood = (mealId: string, foodId: string, data: any) => {
    setPlan((prev: any) => {
      const updated = {
        ...prev,
        meals: prev.meals.map((m: any) => m.id === mealId
          ? { ...m, foodItems: m.foodItems.map((f: any) => f.id === foodId ? { ...f, ...data } : f) }
          : m
        )
      };
      if (isDemo) saveDemoNutrition(updated);
      return updated;
    });
    toast({ title: "✓ פריט עודכן" });
  };

  const deleteFood = async (mealId: string, foodId: string, foodName: string) => {
    const ok = await confirm({ title: `להסיר את "${foodName}"?`, confirmLabel: "הסר", danger: true });
    if (!ok) return;
    if (isDemo) {
      setPlan((prev: any) => {
        const updated = {
          ...prev,
          meals: prev.meals.map((m: any) => m.id === mealId
            ? { ...m, foodItems: m.foodItems.filter((f: any) => f.id !== foodId) }
            : m
          )
        };
        saveDemoNutrition(updated);
        return updated;
      });
      toast({ title: "פריט הוסר" }); return;
    }
    const res = await fetch(`/api/coach/nutrition/food/${foodId}`, { method: "DELETE" });
    if (res.ok) {
      setPlan((prev: any) => ({
        ...prev,
        meals: prev.meals.map((m: any) => m.id === mealId
          ? { ...m, foodItems: m.foodItems.filter((f: any) => f.id !== foodId) }
          : m
        )
      }));
      toast({ title: "פריט הוסר" });
    } else {
      toast({ variant: "destructive", title: "הסרת הפריט נכשלה" });
    }
  };

  const MACRO_ITEMS = [
    { key: "calories", label: "קלוריות", color: "#b6ff4a", unit: "קק״ל" },
    { key: "protein", label: "חלבון", color: "#F87171", unit: "גרם" },
    { key: "carbs", label: "פחמימות", color: "#60A5FA", unit: "גרם" },
    { key: "fat", label: "שומן", color: "#34D399", unit: "גרם" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }} dir="rtl">
      {/* Macro targets card */}
      <div style={{ background: "#161618", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "16px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 15, margin: 0 }}>יעדי מאקרו</h3>
          <button onClick={() => setEditMacros(!editMacros)} style={S.btnGhost}>
            {editMacros ? <X style={{ width: 13, height: 13 }} /> : <Edit2 style={{ width: 13, height: 13 }} />}
            {editMacros ? "ביטול" : "עריכה"}
          </button>
        </div>
        {editMacros ? (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 12 }}>
              {MACRO_ITEMS.map((m) => (
                <div key={m.key}>
                  <label style={{ ...S.label, color: m.color }}>{m.label}</label>
                  <input type="number" style={S.input} value={(macros as any)[m.key]} onChange={(e) => setMacros({ ...macros, [m.key]: +e.target.value })} />
                </div>
              ))}
            </div>
            <button onClick={saveMacros} disabled={savingMacros} style={S.btnYellow}>
              {savingMacros ? <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" /> : <Save style={{ width: 13, height: 13 }} />} שמור יעדים
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {MACRO_ITEMS.map((m) => (
              <div key={m.key} style={{ textAlign: "center", padding: "10px 0", background: "rgba(255,255,255,0.03)", borderRadius: 12 }}>
                <div style={{ color: m.color, fontSize: 20, fontWeight: 900 }}>{(plan as any)[m.key]}</div>
                <div style={{ color: "#48484A", fontSize: 10, marginTop: 2 }}>{m.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preferences */}
      {plan.preferences?.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
          {plan.preferences.map((p: string) => (
            <span key={p} style={{ background: "rgba(182,255,74,0.08)", color: "#b6ff4a", border: "1px solid rgba(182,255,74,0.15)", borderRadius: 999, padding: "3px 12px", fontSize: 11, fontWeight: 700 }}>
              {PREF_LABELS[p] ?? p}
            </span>
          ))}
        </div>
      )}

      {/* Meals */}
      {plan.meals.map((meal: any) => {
        const mealCals = meal.foodItems.reduce((s: number, f: any) => s + f.calories, 0);
        const isOpen = openMeal === meal.id;
        return (
          <div key={meal.id} style={{ background: "#161618", border: `1px solid ${isOpen ? "rgba(182,255,74,0.15)" : "rgba(255,255,255,0.06)"}`, borderRadius: 18, overflow: "hidden" }}>
            <button onClick={() => setOpenMeal(isOpen ? null : meal.id)} style={{ width: "100%", padding: "14px 18px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, textAlign: "right" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{meal.name}</span>
                  {meal.time && <span style={{ color: "#48484A", fontSize: 11, background: "rgba(255,255,255,0.05)", borderRadius: 6, padding: "2px 8px" }}>{meal.time}</span>}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <span style={{ color: "#b6ff4a", fontSize: 12, fontWeight: 700 }}>{Math.round(mealCals)} קק״ל</span>
                  <span style={{ color: "#48484A", fontSize: 12 }}>{meal.foodItems.length} פריטים</span>
                </div>
              </div>
              {isOpen ? <ChevronUp style={{ width: 16, height: 16, color: "#b6ff4a" }} /> : <ChevronDown style={{ width: 16, height: 16, color: "#48484A" }} />}
            </button>

            {isOpen && (
              <div style={{ padding: "0 18px 16px" }}>
                <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 4 }} />
                {meal.foodItems.map((item: any) => (
                  <FoodItemRow key={item.id} item={item} isDemo={isDemo}
                    onUpdate={(id, data) => updateFood(meal.id, id, data)}
                    onDelete={(id) => deleteFood(meal.id, id, item.name)}
                  />
                ))}
                {meal.foodItems.length === 0 && <p style={{ color: "#52525B", fontSize: 13, textAlign: "center", padding: "12px 0" }}>אין פריטים</p>}
              </div>
            )}
          </div>
        );
      })}

      <Link href={`/trainees/${trainee.id}/nutrition/new`}>
        <button style={{ ...S.btnGhost, width: "100%", justifyContent: "center", padding: "12px 0" }}>
          <Plus style={{ width: 14, height: 14 }} />בנה תוכנית תזונה חדשה
        </button>
      </Link>
    </div>
  );
}
