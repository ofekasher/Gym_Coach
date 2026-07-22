// Trainee badge tiers, derived from real workout-completion progress —
// matches the "Lior Fit Dashboard Design" spec's badge thresholds exactly.
export type BadgeTier = "gold" | "silver" | "bronze" | "trial";

export const BADGE_CONFIG: Record<BadgeTier, { label: string; color: string; bg: string }> = {
  gold: { label: "זהב", color: "#f59e0b", bg: "rgba(245,158,11,0.14)" },
  silver: { label: "כסף", color: "#c3c9d1", bg: "rgba(195,201,209,0.14)" },
  bronze: { label: "ברונזה", color: "#e0965a", bg: "rgba(224,150,90,0.14)" },
  trial: { label: "ניסיון", color: "#00D4AA", bg: "rgba(0,212,170,0.14)" },
};

export function badgeForProgress(progressPct: number): BadgeTier {
  if (progressPct >= 75) return "gold";
  if (progressPct >= 50) return "silver";
  if (progressPct >= 25) return "bronze";
  return "trial";
}
