"use client";

import { useEffect } from "react";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Stale caches after a redeploy can cause chunk-load errors in an installed
    // PWA; a one-time reload usually recovers by fetching the fresh assets.
    if (typeof window !== "undefined") {
      const KEY = "mls_reloaded_once";
      if (!sessionStorage.getItem(KEY)) {
        sessionStorage.setItem(KEY, "1");
        window.location.reload();
      }
    }
  }, []);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-16 text-center">
      <span className="text-5xl" aria-hidden>
        🌈
      </span>
      <h1 className="font-heading text-2xl font-bold text-ink">Oops, a little hiccup!</h1>
      <p className="max-w-xs font-round text-base text-ink/70">
        Nothing is lost. Let&rsquo;s try that again.
      </p>
      <button
        onClick={() => reset()}
        className="min-h-[48px] rounded-2xl bg-pink px-8 py-3 font-round text-lg font-bold text-ink shadow-sm hover:bg-pink/80"
      >
        Try Again
      </button>
      <a href="/home" className="font-round text-sm text-ink/60 underline">
        Go Home
      </a>
    </main>
  );
}
