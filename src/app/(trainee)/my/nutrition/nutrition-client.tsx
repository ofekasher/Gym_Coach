"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sunrise, Cloud, Moon, Apple, Utensils, Droplet, type LucideIcon } from "lucide-react";

const GREEN = "#a8ff3e";
const GROCERY_PHOTO = "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800&q=70&auto=format&fit=crop";
const WATER_GOAL = 2500;

const MEAL_ICONS: Record<string, LucideIcon> = {
  "ארוחת בוקר": Sunrise, "ארוחת צהריים": Cloud, "ארוחת ערב": Moon, "חטיף": Apple,
};

const MEAL_PHOTOS: Record<string, string> = {
  "ארוחת בוקר": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=200&q=65&auto=format&fit=crop",
  "ארוחת צהריים": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=65&auto=format&fit=crop",
  "ארוחת ערב": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&q=65&auto=format&fit=crop",
  "חטיף": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&q=65&auto=format&fit=crop",
};
function getMealPhoto(name: string): string {
  for (const key of Object.keys(MEAL_PHOTOS)) if (name?.includes(key)) return MEAL_PHOTOS[key];
  return MEAL_PHOTOS["ארוחת צהריים"];
}

const DEFAULT_MEALS = [
  { id: "1", name: "ארוחת בוקר", foodItems: [
    { id: "d1", name: "2 ביצים קשות", quantity: 100, calories: 155 },
    { id: "d2", name: "מלפפון", quantity: 100, calories: 15 },
    { id: "d3", name: "2 פרוסות לחם קל", quantity: 60, calories: 140 },
    { id: "d4", name: "חצי גביע קוטג׳ 5%", quantity: 125, calories: 130 },
  ] },
  { id: "2", name: "ארוחת צהריים", foodItems: [
    { id: "d5", name: "150 גרם חזה עוף", quantity: 150, calories: 248 },
    { id: "d6", name: "אורז מלא 60 גרם יבש", quantity: 60, calories: 216 },
    { id: "d7", name: "סלט ירקות", quantity: 150, calories: 45 },
  ] },
  { id: "3", name: "ארוחת ערב", foodItems: [
    { id: "d8", name: "200 גרם דג סלמון", quantity: 200, calories: 412 },
    { id: "d9", name: "בטטה אפויה", quantity: 200, calories: 172 },
    { id: "d10", name: "ברוקולי מאודה", quantity: 150, calories: 50 },
  ] },
];

