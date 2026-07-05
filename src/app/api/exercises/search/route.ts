import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { translateExerciseName } from "@/lib/exercise-name-translations";

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const isClaudeConfigured = !!ANTHROPIC_KEY && !ANTHROPIC_KEY.includes("your-");

async function translateToHebrew(description: string, instructions: string[]) {
  if (!isClaudeConfigured) return { description, instructions };

  try {
    const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });
    const res = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `תרגם את הטקסט הבא לעברית. החזר רק את התרגום בלי הסברים נוספים:

תיאור: ${description}

הוראות:
${instructions.join("\n")}

פורמט תגובה:
תיאור: [תרגום התיאור]
הוראות:
1. [הוראה 1]
2. [הוראה 2]
...`,
        },
      ],
    });

    const text = res.content[0].type === "text" ? res.content[0].text : "";
    const lines = text.split("\n").filter((l) => l.trim());
    const descLine = lines.find((l) => l.startsWith("תיאור:"));
    const instrLines = lines.filter((l) => /^\d+\./.test(l.trim()));

    return {
      description: descLine ? descLine.replace("תיאור:", "").trim() : description,
      instructions: instrLines.length ? instrLines.map((l) => l.replace(/^\d+\.\s*/, "").trim()) : instructions,
    };
  } catch (err) {
    console.error("Hebrew translation error:", err);
    return { description, instructions };
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

  const englishName = translateExerciseName(name);

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

    let description: string | null = exercise?.description ?? null;
    let instructions: string[] = exercise?.instructions ?? [];

    if (description) {
      const translated = await translateToHebrew(description, instructions);
      description = translated.description;
      instructions = translated.instructions;
    }

    return NextResponse.json({
      target: exercise?.target ?? null,
      secondaryMuscles: exercise?.secondaryMuscles ?? [],
      instructions,
      equipment: exercise?.equipment ?? null,
      description,
      difficulty: exercise?.difficulty ?? null,
      category: exercise?.category ?? null,
      translatedName: englishName, // for debugging
    });
  } catch (err) {
    console.error("ExerciseDB fetch error:", err);
    return NextResponse.json({ error: "API error" }, { status: 500 });
  }
}
