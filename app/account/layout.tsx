"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { Session } from "@supabase/supabase-js";

import { LoadingState } from "@/components/ui/states";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) router.replace("/login");
    });
  }, [router]);

  // Loading state
  if (session === undefined) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <LoadingState
          layout="compact"
          title="Loading your account..."
          description="Verifying your session, please wait..."
        />
      </div>
    );
  }


  // Not authenticated
  if (!session) return null;

  return (
    <div style={{ background: "var(--color-background)", minHeight: "80vh", paddingBlock: "3rem 5rem" }}>
      <div className="container" style={{ maxWidth: "680px", margin: "0 auto" }}>
        {children}
      </div>
    </div>
  );
}
