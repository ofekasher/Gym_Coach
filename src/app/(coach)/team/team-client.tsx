"use client";
import { useState } from "react";
import { UserPlus, X, Loader2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GREEN = "#b6ff4a";
const AVATAR_COLORS = [GREEN, "#8B5CF6", "#3B82F6", "#F59E0B", "#F87171"];

interface CoachPermission {
  canManageTrainees: boolean;
  canCreatePlans: boolean;
  canManageExercises: boolean;
  canMessage: boolean;
  canManageSchedule: boolean;
  canManagePayments: boolean;
}

interface Coach {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  coachPermission: CoachPermission | null;
}

const PERMISSION_FIELDS: { key: keyof CoachPermission; label: string }[] = [
  { key: "canManageTrainees", label: "צפייה/הוספת מתאמנים" },
  { key: "canCreatePlans", label: "יצירת תוכניות" },
  { key: "canManageExercises", label: "ספריית תרגילים" },
  { key: "canMessage", label: "הודעות" },
  { key: "canManageSchedule", label: "לוח זמנים" },
  { key: "canManagePayments", label: "צפייה/ניהול תשלומים" },
];

const DEFAULT_PERMISSION: CoachPermission = {
  canManageTrainees: true,
  canCreatePlans: true,
  canManageExercises: true,
  canMessage: true,
  canManageSchedule: true,
  canManagePayments: false,
};

function PermToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      aria-pressed={value}
      style={{
        background: value ? GREEN : "#2a2a2a", border: "none", borderRadius: 999,
        width: 40, height: 22, position: "relative", cursor: "pointer", flexShrink: 0,
      }}
    >
      <span style={{ position: "absolute", top: 2, left: value ? 20 : 2, width: 18, height: 18, borderRadius: "50%", background: value ? "#0a0a0a" : "#fff", transition: "left 0.15s" }} />
    </button>
  );
}

