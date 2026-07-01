// Maps muscle groups and exercise names to alternative exercises
export interface AlternativeExercise {
  name: string;
  equipment: "חדר כושר" | "בית" | "שניהם";
  difficulty: "קל" | "בינוני" | "קשה";
}

// Alternatives by muscle group
export const ALTERNATIVES_BY_MUSCLE: Record<string, AlternativeExercise[]> = {
  "חזה": [
    { name: "לחיצת חזה במוט", equipment: "חדר כושר", difficulty: "בינוני" },
    { name: "לחיצת חזה בהנטלים", equipment: "חדר כושר", difficulty: "בינוני" },
    { name: "לחיצת חזה בשיפוע", equipment: "חדר כושר", difficulty: "בינוני" },
    { name: "שכיבות סמיכה", equipment: "בית", difficulty: "קל" },
    { name: "פלייז עם דמבלים", equipment: "חדר כושר", difficulty: "בינוני" },
    { name: "לחיצת חזה בסמית מאשין", equipment: "חדר כושר", difficulty: "קל" },
    { name: "כבל קרוסאובר", equipment: "חדר כושר", difficulty: "קל" },
  ],
  "גב": [
    { name: "מתח", equipment: "שניהם", difficulty: "קשה" },
    { name: "חתירה במוט", equipment: "חדר כושר", difficulty: "בינוני" },
    { name: "חתירה בדמבל חד-ידי", equipment: "חדר כושר", difficulty: "בינוני" },
    { name: "פולדאון", equipment: "חדר כושר", difficulty: "בינוני" },
    { name: "חתירה בכבל", equipment: "חדר כושר", difficulty: "קל" },
    { name: "דדליפט", equipment: "חדר כושר", difficulty: "קשה" },
    { name: "היפר-אקסטנשן", equipment: "חדר כושר", difficulty: "קל" },
  ],
  "כתפיים": [
    { name: "לחיצת כתפיים עם דמבלים", equipment: "חדר כושר", difficulty: "בינוני" },
    { name: "לחיצת כתפיים במוט", equipment: "חדר כושר", difficulty: "בינוני" },
    { name: "הרחקת זרועות לצדדים", equipment: "חדר כושר", difficulty: "קל" },
    { name: "פרונטל עם דמבלים", equipment: "חדר כושר", difficulty: "קל" },
    { name: "חתירה ישרה", equipment: "חדר כושר", difficulty: "בינוני" },
    { name: "כבל לטרל", equipment: "חדר כושר", difficulty: "קל" },
  ],
  "רגליים": [
    { name: "סקוואט עם מוט", equipment: "חדר כושר", difficulty: "קשה" },
    { name: "לגפרס", equipment: "חדר כושר", difficulty: "קל" },
    { name: "לחיצת רגליים במכונה", equipment: "חדר כושר", difficulty: "קל" },
    { name: "ראש גדול (האק סקוואט)", equipment: "חדר כושר", difficulty: "בינוני" },
    { name: "לאנג׳ עם דמבלים", equipment: "שניהם", difficulty: "בינוני" },
    { name: "כפיפת ברכיים שוכב", equipment: "חדר כושר", difficulty: "קל" },
    { name: "סקוואט בולגרי", equipment: "שניהם", difficulty: "קשה" },
    { name: "הרמת עגל בעמידה", equipment: "שניהם", difficulty: "קל" },
  ],
  "ידיים": [
    { name: "כפיפת מרפק עם דמבלים", equipment: "חדר כושר", difficulty: "קל" },
    { name: "כפיפת מרפק עם מוט", equipment: "חדר כושר", difficulty: "קל" },
    { name: "כפיפת מרפק בכבל", equipment: "חדר כושר", difficulty: "קל" },
    { name: "מקבוץ עם דמבלים", equipment: "חדר כושר", difficulty: "קל" },
    { name: "דחיפת מרפק בכבל", equipment: "חדר כושר", difficulty: "קל" },
    { name: "דחיפת מרפק בסקוט", equipment: "חדר כושר", difficulty: "בינוני" },
    { name: "דיפס", equipment: "שניהם", difficulty: "בינוני" },
  ],
  "בטן": [
    { name: "פלאנק", equipment: "בית", difficulty: "בינוני" },
    { name: "כפיפות בטן", equipment: "בית", difficulty: "קל" },
    { name: "רגליים עולות", equipment: "שניהם", difficulty: "בינוני" },
    { name: "קראנצ׳", equipment: "בית", difficulty: "קל" },
    { name: "אב-וויל", equipment: "חדר כושר", difficulty: "קשה" },
    { name: "רוסי טוויסט", equipment: "שניהם", difficulty: "בינוני" },
  ],
};

// Alternatives per specific exercise name (overrides group-level alternatives)
export const ALTERNATIVES_BY_EXERCISE: Record<string, AlternativeExercise[]> = {
  "סקוואט": ALTERNATIVES_BY_MUSCLE["רגליים"],
  "סקוואט עם מוט": ALTERNATIVES_BY_MUSCLE["רגליים"],
  "לגפרס": ALTERNATIVES_BY_MUSCLE["רגליים"],
  "לחיצת רגליים במכונה": ALTERNATIVES_BY_MUSCLE["רגליים"],
  "דדליפט": ALTERNATIVES_BY_MUSCLE["גב"],
  "לחיצת חזה": ALTERNATIVES_BY_MUSCLE["חזה"],
  "לחיצת חזה במוט": ALTERNATIVES_BY_MUSCLE["חזה"],
  "מתח": ALTERNATIVES_BY_MUSCLE["גב"],
};

export function getAlternatives(exerciseName: string, muscleGroup: string): AlternativeExercise[] {
  const byName = ALTERNATIVES_BY_EXERCISE[exerciseName];
  if (byName) return byName.filter(a => a.name !== exerciseName);

  const normalizedGroup = muscleGroup?.replace(/\s/g, "");
  for (const [key, alts] of Object.entries(ALTERNATIVES_BY_MUSCLE)) {
    if (normalizedGroup?.includes(key) || key.includes(normalizedGroup ?? "")) {
      return alts.filter(a => a.name !== exerciseName);
    }
  }

  return ALTERNATIVES_BY_MUSCLE["גב"].slice(0, 4);
}
