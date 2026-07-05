"use client";
import { useState } from "react";

interface Props {
  exerciseName: string;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: "#4ade80",
  intermediate: "#facc15",
  advanced: "#f87171",
};

export function ExerciseGifCard({ exerciseName }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [opened, setOpened] = useState(false);
  const [videoData, setVideoData] = useState<any>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);

  const load = async () => {
    if (data || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/exercises/search?name=${encodeURIComponent(exerciseName)}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to load exercise demo", err);
      setData({ error: true });
    } finally {
      setLoading(false);
    }
  };

  const loadVideo = async () => {
    if (videoData || loadingVideo) return;
    setLoadingVideo(true);
    try {
      const res = await fetch(`/api/exercises/youtube?name=${encodeURIComponent(exerciseName)}`);
      const json = await res.json();
      setVideoData(json);
    } catch (err) {
      console.error("Failed to load exercise video", err);
      setVideoData({ videoId: null });
    } finally {
      setLoadingVideo(false);
    }
  };

  const handleOpen = () => {
    const next = !opened;
    setOpened(next);
    if (next) {
      load();
      loadVideo();
    }
  };

  const hasInfo = data && (data.target || data.equipment || data.difficulty);
  const diffColor = data?.difficulty ? DIFFICULTY_COLOR[data.difficulty] ?? "#fff" : "#fff";

  return (
    <div>
      <button
        onClick={handleOpen}
        className="text-[#a8ff3e] text-xs underline"
      >
        {opened ? "✕ סגור" : "▶ פרטי תרגיל"}
      </button>

      {opened && (
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 mt-3">
          {loading && <div className="text-white/40 text-sm mb-3">טוען מידע...</div>}

          {data && !loading && hasInfo && (
            <div className="flex flex-wrap gap-2 mb-3">
              {data.target && (
                <span className="bg-[#a8ff3e]/10 text-[#a8ff3e] text-xs px-2 py-0.5 rounded-full">
                  💪 שריר ראשי: {data.target}
                </span>
              )}
              {data.equipment && (
                <span className="bg-white/10 text-white/70 text-xs px-2 py-0.5 rounded-full">
                  🔧 ציוד: {data.equipment}
                </span>
              )}
              {data.difficulty && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${diffColor}1A`, color: diffColor }}>
                  ⭐ רמה: {data.difficulty}
                </span>
              )}
            </div>
          )}

          {data && !loading && !hasInfo && (
            <div className="text-white/40 text-sm text-center mb-3">לא נמצא מידע נוסף לתרגיל זה</div>
          )}

          {/* YouTube link — always show, no embed */}
          {!loadingVideo && videoData?.videoId && (
            <a
              href={`https://www.youtube.com/watch?v=${videoData.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mt-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              ▶ צפה בסרטון הדגמה ב-YouTube
            </a>
          )}
          {loadingVideo && (
            <div className="text-white/40 text-xs text-center py-2 mt-2">טוען סרטון...</div>
          )}
          {!loadingVideo && videoData && !videoData.videoId && (
            <div className="text-white/40 text-xs text-center py-2 mt-2">לא נמצא סרטון לתרגיל זה</div>
          )}
        </div>
      )}
    </div>
  );
}
