import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const isConfigured = !!ANTHROPIC_KEY && !ANTHROPIC_KEY.includes("your-");
const anthropic = isConfigured ? new Anthropic({ apiKey: ANTHROPIC_KEY }) : null;

const PROMPT = `אתה מומחה תזונה. נתח את התמונה והחזר JSON בלבד (ללא טקסט נוסף):
{
  "foodName": "שם המזון בעברית",
  "grams": 100,
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0,
  "confidence": "high" | "medium" | "low"
}
אם אינך מזהה אוכל בתמונה, החזר: { "error": "לא זוהה אוכל בתמונה" }
הערך calories/protein/carbs/fat הוא לכמות המוערכת בתמונה, לא ל-100 גרם.`;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "TRAINEE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { imageBase64, mediaType } = await req.json();
  if (!imageBase64 || !mediaType) {
    return NextResponse.json({ error: "Missing image data" }, { status: 400 });
  }

  if (!isConfigured) {
    return NextResponse.json({ error: "שירות ניתוח התמונות אינו זמין כרגע" }, { status: 503 });
  }

  try {
    const response = await anthropic!.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: imageBase64 },
            },
            { type: "text", text: PROMPT },
          ],
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Food photo analysis error:", err);
    return NextResponse.json({ error: "שגיאה בניתוח התמונה" }, { status: 500 });
  }
}
