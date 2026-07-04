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
