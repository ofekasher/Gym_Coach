"use client";
import { useState } from "react";
import { Mail, Copy, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function InvitePage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");

  const sendInvite = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        const data = await res.json();
        setInviteLink(data.inviteUrl);
        toast({ title: "✓ הזמנה נשלחה!", description: `קישור הזמנה נשלח לכתובת ${email}` });
      } else {
        const err = await res.json();
        toast({ variant: "destructive", title: "שגיאה", description: err.error });
      }
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({ title: "הקישור הועתק!" });
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold">הזמן מתאמן/ת</h1>
        <p className="text-muted-foreground text-sm mt-1">שלח קישור הזמנה לאימייל של המתאמן/ת</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <CardTitle>שליחת הזמנה</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>כתובת אימייל של המתאמן/ת</Label>
            <Input
              type="email"
              placeholder="trainee@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendInvite()}
            />
          </div>

          <Button onClick={sendInvite} disabled={loading || !email} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            שלח הזמנה
          </Button>
        </CardContent>
      </Card>

      {inviteLink && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-medium text-emerald-400">הזמנה נשלחה!</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">ניתן גם לשתף את הקישור ישירות:</p>
              <div className="flex gap-2">
                <Input value={inviteLink} readOnly className="text-xs" />
                <Button variant="outline" onClick={copyLink} className="flex-shrink-0">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
