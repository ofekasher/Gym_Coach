"use client";
import { useState, useEffect } from "react";

const GREEN = "#a8ff3e";
const GROCERY_PHOTO = "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800&q=70&auto=format&fit=crop";

const MEAL_ICONS: Record<string, string> = {
  "ארוחת בוקר": "☀️", "ארוחת צהריים": "☁️", "ארוחת ערב": "🌙", "חטיף": "🍎",
};

const MEAL_PHOTOS: Record<string, string> = {
  "ארוחת בוקר": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=200&q=65&auto=format&fit=crop",
  "ארוחת צהריים": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=65&auto=format&fit=crop",
  "ארוחת ערב": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&q=65&auto=format&fit=crop",
  "חטיף": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&q=65&auto=format&fit=crop",
};
function getMealPhoto(name: string): string {
  return MEAL_PHOTOS[name] ?? MEAL_PHOTOS["ארוחת צהריים"];
}

const DEFAULT_MEALS = [
  { id: "1", name: "ארוחת בוקר", foods: [{ name: "2 ביצים קשות" }, { name: "מלפפון" }, { name: "2 פרוסות לחם קל" }, { name: "חצי גביע קוטג׳ 5%" }] },
  { id: "2", name: "ארוחת צהריים", foods: [{ name: "150 גרם חזה עוף" }, { name: "אורז מלא 60 גרם יבש" }, { name: "סלט ירקות" }] },
  { id: "3", name: "ארוחת ערב", foods: [{ name: "200 גרם דג סלמון" }, { name: "בטטה אפויה" }, { name: "ברוקולי מאודה" }] },
];

export function NutritionClient({ nutritionPlan: propPlan }: { nutritionPlan: any }) {
  const [coachPlan, setCoachPlan] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("demo_nutrition_demo-trainee-1");
      if (stored) {
        const parsed = JSON.parse(stored);
        setCoachPlan({
          dailyCalories: parsed.calories ?? 2000,
          proteinGrams: parsed.protein ?? 153,
          carbsGrams: parsed.carbs ?? 200,
          fatGrams: parsed.fat ?? 62,
          meals: (parsed.meals ?? []).map((m: any) => ({
            id: m.id, name: m.name,
            foods: (m.foodItems ?? []).map((f: any) => ({ name: f.name })),
          })),
        });
      }
    } catch {}
  }, []);

  const activePlan = coachPlan ?? propPlan;
  const meals = activePlan?.meals?.length ? activePlan.meals : DEFAULT_MEALS;
  const calories = activePlan?.dailyCalories ?? 2000;
  const protein = activePlan?.proteinGrams ?? 153;
  const carbs = activePlan?.carbsGrams ?? 200;
  const fat = activePlan?.fatGrams ?? 62;

  return (
    <div style={{ background: "#12121f", minHeight: "100vh", paddingBottom: 100 }} dir="rtl">
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px 0" }}>

        {/* Section 1 — grocery hero card */}
        <div style={{
          position: "relative", height: 192, borderRadius: 20, overflow: "hidden", marginBottom: 24,
          backgroundImage: `url(${GROCERY_PHOTO})`, backgroundSize: "cover", backgroundPosition: "center",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <div style={{ fontSize: 44, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{calories}</div>
            <div style={{ fontSize: 13, color: GREEN, fontWeight: 700 }}>קלוריות</div>

            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14 }}>
              {[
                { label: "שומן", value: fat },
                { label: "פחמימה", value: carbs },
                { label: "חלבון", value: protein },
              ].map((m, i) => (
                <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  {i > 0 && <div style={{ width: 1, height: 26, background: "rgba(255,255,255,0.2)" }} />}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{m.value}</div>
                    <div style={{ fontSize: 10, color: GREEN, marginTop: 2 }}>{m.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2 — meal sections */}
        {meals.map((meal: any) => (
          <div key={meal.id} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{meal.name}</span>
              <span style={{ fontSize: 16 }}>{MEAL_ICONS[meal.name] ?? "🍽️"}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {(meal.foods ?? []).map((food: any, fi: number) => (
                <div key={fi} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 12, flexShrink: 0, position: "relative",
                    backgroundImage: `url(${getMealPhoto(meal.name)})`, backgroundSize: "cover", backgroundPosition: "center",
                  }}>
                    <span style={{
                      position: "absolute", top: -4, right: -4, width: 20, height: 20, borderRadius: "50%",
                      background: GREEN, color: "#0a0a0a", fontSize: 13, fontWeight: 800,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>+</span>
                  </div>

                  <button style={{
                    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                    background: "#1c1c2e", border: "1px solid rgba(255,255,255,0.1)",
                    color: GREEN, fontSize: 15, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>⇄</button>

                  <span style={{ fontSize: 14, color: "#fff", flex: 1, textAlign: "right", marginRight: 12 }}>{food.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
