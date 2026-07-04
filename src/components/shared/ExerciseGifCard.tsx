"use client";
import { useState } from "react";

interface Props {
  exerciseName: string;
}

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

  return (
    <div>
      <button
        onClick={() => { setOpened(!opened); load(); }}
        className="text-[#a8ff3e] text-xs underline"
      >
        {opened ? "הסתר הדגמה" : "▶ הצג הדגמה"}
      </button>

      {opened && (
        <div className="mt-3 bg-white/[0.04] border border-white/[0.08] rounded-xl p-4">
          {loading && <div className="text-white/40 text-sm">טוען...</div>}
          {data && !loading && (
            <>
              {data.gifUrl && (
                <img
                  src={data.gifUrl}
                  alt={exerciseName}
                  className="w-48 h-48 object-contain rounded-lg mx-auto mb-3"
                />
              )}
              {data.target && (
                <div className="text-xs text-white/60 mb-1">
                  שריר ראשי: <span className="text-[#a8ff3e]">{data.target}</span>
                </div>
              )}
              {data.equipment && (
                <div className="text-xs text-white/60 mb-2">
                  ציוד: <span className="text-white/80">{data.equipment}</span>
                </div>
              )}
              {data.instructions?.length > 0 && (
                <ol className="text-xs text-white/60 space-y-1 list-decimal list-inside">
                  {data.instructions.slice(0, 3).map((inst: string, i: number) => (
                    <li key={i}>{inst}</li>
                  ))}
                </ol>
              )}
              {!data.gifUrl && !data.target && (
                <div className="text-white/40 text-sm text-center">לא נמצאה הדגמה לתרגיל זה</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
