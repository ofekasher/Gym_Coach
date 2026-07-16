"use client";
import { useState } from "react";
import { ChatWindow } from "@/components/shared/chat-window";
import { MessageCircle } from "lucide-react";

const CARD = { background: "#141414", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20 };

export default function CoachChatClient({ myId, trainees }: { myId: string; trainees: any[] }) {
  const [selected, setSelected] = useState<any>(trainees[0] ?? null);

  return (
    <div style={{ display: "flex", gap: 16, height: "calc(100vh - 120px)" }} dir="rtl">
      {/* Sidebar */}
      <div style={{ ...CARD, width: 240, flexShrink: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 16, margin: 0 }}>שיחות</h2>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {trainees.length === 0 && <div style={{ padding: 20, color: "#52525B", fontSize: 13 }}>אין מתאמנים עדיין</div>}
          {trainees.map(t => (
            <button key={t.id} onClick={() => setSelected(t)}
              style={{ width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, background: selected?.id === t.id ? "rgba(182,255,74,0.08)" : "none", border: "none", borderRight: selected?.id === t.id ? "3px solid #b6ff4a" : "3px solid transparent", cursor: "pointer", textAlign: "right" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(182,255,74,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#b6ff4a", fontSize: 13, flexShrink: 0 }}>
                {t.name?.[0] ?? "?"}
              </div>
              <div>
                <div style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>{t.name ?? t.email}</div>
                <div style={{ color: "#52525B", fontSize: 11 }}>{t.email}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div style={{ ...CARD, flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {selected ? (
          <ChatWindow myId={myId} otherId={selected.id} otherName={selected.name ?? selected.email} />
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <MessageCircle style={{ width: 40, height: 40, color: "#2a2a2a" }} />
            <p style={{ color: "#52525B", fontSize: 14 }}>בחר מתאמן להתחלת שיחה</p>
          </div>
        )}
      </div>
    </div>
  );
}
