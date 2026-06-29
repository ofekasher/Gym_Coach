"use client";
import { useState } from "react";
import { X, Play } from "lucide-react";

interface Props {
  exerciseName: string;
  muscleGroup: string;
  videoId?: string | null;
}

export function ExerciseAnimationButton({ exerciseName, muscleGroup, videoId }: Props) {
  const [open, setOpen] = useState(false);

  const vid = videoId || EXERCISE_VIDEO_MAP[exerciseName] || getFallbackVideo(muscleGroup);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="הדגמת תרגיל"
        style={{
          background: "rgba(139,92,246,0.13)",
          border: "1px solid rgba(139,92,246,0.32)",
          borderRadius: 10,
          padding: "6px 13px",
          color: "#A78BFA",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontSize: 12,
          fontWeight: 700,
          transition: "all 0.15s",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = "rgba(139,92,246,0.24)";
          el.style.borderColor = "rgba(139,92,246,0.6)";
          el.style.boxShadow = "0 0 12px rgba(139,92,246,0.3)";
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = "rgba(139,92,246,0.13)";
          el.style.borderColor = "rgba(139,92,246,0.32)";
          el.style.boxShadow = "none";
        }}
      >
        <Play style={{ width: 12, height: 12 }} />
        הדגמה
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.88)",
            backdropFilter: "blur(14px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
            animation: "fadeInBg 0.18s ease",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#0C0E16",
              border: "1px solid rgba(139,92,246,0.22)",
              borderRadius: 24,
              width: "100%",
              maxWidth: 380,
              overflow: "hidden",
              animation: "slideUp 0.22s cubic-bezier(.34,1.56,.64,1)",
              boxShadow: "0 40px 100px rgba(0,0,0,0.8), 0 0 50px rgba(139,92,246,0.1)",
            }}
          >
            {/* Header */}
            <div style={{
              padding: "15px 18px 12px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "linear-gradient(135deg,rgba(91,33,182,0.1),transparent)",
            }}>
              <div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>{exerciseName}</div>
                <div style={{
                  marginTop: 3, fontSize: 11, color: "#A78BFA",
                  background: "rgba(139,92,246,0.14)",
                  display: "inline-block",
                  padding: "2px 9px", borderRadius: 20, fontWeight: 600,
                }}>
                  {muscleGroup}
                </div>
              </div>
              <button onClick={() => setOpen(false)} style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                width: 34, height: 34, cursor: "pointer",
                color: "rgba(255,255,255,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Video */}
            <div style={{ aspectRatio: "16/9", background: "#000" }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&mute=0&rel=0&modestbranding=1&loop=1&playlist=${vid}`}
                style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Footer */}
            <div style={{
              padding: "10px 18px 14px",
              fontSize: 11, color: "rgba(255,255,255,0.28)",
              textAlign: "center",
              borderTop: "1px solid rgba(255,255,255,0.04)",
            }}>
              לחץ מחוץ לחלון לסגירה
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInBg  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp   { from{opacity:0;transform:translateY(28px) scale(0.96)} to{opacity:1;transform:none} }
      `}</style>
    </>
  );
}

