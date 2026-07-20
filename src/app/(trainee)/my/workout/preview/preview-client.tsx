"use client";
import Link from "next/link";
import { ChevronLeft, Heart, Play, Rewind, FastForward, Volume2, Cast, Clock, Dumbbell, MessageCircle } from "lucide-react";
import { getMuscleGymPhoto } from "@/lib/gym-photos";

// Lior Fit v2 — WorkoutDetails screen, copied from "Lior Fit v2.dc.html".
// The design's video-hero + scrubber has no real video content behind it (no per-session video
// exists), so the scrubber is kept as a static visual and the fake "5.0 rating"/timestamp were
// replaced with real derived data (exercise count, real muscle-group tags) instead of invented numbers.
const LIME = "#a8ff3e";
const GRADIENT = "linear-gradient(105deg,#D2F84B 0%,#6FD668 52%,#35C877 100%)";

export function WorkoutPreviewClient({ session, coachName }: { session: any; coachName: string }) {
  if (!session) {
    return (
      <div dir="rtl" style={{ minHeight: "100vh", background: "#0a1a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: 32, color: "#fff" }}>
        <div style={{ textAlign: "center" }}>
          <Dumbbell size={40} style={{ marginBottom: 16, color: "rgba(255,255,255,0.3)" }} />
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>אין תוכנית אימון פעילה</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>המאמן שלך יוסיף תוכנית בקרוב</div>
        </div>
      </div>
    );
  }

  const exercises = session.exercises ?? [];
  const muscles = Array.from(new Set(exercises.map((e: any) => e.exercise?.muscleGroup).filter(Boolean)));
  const minutes = Math.max(15, exercises.length * 5);
  const heroImg = exercises[0]?.exercise?.imageUrl || getMuscleGymPhoto(exercises[0]?.exercise?.muscleGroup);

  return (
    <div dir="rtl" style={{ position: "relative", minHeight: "100vh", background: "#0a1a0a", color: "#fff" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Hero */}
        <div style={{ position: "relative", height: 380 }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${heroImg})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0a1a0a 4%, rgba(10,26,10,0.15) 40%, rgba(10,26,10,0.35) 100%)" }} />
          <div style={{ position: "absolute", top: 56, right: 18, left: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/my/dashboard" style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(10,16,4,0.5)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChevronLeft size={18} color="#fff" />
            </Link>
            <span style={{ fontSize: 15, fontWeight: 700 }}>פרטי האימון</span>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(10,16,4,0.5)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Heart size={17} color="#fff" />
            </div>
          </div>
          <div style={{ position: "absolute", top: 170, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(10,16,4,0.55)", backdropFilter: "blur(8px)", border: "1.5px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Play size={24} color="#fff" fill="#fff" />
            </div>
          </div>
          {/* Scrubber — static preview only, no real per-session video exists */}
          <div style={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
            <div style={{ height: 3, borderRadius: 999, background: "rgba(255,255,255,0.25)", overflow: "hidden", marginBottom: 10 }}>
              <div style={{ height: "100%", width: "0%", background: LIME, borderRadius: 999 }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Rewind size={18} color="#fff" fill="#fff" />
                <Play size={18} color="#fff" fill="#fff" />
                <FastForward size={18} color="#fff" fill="#fff" />
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>{exercises.length} תרגילים</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, color: "rgba(255,255,255,0.85)" }}>
                <Volume2 size={17} />
                <Cast size={17} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Clock size={15} /> {minutes} דקות</span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.3)" }} />
            {muscles.length > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: 5, color: LIME }}>
                <Dumbbell size={15} /> {muscles.join(", ")}
              </span>
            )}
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1.15, letterSpacing: "-0.01em", marginBottom: 22 }}>
            {session.name} {session.dayLabel && <span className="lf-serif" style={{ color: LIME }}>{session.dayLabel}</span>}
          </div>

          <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>על האימון</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.62)", lineHeight: 1.6, marginBottom: 22 }}>
            {exercises.length} תרגילים{muscles.length ? ` המתמקדים ב${muscles.join(", ")}` : ""} — עקוב אחרי הסטים שלך, השיא האישי, וההתקדמות מהאימון הקודם ישירות בגיליון התרגיל.
          </div>

          <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 12 }}>פרטי המאמן</div>
          <Link href="/my/chat" style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#0f1f0f", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: 12, marginBottom: 22 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(168,255,62,0.14)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18, fontWeight: 900, color: LIME }}>
                {coachName.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{coachName}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>המאמן שלך</div>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(168,255,62,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MessageCircle size={17} color={LIME} />
              </div>
            </div>
          </Link>
        </div>

        <div style={{ padding: "10px 20px 0", background: "#0a1a0a" }}>
          <Link href="/my/workout" style={{ textDecoration: "none" }}>
            <div style={{ height: 60, borderRadius: 999, background: GRADIENT, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={{ fontSize: 17, fontWeight: 900, color: "#0a1004" }}>התחל אימון</span>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#0a1004" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "scaleX(-1)" }}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </div>
          </Link>
        </div>
        <div style={{ height: 26 }} />
      </div>
    </div>
  );
}
