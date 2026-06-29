"use client";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { he } from "date-fns/locale";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card p-3 text-sm">
        <p className="text-muted-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export function ProgressTab({ trainee }: { trainee: any }) {
  const checkIns = [...(trainee.checkIns ?? [])].reverse();

  const weightData = checkIns
    .filter((c: any) => c.weight)
    .map((c: any) => ({
      date: format(new Date(c.date), "dd/MM", { locale: he }),
      "משקל (ק״ג)": c.weight,
    }));

  const measureData = checkIns
    .filter((c: any) => c.waist || c.chest || c.hip)
    .map((c: any) => ({
      date: format(new Date(c.date), "dd/MM", { locale: he }),
      "מותניים": c.waist,
      "חזה": c.chest,
      "ירכיים": c.hip,
      "זרוע": c.arm,
    }));

  const workoutData = (() => {
    const byWeek: Record<string, { completed: number; skipped: number }> = {};
    trainee.workoutLogs?.forEach((log: any) => {
      const week = format(new Date(log.date), "dd/MM");
      if (!byWeek[week]) byWeek[week] = { completed: 0, skipped: 0 };
      if (log.status === "COMPLETED") byWeek[week].completed++;
      else byWeek[week].skipped++;
    });
    return Object.entries(byWeek).slice(-10).map(([date, v]) => ({ date, ...v }));
  })();

  return (
    <div className="space-y-6" dir="rtl">
      {/* Weight chart */}
      <Card>
        <CardHeader><CardTitle>משקל לאורך זמן</CardTitle></CardHeader>
        <CardContent>
          {weightData.length < 2 ? (
            <p className="text-muted-foreground text-sm text-center py-8">אין מספיק נתונים עדיין</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} domain={["auto", "auto"]} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="משקל (ק״ג)" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Adherence chart */}
      <Card>
        <CardHeader><CardTitle>עקביות אימונים</CardTitle></CardHeader>
        <CardContent>
          {workoutData.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">אין נתוני אימון עדיין</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={workoutData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="completed" name="הושלם" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="skipped" name="דולג" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Measurements */}
      {measureData.length >= 2 && (
        <Card>
          <CardHeader><CardTitle>מדידות גוף לאורך זמן</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={measureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} domain={["auto", "auto"]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="מותניים" stroke="#6366f1" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="חזה" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ירכיים" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="זרוע" stroke="#ec4899" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
