"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  email: z.string().email("אימייל לא תקין"),
  password: z.string().min(6, "סיסמה חייבת להכיל לפחות 6 תווים"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        toast({ variant: "destructive", title: "שגיאה", description: "אימייל או סיסמה שגויים" });
      } else {
        // Poll for the session instead of a blind fixed delay — retries a few
        // times in case the cookie hasn't propagated to this request yet.
        let role: string | undefined;
        for (let attempt = 0; attempt < 5 && !role; attempt++) {
          if (attempt > 0) await new Promise(resolve => setTimeout(resolve, 200));
          const sessionRes = await fetch("/api/auth/session");
          const session = await sessionRes.json();
          role = session?.user?.role?.toUpperCase();
        }

        router.refresh();

        if (role === "COACH") {
          router.push("/dashboard");
        } else if (role === "ADMIN") {
          router.push("/admin");
        } else if (role === "TRAINEE") {
          router.push("/my/dashboard");
        } else {
          // Session cookie hasn't propagated yet even after retries — don't guess
          // a role and risk landing a coach on the trainee dashboard.
          toast({ variant: "destructive", title: "שגיאה", description: "הכניסה הצליחה אך טעינת החשבון מתעכבת — רענן את הדף" });
        }
      }
    } catch {
      toast({ variant: "destructive", title: "שגיאה", description: "בעיית תקשורת, נסה שוב" });
    } finally {
      setLoading(false);
    }
  };

  const GREEN = "#a8ff3e";

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col" style={{ background: "#05050a" }} dir="rtl">
      {/* Full-bleed hero background — real Studio Lior Ziv photo, same asset as /welcome */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/lior-onboarding.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: "center 30%" }}
      />
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to top, rgba(4,4,10,0.92) 0%, rgba(4,4,10,0.45) 45%, rgba(4,4,10,0.55) 100%)",
      }} />

      {/* Wordmark */}
      <div className="relative z-10 flex items-center gap-2 px-6 pt-14">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: GREEN, boxShadow: `0 0 14px ${GREEN}` }} />
        <span className="text-white font-extrabold text-lg tracking-wide">LIOR FIT</span>
      </div>

      <div className="flex-1" />

      {/* Hero heading */}
      <div className="relative z-10 px-6 pb-6">
        <h1 className="text-white font-black text-4xl leading-tight" style={{ textShadow: "0 3px 18px rgba(0,0,0,0.7)" }}>
          ברוכים הבאים למאמן<br />האישי שלכם
        </h1>
        <div className="font-extrabold text-lg mt-2" style={{ color: GREEN, textShadow: "0 2px 10px rgba(0,0,0,0.7)" }}>Lior Fit</div>
      </div>

      {/* Glass login card */}
      <div className="relative z-10 px-6 pb-10">
        <div
          className="rounded-3xl p-6"
          style={{
            background: "rgba(10,10,18,0.45)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <Input
                id="email"
                type="email"
                placeholder="אימייל"
                autoComplete="email"
                className="h-14 rounded-2xl text-sm text-white placeholder:text-white/50 text-center"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-destructive mt-1 text-center">{errors.email.message}</p>}
            </div>

            <div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="סיסמה"
                  autoComplete="current-password"
                  className="h-14 rounded-2xl pl-10 text-sm text-white placeholder:text-white/50 text-center"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                  aria-label={showPass ? "הסתר סיסמה" : "הצג סיסמה"}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1 text-center">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-2xl text-base font-black transition-all mt-2"
              style={{ background: GREEN, color: "#08120a" }}
              disabled={loading}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin ml-2" />מתחבר...</> : "כניסה לחשבון"}
            </Button>
          </form>

          <p className="text-center text-xs mt-4" style={{ color: "rgba(255,255,255,0.55)" }}>
            קיבלת הזמנה?{" "}
            <a href="/register" className="font-bold hover:underline" style={{ color: GREEN }}>הרשמה כמתאמן/ת</a>
          </p>
        </div>
      </div>
    </div>
  );
}
