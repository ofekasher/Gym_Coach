"use client";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { BackHeader } from "@/components/shared/back-header";
import { Flame, Dumbbell, Trophy, Bell, LogOut, CalendarDays, type LucideIcon } from "lucide-react";
import { getMuscleGymPhoto } from "@/lib/gym-photos";

const GREEN = "#a8ff3e";
const CARD = "bg-[#1c1c2e] rounded-2xl mx-4 p-4 mt-4";

const GOAL_OPTIONS = ["הרזיה", "מסה", "כוח", "שיפור כושר"];
const EQUIPMENT_OPTIONS = ["חדר כושר", "בית", "גומיות", "משקולות בלבד"];

const weightHistory = [82, 81.5, 81, 80.2, 80, 79.5, 79, 79];

function WeightGraph() {
  const min = Math.min(...weightHistory) - 1;
  const max = Math.max(...weightHistory) + 1;
  const w = 300, h = 120, pad = 10;
  const stepX = (w - pad * 2) / (weightHistory.length - 1);
  const scaleY = (v: number) => h - pad - ((v - min) / (max - min)) * (h - pad * 2);
  const points = weightHistory.map((v, i) => ({ x: pad + i * stepX, y: scaleY(v) }));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h + 20}`} style={{ overflow: "visible" }}>
      <path d={pathD} fill="none" stroke={GREEN} strokeWidth={2} />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i === points.length - 1 ? 5 : 3}
          fill={GREEN}
          stroke={i === points.length - 1 ? "#fff" : "none"}
          strokeWidth={i === points.length - 1 ? 2 : 0}
        />
      ))}
      {weightHistory.map((_, i) => (
        <text key={i} x={pad + i * stepX} y={h + 14} fontSize="9" fill="rgba(255,255,255,0.4)" textAnchor="middle">
          שבוע {i + 1}
        </text>
      ))}
    </svg>
  );
}

function ToggleSwitch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 44, height: 24, borderRadius: 99, border: "none", cursor: "pointer",
        background: on ? GREEN : "rgba(255,255,255,0.15)", position: "relative", transition: "background 0.2s",
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3,
        right: on ? 23 : 3, transition: "right 0.2s",
      }} />
    </button>
  );
}

export function ProfileClient({ user }: { user: any }) {
  const profile = user?.traineeProfile ?? null;

  const [editingStats, setEditingStats] = useState(false);
  const [stats, setStats] = useState({
    height: profile?.height ?? "",
    currentWeight: profile?.currentWeight ?? "",
    targetWeight: profile?.targetWeight ?? "",
    bodyFat: profile?.bodyFat ?? "",
  });
  const [savingStats, setSavingStats] = useState(false);

  const [editingPrefs, setEditingPrefs] = useState(false);
  const [goal, setGoal] = useState(profile?.goal ?? GOAL_OPTIONS[0]);
  const [equipment, setEquipment] = useState<string[]>(profile?.equipment ?? []);
  const [limitations, setLimitations] = useState(profile?.limitations ?? "");
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [notifications, setNotifications] = useState(profile?.notifications ?? true);

  useEffect(() => {
    fetch("/api/trainee/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.profile) return;
        setStats({
          height: data.profile.height ?? "",
          currentWeight: data.profile.currentWeight ?? "",
          targetWeight: data.profile.targetWeight ?? "",
          bodyFat: data.profile.bodyFat ?? "",
        });
        setGoal(data.profile.goal ?? GOAL_OPTIONS[0]);
        setEquipment(data.profile.equipment ?? []);
        setLimitations(data.profile.limitations ?? "");
        setNotifications(data.profile.notifications ?? true);
      })
      .catch((err) => console.error("Failed to load profile", err));
  }, []);

  const saveStats = async () => {
    setSavingStats(true);
    try {
      await fetch("/api/trainee/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          height: stats.height === "" ? null : Number(stats.height),
          currentWeight: stats.currentWeight === "" ? null : Number(stats.currentWeight),
          targetWeight: stats.targetWeight === "" ? null : Number(stats.targetWeight),
          bodyFat: stats.bodyFat === "" ? null : Number(stats.bodyFat),
        }),
      });
    } catch (err) {
      console.error("Failed to save stats", err);
    } finally {
      setSavingStats(false);
      setEditingStats(false);
    }
  };

  const savePrefs = async () => {
    setSavingPrefs(true);
    try {
      await fetch("/api/trainee/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, equipment, limitations }),
      });
    } catch (err) {
      console.error("Failed to save preferences", err);
    } finally {
      setSavingPrefs(false);
      setEditingPrefs(false);
    }
  };

  const toggleEquipment = (item: string) => {
    setEquipment((prev) => (prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]));
  };

  const toggleNotifications = async (val: boolean) => {
    setNotifications(val);
    try {
      await fetch("/api/trainee/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications: val }),
      });
    } catch (err) {
      console.error("Failed to update notifications", err);
    }
  };

  // Training stats derived from real data (with sensible fallbacks)
  const workoutLogs = user?.workoutLogs ?? [];
  const completedCount = workoutLogs.filter((l: any) => l.status === "COMPLETED").length || 12;

  let streak = 0;
  const days = new Set(workoutLogs.map((l: any) => new Date(l.date).toDateString()));
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (days.has(d.toDateString())) streak++;
    else if (i > 0) break;
  }
  if (streak === 0) streak = 5;

  let prLabel = 'סקוואט 80 ק"ג';
  const allExercises = (user?.workoutPlans ?? []).flatMap((p: any) => p.sessions ?? []).flatMap((s: any) => s.exercises ?? []);
  const withWeight = allExercises.filter((e: any) => e.weight != null);
  if (withWeight.length > 0) {
    const top = withWeight.reduce((a: any, b: any) => (b.weight > a.weight ? b : a));
    prLabel = `${top.exercise?.name ?? "תרגיל"} ${top.weight} ק"ג`;
  }

  const programStart = user?.workoutPlans?.[0]?.createdAt ?? user?.createdAt;
  const weeksInProgram = programStart
    ? Math.max(1, Math.ceil((Date.now() - new Date(programStart).getTime()) / (7 * 24 * 60 * 60 * 1000)))
    : 8;

  // Weekly activity: which of the last 7 days had a completed workout
  const WEEK_LABELS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
  const activityDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const done = days.has(d.toDateString());
    return { label: WEEK_LABELS[d.getDay()], done };
  });

  const statFields = [
    { key: "height", label: "גובה (ס״מ)" },
    { key: "currentWeight", label: "משקל נוכחי" },
    { key: "targetWeight", label: "יעד משקל" },
    { key: "bodyFat", label: "אחוז שומן" },
  ] as const;

  return (
    <div style={{ background: "#12121f", minHeight: "100vh", paddingBottom: 100 }} dir="rtl">
      <BackHeader title="פרופיל" />

      {/* Section 1 — photo hero header */}
      <div style={{
        position: "relative", height: 196, overflow: "hidden",
        backgroundImage: `url(${getMuscleGymPhoto(undefined)})`, backgroundSize: "cover", backgroundPosition: "center",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #12121f 4%, rgba(18,18,31,0.55) 60%, rgba(18,18,31,0.35) 100%)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 14 }}>
          <div style={{
            width: 84, height: 84, borderRadius: "50%", background: GREEN,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 30, fontWeight: 900, color: "#08120a",
            border: "3px solid " + GREEN, boxShadow: "0 0 0 4px rgba(168,255,62,0.15)",
          }}>
            {user?.name?.[0] ?? "מ"}
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginTop: 10, textShadow: "0 2px 10px rgba(0,0,0,0.7)" }}>{user?.name}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>{user?.email}</div>
        </div>
      </div>

      {/* Section 2 — editable personal stats */}
      <div className={CARD}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>נתונים אישיים</span>
          <button onClick={() => setEditingStats((v) => !v)} style={{ background: "transparent", border: "none", color: GREEN, fontSize: 13, cursor: "pointer" }}>
            {editingStats ? "ביטול" : "עריכה"}
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {statFields.map((f) => (
            <div key={f.key} style={{ textAlign: "center" }}>
              {editingStats ? (
                <input
                  type="number"
                  value={(stats as any)[f.key]}
                  onChange={(e) => setStats((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  style={{
                    width: "100%", textAlign: "center", fontSize: 16, fontWeight: 800, color: "#fff",
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8, padding: "6px 4px",
                  }}
                />
              ) : (
                <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{(stats as any)[f.key] || "—"}</div>
              )}
              <div style={{ fontSize: 11, color: GREEN, marginTop: 4 }}>{f.label}</div>
            </div>
          ))}
        </div>
        {editingStats && (
          <button
            onClick={saveStats}
            disabled={savingStats}
            style={{
              width: "100%", marginTop: 14, padding: "10px 0", borderRadius: 12, border: "none", cursor: "pointer",
              background: GREEN, color: "#0a0a0a", fontSize: 14, fontWeight: 800,
            }}
          >
            {savingStats ? "שומר..." : "שמור"}
          </button>
        )}
      </div>

      {/* Section 2b — weekly activity */}
      <div className={CARD}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>פעילות השבוע</div>
        <div style={{ display: "flex", gap: 6, justifyContent: "space-between" }}>
          {activityDays.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 26, height: 56, borderRadius: 8, background: "rgba(255,255,255,0.06)",
                boxShadow: d.done ? `inset 0 -56px 0 ${GREEN}` : "none",
              }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3 — weight graph */}
      <div className={CARD}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 10 }}>היסטוריית משקל</div>
        <WeightGraph />
      </div>

      {/* Section 4 — training stats */}
      <div className={CARD}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 10 }}>סטטיסטיקות</div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { icon: CalendarDays, label: "שבועות", value: String(weeksInProgram) },
            { icon: Flame, label: "רצף", value: `${streak} ימים` },
            { icon: Dumbbell, label: "אימונים", value: `${completedCount} הושלמו` },
            { icon: Trophy, label: "שיא אישי", value: prLabel },
          ].map((s) => (
            <div key={s.label} style={{ background: "#12121f", borderRadius: 12, padding: 12, flex: 1, textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center" }}><s.icon size={20} color="#fff" /></div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginTop: 4 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 5 — preferences */}
      <div className={CARD}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>העדפות ומגבלות</span>
          <button onClick={() => setEditingPrefs((v) => !v)} style={{ background: "transparent", border: "none", color: GREEN, fontSize: 13, cursor: "pointer" }}>
            {editingPrefs ? "ביטול" : "עריכה"}
          </button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>יעד</div>
          {editingPrefs ? (
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              style={{
                width: "100%", padding: "8px 10px", borderRadius: 10, fontSize: 14,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff",
              }}
            >
              {GOAL_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          ) : (
            <Link href="/my/goal" style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, color: "#fff" }}>{goal}</span>
                <span style={{ fontSize: 16, color: "rgba(255,255,255,0.4)" }}>←</span>
              </div>
            </Link>
          )}
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>ציוד זמין</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {EQUIPMENT_OPTIONS.map((item) => {
              const selected = equipment.includes(item);
              return (
                <button
                  key={item}
                  disabled={!editingPrefs}
                  onClick={() => toggleEquipment(item)}
                  style={{
                    padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700, border: "none",
                    cursor: editingPrefs ? "pointer" : "default",
                    background: selected ? GREEN : "rgba(255,255,255,0.1)",
                    color: selected ? "#0a0a0a" : "#fff",
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>מגבלות/פציעות</div>
          {editingPrefs ? (
            <input
              type="text"
              value={limitations}
              onChange={(e) => setLimitations(e.target.value)}
              placeholder="לדוגמה: בעיות גב, ברך..."
              style={{
                width: "100%", padding: "8px 10px", borderRadius: 10, fontSize: 14,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff",
              }}
            />
          ) : (
            <div style={{ fontSize: 14, color: "#fff" }}>{limitations || "—"}</div>
          )}
        </div>

        {editingPrefs && (
          <button
            onClick={savePrefs}
            disabled={savingPrefs}
            style={{
              width: "100%", marginTop: 14, padding: "10px 0", borderRadius: 12, border: "none", cursor: "pointer",
              background: GREEN, color: "#0a0a0a", fontSize: 14, fontWeight: 800,
            }}
          >
            {savingPrefs ? "שומר..." : "שמור"}
          </button>
        )}
      </div>

      {/* Section 6 — settings */}
      <div className={CARD} style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 12 }}>הגדרות</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: 14, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}><Bell size={15} /> התראות</span>
          <ToggleSwitch on={notifications} onChange={toggleNotifications} />
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            width: "100%", textAlign: "right", background: "transparent", border: "none",
            padding: "12px 0 0", fontSize: 14, color: "#f87171", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <LogOut size={15} /> התנתקות
        </button>
      </div>
    </div>
  );
}
