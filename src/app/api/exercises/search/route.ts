import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const isClaudeConfigured = !!ANTHROPIC_KEY && !ANTHROPIC_KEY.includes("your-");
const anthropic = isClaudeConfigured ? new Anthropic({ apiKey: ANTHROPIC_KEY }) : null;

async function translateToEnglish(hebrewName: string): Promise<string> {
  // Already English (or no Claude key available) — use as-is
  if (/^[a-zA-Z\s]+$/.test(hebrewName) || !anthropic) return hebrewName;

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 50,
      messages: [{
        role: "user",
        content: `Translate this Hebrew gym exercise name to English.
Return ONLY the English exercise name, nothing else.
Hebrew: "${hebrewName}"
English:`,
      }],
    });

    const translated = response.content[0].type === "text" ? response.content[0].text.trim() : hebrewName;
    return translated || hebrewName;
  } catch (err) {
    console.error("Exercise name translation error:", err);
    return hebrewName;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") ?? "";

  if (!name.trim()) {
    return NextResponse.json({ error: "Missing name parameter" }, { status: 400 });
  }

  if (!process.env.RAPIDAPI_KEY) {
    return NextResponse.json({ error: "ExerciseDB is not configured" }, { status: 503 });
  }

  const englishName = await translateToEnglish(name);

  try {
    const res = await fetch(
      `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(englishName)}?limit=1`,
      {
        headers: {
          "x-rapidapi-host": "exercisedb.p.rapidapi.com",
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        },
        next: { revalidate: 86400 }, // cache 24 hours
      }
    );

    if (!res.ok) return NextResponse.json({ error: "API error" }, { status: 500 });

    const data = await res.json();
    const exercise = data[0] ?? null;

    return NextResponse.json({
      target: exercise?.target ?? null,
      secondaryMuscles: exercise?.secondaryMuscles ?? [],
      instructions: exercise?.instructions ?? [],
      equipment: exercise?.equipment ?? null,
      description: exercise?.description ?? null,
      difficulty: exercise?.difficulty ?? null,
      category: exercise?.category ?? null,
      translatedName: englishName, // for debugging
    });
  } catch (err) {
    console.error("ExerciseDB fetch error:", err);
    return NextResponse.json({ error: "API error" }, { status: 500 });
  }
}
