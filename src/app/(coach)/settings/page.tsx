"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Bell, CreditCard, Building2, Save, Eye, EyeOff, Megaphone } from "lucide-react";

const DAYS_HE = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

const CARD = { background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20 };
const SECTION = "mb-8";
const LABEL = { color: "#71717A", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 6, display: "block" };
const INPUT_S = { background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, height: 44, padding: "0 14px", color: "#fff", fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box" as const };
const TOGGLE_ON = { background: "#b6ff4a", border: "none", borderRadius: 999, width: 44, height: 24, cursor: "pointer", position: "relative" as const, transition: "background 0.2s", flexShrink: 0 };
const TOGGLE_OFF = { ...TOGGLE_ON, background: "#2a2a2a" };

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button style={value ? TOGGLE_ON : TOGGLE_OFF} onClick={() => onChange(!value)} type="button" aria-pressed={value}>
      <span style={{ position: "absolute", top: 3, left: value ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
    </button>
  );
}

export default function CoachSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassFields, setShowPassFields] = useState(false);
  const [form, setForm] = useState({
    name: "", businessName: "", bio: "", phone: "", currency: "ILS",
    monthlyPrice: "", quarterPrice: "", annualPrice: "",
    notifyWorkout: true, notifyCheckin: true, notifyInactive: true, notifyPayment: true,
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [broadcast, setBroadcast] = useState({ enabled: false, dayOfWeek: 4, hour: 18, message: "" });
  const [savingBroadcast, setSavingBroadcast] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(({ settings, coach }) => {
      setForm(f => ({
        ...f,
        name: coach?.name ?? "",
        businessName: settings?.businessName ?? "",
        bio: settings?.bio ?? "",
        phone: settings?.phone ?? "",
        currency: settings?.currency ?? "ILS",
        monthlyPrice: settings?.monthlyPrice?.toString() ?? "",
        quarterPrice: settings?.quarterPrice?.toString() ?? "",
        annualPrice: settings?.annualPrice?.toString() ?? "",
        notifyWorkout: settings?.notifyWorkout ?? true,
        notifyCheckin: settings?.notifyCheckin ?? true,
        notifyInactive: settings?.notifyInactive ?? true,
        notifyPayment: settings?.notifyPayment ?? true,
      }));
      setLoading(false);
    });
    fetch("/api/coach/broadcast").then(r => r.json()).then(({ broadcast: b }) => {
      if (b) setBroadcast({ enabled: b.enabled, dayOfWeek: b.dayOfWeek, hour: b.hour, message: b.message });
    });
  }, []);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const setBroadcastField = (k: string, v: any) => setBroadcast(b => ({ ...b, [k]: v }));

  const saveBroadcast = async () => {
    setSavingBroadcast(true);
    try {
      const res = await fetch("/api/coach/broadcast", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(broadcast),
      });
      const data = await res.json();
      if (res.ok) toast({ title: "נשמר ✓", description: "התזכורת השבועית עודכנה" });
      else toast({ variant: "destructive", title: "שגיאה", description: data.error ?? "שמירה נכשלה" });
    } finally {
      setSavingBroadcast(false);
    }
  };

  const save = async () => {
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      toast({ variant: "destructive", title: "שגיאה", description: "הסיסמאות לא תואמות" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, businessName: form.businessName, bio: form.bio,
          phone: form.phone, currency: form.currency,
          monthlyPrice: form.monthlyPrice ? parseFloat(form.monthlyPrice) : null,
          quarterPrice: form.quarterPrice ? parseFloat(form.quarterPrice) : null,
          annualPrice: form.annualPrice ? parseFloat(form.annualPrice) : null,
          notifyWorkout: form.notifyWorkout, notifyCheckin: form.notifyCheckin,
          notifyInactive: form.notifyInactive, notifyPayment: form.notifyPayment,
          newPassword: form.newPassword || undefined,
        }),
      });
      if (res.ok) toast({ title: "נשמר ✓", description: "ההגדרות עודכנו בהצלחה" });
      else toast({ variant: "destructive", title: "שגיאה", description: "שמירה נכשלה" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#b6ff4a" }} />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-16" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white">הגדרות</h1>
          <p style={{ color: "#71717A", fontSize: 13 }}>ניהול פרופיל ועסק</p>
        </div>
        <button onClick={save} disabled={saving}
          style={{ background: "#b6ff4a", color: "#111", border: "none", borderRadius: 999, padding: "10px 24px", fontWeight: 800, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          שמור שינויים
        </button>
      </div>

      {/* Profile */}
      <div className={SECTION}>
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4" style={{ color: "#b6ff4a" }} />
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>פרופיל אישי</span>
        </div>
        <div style={{ ...CARD, padding: 20 }}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label style={LABEL}>שם מלא</label>
              <input style={INPUT_S} value={form.name} onChange={e => set("name", e.target.value)} placeholder="השם שלך" />
            </div>
            <div>
              <label style={LABEL}>טלפון</label>
              <input style={INPUT_S} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="050-0000000" />
            </div>
          </div>
          <div className="mb-4">
            <label style={LABEL}>שם עסק</label>
            <input style={INPUT_S} value={form.businessName} onChange={e => set("businessName", e.target.value)} placeholder="למשל: יואב כהן כושר" />
          </div>
          <div>
            <label style={LABEL}>ביוגרפיה קצרה</label>
            <textarea
              style={{ ...INPUT_S, height: 90, padding: "12px 14px", resize: "vertical" }}
              value={form.bio} onChange={e => set("bio", e.target.value)}
              placeholder="ספר קצת על עצמך ועל הגישה שלך לאימונים..."
            />
          </div>
        </div>
      </div>

      {/* Password */}
      <div className={SECTION}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" style={{ color: "#b6ff4a" }} />
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>שינוי סיסמה</span>
          </div>
          <button onClick={() => setShowPassFields(!showPassFields)} type="button"
            style={{ color: "#b6ff4a", fontSize: 13, background: "none", border: "none", cursor: "pointer" }}>
            {showPassFields ? "ביטול" : "שנה סיסמה"}
          </button>
        </div>
        {showPassFields && (
          <div style={{ ...CARD, padding: 20 }}>
            <div className="space-y-3">
              <div>
                <label style={LABEL}>סיסמה חדשה</label>
                <input type="password" style={INPUT_S} value={form.newPassword} onChange={e => set("newPassword", e.target.value)} placeholder="לפחות 8 תווים" />
              </div>
              <div>
                <label style={LABEL}>אישור סיסמה</label>
                <input type="password" style={INPUT_S} value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} placeholder="חזור על הסיסמה" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pricing */}
      <div className={SECTION}>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-4 h-4" style={{ color: "#b6ff4a" }} />
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>תמחור</span>
        </div>
        <div style={{ ...CARD, padding: 20 }}>
          <div className="mb-4">
            <label style={LABEL}>מטבע</label>
            <select style={{ ...INPUT_S, cursor: "pointer" }} value={form.currency} onChange={e => set("currency", e.target.value)}>
              <option value="ILS">₪ שקל ישראלי</option>
              <option value="USD">$ דולר אמריקאי</option>
              <option value="EUR">€ יורו</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label style={LABEL}>חודשי</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#71717A", fontSize: 13 }}>₪</span>
                <input style={{ ...INPUT_S, paddingRight: 28 }} type="number" value={form.monthlyPrice} onChange={e => set("monthlyPrice", e.target.value)} placeholder="400" />
              </div>
            </div>
            <div>
              <label style={LABEL}>רבעוני</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#71717A", fontSize: 13 }}>₪</span>
                <input style={{ ...INPUT_S, paddingRight: 28 }} type="number" value={form.quarterPrice} onChange={e => set("quarterPrice", e.target.value)} placeholder="1100" />
              </div>
            </div>
            <div>
              <label style={LABEL}>שנתי</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#71717A", fontSize: 13 }}>₪</span>
                <input style={{ ...INPUT_S, paddingRight: 28 }} type="number" value={form.annualPrice} onChange={e => set("annualPrice", e.target.value)} placeholder="3900" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className={SECTION}>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4" style={{ color: "#b6ff4a" }} />
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>התראות</span>
        </div>
        <div style={{ ...CARD, padding: 0, overflow: "hidden" }}>
          {[
            { key: "notifyWorkout", label: "השלמת אימון", desc: "כשמתאמן מסיים אימון" },
            { key: "notifyCheckin", label: "צ׳ק-אין חדש", desc: "כשמתאמן שולח צ׳ק-אין שבועי" },
            { key: "notifyInactive", label: "חוסר פעילות", desc: "כשמתאמן לא מתאמן 3+ ימים" },
            { key: "notifyPayment", label: "תשלום מתקרב", desc: "כשמנוי של מתאמן מתקרב לסיום" },
          ].map((item, i, arr) => (
            <div key={item.key} style={{
              padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
              borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none"
            }}>
              <div>
                <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{item.label}</div>
                <div style={{ color: "#52525B", fontSize: 12 }}>{item.desc}</div>
              </div>
              <Toggle value={(form as any)[item.key]} onChange={v => set(item.key, v)} />
            </div>
          ))}
        </div>
      </div>

      {/* Weekly broadcast to trainees */}
      <div className={SECTION}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4" style={{ color: "#b6ff4a" }} />
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>תזכורת שבועית למתאמנים</span>
          </div>
          <Toggle value={broadcast.enabled} onChange={v => setBroadcastField("enabled", v)} />
        </div>
        <div style={{ ...CARD, padding: 20 }}>
          <p style={{ color: "#71717A", fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
            הודעת Push שנשלחת אוטומטית לכל המתאמנים שלך, בכל שבוע, ביום שתבחר. <br />
            <span style={{ color: "#A78BFA" }}>שים לב:</span> בתוכנית האחסון הנוכחית ההודעה נשלחת פעם ביום בסביבות 17:00-18:00 — בחירת שעה מדויקת תהיה זמינה לאחר שדרוג תוכנית.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label style={LABEL}>יום בשבוע</label>
              <select style={{ ...INPUT_S, cursor: "pointer" }} value={broadcast.dayOfWeek} onChange={e => setBroadcastField("dayOfWeek", Number(e.target.value))}>
                {DAYS_HE.map((d, i) => <option key={i} value={i}>יום {d}</option>)}
              </select>
            </div>
            <div>
              <label style={LABEL}>שעה מועדפת (לעתיד)</label>
              <select style={{ ...INPUT_S, cursor: "pointer" }} value={broadcast.hour} onChange={e => setBroadcastField("hour", Number(e.target.value))}>
                {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label style={LABEL}>נוסח ההודעה</label>
            <textarea
              style={{ ...INPUT_S, height: 80, padding: "12px 14px", resize: "vertical" }}
              value={broadcast.message} onChange={e => setBroadcastField("message", e.target.value)}
              placeholder="למשל: היום יום שקילה — אל תשכחו להיכנס ולעדכן!"
            />
          </div>
          <button onClick={saveBroadcast} disabled={savingBroadcast}
            style={{ background: "#b6ff4a", color: "#111", border: "none", borderRadius: 999, padding: "10px 20px", fontWeight: 800, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            {savingBroadcast ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            שמור תזכורת
          </button>
        </div>
      </div>
    </div>
  );
}
