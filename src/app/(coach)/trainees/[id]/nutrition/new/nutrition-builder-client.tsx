"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const PREFERENCES = [
  { value: "kosher", label: "כשר" },
  { value: "vegetarian", label: "צמחוני" },
  { value: "vegan", label: "טבעוני" },
  { value: "gluten-free", label: "ללא גלוטן" },
  { value: "lactose-free", label: "ללא לקטוז" },
];

type FoodItem = {
  name: string; quantity: number; unit: string; calories: number;
  protein: number; carbs: number; fat: number; category?: string;
};

type Meal = { name: string; time: string; foodItems: FoodItem[] };

export function NutritionBuilderClient({ trainee }: { trainee: any }) {
  const router = useRouter();
  const { toast } = useToast();
  const existing = trainee.nutritionPlans?.[0];

  const [macros, setMacros] = useState({
    calories: existing?.calories ?? 2000,
    protein: existing?.protein ?? 150,
    carbs: existing?.carbs ?? 200,
    fat: existing?.fat ?? 70,
  });
  const [preferences, setPreferences] = useState<string[]>(existing?.preferences ?? []);
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [meals, setMeals] = useState<Meal[]>(
    existing?.meals.map((m: any) => ({
      name: m.name,
      time: m.time ?? "",
      foodItems: m.foodItems,
    })) ?? [
      { name: "ארוחת בוקר", time: "08:00", foodItems: [] },
      { name: "ארוחת צהריים", time: "13:00", foodItems: [] },
      { name: "ארוחת ערב", time: "19:00", foodItems: [] },
    ]
  );
  const [saving, setSaving] = useState(false);

  const togglePref = (p: string) => {
    setPreferences((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  };

  const addMeal = () => setMeals([...meals, { name: `ארוחה ${meals.length + 1}`, time: "", foodItems: [] }]);

  const addFoodItem = (mealIdx: number) => {
    setMeals((prev) => {
      const next = [...prev];
      next[mealIdx].foodItems.push({ name: "", quantity: 100, unit: "גרם", calories: 0, protein: 0, carbs: 0, fat: 0 });
      return next;
    });
  };

  const updateFoodItem = (mealIdx: number, itemIdx: number, field: string, value: any) => {
    setMeals((prev) => {
      const next = [...prev];
      next[mealIdx].foodItems[itemIdx] = { ...next[mealIdx].foodItems[itemIdx], [field]: value };
      return next;
    });
  };

  const removeFoodItem = (mealIdx: number, itemIdx: number) => {
    setMeals((prev) => {
      const next = [...prev];
      next[mealIdx].foodItems = next[mealIdx].foodItems.filter((_, i) => i !== itemIdx);
      return next;
    });
  };

  const totalActual = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.foodItems.reduce((s, f) => s + (Number(f.calories) || 0), 0),
      protein: acc.protein + meal.foodItems.reduce((s, f) => s + (Number(f.protein) || 0), 0),
      carbs: acc.carbs + meal.foodItems.reduce((s, f) => s + (Number(f.carbs) || 0), 0),
      fat: acc.fat + meal.foodItems.reduce((s, f) => s + (Number(f.fat) || 0), 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const savePlan = async () => {
    setSaving(true);
    try {
      // Demo mode: save to localStorage
      if (trainee.id.startsWith("demo-")) {
        const demoPlan = {
          id: `demo-nutrition-${Date.now()}`,
          isActive: true,
          ...macros, preferences, notes,
          meals: meals.map((m, i) => ({
            id: `demo-meal-${i}`,
            name: m.name, time: m.time, order: i,
            foodItems: m.foodItems.map((f, j) => ({ id: `demo-food-${i}-${j}`, ...f })),
          })),
        };
        try { localStorage.setItem(`demo_nutrition_${trainee.id}`, JSON.stringify(demoPlan)); } catch {}
        toast({ title: "✓ תוכנית תזונה נשמרה!", description: "התוכנית תוצג בפרופיל המתאמן" });
        router.push(`/trainees/${trainee.id}`);
        return;
      }

      const res = await fetch("/api/nutrition/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ traineeId: trainee.id, ...macros, preferences, notes, meals }),
      });
      if (res.ok) {
        toast({ title: "✓ תוכנית תזונה נשמרה!" });
        router.push(`/trainees/${trainee.id}`);
      } else {
        toast({ variant: "destructive", title: "שגיאה בשמירה" });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">בניית תוכנית תזונה</h1>
            <p className="text-muted-foreground text-sm">עבור {trainee.name}</p>
          </div>
        </div>
        <Button onClick={savePlan} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          שמור תוכנית
        </Button>
      </div>

      {/* Macros */}
      <Card>
        <CardHeader><CardTitle>יעדי מאקרו</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { key: "calories", label: "קלוריות", unit: "קק״ל" },
              { key: "protein", label: "חלבון", unit: "גרם" },
              { key: "carbs", label: "פחמימות", unit: "גרם" },
              { key: "fat", label: "שומן", unit: "גרם" },
            ].map((m) => (
              <div key={m.key} className="space-y-1.5">
                <Label className="text-xs">{m.label} ({m.unit})</Label>
                <Input
                  type="number"
                  value={(macros as any)[m.key]}
                  onChange={(e) => setMacros({ ...macros, [m.key]: Number(e.target.value) })}
                />
              </div>
            ))}
          </div>

          {/* Live totals */}
          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            {[
              { label: "קלוריות", actual: Math.round(totalActual.calories), target: macros.calories, color: "text-[#a8ff3e]" },
              { label: "חלבון", actual: Math.round(totalActual.protein), target: macros.protein, color: "text-red-400" },
              { label: "פחמימות", actual: Math.round(totalActual.carbs), target: macros.carbs, color: "text-blue-400" },
              { label: "שומן", actual: Math.round(totalActual.fat), target: macros.fat, color: "text-green-400" },
            ].map((m) => (
              <div key={m.label} className="glass rounded-lg p-2">
                <p className={`text-lg font-bold ${m.color}`}>{m.actual}</p>
                <p className="text-xs text-muted-foreground">/{m.target}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <div className="mt-1 h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full gradient-primary rounded-full" style={{ width: `${Math.min((m.actual / m.target) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader><CardTitle>העדפות תזונה</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PREFERENCES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => togglePref(p.value)}
                className={`px-4 py-2 rounded-full text-sm border transition-all ${preferences.includes(p.value) ? "gradient-primary text-white border-transparent" : "border-border text-muted-foreground hover:border-primary/50"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Meals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">ארוחות</h2>
          <Button variant="outline" size="sm" onClick={addMeal} className="gap-1.5">
            <Plus className="w-4 h-4" />הוסף ארוחה
          </Button>
        </div>

        {meals.map((meal, mealIdx) => (
          <Card key={mealIdx}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Input
                  value={meal.name}
                  onChange={(e) => {
                    const next = [...meals];
                    next[mealIdx].name = e.target.value;
                    setMeals(next);
                  }}
                  className="font-semibold"
                  placeholder="שם הארוחה"
                />
                <Input
                  value={meal.time}
                  onChange={(e) => {
                    const next = [...meals];
                    next[mealIdx].time = e.target.value;
                    setMeals(next);
                  }}
                  className="w-28"
                  placeholder="שעה"
                  type="time"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {meal.foodItems.map((item, itemIdx) => (
                <div key={itemIdx} className="glass rounded-xl p-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                    <div className="sm:col-span-2">
                      <Input
                        value={item.name}
                        onChange={(e) => updateFoodItem(mealIdx, itemIdx, "name", e.target.value)}
                        placeholder="שם המזון"
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="flex gap-1">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateFoodItem(mealIdx, itemIdx, "quantity", Number(e.target.value))}
                        className="h-9 text-sm"
                        placeholder="כמות"
                      />
                      <select
                        value={item.unit}
                        onChange={(e) => updateFoodItem(mealIdx, itemIdx, "unit", e.target.value)}
                        className="h-9 rounded-lg border border-border bg-secondary/50 px-2 text-xs focus:outline-none"
                      >
                        <option>גרם</option><option>מ״ל</option><option>יחידה</option><option>כף</option><option>כוס</option>
                      </select>
                    </div>
                    <button
                      onClick={() => removeFoodItem(mealIdx, itemIdx)}
                      className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors mr-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { field: "calories", label: "קק״ל", color: "text-[#a8ff3e]" },
                      { field: "protein", label: "חלבון ג׳", color: "text-red-400" },
                      { field: "carbs", label: "פחמי׳ ג׳", color: "text-blue-400" },
                      { field: "fat", label: "שומן ג׳", color: "text-green-400" },
                    ].map((f) => (
                      <div key={f.field}>
                        <Label className={`text-xs ${f.color}`}>{f.label}</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={(item as any)[f.field] || ""}
                          onChange={(e) => updateFoodItem(mealIdx, itemIdx, f.field, Number(e.target.value))}
                          className="h-8 text-xs mt-0.5"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={() => addFoodItem(mealIdx)}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-border hover:border-primary/30 text-sm text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                הוסף פריט
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Notes */}
      <Card>
        <CardHeader><CardTitle>הערות</CardTitle></CardHeader>
        <CardContent>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="flex min-h-20 w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            placeholder="הנחיות, הסברים..."
          />
        </CardContent>
      </Card>

      <Button onClick={savePlan} disabled={saving} size="lg" className="w-full gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        שמור תוכנית תזונה
      </Button>
    </div>
  );
}
