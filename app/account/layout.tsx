"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { Session } from "@supabase/supabase-js";
import { LoadingState } from "@/components/ui/states";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) {
        const redirectQuery = pathname ? `?redirect=${encodeURIComponent(pathname)}` : "";
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        router.replace(`/login${redirectQuery}`);
      }
    });
  }, [router, pathname]);

  // Loading or redirecting state
  if (session === undefined || !session) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 4.25rem)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "2.5rem 1rem",
          background: "var(--color-background)",
        }}
      >
        <LoadingState
          layout="card"
          title={session === undefined ? "Loading your account..." : "Redirecting to Sign In..."}
          description={session === undefined ? "Verifying your session, please wait..." : "Please sign in to access your account."}
          className="max-w-md w-full py-5"
        />
      </div>
    );
  }

  return (
    <div style={{ background: "var(--color-background)", minHeight: "calc(100vh - 4.25rem)", padding: "2.5rem 1rem" }}>
      <div className="container" style={{ maxWidth: "680px", margin: "0 auto" }}>
        {children}
      </div>
    </div>
  );
}
