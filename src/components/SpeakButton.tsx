"use client";

import { Volume2 } from "lucide-react";

export function SpeakButton({ text }: { text: string }) {
  const speak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={speak}
      aria-label="Read this out loud"
      className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky/40 text-ink hover:bg-sky/60"
    >
      <Volume2 size={16} />
    </button>
  );
}