export function NutritionClient({ nutritionPlan: propPlan }: { nutritionPlan: any }) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [actualGrams, setActualGrams] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  const [waterTotal, setWaterTotal] = useState(0);
  const [waterLoading, setWaterLoading] = useState(false);

  const [extraItems, setExtraItems] = useState<Record<string, any[]>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);
  const [activeMealForModal, setActiveMealForModal] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"manual" | "search" | "photo">("manual");
  const [manualForm, setManualForm] = useState({ foodName: "", grams: "", calories: "", protein: "", carbs: "", fat: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [savingManual, setSavingManual] = useState(false);

  useEffect(() => {
    // Pre-check items already logged today
    fetch("/api/trainee/nutrition-log")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.logs) return;
        const nextChecked: Record<string, boolean> = {};
        const nextGrams: Record<string, number> = {};
        for (const log of data.logs) {
          const key = `${log.mealName}::${log.foodName}`;
          nextChecked[key] = true;
          nextGrams[key] = log.actualGrams;
        }
        setCheckedItems((prev) => ({ ...nextChecked, ...prev }));
        setActualGrams((prev) => ({ ...nextGrams, ...prev }));
      })
      .catch((err) => console.error("Failed to load nutrition logs", err));

    fetch("/api/trainee/water-log")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.total != null) setWaterTotal(data.total); })
      .catch((err) => console.error("Failed to load water log", err));
  }, []);

  const activePlan = propPlan;
  const meals = activePlan?.meals?.length ? activePlan.meals : DEFAULT_MEALS;
  const targetCalories = activePlan?.calories ?? 2000;
  const targetProtein = activePlan?.protein ?? 153;
  const targetCarbs = activePlan?.carbs ?? 200;
  const targetFat = activePlan?.fat ?? 62;

  // Calories eaten so far: sum over checked items, scaled by actual vs. planned grams
  let eatenCalories = 0;
  for (const meal of meals) {
    const allFoods = [...(meal.foodItems ?? []), ...(extraItems[meal.name] ?? [])];
    for (const food of allFoods) {
      const key = `${meal.name}::${food.name}`;
      if (!checkedItems[key]) continue;
      const grams = actualGrams[key] ?? food.quantity ?? 0;
      const ratio = food.quantity ? grams / food.quantity : 1;
      eatenCalories += Math.round((food.calories ?? 0) * ratio);
    }
  }
  const remainingCalories = Math.max(0, targetCalories - eatenCalories);

  const toggleFood = async (meal: any, food: any) => {
    const key = `${meal.name}::${food.name}`;
    const nowChecked = !checkedItems[key];

    setCheckedItems((prev) => ({ ...prev, [key]: nowChecked }));
    if (nowChecked && actualGrams[key] == null) {
      setActualGrams((prev) => ({ ...prev, [key]: food.quantity ?? 0 }));
    }

    if (!nowChecked) return; // unchecking just removes locally, no DELETE route yet

    setIsLoading((prev) => ({ ...prev, [key]: true }));
    const grams = actualGrams[key] ?? food.quantity ?? 0;
    const ratio = food.quantity ? grams / food.quantity : 1;
    try {
      await fetch("/api/trainee/nutrition-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealName: meal.name,
          foodName: food.name,
          actualGrams: grams,
          calories: Math.round((food.calories ?? 0) * ratio),
          protein: food.protein != null ? Math.round(food.protein * ratio) : undefined,
          carbs: food.carbs != null ? Math.round(food.carbs * ratio) : undefined,
          fat: food.fat != null ? Math.round(food.fat * ratio) : undefined,
          plannedGrams: food.quantity,
          source: "plan",
        }),
      });
    } catch (err) {
      console.error("Failed to log food", err);
    } finally {
      setIsLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const updateGrams = (meal: any, food: any, grams: number) => {
    const key = `${meal.name}::${food.name}`;
    setActualGrams((prev) => ({ ...prev, [key]: grams }));
  };

  const addWater = async (amount: number) => {
    setWaterLoading(true);
    try {
      const res = await fetch("/api/trainee/water-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.total != null) setWaterTotal(data.total);
        else setWaterTotal((t) => t + amount);
      } else {
        setWaterTotal((t) => t + amount); // optimistic fallback (e.g. demo mode with no DB)
      }
    } catch (err) {
      console.error("Failed to add water", err);
      setWaterTotal((t) => t + amount);
    } finally {
      setWaterLoading(false);
    }
  };

  const undoWater = async () => {
    setWaterLoading(true);
    try {
      const res = await fetch("/api/trainee/water-log", { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        if (data?.total != null) setWaterTotal(data.total);
        else setWaterTotal((t) => Math.max(0, t - 50));
      } else {
        setWaterTotal((t) => Math.max(0, t - 50));
      }
    } catch (err) {
      console.error("Failed to undo water", err);
      setWaterTotal((t) => Math.max(0, t - 50));
    } finally {
      setWaterLoading(false);
    }
  };

  const waterPct = Math.min((waterTotal / WATER_GOAL) * 100, 100);
  const cups = Math.floor(waterTotal / 250);

  // Debounced food search: Open Food Facts first (better Israeli packaged products),
  // fall back to USDA FoodData Central (better generic/fresh foods) when OFF has no match.
  // TODO: replace USDA DEMO_KEY with a real API key
  useEffect(() => {
    if (activeTab !== "search" || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const offRes = await fetch(
          `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(searchQuery)}&search_simple=1&action=process&json=1&page_size=5&lc=he`
        );
        const offData = offRes.ok ? await offRes.json() : null;
        const offResults = (offData?.products ?? [])
          .filter((p: any) => (p.product_name_he || p.product_name) && p.nutriments?.["energy-kcal_100g"] != null)
          .map((p: any) => ({
            source: "off" as const,
            name: p.product_name_he || p.product_name,
            calories: Math.round(p.nutriments["energy-kcal_100g"]),
            protein: p.nutriments["proteins_100g"] != null ? Math.round(p.nutriments["proteins_100g"]) : undefined,
            carbs: p.nutriments["carbohydrates_100g"] != null ? Math.round(p.nutriments["carbohydrates_100g"]) : undefined,
            fat: p.nutriments["fat_100g"] != null ? Math.round(p.nutriments["fat_100g"]) : undefined,
            image: p.image_small_url,
          }));

        if (offResults.length > 0) {
          setSearchResults(offResults);
          return;
        }

        const usdaRes = await fetch(
          `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(searchQuery)}&api_key=DEMO_KEY&pageSize=5`
        );
        const usdaData = usdaRes.ok ? await usdaRes.json() : null;
        const findNutrient = (nutrients: any[], name: string) => nutrients?.find((n: any) => n.nutrientName?.includes(name))?.value;
        const usdaResults = (usdaData?.foods ?? []).map((f: any) => ({
          source: "usda" as const,
          name: f.description ?? "",
          calories: Math.round(findNutrient(f.foodNutrients, "Energy") ?? 0),
          protein: findNutrient(f.foodNutrients, "Protein") != null ? Math.round(findNutrient(f.foodNutrients, "Protein")) : undefined,
          carbs: findNutrient(f.foodNutrients, "Carbohydrate") != null ? Math.round(findNutrient(f.foodNutrients, "Carbohydrate")) : undefined,
          fat: findNutrient(f.foodNutrients, "Total lipid") != null ? Math.round(findNutrient(f.foodNutrients, "Total lipid")) : undefined,
        }));
        setSearchResults(usdaResults);
      } catch (err) {
        console.error("Food search failed", err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, activeTab]);

  const resetModal = () => {
    setModalClosing(true);
    setTimeout(() => {
      setShowAddModal(false);
      setModalClosing(false);
      setActiveTab("manual");
      setManualForm({ foodName: "", grams: "", calories: "", protein: "", carbs: "", fat: "" });
      setSearchQuery("");
      setSearchResults([]);
      setPhotoPreview(null);
      setAnalyzing(false);
    }, 300);
  };

  const openAddModal = (mealName: string) => {
    setActiveMealForModal(mealName);
    setShowAddModal(true);
  };

  const selectSearchResult = (result: any) => {
    setManualForm({
      foodName: result.name ?? "",
      grams: "100",
      calories: String(result.calories ?? ""),
      protein: String(result.protein ?? ""),
      carbs: String(result.carbs ?? ""),
      fat: String(result.fat ?? ""),
    });
    setActiveTab("manual");
  };

  const handlePhotoSelect = async (file: File) => {
    setPhotoPreview(URL.createObjectURL(file));
    setAnalyzing(true);
    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/trainee/analyze-food-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType: file.type }),
      });
      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      setManualForm({
        foodName: data.foodName ?? "",
        grams: String(data.grams ?? 100),
        calories: String(data.calories ?? ""),
        protein: String(data.protein ?? ""),
        carbs: String(data.carbs ?? ""),
        fat: String(data.fat ?? ""),
      });
      setActiveTab("manual");
    } catch (err) {
      console.error("Photo analysis failed", err);
      alert("שגיאה בניתוח התמונה");
    } finally {
      setAnalyzing(false);
    }
  };

  const submitManualForm = async () => {
    if (!manualForm.foodName || !manualForm.calories) return;
    setSavingManual(true);
    const grams = Number(manualForm.grams) || 100;
    const calories = Number(manualForm.calories) || 0;
    const newFood = {
      id: `extra-${Date.now()}`,
      name: manualForm.foodName,
      quantity: grams,
      calories,
      protein: manualForm.protein ? Number(manualForm.protein) : undefined,
      carbs: manualForm.carbs ? Number(manualForm.carbs) : undefined,
      fat: manualForm.fat ? Number(manualForm.fat) : undefined,
    };

    setExtraItems((prev) => ({
      ...prev,
      [activeMealForModal]: [...(prev[activeMealForModal] ?? []), newFood],
    }));
    const key = `${activeMealForModal}::${newFood.name}`;
    setCheckedItems((prev) => ({ ...prev, [key]: true }));
    setActualGrams((prev) => ({ ...prev, [key]: grams }));

    try {
      await fetch("/api/trainee/nutrition-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealName: activeMealForModal,
          foodName: newFood.name,
          actualGrams: grams,
          calories,
          protein: newFood.protein,
          carbs: newFood.carbs,
          fat: newFood.fat,
          plannedGrams: null,
          source: "manual",
        }),
      });
    } catch (err) {
      console.error("Failed to log manual food", err);
    } finally {
      setSavingManual(false);
      resetModal();
    }
  };

  return (
    <div style={{ background: "#12121f", minHeight: "100vh", paddingBottom: 100 }} dir="rtl">
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px 0" }}>

        {/* Section 1 — grocery hero card (unchanged layout, now shows "נותרו") */}
        <div style={{
          position: "relative", height: 192, borderRadius: 20, overflow: "hidden", marginBottom: 24,
          backgroundImage: `url(${GROCERY_PHOTO})`, backgroundSize: "cover", backgroundPosition: "center",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <div style={{ fontSize: 44, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{remainingCalories}</div>
            <div style={{ fontSize: 13, color: GREEN, fontWeight: 700 }}>נותרו קלוריות</div>

            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14 }}>
              {[
                { label: "שומן", value: targetFat },
                { label: "פחמימה", value: targetCarbs },
                { label: "חלבון", value: targetProtein },
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
              {(() => { const Icon = MEAL_ICONS[meal.name] ?? Utensils; return <Icon size={17} color="#fff" />; })()}
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {[...(meal.foodItems ?? []), ...(extraItems[meal.name] ?? [])].map((food: any, fi: number) => {
                const key = `${meal.name}::${food.name}`;
                const checked = !!checkedItems[key];
                const grams = actualGrams[key] ?? food.quantity ?? 0;
                const loading = !!isLoading[key];
                return (
                  <div key={food.id ?? fi} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", gap: 8 }}>
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

                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
                      {checked && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>גרם</span>
                          <input
                            type="number"
                            value={grams}
                            onChange={(e) => updateGrams(meal, food, Number(e.target.value))}
                            style={{
                              width: 48, fontSize: 12, color: "#fff", background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "3px 4px",
                              textAlign: "center",
                            }}
                          />
                        </div>
                      )}
                      <span style={{ fontSize: 14, color: "#fff", textAlign: "right" }}>{food.name}</span>
                    </div>

                    <button
                      onClick={() => toggleFood(meal, food)}
                      disabled={loading}
                      style={{
                        width: 24, height: 24, borderRadius: "50%", flexShrink: 0, cursor: loading ? "default" : "pointer",
                        background: checked ? GREEN : "transparent",
                        border: checked ? "none" : "1px solid rgba(255,255,255,0.25)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {loading ? (
                        <div style={{ width: 10, height: 10, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
                      ) : checked ? (
                        <svg width="12" height="12" fill="none" stroke="#0a0a0a" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : null}
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => openAddModal(meal.name)}
              style={{
                width: "100%", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: 12,
                padding: "8px 0", color: "#9ca3af", fontSize: 13, textAlign: "center",
                marginTop: 8, background: "transparent", cursor: "pointer",
              }}
            >
              + הוסף מזון שלא בתפריט
            </button>
          </div>
        ))}

        {/* Section 3 — water tracker */}
        <div style={{ background: "#1c1c2e", borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}><Droplet size={15} /> שתייה יומית</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: GREEN }}>{waterTotal.toLocaleString()} מ״ל</span>
          </div>
          <div style={{ height: 8, borderRadius: 99, background: "rgba(255,255,255,0.1)" }}>
            <div style={{ height: "100%", borderRadius: 99, width: `${waterPct}%`, background: GREEN, transition: "width 0.3s" }} />
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>{cups} כוסות</div>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={undoWater} disabled={waterLoading} style={{
              flex: 1, padding: "8px 0", borderRadius: 10, border: "none", cursor: "pointer",
              background: "rgba(127,29,29,0.3)", color: "#f87171", fontSize: 12, fontWeight: 700,
            }}>-50</button>
            {[50, 100, 250].map((amt) => (
              <button key={amt} onClick={() => addWater(amt)} disabled={waterLoading} style={{
                flex: 1, padding: "8px 0", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer",
                background: "#12121f", color: GREEN, fontSize: 12, fontWeight: 700,
              }}>+{amt} מ״ל</button>
            ))}
          </div>
        </div>
      </div>

      {showAddModal && (
          <div key="modal-root">
            <motion.div
              onClick={resetModal}
              initial={{ opacity: 0 }}
              animate={{ opacity: modalClosing ? 0 : 1 }}
              className="fixed inset-0 bg-black/80 z-[100]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: modalClosing ? "100%" : 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-[#1c1c2e] rounded-t-3xl z-[101] max-h-[85vh] overflow-y-auto"
              style={{ padding: 20 }}
            >
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-4" />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>הוספת מזון — {activeMealForModal}</span>
                <button onClick={resetModal} style={{ background: "transparent", border: "none", color: "#9ca3af", fontSize: 18, cursor: "pointer" }}>✕</button>
              </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[
                { key: "manual", label: "ידני" },
                { key: "search", label: "חיפוש" },
                { key: "photo", label: "צילום" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  style={{
                    padding: "6px 16px", borderRadius: 99, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer",
                    background: activeTab === tab.key ? GREEN : "rgba(255,255,255,0.1)",
                    color: activeTab === tab.key ? "#0a0a0a" : "#9ca3af",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "search" && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ position: "relative", marginBottom: 10 }}>
                  <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>🔍</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="חפש מזון..."
                    style={{
                      width: "100%", padding: "10px 36px 10px 12px", borderRadius: 10, fontSize: 14,
                      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff",
                    }}
                  />
                </div>
                {searching && <div style={{ color: "#9ca3af", fontSize: 13, textAlign: "center" }}>מחפש...</div>}
                {!searching && searchQuery.trim() && searchResults.length === 0 && (
                  <div style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", padding: "12px 0" }}>לא נמצאו תוצאות</div>
                )}
                {!searching && searchResults.map((r, i) => (
                  <div
                    key={i}
                    onClick={() => selectSearchResult(r)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 8px", gap: 8,
                      borderBottom: "1px solid rgba(255,255,255,0.06)", cursor: "pointer",
                    }}
                  >
                    {r.image && (
                      <img src={r.image} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                    )}
                    <span style={{ color: "#fff", fontSize: 13, flex: 1 }}>{r.name}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 99,
                        background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)",
                      }}>{r.source === "off" ? "OFF" : "USDA"}</span>
                      <span style={{ color: GREEN, fontSize: 12 }}>{r.calories ? `${r.calories} קל׳ / 100 גרם` : ""}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "photo" && (
              <div style={{ marginBottom: 16 }}>
                {!photoPreview && (
                  <label style={{
                    display: "block", border: "2px dashed rgba(255,255,255,0.2)", borderRadius: 16,
                    padding: 32, textAlign: "center", cursor: "pointer",
                  }}>
                    <div style={{ fontSize: 48, marginBottom: 8 }}>📷</div>
                    <div style={{ color: "#9ca3af", fontSize: 13 }}>צלם או העלה תמונה של האוכל</div>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => e.target.files?.[0] && handlePhotoSelect(e.target.files[0])}
                      style={{ display: "none" }}
                    />
                  </label>
                )}
                {photoPreview && (
                  <div style={{ textAlign: "center" }}>
                    <img src={photoPreview} alt="" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 16, marginBottom: 10 }} />
                    {analyzing && <div style={{ color: GREEN, fontSize: 13 }}>מנתח תמונה...</div>}
                  </div>
                )}
              </div>
            )}

            {activeTab === "manual" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                {[
                  { key: "foodName", label: "שם המזון", type: "text" },
                  { key: "grams", label: "כמות (גרמים)", type: "number" },
                  { key: "calories", label: "קלוריות", type: "number" },
                  { key: "protein", label: "חלבון (אופציונלי)", type: "number" },
                  { key: "carbs", label: "פחמימה (אופציונלי)", type: "number" },
                  { key: "fat", label: "שומן (אופציונלי)", type: "number" },
                ].map((field) => (
                  <div key={field.key}>
                    <label style={{ display: "block", fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>{field.label}</label>
                    <input
                      type={field.type}
                      value={(manualForm as any)[field.key]}
                      onChange={(e) => setManualForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      style={{
                        width: "100%", padding: "10px 12px", borderRadius: 10, fontSize: 14,
                        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff",
                      }}
                    />
                  </div>
                ))}
                <button
                  onClick={submitManualForm}
                  disabled={savingManual || !manualForm.foodName || !manualForm.calories}
                  style={{
                    width: "100%", padding: "12px 0", borderRadius: 12, border: "none", cursor: "pointer",
                    background: GREEN, color: "#0a0a0a", fontSize: 15, fontWeight: 800, marginTop: 4,
                  }}
                >
                  {savingManual ? "שומר..." : "הוסף"}
                </button>
              </div>
            )}
            </motion.div>
          </div>
        )}
    </div>
  );
}
