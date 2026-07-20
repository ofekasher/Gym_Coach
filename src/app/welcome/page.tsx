import Link from "next/link";

// Lior Fit v2 — Onboarding splash, copied from "Lior Fit v2.dc.html".
// Real asset used: public/videos/login-background.mp4 (the actual gym video already used on
// the login screen) instead of the design's original assets/lior-onboarding.png — that file
// couldn't be pulled from Claude Design in full resolution (256KB read cap truncated it).
const LIME = "#a8ff3e";
const GRADIENT = "linear-gradient(105deg,#D2F84B 0%,#6FD668 55%,#35C877 100%)";

export default function WelcomePage() {
  return (
    <div dir="rtl" style={{ position: "relative", minHeight: "100vh", background: "#0a1a0a", color: "#fff", overflow: "hidden" }}>
      <video
        src="/videos/login-background.mp4"
        muted autoPlay loop playsInline
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0a1a0a 6%, rgba(8,11,7,0.5) 42%, rgba(8,11,7,0.15) 100%)" }} />

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "0 26px 46px" }}>
        <div style={{ display: "flex", gap: 7, marginBottom: 26 }}>
          <div style={{ width: 30, height: 4, borderRadius: 9, background: LIME }} />
          <div style={{ width: 14, height: 4, borderRadius: 9, background: "rgba(255,255,255,0.25)" }} />
          <div style={{ width: 14, height: 4, borderRadius: 9, background: "rgba(255,255,255,0.25)" }} />
        </div>

        <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.02, letterSpacing: "-0.02em" }}>
          מתחילים את<br />
          <span className="lf-serif" style={{ color: LIME, fontSize: 46 }}>מסע הכושר</span> שלך היום
        </div>
        <div style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", marginTop: 16, lineHeight: 1.5, maxWidth: 290 }}>
          עוקבים אחרי אימונים, בונים הרגלים בריאים, ונשארים עקביים כל יום.
        </div>

        <Link href="/login" style={{ textDecoration: "none" }}>
          <div style={{ marginTop: 30, display: "flex", alignItems: "center", background: GRADIENT, borderRadius: 999, padding: 7, height: 64 }}>
            <span style={{ flex: 1, textAlign: "center", color: "#0a1004", fontSize: 17, fontWeight: 800, paddingRight: 14 }}>המשך להתחברות</span>
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#0a1004", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={LIME} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "scaleX(-1)" }}>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
