"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, UserPlus, ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Trainee {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  traineeProfile: { currentWeight: number | null; goals: string[] } | null;
  checkIns: { date: Date; weight: number | null }[];
  workoutPlans: { id: string }[];
}

const GOAL_LABELS: Record<string, string> = {
  weight_loss: "ירידה במשקל",
  muscle_gain: "בניית שריר",
  endurance: "סיבולת",
  strength: "כוח",
  flexibility: "גמישות",
  health: "בריאות כללית",
};

export function TraineesClient({ trainees }: { trainees: Trainee[] }) {
  const [search, setSearch] = useState("");

  const filtered = trainees.filter(
    (t) =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">המתאמנים שלי</h1>
          <p className="text-muted-foreground text-sm">{trainees.length} מתאמנים סה״כ</p>
        </div>
        <Link href="/invite">
          <Button className="gap-2">
            <UserPlus className="w-4 h-4" />
            הזמן מתאמן/ת
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="חיפוש לפי שם או אימייל..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-muted-foreground mb-4">
            {search ? "לא נמצאו תוצאות" : "עדיין אין מתאמנים"}
          </p>
          {!search && (
            <Link href="/invite"><Button>הזמן מתאמן/ת ראשון/ה</Button></Link>
          )}
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/trainees/${t.id}`}>
                <Card className="p-5 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 cursor-pointer group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-primary/20">
                      {t.name?.[0] ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.email}</p>
                        </div>
                        <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {t.workoutPlans.length > 0 && (
                          <Badge variant="secondary" className="text-xs">יש תוכנית אימון</Badge>
                        )}
                        {t.checkIns.length > 0 && t.checkIns[0].weight && (
                          <Badge variant="outline" className="text-xs">{t.checkIns[0].weight} ק״ג</Badge>
                        )}
                        {t.traineeProfile?.goals.slice(0, 2).map((g) => (
                          <Badge key={g} variant="outline" className="text-xs">{GOAL_LABELS[g] ?? g}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
