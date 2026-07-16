"use client";

import type { AiMode } from "@/lib/types";
import type { GeneratedPost } from "@/lib/ai/generatePost";

const MODES: { key: AiMode; label: string; description: string }[] = [
  { key: "keepMyWords", label: "Keep My Words", description: "Just tidy up a little." },
  { key: "makeItClearer", label: "Make It Clearer", description: "Organize it nicely." },
  { key: "makeItMagical", label: "Make It Magical", description: "Add a little sparkle." },
];

interface AiModeSelectorProps {
  activeMode: AiMode;
  results: Partial<Record<AiMode, GeneratedPost>>;
  loading: boolean;
  onSelectMode: (mode: AiMode) => void;
}

export function AiModeSelector({ activeMode, results, loading, onSelectMode }: AiModeSelectorProps) {
  const current = results[activeMode];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto">
        {MODES.map((mode) => (
          <button
            key={mode.key}
            type="button"
            onClick={() => onSelectMode(mode.key)}
            aria-pressed={activeMode === mode.key}
            className={`shrink-0 rounded-2xl px-4 py-2 font-round text-sm font-semibold transition-colors ${
              activeMode === mode.key ? "bg-pink text-ink" : "bg-white text-ink/60 ring-1 ring-black/5"
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>
      <p className="font-round text-xs text-ink/50">
        {MODES.find((m) => m.key === activeMode)?.description}
      </p>

      <div className="min-h-[140px] rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        {loading && !current ? (
          <p className="animate-pulse font-round text-base text-ink/60">Adding a little sparkle&hellip;</p>
        ) : current ? (
          <div className="flex flex-col gap-2">
            <h3 className="font-heading text-lg font-bold text-ink">{current.title}</h3>
            <p className="font-round text-base leading-relaxed text-ink/80">{current.body}</p>
          </div>
        ) : (
          <p className="font-round text-base text-ink/50">Tap a style to see your post.</p>
        )}
      </div>
    </div>
  );
}
