"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, Upload, CheckCircle2, Camera } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BackHeader } from "@/components/shared/back-header";

const schema = z.object({
  weight: z.coerce.number().positive().optional(),
  waist: z.coerce.number().positive().optional(),
  chest: z.coerce.number().positive().optional(),
  hip: z.coerce.number().positive().optional(),
  arm: z.coerce.number().positive().optional(),
  bodyFat: z.coerce.number().min(0).max(60).optional(),
  followedPlan: z.boolean(),
  workoutsCompleted: z.coerce.number().int().min(0),
  traineeNotes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const ANGLES = ["FRONT", "SIDE", "BACK"] as const;
const ANGLE_LABELS: Record<string, string> = { FRONT: "קדמי", SIDE: "צד", BACK: "אחורי" };

export default function CheckInPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState<{ angle: string; file: File; preview: string }[]>([]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { followedPlan: true, workoutsCompleted: 0 },
  });

  const handlePhotoUpload = async (angle: string, file: File) => {
    const preview = URL.createObjectURL(file);
    // Convert to persistent data URL so it survives page reloads in localStorage
    const dataUrl = await new Promise<string>(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target?.result as string ?? preview);
      reader.readAsDataURL(file);
    });
    setPhotos((prev) => {
      const filtered = prev.filter((p) => p.angle !== angle);
      return [...filtered, { angle, file, preview, dataUrl }];
    });
  };

  const saveDemoCheckin = (data: FormData) => {
    const photoUrls = photos.map(p => ({ id: Date.now().toString() + p.angle, angle: p.angle, url: (p as any).dataUrl || p.preview }));
    const entry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...data,
      photos: photoUrls,
    };
    try {
      const traineeId = localStorage.getItem("demo_trainee_id") ?? "demo-trainee-1";
      const key = `demo_checkins_${traineeId}`;
      const existing = JSON.parse(localStorage.getItem(key) ?? "[]");
      localStorage.setItem(key, JSON.stringify([entry, ...existing]));
    } catch {}
    setSaving(false);
    toast({ title: "✓ צ׳ק-אין נשמר בהצלחה!" });
    router.push("/my/dashboard");
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const photoUrls: { angle: string; url: string }[] = [];
      for (const photo of photos) {
        const fd = new FormData();
        fd.append("file", photo.file);
        fd.append("angle", photo.angle);
        try {
          const uploadRes = await fetch("/api/checkin/upload", { method: "POST", body: fd });
          if (uploadRes.ok) {
            const { url } = await uploadRes.json();
            photoUrls.push({ angle: photo.angle, url });
          }
        } catch {}
      }

      try {
        const res = await fetch("/api/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, photos: photoUrls }),
        });
        if (res.ok) {
          toast({ title: "✓ צ׳ק-אין נשמר בהצלחה!" });
          router.push("/my/dashboard");
          return;
        }
      } catch {}

      // Fallback: save to localStorage (demo mode)
      saveDemoCheckin(data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      <BackHeader title="צ׳ק-אין שבועי" subtitle="עדכן את ההתקדמות שלך" />

      <div style={{
        borderRadius: 20, padding: "18px 16px", position: "relative", overflow: "hidden",
        backgroundImage: "linear-gradient(135deg, rgba(19,24,31,0.88), rgba(19,24,31,0.75)), url(/images/gym/coach-situps.jpg)",
        backgroundSize: "cover", backgroundPosition: "center 25%",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>כל שבוע נחשב 💪</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>עקביות בצ׳ק-אין עוזרת למאמן שלך לדייק את התוכנית בשבילך</div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Measurements */}
        <Card>
          <CardHeader><CardTitle>מדידות</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { name: "weight", label: "משקל (ק״ג)", placeholder: "72.5" },
              { name: "waist", label: "מותניים (ס״מ)", placeholder: "80" },
              { name: "chest", label: "חזה (ס״מ)", placeholder: "90" },
              { name: "hip", label: "ירכיים (ס״מ)", placeholder: "95" },
              { name: "arm", label: "זרוע (ס״מ)", placeholder: "35" },
              { name: "bodyFat", label: "אחוז שומן (%)", placeholder: "18" },
            ].map((field) => (
              <div key={field.name} className="space-y-1.5">
                <Label className="text-xs">{field.label}</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder={field.placeholder}
                  {...register(field.name as any)}
                  className="h-10"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Follow plan */}
        <Card>
          <CardHeader><CardTitle>שאלות</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>האם עקבת לתוכנית האימון?</Label>
              <div className="flex gap-3">
                {[{ value: true, label: "כן ✓" }, { value: false, label: "לא ✗" }].map((opt) => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setValue("followedPlan", opt.value)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      watch("followedPlan") === opt.value
                        ? opt.value ? "gradient-primary text-white border-transparent" : "bg-destructive/10 border-destructive/30 text-destructive"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>כמה אימונים השלמת השבוע?</Label>
              <Input
                type="number"
                min="0"
                max="14"
                placeholder="3"
                {...register("workoutsCompleted")}
              />
            </div>

            <div className="space-y-1.5">
              <Label>הערות (אופציונלי)</Label>
              <textarea
                className="flex min-h-20 w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="כיצד הרגשת השבוע? שינויים, קשיים..."
                {...register("traineeNotes")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              <CardTitle>תמונות התקדמות (אופציונלי)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {ANGLES.map((angle) => {
                const photo = photos.find((p) => p.angle === angle);
                return (
                  <label key={angle} className="cursor-pointer">
                    <div className={`aspect-[3/4] rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${photo ? "border-primary/30 bg-primary/5" : "border-border hover:border-primary/30"}`}>
                      {photo ? (
                        <img src={photo.preview} alt={angle} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                          <p className="text-xs text-muted-foreground">{ANGLE_LABELS[angle]}</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handlePhotoUpload(angle, e.target.files[0])}
                    />
                  </label>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" disabled={saving} className="w-full gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          שמור צ׳ק-אין
        </Button>
      </form>
    </div>
  );
}
