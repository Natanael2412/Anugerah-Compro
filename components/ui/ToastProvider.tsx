"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const COLORS: Record<ToastType, string> = {
  success: "rgba(70,170,100,0.15)",
  error: "rgba(200,70,70,0.15)",
  info: "rgba(192,192,192,0.1)",
};

const BORDERS: Record<ToastType, string> = {
  success: "1px solid rgba(70,170,100,0.4)",
  error: "1px solid rgba(200,70,70,0.4)",
  info: "1px solid rgba(192,192,192,0.2)",
};

const ICONS: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  info: "·",
};

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast stack — bottom right */}
      <div
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
          pointerEvents: "none",
        }}
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.75rem 1.25rem",
              background: COLORS[toast.type],
              border: BORDERS[toast.type],
              borderRadius: "2px",
              backdropFilter: "blur(12px)",
              animation: "toastIn 0.25s ease",
              fontFamily: "var(--font-helvetica)",
              fontSize: "0.75rem",
              letterSpacing: "0.06em",
              color: "var(--color-text)",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            }}
          >
            <span style={{ fontSize: "0.85rem" }}>{ICONS[toast.type]}</span>
            {toast.message}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