/* ─── Video map: exercise name → YouTube ID ─────────────────────────────── */
// סרטוני אנימציה אנטומית תלת-ממדית (Muscle & Motion style)
export const EXERCISE_VIDEO_MAP: Record<string, string> = {
  // חזה
  "לחיצת חזה עם מוט":                   "SCVCLChPQEY",
  "לחיצת חזה":                           "SCVCLChPQEY",
  "לחיצת חזה בשיפוע חיובי עם משקולות": "8iPEnn-ltC8",
  "לחיצת חזה בשיפוע":                   "8iPEnn-ltC8",
  "לחיצת חזה בסמית מאשין":              "Vc29oNE-1OI",
  "לחיצה צרה עם משקולות על רצפה":       "K4qRITKSqbU",
  "מסור על ספסל עם משקולת יד":          "VHrdVShDFZY",
  "פול אובר":                            "VHrdVShDFZY",

  // כתפיים
  "לחיצת כתפיים מעל הראש עם דמבלים":   "qEwKCR5JCog",
  "לחיצת כתפיים":                        "qEwKCR5JCog",
  "לחיצת כתפיים בסמית מאשין":           "O-MwPUQBCrU",
  "לחיצת כתפיים עם משקולת בישיבה":      "6Z15_WbXBkE",
  "הרחקת זרועות לצדדים עם דמבלים":      "3VcKaXpzqRo",
  "הרחקת זרועות לצדדים בשיפוע חיובי":   "WQjFPd-qkYA",
  "חתירה ישרה בעמידה":                   "e9l-PmHuQqo",
  "הרמת כתפיים עם דמבלים":              "NAqCFloHxDE",
  "ג'רק פוש פרס":                       "O-MwPUQBCrU",
  "כפיפת כתף עם דמבל":                  "sOgCEFEcOaY",

  // גב
  "לט פולדאון":                          "CAwf7n6Luuc",
  "חתירה בהטיית גוף עם מוט":            "6FZHhZeejl8",
  "חתירה בהטיית גוף עם דמבלים":         "roCP0_wnYjM",
  "חתירה צרה בקייבל קרוס":              "GZbfZ033f74",
  "חתירה באחיזה צרה — טי בר":           "kBWAon7ItDw",
  "חתירה בהטיית גוף בסמית מאשין":       "YrSA1N6H5m8",
  "משיכת כבל לצד הראש":                 "CAwf7n6Luuc",
  "דדליפט":                              "ytGaGIn3SjE",
  "דדליפט רומני":                        "UTfHRONDDHk",
  "סינגל לג דדליפט עם קטלבל":           "lCqRpYGFFT0",

  // רגליים
  "סקוואט עם מוט":                       "bEv6CCg2BC8",
  "סקוואט":                              "bEv6CCg2BC8",
  "סקוואט בסמית מאשין":                 "nSJ9U3XWXE0",
  "פרונט סקוואט עם קטלבל":              "bJTzeZPvFsM",
  "סקוואט קדמי עם דמבל":                "bEv6CCg2BC8",
  "סקוואט בוקס":                         "bEv6CCg2BC8",
  "לאנג'ים":                             "QOVaHwm-Q6U",
  "פשיטת ירך (לג אקסטנשן)":             "YyvSfVjQeL0",
  "כפיפת ברכיים (לג קרל)":              "1Tq3QdYUuHs",
  "פשיטת ירך בשכיבה על ספסל":           "1Tq3QdYUuHs",
  "פשיטת ירך בקייבל קרוס":              "1Tq3QdYUuHs",
  "פשיטת גב עם מוט (גוד מורנינג)":      "YA-h3n9L5N0",
  "עלייה על בהונות בסמית מאשין":         "gUtCDMomDYs",
  "הרמות רגליים על ספסל":               "l4kQd9eWclE",
  "קירוב ברכיים לחזה":                  "pBsqNckfB9I",

  // זרועות
  "כפיפת מרפקים עם מוט":                "ykJmrZ5v0Oo",
  "פטישים עם דמבלים":                   "zC3nLlEvin4",
  "פטישים על ספסל שיפוע חיובי":         "zC3nLlEvin4",
  "כפיפת מרפק בכיסא כומר":              "soxrZlIl35U",
  "פשיטת מרפקים עם חבל בקייבל":         "vB5OHsJ3EME",
  "פשיטת מרפקים מאחורי הראש עם דמבל":  "d_KZxkY_0cM",
  "ג'קסונים פשיטת מרפק על ספסל":        "d_KZxkY_0cM",
  "לחיצה צרפתית עם דמבל":               "d_KZxkY_0cM",
  "כיפוף פרק כף היד":                   "iP2fjx48oS8",

  // בטן
  "פלאנק":                               "pSHjTRCQxIw",
  "כפיפות בטן":                          "Xyd_fa5zoEU",
  "הרמות רגליים":                        "l4kQd9eWclE",
  "סיבוב פלטת משקולות (הגה)":           "eGZoFkNRzgk",
};

/* ─── Fallback by muscle group ───────────────────────────────────────────── */
function getFallbackVideo(muscleGroup: string): string {
  if (muscleGroup.includes("חזה"))    return "SCVCLChPQEY";
  if (muscleGroup.includes("גב"))     return "ytGaGIn3SjE";
  if (muscleGroup.includes("כתפיים")) return "qEwKCR5JCog";
  if (muscleGroup.includes("רגליים")) return "bEv6CCg2BC8";
  if (muscleGroup.includes("זרועות")) return "ykJmrZ5v0Oo";
  if (muscleGroup.includes("בטן"))    return "pSHjTRCQxIw";
  return "bEv6CCg2BC8";
}
