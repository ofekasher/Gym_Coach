"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, RotateCcw, Bot } from "lucide-react";

interface Msg { role: "user" | "assistant"; content: string }

const QUICK = [
  "מה לאכול לפני אימון?",
  "כמה חלבון אני צריך ביום?",
  "למה הזרועות כואבות אחרי אימון?",
  "אין לי כוח להתאמן, מה עושים?",
  "כמה מנוחה צריך בין אימונים?",
  "מה לאכול כדי לבנות שרירים?",
];

const BG      = "transparent";
const CARD    = "#1A1A1F";
const PURPLE  = "#3B82F6";
const PDIM    = "rgba(59,130,246,0.15)";
const BORDER  = "rgba(255,255,255,0.06)";

export function AIChatClient({ userContext }: { userContext: any }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    const newMessages: Msg[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, userContext }),
      });
      const { message } = await res.json();
      setMessages([...newMessages, { role: "assistant", content: message }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "לא הצלחתי להתחבר. נסה שוב 🙏" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100dvh - 100px)", background: BG }} dir="rtl">

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, rgba(19,24,31,0.94), rgba(19,24,31,0.88)), url(/images/gym/dumbbell-curl.jpg)`,
        backgroundSize: "cover", backgroundPosition: "center 30%",
        borderBottom: `1px solid ${BORDER}`,
        padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 14,
            background: "linear-gradient(135deg,#1D4ED8,#3B82F6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(59,130,246,0.4)",
          }}>
            <Sparkles style={{ width: 20, height: 20, color: "#fff" }} />
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>FitBot AI</div>
            <div style={{ color: "#10B981", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
              מוכן לעזור
            </div>
          </div>
        </div>
        <button onClick={() => setMessages([])} style={{
          background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`,
          borderRadius: 10, padding: "7px 12px", color: "rgba(255,255,255,0.4)",
          cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12,
        }}>
          <RotateCcw style={{ width: 13, height: 13 }} /> נקה שיחה
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 14 }}>

        {messages.length === 0 && (
          <div style={{ paddingTop: 8 }}>
            {/* Welcome */}
            <div style={{
              background: PDIM, border: `1px solid rgba(59,130,246,0.2)`,
              borderRadius: 18, padding: "16px 18px", marginBottom: 20, textAlign: "center",
            }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><Bot size={28} color="#fff" /></div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                שלום {userContext.name}!
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                שאל/י אותי כל שאלה על תזונה, אימונים ובריאות 💪
              </div>
            </div>

            {/* Quick questions */}
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, marginBottom: 10 }}>שאלות נפוצות</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {QUICK.map((q) => (
                <button key={q} onClick={() => send(q)} style={{
                  background: CARD, border: `1px solid ${BORDER}`,
                  borderRadius: 14, padding: "10px 12px", color: "rgba(255,255,255,0.6)",
                  fontSize: 12, cursor: "pointer", textAlign: "right", lineHeight: 1.4,
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,130,246,0.4)";
                  (e.currentTarget as HTMLElement).style.color = "#fff";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = BORDER;
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)";
                }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", gap: 4 }}>
            {msg.role === "assistant" && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 22, height: 22, borderRadius: 7, background: PDIM, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Sparkles style={{ width: 11, height: 11, color: PURPLE }} />
                </div>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>FitBot</span>
              </div>
            )}
            <div style={{
              maxWidth: "82%",
              background: msg.role === "user"
                ? "linear-gradient(135deg,#1D4ED8,#3B82F6)"
                : CARD,
              color: "#fff",
              borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
              padding: "11px 15px",
              fontSize: 13,
              lineHeight: 1.7,
              border: msg.role === "assistant" ? `1px solid ${BORDER}` : "none",
              whiteSpace: "pre-wrap",
              boxShadow: msg.role === "user" ? "0 4px 20px rgba(59,130,246,0.3)" : "none",
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 7, background: PDIM, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles style={{ width: 11, height: 11, color: PURPLE }} />
            </div>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "4px 18px 18px 18px", padding: "12px 16px", display: "flex", gap: 5, alignItems: "center" }}>
              {[0, 1, 2].map((j) => (
                <div key={j} style={{ width: 7, height: 7, borderRadius: "50%", background: PURPLE, opacity: 0.8, animation: `bounce 1.2s ease ${j * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        background: CARD, borderTop: `1px solid ${BORDER}`,
        padding: "12px 14px", display: "flex", gap: 10, alignItems: "center",
        paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="שאל/י על תזונה, אימון, כאבים..."
          disabled={loading}
          style={{
            flex: 1, background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`,
            borderRadius: 14, height: 46, padding: "0 16px", color: "#fff",
            fontSize: 14, outline: "none",
          }}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          style={{
            width: 46, height: 46, borderRadius: 14, border: "none", cursor: input.trim() && !loading ? "pointer" : "default",
            background: input.trim() && !loading ? "linear-gradient(135deg,#1D4ED8,#3B82F6)" : "rgba(255,255,255,0.05)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "all 0.2s",
            boxShadow: input.trim() && !loading ? "0 4px 16px rgba(59,130,246,0.35)" : "none",
          }}
        >
          {loading
            ? <Loader2 style={{ width: 18, height: 18, color: "rgba(255,255,255,0.4)", animation: "spin 1s linear infinite" }} />
            : <Send style={{ width: 18, height: 18, color: input.trim() ? "#fff" : "rgba(255,255,255,0.2)" }} />
          }
        </button>
      </div>

      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0);opacity:0.5} 50%{transform:translateY(-6px);opacity:1} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
