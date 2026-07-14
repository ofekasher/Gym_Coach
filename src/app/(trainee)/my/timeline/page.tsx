// @ts-nocheck
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Dumbbell, Apple, CheckCircle2, Camera, Trophy, MessageSquare, UserPlus } from "lucide-react";
import { BackHeader } from "@/components/shared/back-header";

const EVENT_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  WORKOUT_PLAN_CREATED: { icon: Dumbbell, color: "text-primary bg-primary/10", label: "תוכנית אימון חדשה" },
  NUTRITION_PLAN_UPDATED: { icon: Apple, color: "text-green-400 bg-green-400/10", label: "תוכנית תזונה עודכנה" },
  CHECKIN_COMPLETED: { icon: CheckCircle2, color: "text-blue-400 bg-blue-400/10", label: "צ׳ק-אין הושלם" },
  PROGRESS_PHOTOS_UPLOADED: { icon: Camera, color: "text-purple-400 bg-purple-400/10", label: "תמונות הועלו" },
  NEW_PR: { icon: Trophy, color: "text-amber-400 bg-amber-400/10", label: "שיא אישי חדש!" },
  COACH_NOTE: { icon: MessageSquare, color: "text-muted-foreground bg-secondary", label: "הערת מאמן" },
  TRAINEE_JOINED: { icon: UserPlus, color: "text-emerald-400 bg-emerald-400/10", label: "הצטרפת לאימונים" },
};

const DEMO_TIMELINE_EVENTS = [
  { id: "1", type: "TRAINEE_JOINED", description: "הצטרפת לאימונים עם המאמן", date: new Date("2024-01-01"), metadata: null },
  { id: "2", type: "WORKOUT_PLAN_CREATED", description: "תוכנית אימון חדשה נוצרה עבורך", date: new Date("2024-01-08"), metadata: null },
  { id: "3", type: "CHECKIN_COMPLETED", description: "צ׳ק-אין שבועי הושלם - 82.5 ק״ג", date: new Date("2024-02-01"), metadata: null },
  { id: "4", type: "NEW_PR", description: "שיא אישי חדש בלחיצת חזה!", date: new Date("2024-03-15"), metadata: { exerciseName: "לחיצת חזה", weight: 80 } },
];

export default async function MyTimelinePage() {
  let events: typeof DEMO_TIMELINE_EVENTS = [];
  try {
    const session = await auth();
    if (session?.user?.id) {
      const dbEvents = await prisma.timelineEvent.findMany({
        where: { traineeId: session.user.id },
        orderBy: { date: "desc" },
        take: 50,
      });
      events = dbEvents as any;
    } else {
      events = DEMO_TIMELINE_EVENTS;
    }
  } catch {
    events = DEMO_TIMELINE_EVENTS;
  }

  return (
    <div className="space-y-4 animate-fade-in" dir="rtl">
      <BackHeader title="ציר הזמן שלי" />

      {events.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">אין אירועים עדיין</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute right-5 top-0 bottom-0 w-0.5 bg-border" />
          <div className="space-y-4 pr-14">
            {events.map((event) => {
              const cfg = EVENT_CONFIG[event.type] ?? EVENT_CONFIG.COACH_NOTE;
              const Icon = cfg.icon;
              return (
                <div key={event.id} className="relative">
                  <div className={`absolute -right-14 w-10 h-10 rounded-full flex items-center justify-center ${cfg.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="glass-card p-4">
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{cfg.label}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{event.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {format(new Date(event.date), "d MMM", { locale: he })}
                      </span>
                    </div>
                    {event.type === "NEW_PR" && event.metadata && (
                      <div className="mt-2 text-xs text-amber-400 font-medium flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> {(event.metadata as any).exerciseName}: {(event.metadata as any).weight} ק״ג
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
