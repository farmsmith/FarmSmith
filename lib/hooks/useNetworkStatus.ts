"use client";

import { useState, useEffect } from "react";

export interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
}

/**
 * Hook to monitor client-side network connectivity with SSR hydration safety.
 * Defaults to online (true) during SSR and initial hydration to prevent mismatches.
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Sync initial client state
    if (typeof navigator !== "undefined" && typeof navigator.onLine === "boolean") {
      setIsOnline(navigator.onLine);
      if (!navigator.onLine) {
        setWasOffline(true);
      }
    }

    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}
