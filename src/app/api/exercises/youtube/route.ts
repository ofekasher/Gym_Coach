import { NextRequest, NextResponse } from "next/server";
import { EXERCISE_NAME_TRANSLATIONS } from "@/lib/exercise-name-translations";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") ?? "";

  const englishName = EXERCISE_NAME_TRANSLATIONS[name] ?? name;
  const query = `${englishName} exercise tutorial`;

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "YouTube API not configured" }, { status: 503 });
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=3&videoDuration=short&videoEmbeddable=true&key=${apiKey}`,
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "YouTube API error" }, { status: 500 });
    }

    const data = await res.json();
    const video = data.items?.[0];
    const videoId = video?.id?.videoId ?? null;

    if (!videoId) {
      return NextResponse.json({ videoId: null });
    }

    return NextResponse.json({
      videoId,
      title: video?.snippet?.title ?? null,
      thumbnail: video?.snippet?.thumbnails?.medium?.url ?? null,
    });
  } catch (err) {
    console.error("YouTube fetch error:", err);
    return NextResponse.json({ error: "YouTube API error" }, { status: 500 });
  }
}
