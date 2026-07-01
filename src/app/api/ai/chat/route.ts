import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const isConfigured = !!ANTHROPIC_KEY && !ANTHROPIC_KEY.includes("your-");

const SYSTEM_PROMPT = `אתה עוזר כושר ותזונה AI בשם "FitBot" באפליקציית SmartFitCoach.
אתה מדבר עברית בצורה ידידותית, מעודדת ומקצועית.
אתה עוזר למתאמנים עם:
- שאלות תזונה: מה לאכול לפני/אחרי אימון, כמה קלוריות, מאקרו, תכנון ארוחות
- שאלות אימון: טכניקת ביצוע, כאבים שרירים, מנוחה, תכנות
- מוטיבציה: עידוד, תשובות לשאלות "לא בא לי להתאמן"
- שאלות כלליות על בריאות ופיטנס
כללים:
1. תמיד ענה בעברית
2. היה קצר וממוקד — תשובות לא ארוכות מדי (3-5 משפטים)
3. השתמש באמוג'ים בצורה מתונה
4. אם שאלה רפואית רצינית — המלץ לפנות לרופא
5. היה מעודד ואופטימי`;

const DEMO_RESPONSES: Record<string, string> = {
  כוח: "😊 גם לי היו ימים כאלה! הטריק הוא להתחיל — לפעמים רק 10 דקות ראשונות קשות. נסה אימון קצר של 20 דקות ותראה שהאנרגיה מגיעה. אתה יכול! 💪",
  חלבון: "🥩 ההמלצה הכללית: 1.6-2.2 גרם חלבון לכל ק\"ג גוף. אם שוקל 80 ק\"ג — זה 128-176 גרם ביום. מקורות מצוינים: עוף, ביצים, קוטג׳, טונה.",
  לאכול: "🥑 לפני אימון (1-2 שעות): פחמימות + חלבון קל — אורז עם עוף, בננה עם חמאת בוטנים. אחרי אימון: חלבון מהיר + פחמימות — גביע יוגורט, חביתה עם לחם.",
  כואב: "🧊 כאב שרירים מושהה (DOMS) זה תקין! מופיע 24-48 שעות אחרי אימון חדש. עזרה: מתיחות קלות, הרבה מים, שינה טובה. זה סימן שהשרירים מתפתחים 💪",
  מנוחה: "😴 שרירים גדלים בזמן מנוחה! המלצה: 48 שעות מנוחה לאותה קבוצת שרירים. שינה 7-9 שעות קריטית לשחרור הורמון גדילה.",
  default: "💪 שאלה מצוינת! אני כאן לעזור עם כל שאלה על כושר ותזונה. שאל אותי על אימונים, תזונה, מוטיבציה ועוד.",
};

function getDemoResponse(q: string): string {
  const t = q.toLowerCase();
  if (t.includes("כוח") || t.includes("אנרגיה") || t.includes("בא לי") || t.includes("עייפ")) return DEMO_RESPONSES["כוח"];
  if (t.includes("חלבון") || t.includes("פרוטאין")) return DEMO_RESPONSES["חלבון"];
  if (t.includes("לאכול") || t.includes("אוכל") || t.includes("תזונה")) return DEMO_RESPONSES["לאכול"];
  if (t.includes("כואב") || t.includes("כאב")) return DEMO_RESPONSES["כואב"];
  if (t.includes("מנוחה") || t.includes("שינה")) return DEMO_RESPONSES["מנוחה"];
  return DEMO_RESPONSES["default"];
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messages, userContext } = await req.json();
  const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user")?.content ?? "";

  if (!isConfigured) {
    return NextResponse.json({ message: getDemoResponse(lastUserMsg) });
  }

  try {
    const client = new Anthropic({ apiKey: ANTHROPIC_KEY });

    let systemMsg = SYSTEM_PROMPT;
    if (userContext) {
      const ctx = [
        `שם: ${userContext.name}`,
        userContext.weight ? `משקל נוכחי: ${userContext.weight} ק"ג` : null,
        userContext.planName ? `תוכנית אימון: ${userContext.planName}` : null,
        userContext.streak ? `אימונים השבוע: ${userContext.streak}` : null,
        userContext.goals?.length ? `מטרות: ${userContext.goals.join(", ")}` : null,
        userContext.experience ? `רמת ניסיון: ${userContext.experience}` : null,
      ].filter(Boolean).join(" | ");
      systemMsg += `\n\nנתוני המתאמן: ${ctx}\nהתאם את התשובות לנתונים אלה כשרלוונטי.`;
    }

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: systemMsg,
      messages: messages.map((m: any) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ message: text });
  } catch (err) {
    console.error("Claude AI error:", err);
    return NextResponse.json({ message: getDemoResponse(lastUserMsg) });
  }
}
