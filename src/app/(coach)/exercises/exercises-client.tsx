"use client";
import { useState, useMemo } from "react";
import { Search, Plus, Trash2, Loader2, ChevronDown, Dumbbell, Zap, Filter, X, Video, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { ExerciseGifCard } from "@/components/shared/ExerciseGifCard";

const MUSCLE_GROUPS = ["חזה", "גב", "רגליים", "כתפיים", "זרועות", "בטן", "גוף מלא", "ישבן", "גב תחתון"];
const DIFFICULTIES = ["קל", "בינוני", "מתקדם"];

const DIFF_COLOR: Record<string, string> = {
  קל: "#22c55e",
  בינוני: "#f59e0b",
  מתקדם: "#ef4444",
};

// Converts a pasted YouTube/Vimeo watch URL into its embeddable form. Returns null for
// anything else (own-hosted video links are played directly via a <video> tag instead).
function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

export function ExercisesClient({ exercises: initial, coachId }: { exercises: any[]; coachId: string }) {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [exercises, setExercises] = useState(initial);
  const [search, setSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("הכל");
  const [equipFilter, setEquipFilter] = useState("הכל");
  const [diffFilter, setDiffFilter] = useState("הכל");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", muscleGroup: "", equipment: "", difficulty: "בינוני", description: "" });
  const [videoModal, setVideoModal] = useState<{ id: string; name: string; videoUrl: string } | null>(null);
  const [videoInput, setVideoInput] = useState("");
  const [savingVideo, setSavingVideo] = useState(false);

  const openVideoModal = (ex: any) => {
    setVideoModal({ id: ex.id, name: ex.name, videoUrl: ex.videoUrl ?? "" });
    setVideoInput(ex.videoUrl ?? "");
  };

  const saveVideo = async () => {
    if (!videoModal) return;
    setSavingVideo(true);
    try {
      const res = await fetch(`/api/exercises/${videoModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: videoInput.trim() }),
      });
      if (res.ok) {
        const updated = await res.json();
        setExercises((prev) => prev.map((e) => (e.id === updated.id ? { ...e, videoUrl: updated.videoUrl } : e)));
        setVideoModal({ ...videoModal, videoUrl: videoInput.trim() });
        toast({ title: "✓ סרטון הדגמה נשמר" });
      } else {
        toast({ variant: "destructive", title: "שמירת הסרטון נכשלה" });
      }
    } finally {
      setSavingVideo(false);
    }
  };

  // unique equipment list
  const equipmentList = useMemo(() => {
    const s = new Set(exercises.map(e => e.equipment).filter(Boolean));
    return Array.from(s).sort();
  }, [exercises]);

  const filtered = useMemo(() => exercises.filter(ex => {
    const q = search.toLowerCase();
    const matchSearch = !q || ex.name.toLowerCase().includes(q) || (ex.description || "").toLowerCase().includes(q);
    const matchMuscle = muscleFilter === "הכל" || ex.muscleGroup === muscleFilter;
    const matchEquip = equipFilter === "הכל" || ex.equipment === equipFilter;
    const matchDiff = diffFilter === "הכל" || ex.difficulty === diffFilter;
    return matchSearch && matchMuscle && matchEquip && matchDiff;
  }), [exercises, search, muscleFilter, equipFilter, diffFilter]);

  const grouped = useMemo(() => filtered.reduce((acc: Record<string, any[]>, ex) => {
    if (!acc[ex.muscleGroup]) acc[ex.muscleGroup] = [];
    acc[ex.muscleGroup].push(ex);
    return acc;
  }, {}), [filtered]);

  const hasFilters = muscleFilter !== "הכל" || equipFilter !== "הכל" || diffFilter !== "הכל" || search;

  const addExercise = async () => {
    if (!form.name || !form.muscleGroup) return toast({ variant: "destructive", title: "יש למלא שם ושריר" });
    setSaving(true);
    try {
      const res = await fetch("/api/exercises", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, coachId, isCustom: true }) });
      if (res.ok) {
        const data = await res.json();
        setExercises([...exercises, data]);
        setForm({ name: "", muscleGroup: "", equipment: "", difficulty: "בינוני", description: "" });
        setShowAdd(false);
        toast({ title: "✓ תרגיל נוסף בהצלחה" });
      }
    } finally { setSaving(false); }
  };

  const deleteExercise = async (id: string, name: string) => {
    const ok = await confirm({
      title: `למחוק את "${name}"?`,
      description: "התרגיל יימחק לצמיתות ולא ניתן יהיה לשחזר אותו.",
      confirmLabel: "מחק", danger: true,
    });
    if (!ok) return;
    try {
      const res = await fetch(`/api/exercises/${id}`, { method: "DELETE" });
      if (res.ok) { setExercises(exercises.filter(ex => ex.id !== id)); toast({ title: "תרגיל נמחק" }); }
      else toast({ variant: "destructive", title: "מחיקת התרגיל נכשלה" });
    } catch {
      toast({ variant: "destructive", title: "שגיאת רשת — נסה שוב" });
    }
  };

  const INPUT_S = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    height: 44,
    padding: "0 14px",
    color: "#fff",
    fontSize: 14,
    width: "100%",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const Chip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button onClick={onClick} style={{
      background: active ? "#b6ff4a" : "rgba(255,255,255,0.04)",
      color: active ? "#0a0a0a" : "#A1A1AA",
      border: `1px solid ${active ? "#b6ff4a" : "rgba(255,255,255,0.08)"}`,
      borderRadius: 999,
      padding: "5px 13px",
      fontSize: 12,
      fontWeight: active ? 700 : 500,
      cursor: "pointer",
      whiteSpace: "nowrap" as const,
      transition: "all 0.15s",
    }}>
      {label}
    </button>
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }} dir="rtl">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 800, margin: 0 }}>ספריית תרגילים</h1>
          <p style={{ color: "#71717A", fontSize: 13, margin: "4px 0 0" }}>
            {filtered.length} תרגילים {hasFilters ? `(מתוך ${exercises.length})` : "עם הסברים מלאים וסרטוני הדגמה"}
          </p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{
          background: "#b6ff4a",
          color: "#0a0a0a",
          border: "none",
          borderRadius: 999,
          padding: "10px 20px",
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          boxShadow: "0 4px 20px rgba(182,255,74,0.4)",
        }}>
          <Plus style={{ width: 16, height: 16 }} /> הוסף תרגיל
        </button>
      </div>

      {/* Add exercise form */}
      {showAdd && (
        <div style={{ background: "#141414", border: "1px solid rgba(182,255,74,0.2)", borderRadius: 20, padding: 22, marginBottom: 20 }}>
          <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 16 }}>תרגיל חדש</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ color: "#71717A", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 6 }}>שם התרגיל *</label>
              <input style={INPUT_S} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="שם התרגיל" />
            </div>
            <div>
              <label style={{ color: "#71717A", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 6 }}>קבוצת שרירים *</label>
              <select style={{ ...INPUT_S, cursor: "pointer" }} value={form.muscleGroup} onChange={e => setForm({ ...form, muscleGroup: e.target.value })}>
                <option value="">בחר שריר</option>
                {MUSCLE_GROUPS.map(mg => <option key={mg} value={mg}>{mg}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: "#71717A", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 6 }}>ציוד</label>
              <input style={INPUT_S} value={form.equipment} onChange={e => setForm({ ...form, equipment: e.target.value })} placeholder="מוט, דמבלים..." />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: "#71717A", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 6 }}>תיאור</label>
            <input style={INPUT_S} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="הוראות ביצוע..." />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={addExercise} disabled={saving} style={{ background: "#b6ff4a", color: "#0a0a0a", border: "none", borderRadius: 999, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              {saving ? <Loader2 style={{ width: 16, height: 16 }} /> : null} שמור
            </button>
            <button onClick={() => setShowAdd(false)} style={{ background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999, padding: "10px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>ביטול</button>
          </div>
        </div>
      )}

      {/* Search + Filters */}
      <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: "16px 18px", marginBottom: 22 }}>
        {/* Search bar */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          <Search style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#52525B" }} />
          <input
            style={{ ...INPUT_S, paddingRight: 42, background: "rgba(255,255,255,0.03)" }}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חיפוש תרגיל לפי שם..."
          />
          {search && (
            <button aria-label="נקה חיפוש" onClick={() => setSearch("")} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#52525B", display: "flex" }}>
              <X style={{ width: 14, height: 14 }} />
            </button>
          )}
        </div>

        {/* Filter rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Muscle */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#52525B", fontSize: 11, fontWeight: 700, minWidth: 70 }}>שריר</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Chip label="הכל" active={muscleFilter === "הכל"} onClick={() => setMuscleFilter("הכל")} />
              {MUSCLE_GROUPS.map(mg => (
                <Chip key={mg} label={mg} active={muscleFilter === mg} onClick={() => setMuscleFilter(mg === muscleFilter ? "הכל" : mg)} />
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#52525B", fontSize: 11, fontWeight: 700, minWidth: 70 }}>ציוד</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Chip label="הכל" active={equipFilter === "הכל"} onClick={() => setEquipFilter("הכל")} />
              {equipmentList.map(eq => (
                <Chip key={eq} label={eq} active={equipFilter === eq} onClick={() => setEquipFilter(eq === equipFilter ? "הכל" : eq)} />
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#52525B", fontSize: 11, fontWeight: 700, minWidth: 70 }}>רמה</span>
            <div style={{ display: "flex", gap: 6 }}>
              <Chip label="הכל" active={diffFilter === "הכל"} onClick={() => setDiffFilter("הכל")} />
              {DIFFICULTIES.map(d => (
                <Chip key={d} label={d} active={diffFilter === d} onClick={() => setDiffFilter(d === diffFilter ? "הכל" : d)} />
              ))}
            </div>
          </div>
        </div>

        {/* Clear filters */}
        {hasFilters && (
          <div style={{ marginTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 12 }}>
            <button onClick={() => { setSearch(""); setMuscleFilter("הכל"); setEquipFilter("הכל"); setDiffFilter("הכל"); }} style={{
              background: "none", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 999, padding: "4px 12px",
              color: "#F87171", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
            }}>
              <X style={{ width: 11, height: 11 }} /> נקה סינון
            </button>
          </div>
        )}
      </div>

      {/* Empty state */}
      {Object.keys(grouped).length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#52525B" }}>
          <Dumbbell style={{ width: 40, height: 40, margin: "0 auto 12px", opacity: 0.4 }} />
          <p style={{ fontSize: 15, fontWeight: 600 }}>לא נמצאו תרגילים</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>נסה לשנות את הסינון</p>
        </div>
      )}

      {/* Grouped exercises */}
      {Object.entries(grouped).map(([muscle, exs]) => (
        <div key={muscle} style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ color: "#A78BFA", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>{muscle}</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
            <span style={{ color: "#52525B", fontSize: 11 }}>{exs.length} תרגילים</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 10 }}>
            {exs.map(ex => (
              <div key={ex.id} style={{
                background: "#141414",
                border: `1px solid ${expanded === ex.id ? "rgba(182,255,74,0.35)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 16,
                overflow: "hidden",
                transition: "border-color 0.15s",
              }}>
                {/* Card header */}
                <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#F4F4F5", fontSize: 14, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ex.name}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                      {ex.equipment && (
                        <span style={{ fontSize: 10, color: "#71717A", background: "rgba(255,255,255,0.05)", borderRadius: 6, padding: "2px 7px" }}>{ex.equipment}</span>
                      )}
                      {ex.difficulty && (
                        <span style={{ fontSize: 10, color: DIFF_COLOR[ex.difficulty] ?? "#A1A1AA", background: `${DIFF_COLOR[ex.difficulty]}18`, borderRadius: 6, padding: "2px 7px", fontWeight: 700 }}>{ex.difficulty}</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setExpanded(expanded === ex.id ? null : ex.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#52525B", padding: 4, flexShrink: 0 }}
                  >
                    <ChevronDown style={{ width: 16, height: 16, transform: expanded === ex.id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                  </button>
                </div>

                {/* Expanded details */}
                {expanded === ex.id && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "14px 16px", background: "rgba(0,0,0,0.2)" }}>
                    {ex.description && (
                      <p style={{ color: "#A1A1AA", fontSize: 12, lineHeight: 1.6, marginBottom: 10 }}>{ex.description}</p>
                    )}
                    {ex.howTo && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ color: "#b6ff4a", fontSize: 10, fontWeight: 800, textTransform: "uppercase", marginBottom: 5 }}>ביצוע</div>
                        <p style={{ color: "#A1A1AA", fontSize: 12, lineHeight: 1.6 }}>{ex.howTo}</p>
                      </div>
                    )}
                    {ex.tips?.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ color: "#b6ff4a", fontSize: 10, fontWeight: 800, textTransform: "uppercase", marginBottom: 5 }}>טיפים</div>
                        {ex.tips.map((tip: string, i: number) => (
                          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
                            <span style={{ color: "#b6ff4a" }}>•</span>
                            <span style={{ color: "#A1A1AA", fontSize: 12 }}>{tip}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ marginBottom: 8 }}>
                      <ExerciseGifCard exerciseName={ex.name} />
                    </div>

                    <button
                      onClick={() => openVideoModal(ex)}
                      style={{
                        width: "100%", background: "rgba(182,255,74,0.08)", border: "1px solid rgba(182,255,74,0.2)",
                        borderRadius: 10, padding: "9px 12px", color: "#b6ff4a", fontSize: 12.5, fontWeight: 700,
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 8,
                      }}
                    >
                      <Video size={14} /> {ex.videoUrl ? "צפה בסרטון הדגמה" : "הוסף סרטון הדגמה"}
                    </button>

                    {ex.isCustom && ex.coachId === coachId && (
                      <button aria-label={`מחק תרגיל: ${ex.name}`} onClick={() => deleteExercise(ex.id, ex.name)} style={{
                        marginTop: 8,
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.15)",
                        color: "#F87171",
                        borderRadius: 8,
                        padding: "6px 12px",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}>
                        <Trash2 style={{ width: 12, height: 12 }} /> מחק תרגיל
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Demo-video modal — coach pastes a YouTube/Vimeo link, persisted per exercise.
          Never scrapes/embeds MuscleWiki media (their terms forbid it) — only links out. */}
      {videoModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setVideoModal(null)}>
          <div style={{ background: "#141414", border: "1px solid #2a2a2a", borderRadius: 20, padding: 24, width: 480, maxWidth: "100%" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ color: "#fff", fontSize: 17, fontWeight: 800 }}>סרטון הדגמה — {videoModal.name}</h3>
              <button onClick={() => setVideoModal(null)} style={{ background: "#1c1c1c", border: "1px solid #2a2a2a", borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={15} style={{ color: "#fff" }} />
              </button>
            </div>

            {videoModal.videoUrl && (
              <div style={{ marginBottom: 14, borderRadius: 12, overflow: "hidden", background: "#000", aspectRatio: "16/9" }}>
                {toEmbedUrl(videoModal.videoUrl) ? (
                  <iframe src={toEmbedUrl(videoModal.videoUrl)!} style={{ width: "100%", height: "100%", border: "none" }} allow="autoplay; encrypted-media" allowFullScreen />
                ) : (
                  <video src={videoModal.videoUrl} controls style={{ width: "100%", height: "100%" }} />
                )}
              </div>
            )}

            <label style={{ color: "#71717A", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 6 }}>קישור לסרטון (YouTube / Vimeo / קישור ישיר)</label>
            <input
              value={videoInput}
              onChange={(e) => setVideoInput(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              dir="ltr"
              style={{ ...INPUT_S, marginBottom: 12, textAlign: "left" }}
            />
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <button onClick={saveVideo} disabled={savingVideo} style={{ background: "#b6ff4a", color: "#0a0a0a", border: "none", borderRadius: 999, padding: "10px 20px", fontWeight: 700, fontSize: 13.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                {savingVideo ? <Loader2 size={14} className="animate-spin" /> : null} שמור
              </button>
              {videoModal.videoUrl && (
                <button onClick={() => { setVideoInput(""); }} style={{ background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999, padding: "10px 20px", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>
                  הסר קישור
                </button>
              )}
            </div>

            <a
              href={`https://musclewiki.com/search?q=${encodeURIComponent(videoModal.name)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 6, color: "#888", fontSize: 12.5, textDecoration: "none" }}
            >
              <ExternalLink size={13} /> חפש הדגמה ב-MuscleWiki
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
