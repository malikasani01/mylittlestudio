"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SplashPage() {
  const router = useRouter();
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function routeNext() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        if (!cancelled) router.replace("/welcome");
        return;
      }

      const { data: child } = await supabase
        .from("child_profiles")
        .select("id")
        .eq("parent_user_id", session.user.id)
        .limit(1)
        .maybeSingle();

      if (cancelled) return;
      router.replace(child ? "/home" : "/setup");
    }

    const timer = setTimeout(() => {
      routeNext().catch(() => setShowRetry(true));
    }, 1200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-gradient-to-b from-pink/30 via-cream to-lilac/20 px-6 text-center">
      <span className="animate-pulse" aria-hidden>
        <Sparkles size={72} className="text-lilac" />
      </span>
      <h1 className="font-heading text-4xl font-bold text-ink">My Little Studio</h1>
      <p className="font-round text-lg text-ink/70">Create. Imagine. Share Your Sparkle.</p>
      {showRetry && (
        <p className="font-round text-sm text-ink/50">Taking a little longer than usual&hellip;</p>
      )}
    </main>
  );
}
