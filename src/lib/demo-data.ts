// Demo data used when DB is not connected
export const DEMO_TRAINEES = [
  {
    id: "demo-trainee-001",
    name: "אבי כהן",
    email: "avi@example.com",
    role: "TRAINEE",
    coachId: "demo-coach-001",
    createdAt: new Date("2024-01-15"),
    image: null,
    traineeProfile: {
      id: "p1", userId: "demo-trainee-001",
      goals: ["muscle_gain", "strength"], experience: "intermediate",
      height: 178, startingWeight: 82, currentWeight: 79,
      phone: "050-1234567", gender: "male",
      dateOfBirth: new Date("1995-05-10"),
      injuries: null, medicalConditions: null, limitations: null, medications: null, notes: null,
      dailyCalories: 2700,
      updatedAt: new Date(),
    },
    nutritionLogs: [
      { id: "nl1", traineeId: "demo-trainee-001", date: new Date(), mealName: "ארוחת בוקר", foodName: "חביתה מ-3 ביצים", plannedGrams: null, actualGrams: 200, calories: 320, protein: 24, carbs: 4, fat: 22, source: "plan", createdAt: new Date() },
      { id: "nl2", traineeId: "demo-trainee-001", date: new Date(), mealName: "ארוחת צהריים", foodName: "חזה עוף + אורז מלא", plannedGrams: null, actualGrams: 350, calories: 560, protein: 55, carbs: 60, fat: 10, source: "plan", createdAt: new Date() },
      { id: "nl3", traineeId: "demo-trainee-001", date: new Date(), mealName: "חטיף", foodName: "יוגורט + פרי", plannedGrams: null, actualGrams: 200, calories: 960, protein: 20, carbs: 100, fat: 30, source: "manual", createdAt: new Date() },
    ],
    checkIns: [
      { id: "ci1", traineeId: "demo-trainee-001", date: new Date(Date.now() - 2 * 86400000), weight: 79, waist: null, chest: null, hip: null, arm: null, bodyFat: null, followedPlan: true, workoutsCompleted: 4, coachNotes: null, traineeNotes: null, photos: [] },
      { id: "ci2", traineeId: "demo-trainee-001", date: new Date(Date.now() - 9 * 86400000), weight: 80.5, waist: null, chest: null, hip: null, arm: null, bodyFat: null, followedPlan: true, workoutsCompleted: 3, coachNotes: null, traineeNotes: null, photos: [] },
    ],
    workoutLogs: [
      { id: "wl1", traineeId: "demo-trainee-001", sessionId: "s1", date: new Date(Date.now() - 86400000), status: "COMPLETED", notes: null, exerciseLogs: [] },
      { id: "wl2", traineeId: "demo-trainee-001", sessionId: "s2", date: new Date(Date.now() - 3 * 86400000), status: "COMPLETED", notes: null, exerciseLogs: [] },
    ],
    workoutPlans: [
      {
        id: "wp1", traineeId: "demo-trainee-001", coachId: "demo-coach-001",
        name: "תוכנית PPL — אבי", template: "PPL", isActive: true, createdAt: new Date("2024-02-01"),
        sessions: [
          {
            id: "s1", planId: "wp1", name: "Push Day", dayLabel: "ראשון + רביעי", order: 1,
            exercises: [
              { id: "se1", sessionId: "s1", exerciseId: "ex1", sets: 4, reps: "10", weight: 80, restTime: 90, techniqueNotes: "ירידה איטית 3 שניות", order: 1, exercise: { id: "ex1", name: "לחיצת חזה", muscleGroup: "חזה", description: null, howTo: null, tips: [], commonMistakes: [], equipment: "מוט", difficulty: "בינוני", videoUrl: null, imageUrl: null, isCustom: false, coachId: null } },
              { id: "se2", sessionId: "s1", exerciseId: "ex2", sets: 3, reps: "12", weight: 50, restTime: 60, techniqueNotes: null, order: 2, exercise: { id: "ex2", name: "לחיצת כתפיים", muscleGroup: "כתפיים", description: null, howTo: null, tips: [], commonMistakes: [], equipment: "מוט", difficulty: "בינוני", videoUrl: null, imageUrl: null, isCustom: false, coachId: null } },
              { id: "se3", sessionId: "s1", exerciseId: "ex3", sets: 3, reps: "15", weight: 30, restTime: 60, techniqueNotes: null, order: 3, exercise: { id: "ex3", name: "טרייספס פולי", muscleGroup: "זרועות", description: null, howTo: null, tips: [], commonMistakes: [], equipment: "פולי", difficulty: "קל", videoUrl: null, imageUrl: null, isCustom: false, coachId: null } },
            ],
          },
          {
            id: "s2", planId: "wp1", name: "Pull Day", dayLabel: "שני + חמישי", order: 2,
            exercises: [
              { id: "se4", sessionId: "s2", exerciseId: "ex4", sets: 4, reps: "8", weight: 70, restTime: 90, techniqueNotes: null, order: 1, exercise: { id: "ex4", name: "שכיבות סמיכה", muscleGroup: "גב", description: null, howTo: null, tips: [], commonMistakes: [], equipment: "מכונה", difficulty: "בינוני", videoUrl: null, imageUrl: null, isCustom: false, coachId: null } },
              { id: "se5", sessionId: "s2", exerciseId: "ex5", sets: 3, reps: "10", weight: 55, restTime: 75, techniqueNotes: null, order: 2, exercise: { id: "ex5", name: "חתירה צרה", muscleGroup: "גב", description: null, howTo: null, tips: [], commonMistakes: [], equipment: "מכונת כבל", difficulty: "בינוני", videoUrl: null, imageUrl: null, isCustom: false, coachId: null } },
            ],
          },
          {
            id: "s3", planId: "wp1", name: "Leg Day", dayLabel: "שישי", order: 3,
            exercises: [
              { id: "se6", sessionId: "s3", exerciseId: "ex6", sets: 5, reps: "5", weight: 100, restTime: 120, techniqueNotes: "כפות הרגליים מורחבות", order: 1, exercise: { id: "ex6", name: "סקוואט", muscleGroup: "רגליים", description: null, howTo: null, tips: [], commonMistakes: [], equipment: "מוט + מסגרת", difficulty: "מתקדם", videoUrl: null, imageUrl: null, isCustom: false, coachId: null } },
            ],
          },
        ],
      },
    ],
    nutritionPlans: [
      {
        id: "np1", traineeId: "demo-trainee-001",
        name: "תפריט בניית שריר — אבי",
        calories: 2800, protein: 180, carbs: 320, fat: 80,
        preferences: [], notes: null, isActive: true, createdAt: new Date("2024-02-01"),
        meals: [
          {
            id: "m1", nutritionPlanId: "np1", name: "ארוחת בוקר", time: "07:30", order: 1,
            foodItems: [
              { id: "f1", mealId: "m1", name: "שיבולת שועל", quantity: 100, unit: "גרם", calories: 370, protein: 13, carbs: 58, fat: 7, category: "פחמימות" },
              { id: "f2", mealId: "m1", name: "חלב 3%", quantity: 250, unit: "מ\"ל", calories: 158, protein: 8, carbs: 11, fat: 8, category: "חלב" },
              { id: "f3", mealId: "m1", name: "בננה", quantity: 1, unit: "יחידה", calories: 89, protein: 1, carbs: 23, fat: 0, category: "פירות" },
            ],
          },
          {
            id: "m2", nutritionPlanId: "np1", name: "ארוחת צהריים", time: "13:00", order: 2,
            foodItems: [
              { id: "f4", mealId: "m2", name: "חזה עוף", quantity: 200, unit: "גרם", calories: 330, protein: 62, carbs: 0, fat: 7, category: "חלבונים" },
              { id: "f5", mealId: "m2", name: "אורז לבן מבושל", quantity: 200, unit: "גרם", calories: 260, protein: 5, carbs: 57, fat: 0, category: "פחמימות" },
              { id: "f6", mealId: "m2", name: "ברוקולי מאודה", quantity: 150, unit: "גרם", calories: 50, protein: 4, carbs: 8, fat: 0, category: "ירקות" },
            ],
          },
          {
            id: "m3", nutritionPlanId: "np1", name: "חטיף לפני אימון", time: "16:30", order: 3,
            foodItems: [
              { id: "f7", mealId: "m3", name: "חמאת בוטנים", quantity: 30, unit: "גרם", calories: 180, protein: 8, carbs: 6, fat: 15, category: "שומנים" },
              { id: "f8", mealId: "m3", name: "לחם מחיטה מלאה", quantity: 2, unit: "פרוסות", calories: 160, protein: 6, carbs: 30, fat: 2, category: "פחמימות" },
            ],
          },
          {
            id: "m4", nutritionPlanId: "np1", name: "ארוחת ערב", time: "20:00", order: 4,
            foodItems: [
              { id: "f9", mealId: "m4", name: "סלמון אפוי", quantity: 180, unit: "גרם", calories: 370, protein: 40, carbs: 0, fat: 22, category: "חלבונים" },
              { id: "f10", mealId: "m4", name: "בטטה", quantity: 200, unit: "גרם", calories: 172, protein: 3, carbs: 40, fat: 0, category: "פחמימות" },
              { id: "f11", mealId: "m4", name: "סלט ירקות", quantity: 200, unit: "גרם", calories: 40, protein: 2, carbs: 8, fat: 0, category: "ירקות" },
            ],
          },
        ],
      },
    ],
    timelineEvents: [],
  },
  {
    id: "demo-trainee-002",
    name: "מיכל לוי",
    email: "michal@example.com",
    role: "TRAINEE",
    coachId: "demo-coach-001",
    createdAt: new Date("2024-02-10"),
    image: null,
    traineeProfile: {
      id: "p2", userId: "demo-trainee-002",
      goals: ["weight_loss", "health"], experience: "beginner",
      height: 165, startingWeight: 70, currentWeight: 67,
      phone: "052-9876543", gender: "female",
      dateOfBirth: new Date("1998-11-20"),
      injuries: null, medicalConditions: null, limitations: null, medications: null, notes: null,
      updatedAt: new Date(),
    },
    checkIns: [
      { id: "ci3", traineeId: "demo-trainee-002", date: new Date(Date.now() - 86400000), weight: 67, waist: null, chest: null, hip: null, arm: null, bodyFat: null, followedPlan: true, workoutsCompleted: 3, coachNotes: null, traineeNotes: null, photos: [] },
    ],
    workoutLogs: [
      { id: "wl3", traineeId: "demo-trainee-002", sessionId: "s4", date: new Date(Date.now() - 86400000), status: "COMPLETED", notes: null, exerciseLogs: [] },
    ],
    workoutPlans: [],
    nutritionPlans: [],
    timelineEvents: [],
  },
  {
    id: "demo-trainee-003",
    name: "דנה שפירא",
    email: "dana@example.com",
    role: "TRAINEE",
    coachId: "demo-coach-001",
    createdAt: new Date("2024-03-01"),
    image: null,
    traineeProfile: null,
    checkIns: [],
    workoutLogs: [],
    workoutPlans: [],
    nutritionPlans: [],
    timelineEvents: [],
  },
];

export const DEMO_ALERTS = [
  { id: "a1", coachId: "demo-coach-001", traineeId: "demo-trainee-003", type: "NO_CHECKIN", message: "דנה לא שלחה צ׳ק-אין מזה 10 ימים", isRead: false, createdAt: new Date(Date.now() - 2 * 86400000), trainee: { name: "דנה שפירא", id: "demo-trainee-003" } },
  { id: "a2", coachId: "demo-coach-001", traineeId: "demo-trainee-002", type: "LOW_CONSISTENCY", message: "מיכל השלימה רק 60% מהאימונים השבוע", isRead: false, createdAt: new Date(Date.now() - 86400000), trainee: { name: "מיכל לוי", id: "demo-trainee-002" } },
];

import { EXERCISE_LIBRARY } from "./exercise-library";
export const DEMO_EXERCISES = EXERCISE_LIBRARY;

export const isDemoId = (id: string) => id?.startsWith("demo-");
