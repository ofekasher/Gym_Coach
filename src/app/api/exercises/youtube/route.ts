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
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&videoDuration=short&key=${apiKey}`,
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "YouTube API error" }, { status: 500 });
    }

    const data = await res.json();
    const video = data.items?.[0];

    if (!video) {
      return NextResponse.json({ videoId: null });
    }

    return NextResponse.json({
      videoId: video.id.videoId,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.medium.url,
    });
  } catch (err) {
    console.error("YouTube fetch error:", err);
    return NextResponse.json({ error: "YouTube API error" }, { status: 500 });
  }
}
