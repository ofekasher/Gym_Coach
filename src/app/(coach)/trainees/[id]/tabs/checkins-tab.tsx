"use client";
import { useState } from "react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { CheckCircle2, Image as ImageIcon, ChevronDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function CheckinsTab({ trainee }: { trainee: any }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const checkIns = trainee.checkIns ?? [];

  if (checkIns.length === 0) {
    return (
      <div className="text-center py-16">
        <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">עדיין אין צ׳ק-אינים</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" dir="rtl">
      {checkIns.map((ci: any) => (
        <Card key={ci.id} className="overflow-hidden">
          <button
            className="w-full text-right"
            onClick={() => setExpanded(expanded === ci.id ? null : ci.id)}
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white text-sm font-bold">
                  {format(new Date(ci.date), "dd", { locale: he })}
                </div>
                <div>
                  <p className="font-medium text-sm">{format(new Date(ci.date), "EEEE, d בMMMM yyyy", { locale: he })}</p>
                  <div className="flex gap-2 mt-0.5">
                    {ci.weight && <span className="text-xs text-muted-foreground">{ci.weight} ק״ג</span>}
                    {ci.bodyFat && <span className="text-xs text-muted-foreground">{ci.bodyFat}% שומן</span>}
                    <Badge variant={ci.followedPlan ? "success" : "warning"} className="text-xs">
                      {ci.followedPlan ? "עקב לתוכנית" : "לא עקב"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {ci.photos.length > 0 && <ImageIcon className="w-4 h-4 text-muted-foreground" />}
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded === ci.id ? "rotate-180" : ""}`} />
              </div>
            </div>
          </button>

          {expanded === ci.id && (
            <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
              {/* Measurements */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[
                  { label: "משקל", value: ci.weight, unit: "ק״ג" },
                  { label: "מותניים", value: ci.waist, unit: "ס״מ" },
                  { label: "חזה", value: ci.chest, unit: "ס״מ" },
                  { label: "ירכיים", value: ci.hip, unit: "ס״מ" },
                  { label: "זרוע", value: ci.arm, unit: "ס״מ" },
                  { label: "שומן", value: ci.bodyFat, unit: "%" },
                ].filter(m => m.value).map((m) => (
                  <div key={m.label} className="glass rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-primary">{m.value}</p>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-xs text-muted-foreground">{m.unit}</p>
                  </div>
                ))}
              </div>

              {/* Workouts */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">אימונים השבוע:</span>
                <span className="font-medium">{ci.workoutsCompleted}</span>
              </div>

              {/* Coach notes */}
              {ci.coachNotes && (
                <div className="glass rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">הערות מאמן</p>
                  <p className="text-sm">{ci.coachNotes}</p>
                </div>
              )}

              {/* Photos */}
              {ci.photos.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">תמונות התקדמות</p>
                  <div className="flex gap-2 flex-wrap">
                    {ci.photos.map((photo: any) => (
                      <a key={photo.id} href={photo.url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={photo.url}
                          alt={photo.angle}
                          className="w-20 h-28 object-cover rounded-lg border border-border hover:border-primary/50 transition-colors"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
