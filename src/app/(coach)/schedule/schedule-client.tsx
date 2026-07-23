"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Plus, X, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConfirm } from "@/components/shared/confirm-dialog";

const DAYS_LONG = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const MONTHS_HE = ["ינו׳", "פבר׳", "מרץ", "אפר׳", "מאי", "יוני", "יולי", "אוג׳", "ספט׳", "אוק׳", "נוב׳", "דצמ׳"];
const COLORS = ["#b6ff4a", "#60A5FA", "#34D399", "#F87171", "#A78BFA", "#FB923C", "#38BDF8", "#4ADE80"];
const TYPES = ["אימון", "הדרכה", "הערכה", "שיחה", "אחר"];

type Appointment = { id: string; date: string; time: string; duration: number; traineeId: string; traineeName: string; type: string; notes: string; color: string };

function isoDate(d: Date) { return d.toISOString().slice(0, 10); }
function todayISO() { return isoDate(new Date()); }
function startOfWeek(d: Date) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() - copy.getDay());
  copy.setHours(0, 0, 0, 0);
  return copy;
}

const S = {
  input: { background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: 10, color: "#fff", fontSize: 14, padding: "10px 14px", outline: "none", width: "100%" },
  label: { color: "#888", fontSize: 11, fontWeight: 700 as const, letterSpacing: "0.04em", display: "block" as const, marginBottom: 5 },
  btnYellow: { background: "#b6ff4a", color: "#0a0a0a", border: "none", borderRadius: 999, padding: "10px 22px", fontWeight: 800 as const, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 },
};

