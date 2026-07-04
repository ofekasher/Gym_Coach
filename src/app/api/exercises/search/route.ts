import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") ?? "";

  if (!name.trim()) {
    return NextResponse.json({ error: "Missing name parameter" }, { status: 400 });
  }

  if (!process.env.RAPIDAPI_KEY) {
    return NextResponse.json({ error: "ExerciseDB is not configured" }, { status: 503 });
  }

  try {
    const res = await fetch(
      `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(name)}?limit=5`,
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
    });
  } catch (err) {
    console.error("ExerciseDB fetch error:", err);
    return NextResponse.json({ error: "API error" }, { status: 500 });
  }
}
