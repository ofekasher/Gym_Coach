"use client";
import { useState, useEffect } from "react";

const BG = "transparent";
const CARD = { background: "#161B22", borderRadius: 28, border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 8px 24px rgba(0,0,0,0.35)" };

const MEAL_ICONS: Record<string, string> = {
  "ארוחת בוקר": "☀️", "ארוחת צהריים": "🌤️", "ארוחת ערב": "🌙", "חטיף": "🍎",
};

// Real stock photos (Unsplash) by meal type
const MEAL_PHOTOS: Record<string, string> = {
  "ארוחת בוקר": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=200&q=65&auto=format&fit=crop",
  "ארוחת צהריים": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=65&auto=format&fit=crop",
  "ארוחת ערב": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&q=65&auto=format&fit=crop",
  "חטיף": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&q=65&auto=format&fit=crop",
};
function getMealPhoto(name: string): string {
  return MEAL_PHOTOS[name] ?? MEAL_PHOTOS["ארוחת צהריים"];
}

function DonutRing({ eaten, goal, color }: { eaten: number; goal: number; color: string }) {
  const pct = Math.min(eaten / Math.max(goal, 1), 1);
  const r = 56, cx = 72, cy = 72, stroke = 10;
  const circum = 2 * Math.PI * r;
  const dash = pct * circum;
  return (
    <svg width="144" height="144" viewBox="0 0 144 144">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke}/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={`${dash} ${circum}`}
        transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: "stroke-dasharray 0.6s ease" }}/>
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="22" fontWeight="800" fill="#fff">{eaten}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.4)">מתוך</text>
      <text x={cx} y={cy + 24} textAnchor="middle" fontSize="11" fontWeight="600" fill="rgba(255,255,255,0.55)">{goal} Kcal</text>
    </svg>
  );
}

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(value / Math.max(max, 1), 1) * 100;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>{value}g <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>/ {max}g</span></span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.08)" }}>
        <div style={{ height: "100%", borderRadius: 99, width: `${pct}%`, background: color, transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

const DEFAULT_MEALS = [
  { id: "1", name: "ארוחת בוקר", targetCalories: 500, foods: [{ name: "שיבולת שועל עם פירות", calories: 320, protein: 12, carbs: 55, fat: 6 }, { name: "ביצה מקושקשת", calories: 180, protein: 12, carbs: 2, fat: 12 }] },
  { id: "2", name: "ארוחת צהריים", targetCalories: 700, foods: [{ name: "חזה עוף ואורז", calories: 420, protein: 42, carbs: 48, fat: 8 }, { name: "סלט ירקות", calories: 120, protein: 3, carbs: 18, fat: 4 }, { name: "לחם מלא", calories: 160, protein: 5, carbs: 32, fat: 2 }] },
  { id: "3", name: "חטיף", targetCalories: 250, foods: [{ name: "קוטג׳ + פירות", calories: 250, protein: 18, carbs: 28, fat: 5 }] },
  { id: "4", name: "ארוחת ערב", targetCalories: 550, foods: [{ name: "סלמון צלוי", calories: 320, protein: 34, carbs: 0, fat: 18 }, { name: "בטטה אפויה", calories: 180, protein: 3, carbs: 40, fat: 1 }, { name: "ברוקולי מאודה", calories: 50, protein: 4, carbs: 8, fat: 1 }] },
];

export function NutritionClient({ nutritionPlan: propPlan }: { nutritionPlan: any }) {
  const [activeTab, setActiveTab] = useState<"today" | "plan">("today");
  const [waterGlasses, setWaterGlasses] = useState(3);
  const [loggedMeals, setLoggedMeals] = useState<Set<string>>(new Set());
  const [coachPlan, setCoachPlan] = useState<any>(null);

  // Read coach's plan from localStorage (saved when coach creates nutrition plan for demo-trainee-1)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("demo_nutrition_demo-trainee-1");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert coach plan format to display format
        const converted = {
          dailyCalories: parsed.calories ?? 2000,
          proteinGrams: parsed.protein ?? 150,
          carbsGrams: parsed.carbs ?? 200,
          fatGrams: parsed.fat ?? 55,
          meals: (parsed.meals ?? []).map((m: any) => ({
            id: m.id, name: m.name, time: m.time,
            targetCalories: m.foodItems?.reduce((s: number, f: any) => s + (f.calories ?? 0), 0) ?? 0,
            foods: (m.foodItems ?? []).map((f: any) => ({
              name: f.name, calories: f.calories ?? 0, protein: f.protein ?? 0, carbs: f.carbs ?? 0, fat: f.fat ?? 0,
            })),
          })),
        };
        setCoachPlan(converted);
      }
    } catch {}
  }, []);

  const activePlan = coachPlan ?? propPlan;
  const meals = activePlan?.meals ?? DEFAULT_MEALS;
  const targetCalories = activePlan?.dailyCalories ?? 2000;
  const targetProtein = activePlan?.proteinGrams ?? 160;
  const targetCarbs = activePlan?.carbsGrams ?? 200;
  const targetFat = activePlan?.fatGrams ?? 55;

  const loggedFoods = meals.filter((m: any) => loggedMeals.has(m.id)).flatMap((m: any) => m.foods ?? []);
  const eatenCalories = loggedFoods.reduce((s: number, f: any) => s + (f.calories ?? 0), 0);
  const eatenProtein = loggedFoods.reduce((s: number, f: any) => s + (f.protein ?? 0), 0);
  const eatenCarbs = loggedFoods.reduce((s: number, f: any) => s + (f.carbs ?? 0), 0);
  const eatenFat = loggedFoods.reduce((s: number, f: any) => s + (f.fat ?? 0), 0);

  return (
    <div style={{ background: BG, minHeight: "100vh", paddingBottom: 100 }} dir="rtl">
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px 0" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>תזונה</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>מעקב יומי</div>
          </div>
          <div style={{ padding: "6px 14px", borderRadius: 99, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#3B82F6" }}>
              {new Date().toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "#1A1A1F", borderRadius: 14, padding: 4, marginBottom: 20 }}>
          {(["today", "plan"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: "8px 0", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
              background: activeTab === tab ? "#3B82F6" : "transparent",
              color: activeTab === tab ? "#fff" : "rgba(255,255,255,0.35)",
              transition: "all 0.2s",
            }}>{tab === "today" ? "היום" : "תוכנית"}</button>
          ))}
        </div>

        {activeTab === "today" && (
          <>
            {/* Donut + macros */}
            <div style={{ ...CARD, padding: "20px 20px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <DonutRing eaten={eatenCalories} goal={targetCalories} color="#F59E0B"/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>מאקרו יומי</div>
                  <MacroBar label="חלבון" value={eatenProtein} max={targetProtein} color="#3B82F6"/>
                  <MacroBar label="פחמימות" value={eatenCarbs} max={targetCarbs} color="#3B82F6"/>
                  <MacroBar label="שומן" value={eatenFat} max={targetFat} color="#F97316"/>
                </div>
              </div>
            </div>

            {/* 4 quick stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
              {[
                { label: "קלוריות", value: `${eatenCalories}`, sub: `/${targetCalories}`, color: "#F59E0B" },
                { label: "חלבון", value: `${eatenProtein}g`, sub: `/${targetProtein}g`, color: "#3B82F6" },
                { label: "פחמי׳", value: `${eatenCarbs}g`, sub: `/${targetCarbs}g`, color: "#3B82F6" },
                { label: "שומן", value: `${eatenFat}g`, sub: `/${targetFat}g`, color: "#F97316" },
              ].map((s) => (
                <div key={s.label} style={{ ...CARD, padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{s.sub}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 1, fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Water tracker */}
            <div style={{ ...CARD, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>💧 מים היום</span>
                <span style={{ fontSize: 12, color: "#60A5FA", fontWeight: 700 }}>{waterGlasses}/8 כוסות</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {Array.from({ length: 8 }, (_, i) => (
                  <button key={i} onClick={() => setWaterGlasses(i < waterGlasses ? i : i + 1)} style={{
                    flex: 1, height: 28, borderRadius: 8, border: "none", cursor: "pointer",
                    background: i < waterGlasses ? "#60A5FA" : "rgba(255,255,255,0.06)",
                    transition: "background 0.2s",
                  }} />
                ))}
              </div>
            </div>

            {/* Meals list */}
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 12 }}>ארוחות</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {meals.map((meal: any) => {
                const done = loggedMeals.has(meal.id);
                const mealCals = (meal.foods ?? []).reduce((s: number, f: any) => s + (f.calories ?? 0), 0);
                return (
                  <div key={meal.id} style={{
                    ...CARD, padding: "14px 16px",
                    border: done ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.05)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: done ? 0 : 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 14, position: "relative", flexShrink: 0,
                          backgroundImage: `url(${getMealPhoto(meal.name)})`, backgroundSize: "cover", backgroundPosition: "center",
                          opacity: done ? 0.5 : 1, border: done ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.08)",
                        }}>
                          <span style={{
                            position: "absolute", bottom: -4, left: -4, fontSize: 14, width: 20, height: 20,
                            background: "#161B22", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}>{MEAL_ICONS[meal.name] ?? "🍽️"}</span>
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: done ? "#10B981" : "#fff" }}>{meal.name}</div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{mealCals} קלוריות</div>
                        </div>
                      </div>
                      <button onClick={() => {
                        const next = new Set(loggedMeals);
                        done ? next.delete(meal.id) : next.add(meal.id);
                        setLoggedMeals(next);
                      }} style={{
                        width: 30, height: 30, borderRadius: "50%", border: "none", cursor: "pointer",
                        background: done ? "#10B981" : "rgba(255,255,255,0.07)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s",
                      }}>
                        {done
                          ? <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                          : <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        }
                      </button>
                    </div>
                    {!done && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {(meal.foods ?? []).map((food: any, fi: number) => (
                          <div key={fi} style={{ display: "flex", justifyContent: "space-between", paddingRight: 48 }}>
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{food.name}</span>
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{food.calories} Kcal</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add meal */}
            <button style={{
              width: "100%", marginTop: 14, padding: "14px 0", borderRadius: 16,
              border: "2px dashed rgba(59,130,246,0.3)", background: "transparent",
              color: "#3B82F6", fontSize: 13, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <svg width="16" height="16" fill="none" stroke="#3B82F6" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              הוסף ארוחה
            </button>
          </>
        )}

        {activeTab === "plan" && (
          <div style={{ ...CARD, padding: "16px" }}>
            {activePlan ? (
              <>
                {activePlan.name && <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{activePlan.name}</div>}
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
                  {activePlan.dailyCalories} Kcal ביום · {activePlan.proteinGrams}g חלבון
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "קלוריות יומי", value: `${activePlan.dailyCalories} Kcal`, color: "#F59E0B" },
                    { label: "חלבון", value: `${activePlan.proteinGrams}g`, color: "#3B82F6" },
                    { label: "פחמימות", value: `${activePlan.carbsGrams}g`, color: "#3B82F6" },
                    { label: "שומן", value: `${activePlan.fatGrams}g`, color: "#F97316" },
                  ].map((s) => (
                    <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px 14px" }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {activePlan.notes && (
                  <div style={{ marginTop: 14, background: "rgba(59,130,246,0.08)", borderRadius: 12, padding: "12px 14px", fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
                    {activePlan.notes}
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🥗</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>המאמן שלך לא הגדיר תוכנית תזונה עדיין</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
