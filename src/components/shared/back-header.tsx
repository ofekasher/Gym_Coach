"use client";
import { useRouter } from "next/navigation";

export function BackHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const router = useRouter();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      <button
        onClick={() => router.back()}
        aria-label="חזרה"
        style={{
          width: 40, height: 40, borderRadius: 14, flexShrink: 0,
          background: "#12160f", border: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
  );
}
