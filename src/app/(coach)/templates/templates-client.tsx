"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Dumbbell, Send, Loader2, Check } from "lucide-react";
import { getMuscleGymPhoto } from "@/lib/gym-photos";
import { useToast } from "@/hooks/use-toast";

const GREEN = "#b6ff4a";

const CATEGORY_LABELS: Record<string, string> = {
  FBW: "כל הגוף", UPPER_LOWER: "עליון/תחתון", PPL: "Push/Pull/Legs", AB: "A/B", CUSTOM: "מותאם אישית",
};
const CATEGORY_COLORS: Record<string, string> = {
  FBW: "#3B82F6", UPPER_LOWER: "#F59E0B", PPL: GREEN, AB: "#8B5CF6", CUSTOM: "#888",
};
const AVATAR_COLORS = [GREEN, "#8B5CF6", "#3B82F6", "#F59E0B", "#F87171"];

interface Template {
  id: string;
  name: string;
  category: string;
  days: { name: string; dayLabel: string; exercises: { exerciseId: string; name: string; sets: number; reps: string }[] }[];
  createdAt: string;
}

interface Trainee {
  id: string;
  name: string | null;
}

export function TemplatesClient({ templates: initial, trainees, coachId }: { templates: Template[]; trainees: Trainee[]; coachId: string }) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState(initial);
  const [assignFor, setAssignFor] = useState<Template | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);

  const remove = async (id: string) => {
    if (!confirm("למחוק את התבנית?")) return;
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch(`/api/templates/${id}`, { method: "DELETE" });
    } catch {
      toast({ variant: "destructive", title: "שגיאה במחיקה" });
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sendAssign = async () => {
    if (!assignFor || selected.size === 0) return;
    setSending(true);
    try {
      const sessions = assignFor.days.map((d) => ({
        name: d.name,
        dayLabel: d.dayLabel,
        exercises: d.exercises.map((e) => ({ exerciseId: e.exerciseId, sets: e.sets, reps: e.reps })),
      }));
      await Promise.all(
        Array.from(selected).map((traineeId) =>
          fetch("/api/workout/plans", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ traineeId, coachId, name: assignFor.name, template: assignFor.category, sessions }),
          })
        )
      );
      toast({ title: `התבנית נשלחה ל-${selected.size} מתאמנים!` });
      setAssignFor(null);
      setSelected(new Set());
    } catch {
      toast({ variant: "destructive", title: "שגיאה בשליחה" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-5 min-h-screen bg-[#070707]" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[26px] font-black text-white" style={{ letterSpacing: "-0.8px" }}>תבניות אימון</h1>
          <p className="text-[12.5px] mt-1 font-medium" style={{ color: "#888" }}>{templates.length} תבניות שמורות</p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        <Link href="/templates/new">
          <div
            className="flex flex-col items-center justify-center text-center flex-shrink-0 cursor-pointer"
            style={{ border: "1.5px dashed #333", borderRadius: 18, padding: 22, minHeight: 210, width: 220 }}
          >
            <div className="w-[52px] h-[52px] rounded-[15px] flex items-center justify-center mb-3.5" style={{ background: "rgba(182,255,74,0.12)" }}>
              <Plus size={26} style={{ color: GREEN }} strokeWidth={2.4} />
            </div>
            <div className="text-[16px] font-extrabold text-white">תבנית חדשה</div>
            <div className="text-[12.5px] mt-1.5" style={{ color: "#888" }}>בנה תוכנית מותאמת אישית</div>
          </div>
        </Link>

        {templates.map((t) => {
          const exCount = t.days.reduce((s, d) => s + d.exercises.length, 0);
          const color = CATEGORY_COLORS[t.category] ?? "#888";
          return (
            <div key={t.id} className="bg-[#141414] border border-[#1e1e1e] rounded-[18px] overflow-hidden flex-shrink-0" style={{ width: 220 }}>
              <div className="relative h-24 bg-[#0d0d0d] overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: `url(${getMuscleGymPhoto(undefined)})` }} />
                <span
                  className="absolute top-2.5 right-2.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(0,0,0,0.6)", color }}
                >
                  {CATEGORY_LABELS[t.category] ?? t.category}
                </span>
              </div>
              <div className="p-[18px]">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[17px] font-extrabold text-white">{t.name}</h3>
                  <button onClick={() => remove(t.id)} className="flex-shrink-0" style={{ color: "#ff5c5c" }}>
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2 mb-3.5">
                  <Dumbbell size={13} style={{ color: "#888" }} />
                  <span className="text-[12.5px]" style={{ color: "#aaa" }}>{t.days.length} ימי אימון · {exCount} תרגילים</span>
                </div>
                <button
                  onClick={() => { setAssignFor(t); setSelected(new Set()); }}
                  className="w-full rounded-[10px] py-2 text-[12.5px] font-extrabold flex items-center justify-center gap-1.5"
                  style={{ background: GREEN, color: "#0a0a0a" }}
                >
                  <Send size={13} /> שלח למתאמנים
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {templates.length === 0 && (
        <p className="text-sm" style={{ color: "#666" }}>עדיין אין תבניות שמורות — לחץ על "תבנית חדשה" כדי להתחיל.</p>
      )}

      {/* Assign modal — matches design's ASSIGN MODAL */}
      {assignFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5" style={{ background: "rgba(0,0,0,0.66)" }} onClick={() => setAssignFor(null)}>
          <div className="w-full" style={{ maxWidth: 420, background: "#0f0f0f", border: "1px solid #222", borderRadius: 20, padding: 28 }} onClick={(e) => e.stopPropagation()}>
            <h2 className="text-[21px] font-black text-white mb-1">שליחה למתאמנים</h2>
            <p className="text-[13px] mb-5" style={{ color: "#888" }}>בחר למי לשלוח את "{assignFor.name}".</p>
            {trainees.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: "#666" }}>אין מתאמנים עדיין</p>
            ) : (
              <div className="flex flex-col gap-2 mb-4">
                {trainees.map((t, i) => {
                  const isSelected = selected.has(t.id);
                  return (
                    <div
                      key={t.id}
                      onClick={() => toggleSelect(t.id)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer"
                      style={{ background: isSelected ? "rgba(182,255,74,0.08)" : "#141414", border: `1px solid ${isSelected ? GREEN : "#1e1e1e"}` }}
                    >
                      <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center font-extrabold text-[15px] flex-shrink-0" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length], color: "#0a0a0a" }}>
                        {t.name?.[0] ?? "?"}
                      </div>
                      <span className="flex-1 text-[14.5px] font-bold text-white">{t.name}</span>
                      {isSelected && <Check size={16} style={{ color: GREEN }} />}
                    </div>
                  );
                })}
              </div>
            )}
            <button
              onClick={sendAssign}
              disabled={sending || selected.size === 0}
              className="w-full rounded-xl py-3.5 font-black text-[15px] flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: GREEN, color: "#0a0a0a" }}
            >
              {sending && <Loader2 size={16} className="animate-spin" />} שלח תבנית
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