export function ScheduleClient({ trainees, coachId }: { trainees: any[]; coachId: string }) {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const scheduleKey = `demo_schedule_${coachId}`;
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const stored = typeof window !== "undefined" && localStorage.getItem(scheduleKey);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const saveSchedule = (appts: Appointment[]) => {
    try { localStorage.setItem(scheduleKey, JSON.stringify(appts)); } catch {}
  };
  const [addForDate, setAddForDate] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ time: "09:00", duration: 60, traineeId: "", type: "אימון", notes: "" });

  const apptByDate = useMemo(() => {
    const m: Record<string, Appointment[]> = {};
    appointments.forEach((a) => { if (!m[a.date]) m[a.date] = []; m[a.date].push(a); });
    Object.values(m).forEach(list => list.sort((a, b) => a.time.localeCompare(b.time)));
    return m;
  }, [appointments]);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const prevWeek = () => setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; });
  const nextWeek = () => setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; });

  const addAppointment = async () => {
    if (!form.traineeId || !addForDate) return toast({ variant: "destructive", title: "בחר מתאמן" });
    setSaving(true);
    const trainee = trainees.find(t => t.id === form.traineeId);
    const color = COLORS[appointments.length % COLORS.length];
    const newAppt: Appointment = {
      id: Date.now().toString(),
      date: addForDate,
      time: form.time,
      duration: form.duration,
      traineeId: form.traineeId,
      traineeName: trainee?.name ?? "",
      type: form.type,
      notes: form.notes,
      color,
    };
    const updated = [...appointments, newAppt];
    setAppointments(updated);
    saveSchedule(updated);
    setForm({ time: "09:00", duration: 60, traineeId: "", type: "אימון", notes: "" });
    setAddForDate(null);
    toast({ title: "✓ אימון נוסף ללוח זמנים" });
    setSaving(false);
  };

  const removeAppt = async (id: string, traineeName: string) => {
    const ok = await confirm({ title: `לבטל את האימון עם ${traineeName}?`, confirmLabel: "בטל אימון", danger: true });
    if (!ok) return;
    const updated = appointments.filter(a => a.id !== id);
    setAppointments(updated);
    saveSchedule(updated);
  };

  return (
    <div dir="rtl">
      {/* Week nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <button onClick={prevWeek} style={{ background: "#141414", border: "1px solid #2a2a2a", borderRadius: 10, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ChevronRight style={{ width: 18, height: 18, color: "#888" }} />
        </button>
        <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>
          {weekDays[0].getDate()} ב{MONTHS_HE[weekDays[0].getMonth()]} — {weekDays[6].getDate()} ב{MONTHS_HE[weekDays[6].getMonth()]} {weekDays[6].getFullYear()}
        </h2>
        <button onClick={nextWeek} style={{ background: "#141414", border: "1px solid #2a2a2a", borderRadius: 10, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ChevronLeft style={{ width: 18, height: 18, color: "#888" }} />
        </button>
      </div>

      {/* 7-column week grid — matches Lior Fit Dashboard Design's CALENDAR exactly */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 12 }}>
        {weekDays.map((d) => {
          const iso = isoDate(d);
          const isToday = iso === todayISO();
          const dayAppts = apptByDate[iso] ?? [];
          return (
            <div key={iso} style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: 16, padding: "14px 12px", minHeight: 260 }}>
              <div style={{ textAlign: "center", marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid #1c1c1c" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: isToday ? "#b6ff4a" : "#e8e8e8" }}>{DAYS_LONG[d.getDay()]}</div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{d.getDate()} ב{MONTHS_HE[d.getMonth()]}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                {dayAppts.map((a) => (
                  <div key={a.id} style={{ position: "relative", background: `${a.color}18`, border: `1px solid ${a.color}40`, borderRadius: 10, padding: "9px 10px" }}>
                    <button aria-label={`בטל אימון עם ${a.traineeName}`} onClick={() => removeAppt(a.id, a.traineeName)} style={{ position: "absolute", top: 6, left: 6, background: "none", border: "none", cursor: "pointer" }}>
                      <X style={{ width: 11, height: 11, color: "rgba(255,255,255,0.4)" }} />
                    </button>
                    <Link href={a.traineeId ? `/trainees/${a.traineeId}` : "#"}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: a.color, display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock size={10} /> {a.time}
                      </div>
                      <div style={{ fontSize: 12, color: "#ddd", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.traineeName}</div>
                    </Link>
                  </div>
                ))}
                {dayAppts.length === 0 && (
                  <div style={{ textAlign: "center", padding: "16px 0", color: "#555", fontSize: 11.5 }}>אין אימונים ביום זה</div>
                )}
              </div>
              <button
                onClick={() => setAddForDate(iso)}
                style={{ width: "100%", background: "transparent", border: "1px dashed #333", borderRadius: 9, padding: "7px 0", color: "#888", fontSize: 11.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
              >
                <Plus size={12} /> הוסף
              </button>
            </div>
          );
        })}
      </div>

      {/* Add appointment modal */}
      {addForDate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.66)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setAddForDate(null)}>
          <div style={{ background: "#141414", border: "1px solid #2a2a2a", borderRadius: 18, padding: 22, width: 420, maxWidth: "100%" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>אימון חדש</h3>
              <button aria-label="סגור" onClick={() => setAddForDate(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X style={{ width: 17, height: 17, color: "#888" }} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={S.label}>מתאמן</label>
                <select style={{ ...S.input, cursor: "pointer" }} value={form.traineeId} onChange={(e) => setForm({ ...form, traineeId: e.target.value })}>
                  <option value="">בחר מתאמן...</option>
                  {trainees.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <label style={S.label}>שעה</label>
                  <input type="time" style={S.input} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                </div>
                <div>
                  <label style={S.label}>משך (דקות)</label>
                  <input type="number" style={S.input} value={form.duration} onChange={(e) => setForm({ ...form, duration: +e.target.value })} step={15} />
                </div>
              </div>
              <div>
                <label style={S.label}>סוג</label>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const }}>
                  {TYPES.map(t => (
                    <button key={t} onClick={() => setForm({ ...form, type: t })} style={{
                      padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: "pointer",
                      background: form.type === t ? "#b6ff4a" : "rgba(255,255,255,0.05)",
                      color: form.type === t ? "#0a0a0a" : "rgba(255,255,255,0.5)",
                      border: `1px solid ${form.type === t ? "#b6ff4a" : "rgba(255,255,255,0.08)"}`,
                    }}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={S.label}>הערות</label>
                <input style={S.input} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="הערות אופציונלי..." />
              </div>
              <button onClick={addAppointment} disabled={saving} style={S.btnYellow}>
                {saving ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <Plus style={{ width: 14, height: 14 }} />}
                הוסף ללוח זמנים
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