export function TeamClient({ coaches: initial }: { coaches: Coach[] }) {
  const { toast } = useToast();
  const [coaches, setCoaches] = useState(initial);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sentLink, setSentLink] = useState<string | null>(null);

  const togglePermission = async (coachId: string, field: keyof CoachPermission, value: boolean) => {
    setCoaches(prev => prev.map(c => c.id === coachId ? { ...c, coachPermission: { ...(c.coachPermission ?? DEFAULT_PERMISSION), [field]: value } } : c));
    const res = await fetch(`/api/coach/team/permissions/${coachId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (!res.ok) {
      toast({ variant: "destructive", title: "שמירת ההרשאה נכשלה" });
      setCoaches(prev => prev.map(c => c.id === coachId ? { ...c, coachPermission: { ...(c.coachPermission ?? DEFAULT_PERMISSION), [field]: !value } } : c));
    }
  };

  const invite = async () => {
    if (!email.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: "COACH" }),
      });
      const data = await res.json();
      if (res.ok) {
        setSentLink(data.inviteUrl);
        toast({ title: "הזמנת מאמן נשלחה!" });
      } else {
        toast({ variant: "destructive", title: data.error ?? "שגיאה" });
      }
    } finally {
      setSending(false);
    }
  };

  const close = () => {
    setOpen(false);
    setEmail("");
    setSentLink(null);
  };

  return (
    <div className="space-y-5 min-h-screen bg-[#070707]" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[26px] font-black text-white" style={{ letterSpacing: "-0.8px" }}>צוות מאמנים</h1>
          <p className="text-[12.5px] mt-1 font-medium" style={{ color: "#888" }}>{coaches.length} מאמנים בצוות שלך</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 font-extrabold px-4 py-2.5 rounded-xl text-sm"
          style={{ background: GREEN, color: "#0a0a0a" }}
        >
          <UserPlus size={16} /> הוסף מאמן
        </button>
      </div>

      <div className="flex items-center gap-4 bg-[#141414] border border-[#1e1e1e] rounded-2xl px-[18px] py-3.5">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl flex-shrink-0" style={{ background: GREEN, color: "#0a0a0a" }}>
          ל
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] font-extrabold text-white truncate">ליאור זיו</h3>
          <div className="text-[12.5px] mt-0.5" style={{ color: "#888" }}>בעלים · כל ההרשאות</div>
        </div>
        <span className="text-[10.5px] font-extrabold px-2.5 py-[3px] rounded-full flex-shrink-0" style={{ color: GREEN, background: "rgba(182,255,74,0.12)" }}>
          בעלים
        </span>
      </div>

      {coaches.length === 0 ? (
        <div className="bg-[#111] border border-[#1e1e1e] rounded-[18px] text-center py-16">
          <p className="text-sm mb-4" style={{ color: "#666" }}>עדיין אין מאמנים נוספים בצוות שלך</p>
          <button onClick={() => setOpen(true)} className="inline-block font-bold px-4 py-2 rounded-xl text-sm" style={{ background: GREEN, color: "#0a0a0a" }}>
            הוסף מאמן ראשון/ה
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {coaches.map((c, i) => {
            const perm = c.coachPermission ?? DEFAULT_PERMISSION;
            return (
              <div key={c.id} className="bg-[#141414] border border-[#1e1e1e] rounded-2xl px-[18px] py-3.5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl flex-shrink-0" style={{ background: AVATAR_COLORS[(i + 1) % AVATAR_COLORS.length], color: "#0a0a0a" }}>
                    {c.name?.[0] ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[16px] font-extrabold text-white truncate">{c.name}</h3>
                    <div className="text-[12.5px] mt-0.5" style={{ color: "#888" }}>{c.email}</div>
                  </div>
                  <span className="text-[10.5px] font-extrabold px-2.5 py-[3px] rounded-full flex-shrink-0" style={{ color: GREEN, background: "rgba(182,255,74,0.12)" }}>
                    מאמן
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-3 border-t border-[#222]">
                  {PERMISSION_FIELDS.map(f => (
                    <div key={f.key} className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold" style={{ color: "#ccc" }}>{f.label}</span>
                      <PermToggle value={perm[f.key]} onChange={(v) => togglePermission(c.id, f.key, v)} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex justify-start" style={{ background: "rgba(0,0,0,0.66)" }} onClick={close}>
          <div className="h-full overflow-y-auto p-8" style={{ width: 460, maxWidth: "92vw", background: "#0f0f0f", borderLeft: "1px solid #222" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-black text-white">הוספת מאמן</h2>
              <button aria-label="סגור" onClick={close} className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center" style={{ background: "#1c1c1c", border: "1px solid #2a2a2a" }}>
                <X size={17} style={{ color: "#fff" }} />
              </button>
            </div>

            {!sentLink ? (
              <>
                <p className="text-[13.5px] mb-6" style={{ color: "#888" }}>שלח הזמנה לאימייל — המאמן ייצור לעצמו סיסמה בהרשמה.</p>
                <div className="mb-2 text-xs font-bold" style={{ color: "#aaa" }}>אימייל</div>
                <div className="relative">
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#666" }} />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    dir="ltr"
                    className="w-full bg-[#141414] border border-[#2a2a2a] rounded-xl pr-10 pl-3.5 py-3 text-white text-sm text-left outline-none"
                  />
                </div>
                <button
                  onClick={invite}
                  disabled={sending || !email.trim()}
                  className="w-full mt-6 rounded-xl py-3.5 font-black text-[15px] flex items-center justify-center gap-2 disabled:opacity-40"
                  style={{ background: GREEN, color: "#0a0a0a" }}
                >
                  {sending && <Loader2 size={16} className="animate-spin" />} שלח הזמנה
                </button>
              </>
            ) : (
              <div className="text-center pt-8">
                <div className="w-[76px] h-[76px] mx-auto mb-5 rounded-full flex items-center justify-center" style={{ background: "rgba(182,255,74,0.14)" }}>
                  <UserPlus size={34} style={{ color: GREEN }} />
                </div>
                <h3 className="text-xl font-black text-white mb-3">ההזמנה נשלחה!</h3>
                <p className="text-sm mb-5" style={{ color: "#888" }}>שלח למאמן את הקישור הבא כדי שיירשם:</p>
                <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-3.5 text-[12px] break-all mb-5" style={{ color: GREEN }} dir="ltr">
                  {sentLink}
                </div>
                <button onClick={close} className="w-full rounded-xl py-3 font-bold text-sm" style={{ background: "#1c1c1c", border: "1px solid #2a2a2a", color: "#fff" }}>
                  סגור
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
