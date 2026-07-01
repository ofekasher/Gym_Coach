"use client";
import { useState, useMemo } from "react";
import { ChevronRight, ChevronLeft, Plus, X, Clock, User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DAYS_HE = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
const DAYS_LONG = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const MONTHS_HE = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
const COLORS = ["#F5C518", "#60A5FA", "#34D399", "#F87171", "#A78BFA", "#FB923C", "#38BDF8", "#4ADE80"];

type Appointment = { id: string; date: string; time: string; duration: number; traineeId: string; traineeName: string; type: string; notes: string; color: string };

const TYPES = ["אימון", "הדרכה", "הערכה", "שיחה", "אחר"];

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function firstDayOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay(); }
function isoDate(y: number, m: number, d: number) { return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`; }
function todayISO() { return new Date().toISOString().slice(0, 10); }

const S = {
  input: { background: "#1C1C1E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 14, padding: "10px 14px", outline: "none", width: "100%" },
  label: { color: "#48484A", fontSize: 11, fontWeight: 700 as const, letterSpacing: "0.04em", display: "block" as const, marginBottom: 5 },
  btnYellow: { background: "#F5C518", color: "#111", border: "none", borderRadius: 999, padding: "10px 22px", fontWeight: 800 as const, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 },
  btnGhost: { background: "rgba(255,255,255,0.05)", color: "#71717A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999, padding: "10px 18px", fontWeight: 700 as const, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 },
};

export function ScheduleClient({ trainees, coachId }: { trainees: any[]; coachId: string }) {
  const { toast } = useToast();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const scheduleKey = `demo_schedule_${coachId}`;
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const stored = typeof window !== "undefined" && localStorage.getItem(`demo_schedule_${coachId}`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const saveSchedule = (appts: Appointment[]) => {
    try { localStorage.setItem(scheduleKey, JSON.stringify(appts)); } catch {}
  };
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ time: "09:00", duration: 60, traineeId: "", type: "אימון", notes: "" });

  const days = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);

  const apptByDate = useMemo(() => {
    const m: Record<string, Appointment[]> = {};
    appointments.forEach((a) => { if (!m[a.date]) m[a.date] = []; m[a.date].push(a); });
    return m;
  }, [appointments]);

  const dayAppts = apptByDate[selectedDate] ?? [];

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  const addAppointment = async () => {
    if (!form.traineeId) return toast({ variant: "destructive", title: "בחר מתאמן" });
    setSaving(true);
    const trainee = trainees.find(t => t.id === form.traineeId);
    const color = COLORS[appointments.length % COLORS.length];
    const newAppt: Appointment = {
      id: Date.now().toString(),
      date: selectedDate,
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
    setShowForm(false);
    toast({ title: "✓ אימון נוסף ללוח זמנים" });
    setSaving(false);
  };

  const removeAppt = (id: string) => {
    const updated = appointments.filter(a => a.id !== id);
    setAppointments(updated);
    saveSchedule(updated);
  };

  const formatDateHe = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return `${d} ב${MONTHS_HE[m - 1]} ${y}`;
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, minHeight: 600 }} dir="rtl">
      {/* Calendar */}
      <div>
        {/* Month nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <button onClick={prevMonth} style={{ background: "#161618", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ChevronRight style={{ width: 18, height: 18, color: "#71717A" }} />
          </button>
          <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>{MONTHS_HE[month]} {year}</h2>
          <button onClick={nextMonth} style={{ background: "#161618", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ChevronLeft style={{ width: 18, height: 18, color: "#71717A" }} />
          </button>
        </div>

        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 6, gap: 2 }}>
          {DAYS_HE.map(d => (
            <div key={d} style={{ textAlign: "center", color: "#48484A", fontSize: 11, fontWeight: 700, padding: "6px 0" }}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: days }).map((_, i) => {
            const d = i + 1;
            const iso = isoDate(year, month, d);
            const isToday = iso === todayISO();
            const isSelected = iso === selectedDate;
            const hasAppts = (apptByDate[iso]?.length ?? 0) > 0;
            return (
              <button key={d} onClick={() => setSelectedDate(iso)} style={{
                aspectRatio: "1", border: "none", cursor: "pointer", borderRadius: 12,
                background: isSelected ? "#F5C518" : isToday ? "rgba(245,197,24,0.1)" : "rgba(255,255,255,0.03)",
                position: "relative", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
                transition: "all 0.15s"
              }}>
                <span style={{ color: isSelected ? "#111" : isToday ? "#F5C518" : "#E5E5E5", fontSize: 14, fontWeight: isSelected || isToday ? 800 : 500 }}>{d}</span>
                {hasAppts && (
                  <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                    {(apptByDate[iso] ?? []).slice(0, 3).map((a) => (
                      <div key={a.id} style={{ width: 5, height: 5, borderRadius: "50%", background: isSelected ? "#111" : a.color }} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day detail panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ color: "#fff", fontWeight: 800, fontSize: 16, margin: 0 }}>{formatDateHe(selectedDate)}</p>
            <p style={{ color: "#52525B", fontSize: 12, margin: 0 }}>{DAYS_LONG[new Date(selectedDate).getDay()]}</p>
          </div>
          <button onClick={() => setShowForm(true)} style={S.btnYellow}>
            <Plus style={{ width: 14, height: 14 }} />הוסף
          </button>
        </div>

        {/* Appointments for day */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {dayAppts.length === 0 && (
            <div style={{ background: "#161618", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "28px 16px", textAlign: "center" }}>
              <p style={{ color: "#48484A", fontSize: 13 }}>אין אימונים ביום זה</p>
            </div>
          )}
          {dayAppts.sort((a, b) => a.time.localeCompare(b.time)).map(appt => (
            <div key={appt.id} style={{ background: "#161618", border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 14, padding: "12px 14px", borderRight: `3px solid ${appt.color}`, position: "relative" }}>
              <button onClick={() => removeAppt(appt.id)} style={{ position: "absolute", top: 8, left: 8, background: "none", border: "none", cursor: "pointer" }}>
                <X style={{ width: 14, height: 14, color: "#48484A" }} />
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Clock style={{ width: 12, height: 12, color: appt.color }} />
                <span style={{ color: appt.color, fontSize: 12, fontWeight: 700 }}>{appt.time}</span>
                <span style={{ color: "#48484A", fontSize: 11 }}>• {appt.duration} דק׳</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <User style={{ width: 12, height: 12, color: "#71717A" }} />
                <span style={{ color: "#E5E5E5", fontSize: 14, fontWeight: 700 }}>{appt.traineeName}</span>
              </div>
              <div style={{ marginTop: 4 }}>
                <span style={{ background: `${appt.color}18`, color: appt.color, fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "2px 8px" }}>{appt.type}</span>
              </div>
              {appt.notes && <p style={{ color: "#52525B", fontSize: 11, marginTop: 6 }}>{appt.notes}</p>}
            </div>
          ))}
        </div>

        {/* Add form */}
        {showForm && (
          <div style={{ background: "#161618", border: "1px solid rgba(245,197,24,0.15)", borderRadius: 16, padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 14, margin: 0 }}>אימון חדש</h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X style={{ width: 16, height: 16, color: "#52525B" }} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
                      background: form.type === t ? "#F5C518" : "rgba(255,255,255,0.05)",
                      color: form.type === t ? "#111" : "#71717A",
                      border: `1px solid ${form.type === t ? "#F5C518" : "rgba(255,255,255,0.08)"}`,
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
                הוסף לוח זמנים
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
