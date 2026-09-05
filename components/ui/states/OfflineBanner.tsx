"use client";

import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { useNetworkStatus } from "@/lib/hooks/useNetworkStatus";

export function OfflineBanner() {
  const { isOnline, wasOffline } = useNetworkStatus();
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showReconnected) {
    return null;
  }

  return (
    <aside
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "1rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        maxWidth: "92vw",
        width: "max-content",
        background: isOnline ? "#1F3A2E" : "#78350F",
        color: "#FFFFFF",
        border: `1px solid ${isOnline ? "#059669" : "#D97706"}`,
        borderRadius: "var(--radius-full)",
        padding: "0.5rem 1.25rem",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.625rem",
        fontSize: "0.875rem",
        fontWeight: 500,
        pointerEvents: "auto",
        transition: "opacity 0.2s ease, transform 0.2s ease",
      }}
    >
      {isOnline ? (
        <>
          <Wifi size={16} style={{ color: "#34D399" }} aria-hidden="true" />
          <span>You're back online</span>
        </>
      ) : (
        <>
          <WifiOff size={16} style={{ color: "#FCD34D" }} aria-hidden="true" />
          <span>You're currently offline. Some live features may be paused.</span>
        </>
      )}
    </aside>
  );
}
