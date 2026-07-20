"use client";
import { useState, useCallback, createContext, useContext, useRef } from "react";
import { AlertTriangle } from "lucide-react";

const GREEN = "#a8ff3e";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within a ConfirmProvider");
  return ctx;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<(v: boolean) => void>();

  const confirm = useCallback<ConfirmFn>((options) => {
    setState(options);
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const close = (result: boolean) => {
    resolveRef.current?.(result);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div
          dir="rtl"
          style={{
            position: "fixed", inset: 0, zIndex: 300,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(3px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
          }}
          onClick={() => close(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#141414", border: "1px solid #2a2a2a", borderRadius: 20,
              padding: 24, width: "100%", maxWidth: 380,
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12, marginBottom: 14,
              background: state.danger ? "rgba(248,113,113,0.12)" : "rgba(168,255,62,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <AlertTriangle size={22} color={state.danger ? "#F87171" : GREEN} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{state.title}</div>
            {state.description && (
              <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, marginBottom: 20 }}>
                {state.description}
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: state.description ? 0 : 20 }}>
              <button
                onClick={() => close(false)}
                style={{
                  flex: 1, padding: "11px 0", borderRadius: 12, cursor: "pointer",
                  background: "#1c1c1c", border: "1px solid #2a2a2a", color: "#fff",
                  fontSize: 13.5, fontWeight: 700,
                }}
              >
                {state.cancelLabel ?? "ביטול"}
              </button>
              <button
                onClick={() => close(true)}
                style={{
                  flex: 1, padding: "11px 0", borderRadius: 12, cursor: "pointer", border: "none",
                  background: state.danger ? "#F87171" : GREEN,
                  color: state.danger ? "#1a0a0a" : "#08120a",
                  fontSize: 13.5, fontWeight: 800,
                }}
              >
                {state.confirmLabel ?? "אישור"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
