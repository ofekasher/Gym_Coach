"use client";
import { useState } from "react";
import Link from "next/link";
import {
  User, Dumbbell, Apple, BarChart3, Calendar, Clock,
  Plus, TrendingUp, TrendingDown, MessageCircle, ArrowRight,
} from "lucide-react";
import { ProfileTab } from "./tabs/profile-tab";
import { WorkoutTab } from "./tabs/workout-tab";
import { NutritionTab } from "./tabs/nutrition-tab";
import { ProgressTab } from "./tabs/progress-tab";
import { CheckinsTab } from "./tabs/checkins-tab";
import { TimelineTab } from "./tabs/timeline-tab";

const TABS = [
  { id: "profile", label: "פרופיל", icon: User },
  { id: "workout", label: "אימון", icon: Dumbbell },
  { id: "nutrition", label: "תזונה", icon: Apple },
  { id: "progress", label: "גרפים", icon: BarChart3 },
  { id: "checkins", label: "צ׳ק-אינים", icon: Calendar },
  { id: "timeline", label: "ציר זמן", icon: Clock },
];

const AVATAR_COLORS = ["#F5C518", "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EC4899"];

export function TraineeDetailClient({ trainee }: { trainee: any }) {
  const [activeTab, setActiveTab] = useState("profile");

  const lastCheckIn = trainee.checkIns[0];
  const prevCheckIn = trainee.checkIns[1];
  const weightDiff = lastCheckIn?.weight && prevCheckIn?.weight
    ? lastCheckIn.weight - prevCheckIn.weight
    : null;

  const avatarColor = AVATAR_COLORS[(trainee.name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

  return (
    <div className="space-y-5 animate-fade-in" dir="rtl">
      {/* Header card */}
      <div style={{ background: "linear-gradient(145deg, #1A1A1C, #141416)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 24, padding: "20px 22px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
        <div className="flex items-start gap-4 flex-wrap">
          {/* Avatar */}
          <div style={{ width: 60, height: 60, background: avatarColor, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", color: "#111", fontWeight: 900, fontSize: 24, flexShrink: 0, boxShadow: `0 8px 24px ${avatarColor}40` }}>
            {trainee.name?.[0] ?? "?"}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>{trainee.name}</h1>
            <p style={{ color: "#52525B", fontSize: 13, margin: "0 0 10px" }}>{trainee.email}</p>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {lastCheckIn?.weight && (
                <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "5px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "#71717A", fontSize: 12 }}>משקל:</span>
                  <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{lastCheckIn.weight} ק״ג</span>
                  {weightDiff !== null && (
                    <span style={{ color: weightDiff < 0 ? "#10B981" : "#F87171", fontSize: 12, display: "flex", alignItems: "center", gap: 2 }}>
                      {weightDiff < 0 ? <TrendingDown style={{ width: 12, height: 12 }} /> : <TrendingUp style={{ width: 12, height: 12 }} />}
                      {Math.abs(weightDiff).toFixed(1)}
                    </span>
                  )}
                </div>
              )}
              {trainee.traineeProfile?.goals.slice(0, 2).map((g: string) => (
                <span key={g} style={{ background: "rgba(245,197,24,0.08)", color: "#F5C518", border: "1px solid rgba(245,197,24,0.15)", borderRadius: 999, padding: "4px 12px", fontSize: 11, fontWeight: 700 }}>{g}</span>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <Link href={`/trainees/${trainee.id}/workout/new`}>
              <button style={{ background: "#F5C518", color: "#111", border: "none", borderRadius: 12, padding: "8px 14px", fontWeight: 800, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                <Plus style={{ width: 13, height: 13 }} />אימון
              </button>
            </Link>
            <Link href={`/trainees/${trainee.id}/nutrition/new`}>
              <button style={{ background: "rgba(255,255,255,0.06)", color: "#E5E5E5", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "8px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                <Plus style={{ width: 13, height: 13 }} />תזונה
              </button>
            </Link>
            <Link href={`/chat`}>
              <button style={{ background: "rgba(255,255,255,0.06)", color: "#E5E5E5", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "8px 12px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                <MessageCircle style={{ width: 15, height: 15 }} />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ overflowX: "auto" }} className="no-scrollbar">
        <div style={{ display: "flex", gap: 4, minWidth: "max-content", background: "#161618", borderRadius: 14, padding: 4 }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: active ? "#F5C518" : "transparent",
                  color: active ? "#111" : "#48484A",
                  fontWeight: active ? 800 : 600, fontSize: 13, transition: "all 0.2s", whiteSpace: "nowrap" as const,
                }}
              >
                <tab.icon style={{ width: 14, height: 14 }} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="animate-fade-in" key={activeTab}>
        {activeTab === "profile" && <ProfileTab trainee={trainee} />}
        {activeTab === "workout" && <WorkoutTab trainee={trainee} />}
        {activeTab === "nutrition" && <NutritionTab trainee={trainee} />}
        {activeTab === "progress" && <ProgressTab trainee={trainee} />}
        {activeTab === "checkins" && <CheckinsTab trainee={trainee} />}
        {activeTab === "timeline" && <TimelineTab trainee={trainee} />}
      </div>
    </div>
  );
}
