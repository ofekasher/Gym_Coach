"use client";
import { useEffect, useState } from "react";
import { CreditCard, Plus, CheckCircle2, Clock, XCircle, Loader2, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

const CARD = { background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20 };
const INPUT_S = { background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, height: 44, padding: "0 14px", color: "#fff", fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box" as const };

const PLAN_LABELS: Record<string, string> = { MONTHLY: "חודשי", QUARTERLY: "רבעוני", ANNUAL: "שנתי" };
const STATUS_STYLE: Record<string, any> = {
  ACTIVE: { background: "rgba(16,185,129,0.12)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)" },
  EXPIRED: { background: "rgba(239,68,68,0.12)", color: "#F87171", border: "1px solid rgba(239,68,68,0.2)" },
  CANCELLED: { background: "rgba(239,68,68,0.12)", color: "#F87171", border: "1px solid rgba(239,68,68,0.2)" },
  PENDING: { background: "rgba(182,255,74,0.12)", color: "#b6ff4a", border: "1px solid rgba(182,255,74,0.2)" },
};

export default function PaymentsPage() {
  const { toast } = useToast();
  const [trainees, setTrainees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [modal, setModal] = useState<{ type: "sub" | "pay"; traineeId: string; subId?: string } | null>(null);
  const [form, setForm] = useState({ plan: "MONTHLY", amount: "", notes: "", method: "cash" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch("/api/payments");
      if (res.ok) {
        const { trainees: t } = await res.json();
        setTrainees(t);
      } else {
        setLoadError(true);
      }
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totalRevenue = trainees.reduce((sum, t) => sum + (t.subscription?.payments?.reduce((s: number, p: any) => s + p.amount, 0) ?? 0), 0);
  const activeCount = trainees.filter(t => t.subscription?.status === "ACTIVE").length;

  const saveSubscription = async () => {
    if (!modal || !form.amount) return;
    setSaving(true);
    try {
      const res = await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create_subscription", traineeId: modal.traineeId, plan: form.plan, amount: parseFloat(form.amount), notes: form.notes }) });
      if (res.ok) {
        await load();
        setModal(null);
      } else {
        toast({ variant: "destructive", title: "שמירת המינוי נכשלה, נסה שוב" });
      }
    } catch {
      toast({ variant: "destructive", title: "שגיאת רשת — נסה שוב" });
    } finally {
      setSaving(false);
    }
  };

  const recordPayment = async () => {
    if (!modal?.subId || !form.amount) return;
    setSaving(true);
    try {
      const res = await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "record_payment", subscriptionId: modal.subId, paymentAmount: parseFloat(form.amount), method: form.method, paymentNotes: form.notes }) });
      if (res.ok) {
        await load();
        setModal(null);
      } else {
        toast({ variant: "destructive", title: "רישום התשלום נכשל, נסה שוב" });
      }
    } catch {
      toast({ variant: "destructive", title: "שגיאת רשת — נסה שוב" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-16" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white">תשלומים ומינויים</h1>
          <p style={{ color: "#71717A", fontSize: 13 }}>ניהול תשלומים של מתאמנים</p>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
        <div style={{ ...CARD, padding: 18 }}>
          <div style={{ color: "#48484A", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>הכנסות סה״כ</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#b6ff4a" }}>₪{totalRevenue.toLocaleString()}</div>
        </div>
        <div style={{ ...CARD, padding: 18 }}>
          <div style={{ color: "#48484A", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>מינויים פעילים</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#10B981" }}>{activeCount}</div>
        </div>
        <div style={{ ...CARD, padding: 18 }}>
          <div style={{ color: "#48484A", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>סה״כ מתאמנים</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>{trainees.length}</div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" style={{ color: "#b6ff4a" }} /></div>
      ) : loadError ? (
        <div style={{ ...CARD, padding: 32, textAlign: "center" }}>
          <p style={{ color: "#F87171", fontSize: 14, fontWeight: 700, marginBottom: 6 }}>טעינת נתוני התשלומים נכשלה</p>
          <p style={{ color: "#71717A", fontSize: 13, marginBottom: 16 }}>בדוק את החיבור ונסה שוב</p>
          <button onClick={load} style={{ background: "#b6ff4a", color: "#0a0a0a", border: "none", borderRadius: 999, padding: "10px 20px", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>נסה שוב</button>
        </div>
      ) : (
        <div className="space-y-3">
          {trainees.map(t => {
            const sub = t.subscription;
            const isOpen = expanded === t.id;
            return (
              <div key={t.id} style={CARD}>
                <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} onClick={() => setExpanded(isOpen ? null : t.id)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(182,255,74,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#b6ff4a", fontSize: 14 }}>
                      {t.name?.[0] ?? "?"}
                    </div>
                    <div>
                      <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{t.name ?? t.email}</div>
                      <div style={{ color: "#52525B", fontSize: 12 }}>{sub ? `${PLAN_LABELS[sub.plan]} · ₪${sub.amount}` : "אין מינוי"}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {sub ? (
                      <span style={{ ...STATUS_STYLE[sub.status], padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                        {sub.status === "ACTIVE" ? "פעיל" : sub.status === "EXPIRED" ? "פג תוקף" : sub.status === "CANCELLED" ? "בוטל" : "ממתין"}
                      </span>
                    ) : (
                      <button onClick={e => { e.stopPropagation(); setForm({ plan: "MONTHLY", amount: "", notes: "", method: "cash" }); setModal({ type: "sub", traineeId: t.id }); }}
                        style={{ background: "rgba(182,255,74,0.12)", border: "1px solid rgba(182,255,74,0.2)", color: "#b6ff4a", borderRadius: 999, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                        <Plus style={{ width: 13, height: 13 }} /> הוסף מינוי
                      </button>
                    )}
                    <ChevronDown style={{ width: 16, height: 16, color: "#52525B", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                  </div>
                </div>

                {isOpen && sub && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 20px" }}>
                    <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                      <div>
                        <div style={{ color: "#48484A", fontSize: 10, fontWeight: 700, marginBottom: 2 }}>תחילת מינוי</div>
                        <div style={{ color: "#fff", fontSize: 13 }}>{format(new Date(sub.startDate), "d/M/yyyy", { locale: he })}</div>
                      </div>
                      {sub.endDate && (
                        <div>
                          <div style={{ color: "#48484A", fontSize: 10, fontWeight: 700, marginBottom: 2 }}>סיום מינוי</div>
                          <div style={{ color: "#fff", fontSize: 13 }}>{format(new Date(sub.endDate), "d/M/yyyy", { locale: he })}</div>
                        </div>
                      )}
                    </div>

                    <div style={{ color: "#48484A", fontSize: 10, fontWeight: 700, marginBottom: 8 }}>תשלומים אחרונים</div>
                    {sub.payments?.length === 0 ? (
                      <div style={{ color: "#52525B", fontSize: 13, marginBottom: 10 }}>אין תשלומים עדיין</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                        {sub.payments?.map((p: any) => (
                          <div key={p.id} style={{ background: "#242428", borderRadius: 10, padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>₪{p.amount}</span>
                            <span style={{ color: "#52525B", fontSize: 11 }}>{format(new Date(p.paidAt ?? p.date), "d/M/yyyy", { locale: he })} · {p.method}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => { setForm({ plan: sub.plan, amount: String(sub.amount), notes: "", method: "cash" }); setModal({ type: "pay", traineeId: t.id, subId: sub.id }); }}
                        style={{ background: "#b6ff4a", color: "#111", border: "none", borderRadius: 999, padding: "8px 16px", fontSize: 12, fontWeight: 800, cursor: "pointer", flex: 1 }}>
                        + רשום תשלום
                      </button>
                      <button onClick={() => { setForm({ plan: sub.plan, amount: String(sub.amount), notes: sub.notes ?? "", method: "cash" }); setModal({ type: "sub", traineeId: t.id }); }}
                        style={{ background: "#242428", color: "#fff", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        עדכן מינוי
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }} onClick={() => setModal(null)}>
          <div style={{ ...CARD, padding: 24, width: "100%", maxWidth: 400 }} onClick={e => e.stopPropagation()} dir="rtl">
            <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 16, marginBottom: 20 }}>
              {modal.type === "sub" ? "הגדרת מינוי" : "רישום תשלום"}
            </h3>
            {modal.type === "sub" && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ color: "#71717A", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 6 }}>סוג מינוי</label>
                  <select style={{ ...INPUT_S, cursor: "pointer" }} value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}>
                    <option value="MONTHLY">חודשי</option>
                    <option value="QUARTERLY">רבעוני</option>
                    <option value="ANNUAL">שנתי</option>
                  </select>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ color: "#71717A", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 6 }}>סכום (₪)</label>
                  <input style={INPUT_S} type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="400" />
                </div>
              </>
            )}
            {modal.type === "pay" && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ color: "#71717A", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 6 }}>סכום שהתקבל (₪)</label>
                  <input style={INPUT_S} type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="400" />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ color: "#71717A", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 6 }}>אמצעי תשלום</label>
                  <select style={{ ...INPUT_S, cursor: "pointer" }} value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}>
                    <option value="cash">מזומן</option>
                    <option value="transfer">העברה בנקאית</option>
                    <option value="bit">ביט</option>
                    <option value="paybox">פייבוקס</option>
                    <option value="credit">אשראי</option>
                  </select>
                </div>
              </>
            )}
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: "#71717A", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 6 }}>הערות</label>
              <input style={INPUT_S} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="הערה אופציונלית..." />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={modal.type === "sub" ? saveSubscription : recordPayment} disabled={saving || !form.amount}
                style={{ flex: 1, background: "#b6ff4a", color: "#111", border: "none", borderRadius: 999, height: 44, fontWeight: 800, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {saving ? <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> : "שמור"}
              </button>
              <button onClick={() => setModal(null)} style={{ flex: 1, background: "#242428", color: "#fff", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999, height: 44, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>ביטול</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
