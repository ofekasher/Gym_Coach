"use client";
import { useState, useEffect } from "react";
import { Mail, Loader2, Eye, EyeOff, MessageCircle, Copy, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const GREEN = "#a8ff3e";
const glassCard = "backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8";
const inputClass = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white outline-none placeholder:text-white/30";
const labelClass = "text-white/60 text-sm mb-1 block";

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default function InvitePage() {
  const { toast } = useToast();
  const [coachName, setCoachName] = useState("המאמן שלך");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.coach?.name) setCoachName(data.coach.name); })
      .catch((err) => console.error("Failed to load coach name", err));
  }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState(generatePassword());
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{ name: string; email: string; phone: string; password: string } | null>(null);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword(generatePassword());
    setCreated(null);
  };

  const createTrainee = async () => {
    if (!name || !email || !password) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", name, email, password, phone: phone || undefined }),
      });
      if (res.ok) {
        setCreated({ name, email, phone, password });
        toast({ title: "✓ המתאמן נוסף בהצלחה!" });
      } else {
        const err = await res.json();
        toast({ variant: "destructive", title: "שגיאה", description: err.error });
      }
    } finally {
      setLoading(false);
    }
  };

  const whatsappMessage = created
    ? `היי ${created.name}! 👋
${coachName} הוסיף אותך למערכת האימון האישי.

כנס/י כאן: ${typeof window !== "undefined" ? window.location.origin : ""}/login
אימייל: ${created.email}
סיסמה זמנית: ${created.password}

בהצלחה! 💪`
    : "";

  const whatsappLink = created?.phone
    ? `https://wa.me/972${created.phone.replace(/^0/, "").replace(/-/g, "")}?text=${encodeURIComponent(whatsappMessage)}`
    : null;

  const copyDetails = () => {
    navigator.clipboard.writeText(whatsappMessage);
    toast({ title: "הפרטים הועתקו!" });
  };

  return (
    <div className="min-h-screen bg-[#080810] max-w-lg mx-auto py-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">הזמן מתאמן/ת</h1>
        <p className="text-white/50 text-sm mt-1">צור חשבון מתאמן חדש עם סיסמה זמנית</p>
      </div>

      {!created ? (
        <div className={glassCard}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: GREEN }}>
              <UserPlus className="w-5 h-5 text-black" />
            </div>
            <span className="text-white font-bold text-lg">פרטי המתאמן/ת</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>שם מלא</label>
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="דוד לוי" />
            </div>

            <div>
              <label className={labelClass}>אימייל</label>
              <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="david@example.com" />
            </div>

            <div>
              <label className={labelClass}>מספר טלפון (אופציונלי)</label>
              <input type="tel" className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="050-1234567" />
            </div>

            <div>
              <label className={labelClass}>סיסמה זמנית</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={inputClass}
                    style={{ paddingLeft: 40 }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setPassword(generatePassword())}
                  title="צור סיסמה אקראית"
                  className="w-12 flex-shrink-0 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 flex items-center justify-center"
                >
                  🎲
                </button>
              </div>
            </div>

            <button
              onClick={createTrainee}
              disabled={loading || !name || !email || !password}
              className="w-full bg-[#a8ff3e] text-black font-bold rounded-xl py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              שלח הזמנה
            </button>
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={glassCard}>
          <div className="text-center mb-5">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-white font-bold text-lg">המתאמן נוסף בהצלחה!</div>
          </div>

          <div className="space-y-2 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-white/50">שם:</span>
              <span className="text-white font-semibold">{created.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">אימייל:</span>
              <span className="text-white font-semibold">{created.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">סיסמה:</span>
              <span className="text-white font-semibold">{created.password}</span>
            </div>
          </div>

          <div className="space-y-2">
            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                שלח בוואטסאפ
              </a>
            ) : (
              <div className="text-center text-white/30 text-xs">לא הוזן מספר טלפון — אין אפשרות לשליחה בוואטסאפ</div>
            )}
            <button
              onClick={copyDetails}
              className="w-full bg-white/[0.04] border border-white/[0.08] text-white/80 rounded-xl py-3 flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              העתק פרטים
            </button>
            <button
              onClick={resetForm}
              className="w-full bg-white/[0.04] border border-white/[0.08] text-white/80 rounded-xl py-3"
            >
              הוסף מתאמן נוסף
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
