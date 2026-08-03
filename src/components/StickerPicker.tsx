"use client";

import type { Sticker } from "@/lib/types";
import { uuid } from "@/lib/uuid";

const STICKER_LIBRARY = [
  "❤️", "⭐", "🌸", "🌈", "🧵", "👗", "🎵", "🐱", "✨", "🍓",
  "💖", "🌟", "🌷", "🦋", "🎀", "🧶", "👛", "🎤", "🐰", "🍩",
];

interface StickerPickerProps {
  stickers: Sticker[];
  onChange: (stickers: Sticker[]) => void;
  max?: number;
}

export function StickerPicker({ stickers, onChange, max = 5 }: StickerPickerProps) {
  function toggle(emoji: string) {
    const existing = stickers.findIndex((s) => s.emoji === emoji);
    if (existing >= 0) {
      onChange(stickers.filter((_, i) => i !== existing));
      return;
    }
    if (stickers.length >= max) return;
    onChange([...stickers, { id: uuid(), emoji, slot: stickers.length }]);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="font-round text-xs text-ink/50">{stickers.length} / {max} stickers</p>
      <div className="flex flex-wrap gap-2">
        {STICKER_LIBRARY.map((emoji) => {
          const active = stickers.some((s) => s.emoji === emoji);
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => toggle(emoji)}
              aria-pressed={active}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xl ring-2 transition-colors ${
                active ? "ring-pink bg-pink/20" : "ring-transparent bg-cream"
              }`}
            >
              {emoji}
            </button>
          );
        })}
      </div>
    </div>
  );
}
