"use client";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Dumbbell, Apple, CheckCircle2, Camera, Trophy, MessageSquare, UserPlus } from "lucide-react";

const EVENT_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  WORKOUT_PLAN_CREATED: { icon: Dumbbell, color: "text-primary bg-primary/10", label: "תוכנית אימון נוצרה" },
  NUTRITION_PLAN_UPDATED: { icon: Apple, color: "text-green-400 bg-green-400/10", label: "תוכנית תזונה עודכנה" },
  CHECKIN_COMPLETED: { icon: CheckCircle2, color: "text-blue-400 bg-blue-400/10", label: "צ׳ק-אין הושלם" },
  PROGRESS_PHOTOS_UPLOADED: { icon: Camera, color: "text-purple-400 bg-purple-400/10", label: "תמונות הועלו" },
  NEW_PR: { icon: Trophy, color: "text-[#b6ff4a] bg-[#b6ff4a]/10", label: "שיא אישי חדש!" },
  COACH_NOTE: { icon: MessageSquare, color: "text-muted-foreground bg-secondary", label: "הערת מאמן" },
  TRAINEE_JOINED: { icon: UserPlus, color: "text-emerald-400 bg-emerald-400/10", label: "הצטרף/ה לאימונים" },
};

export function TimelineTab({ trainee }: { trainee: any }) {
  const events = trainee.timelineEvents ?? [];

  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">אין אירועים בציר הזמן עדיין</p>
      </div>
    );
  }

  return (
    <div className="relative" dir="rtl">
      {/* Timeline line */}
      <div className="absolute right-5 top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-4 pr-14">
        {events.map((event: any, i: number) => {
          const cfg = EVENT_CONFIG[event.type] ?? EVENT_CONFIG.COACH_NOTE;
          const Icon = cfg.icon;

          return (
            <div key={event.id} className="relative">
              {/* Icon dot */}
              <div className={`absolute -right-14 w-10 h-10 rounded-full flex items-center justify-center ${cfg.color}`}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="glass-card p-4">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-medium text-sm">{cfg.label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{event.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {format(new Date(event.date), "d MMM, HH:mm", { locale: he })}
                  </span>
                </div>

                {event.type === "NEW_PR" && event.metadata && (
                  <div className="mt-2 glass rounded-lg p-2 text-xs">
                    <span className="text-[#b6ff4a] font-medium">
                      {(event.metadata as any).exerciseName}: {(event.metadata as any).weight} ק״ג
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
