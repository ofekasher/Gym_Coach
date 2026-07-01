"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Send, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface Message { id: string; senderId: string; content: string; status: string; createdAt: string; }

export function ChatWindow({ myId, otherId, otherName }: { myId: string; otherId: string; otherName: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout>();

  const isDemo = myId.startsWith("demo-") || otherId.startsWith("demo-");
  const chatKey = `demo_chat_${[myId, otherId].sort().join("_")}`;

  const load = useCallback(async () => {
    if (isDemo) {
      try {
        const stored = localStorage.getItem(chatKey);
        setMessages(stored ? JSON.parse(stored) : []);
      } catch {}
      return;
    }
    const res = await fetch(`/api/chat?with=${otherId}`);
    if (res.ok) {
      const { messages: msgs } = await res.json();
      setMessages(msgs);
    }
  }, [otherId, isDemo, chatKey]);

  useEffect(() => {
    load();
    pollingRef.current = setInterval(load, 2000);
    return () => clearInterval(pollingRef.current);
  }, [load]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setText("");
    if (isDemo) {
      const newMsg: Message = { id: Date.now().toString(), senderId: myId, content: trimmed, status: "SENT", createdAt: new Date().toISOString() };
      setMessages(prev => {
        const updated = [...prev, newMsg];
        try { localStorage.setItem(chatKey, JSON.stringify(updated)); } catch {}
        return updated;
      });
      setSending(false);
      return;
    }
    await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ receiverId: otherId, content: trimmed }) });
    await load();
    setSending(false);
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  const BUBBLE_ME = { background: "#F5C518", color: "#111", borderRadius: "18px 18px 4px 18px", padding: "10px 14px", fontSize: 13, maxWidth: "75%", alignSelf: "flex-end", fontWeight: 500 };
  const BUBBLE_OTHER = { background: "#2C2C2E", color: "#fff", borderRadius: "18px 18px 18px 4px", padding: "10px 14px", fontSize: 13, maxWidth: "75%", alignSelf: "flex-start" };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ padding: "14px 16px", background: "#1C1C1E", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(245,197,24,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#F5C518", fontSize: 13 }}>
          {otherName?.[0] ?? "?"}
        </div>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{otherName}</div>
          <div style={{ color: "#52525B", fontSize: 11 }}>שיחה פרטית</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 8 }} dir="rtl">
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#3A3A3C", fontSize: 13, marginTop: 40 }}>
            אין הודעות עדיין — שלח/י את ההודעה הראשונה 👋
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.senderId === myId;
          return (
            <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
              <div style={isMe ? BUBBLE_ME : BUBBLE_OTHER}>{msg.content}</div>
              <div style={{ color: "#3A3A3C", fontSize: 10, marginTop: 2, paddingInline: 4 }}>
                {format(new Date(msg.createdAt), "HH:mm", { locale: he })}
                {isMe && msg.status === "READ" && <span style={{ marginRight: 4, color: "#F5C518" }}>✓✓</span>}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: 8, alignItems: "center" }} dir="rtl">
        <input
          value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKey}
          placeholder="כתוב הודעה..."
          style={{ flex: 1, background: "#2C2C2E", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, height: 44, padding: "0 14px", color: "#fff", fontSize: 14, outline: "none" }}
        />
        <button onClick={send} disabled={!text.trim() || sending}
          style={{ width: 44, height: 44, background: text.trim() ? "#F5C518" : "#2C2C2E", border: "none", borderRadius: 12, cursor: text.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}>
          {sending ? <Loader2 style={{ width: 18, height: 18, color: "#111", animation: "spin 1s linear infinite" }} /> : <Send style={{ width: 18, height: 18, color: text.trim() ? "#111" : "#52525B" }} />}
        </button>
      </div>
    </div>
  );
}
