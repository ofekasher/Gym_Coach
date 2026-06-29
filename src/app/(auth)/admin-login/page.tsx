"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Loader2, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) router.push("/admin");
      else setError("אימייל או סיסמה שגויים");
    } finally {
      setLoading(false);
    }
  };

  const INPUT = { background: "#2C2C2E", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, height: 48, padding: "0 14px", color: "#fff", fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box" as const };

  return (
    <div style={{ minHeight: "100vh", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: "rgba(245,197,24,0.12)", border: "1px solid rgba(245,197,24,0.25)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Shield style={{ width: 28, height: 28, color: "#F5C518" }} />
          </div>
          <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Admin Panel</h1>
          <p style={{ color: "#71717A", fontSize: 13 }}>גישה למנהלי מערכת בלבד</p>
        </div>

        <div style={{ background: "#1C1C1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 24, padding: 24 }}>
          <form onSubmit={handleSubmit} dir="rtl">
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: "#71717A", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, display: "block" }}>אימייל</label>
              <input style={INPUT} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@fitcoach.app" required />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: "#71717A", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, display: "block" }}>סיסמה</label>
              <div style={{ position: "relative" }}>
                <input style={{ ...INPUT, paddingLeft: 44 }} type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#52525B" }}>
                  {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>
            {error && <p style={{ color: "#EF4444", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ background: "#F5C518", color: "#111", border: "none", borderRadius: 999, height: 48, width: "100%", fontSize: 14, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {loading ? <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> : <Shield style={{ width: 18, height: 18 }} />}
              כניסה לאדמין
            </button>
          </form>
        </div>
        <p style={{ textAlign: "center", color: "#3A3A3C", fontSize: 12, marginTop: 16 }}>SmartFitCoach Admin v1.0</p>
      </div>
    </div>
  );
}
