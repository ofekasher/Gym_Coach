"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
        // Force session to settle before reading role
        await new Promise(resolve => setTimeout(resolve, 500));
        router.refresh();
        await new Promise(resolve => setTimeout(resolve, 200));

        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();

        console.log("SESSION RESPONSE:", JSON.stringify(session));
        console.log("USER ROLE:", session?.user?.role);

        const role = session?.user?.role?.toUpperCase();
        console.log("ROLE UPPERCASE:", role);

        if (role === "COACH") {
          console.log("Redirecting to /dashboard");
          router.push("/dashboard");
        } else if (role === "ADMIN") {
          console.log("Redirecting to /admin");
          router.push("/admin");
        } else {
          console.log("Redirecting to /my/dashboard (fallback)");
          router.push("/my/dashboard");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "#111111" }}>
      {/* Subtle gym photo background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "url(/images/gym/treadmill-run.jpg)", backgroundSize: "cover", backgroundPosition: "center",
        opacity: 0.1, filter: "blur(2px) grayscale(0.3)",
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, #111111 0%, rgba(17,17,17,0.85) 40%, #111111 100%)" }} />
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, #3B82F6 0%, transparent 70%)", transform: "translate(-50%, -40%)" }} />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #3B82F6 0%, transparent 70%)", transform: "translate(30%, 30%)" }} />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Hero splash top */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold mb-5"
            style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", color: "#3B82F6" }}>
            <Zap className="w-3 h-3 fill-current" />
            AI POWERED
          </div>
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-1">Smart</h1>
          <h1 className="text-5xl font-extrabold leading-tight mb-3" style={{ color: "#3B82F6" }}>FitCoach</h1>
          <p className="text-sm" style={{ color: "#71717A" }}>המאמן שלך. התוכנית שלך. הגרסה הכי טובה שלך.</p>
        </div>

        {/* Login card */}
        <div
          className="rounded-3xl p-7"
          style={{
            background: "#1C1C1E",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.5)"
          }}
        >
          <h2 className="text-lg font-bold text-white mb-5 text-center">כניסה לחשבון</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#71717A" }}>אימייל</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                className="h-12 rounded-xl text-sm text-white placeholder:text-zinc-600"
                style={{
                  background: "#2C2C2E",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#71717A" }}>סיסמה</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-12 rounded-xl pl-10 text-sm text-white placeholder:text-zinc-600"
                  style={{
                    background: "#2C2C2E",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#52525B" }}
                  aria-label={showPass ? "הסתר סיסמה" : "הצג סיסמה"}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-full text-sm font-extrabold transition-all"
              style={{
                background: "#3B82F6",
                color: "#fff",
                boxShadow: "0 6px 24px rgba(59,130,246,0.35)",
              }}
              disabled={loading}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin ml-2" />מתחבר...</> : "כניסה לחשבון"}
            </Button>
          </form>

          <p className="text-center text-xs mt-5" style={{ color: "#52525B" }}>
            קיבלת הזמנה?{" "}
            <a href="/register" className="font-semibold hover:underline" style={{ color: "#3B82F6" }}>הרשמה כמתאמן/ת</a>
          </p>
        </div>

        <p className="text-center text-xs mt-4 opacity-40" style={{ color: "#3B82F6" }}>coach@demo.com / demo1234</p>
      </div>
    </div>
  );
}
