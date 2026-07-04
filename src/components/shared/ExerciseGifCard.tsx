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
  const [showVideo, setShowVideo] = useState(false);

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

  const handleShowVideo = () => {
    setShowVideo(true);
    loadVideo();
  };

  const hasInfo = data && (data.target || data.equipment || data.difficulty || data.description);
  const diffColor = data?.difficulty ? DIFFICULTY_COLOR[data.difficulty] ?? "#fff" : "#fff";

  return (
    <div>
      <button
        onClick={() => { setOpened(!opened); load(); }}
        className="text-[#a8ff3e] text-xs underline"
      >
        {opened ? "✕ סגור" : "▶ פרטי תרגיל"}
      </button>

      {opened && (
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 mt-3">
          {loading && <div className="text-white/40 text-sm">טוען...</div>}
          {data && !loading && (
            <>
              {hasInfo ? (
                <>
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

                  {data.description && (
                    <p className="text-white/60 text-xs leading-relaxed mb-3">{data.description}</p>
                  )}

                  {data.instructions?.length > 0 && (
                    <>
                      <div className="text-white/70 text-xs font-bold mb-1">הוראות ביצוע:</div>
                      <ol className="text-white/50 text-xs space-y-1 list-decimal list-inside">
                        {data.instructions.slice(0, 4).map((inst: string, i: number) => (
                          <li key={i}>{inst}</li>
                        ))}
                      </ol>
                    </>
                  )}

                  {!showVideo && (
                    <button
                      onClick={handleShowVideo}
                      className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 text-xs font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-2 mt-3"
                    >
                      ▶ הצג סרטון הדגמה ב-YouTube
                    </button>
                  )}

                  {showVideo && (
                    <div className="mt-3">
                      {loadingVideo && (
                        <div className="text-white/40 text-xs text-center py-4">טוען סרטון...</div>
                      )}
                      {videoData?.videoId && !loadingVideo && (
                        <div className="rounded-xl overflow-hidden">
                          <iframe
                            width="100%"
                            height="200"
                            src={`https://www.youtube.com/embed/${videoData.videoId}`}
                            title={videoData.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="rounded-xl"
                          />
                        </div>
                      )}
                      {videoData && !videoData.videoId && !loadingVideo && (
                        <div className="text-white/40 text-xs text-center py-2">
                          לא נמצא סרטון לתרגיל זה
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-white/40 text-sm text-center">לא נמצא מידע לתרגיל זה</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
