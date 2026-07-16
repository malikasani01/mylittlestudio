"use client";

import type { SwatchOption } from "@/lib/fashionOptions";

interface OptionGridProps {
  options: SwatchOption[];
  value: string | string[] | null;
  onSelect: (id: string) => void;
  multi?: boolean;
}

export function OptionGrid({ options, value, onSelect, multi = false }: OptionGridProps) {
  const isActive = (id: string) => (multi ? Array.isArray(value) && value.includes(id) : value === id);

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onSelect(opt.id)}
          aria-pressed={isActive(opt.id)}
          className={`flex flex-col items-center gap-1 rounded-2xl p-2 ring-2 transition-colors ${
            isActive(opt.id) ? "ring-pink bg-pink/15" : "ring-transparent bg-white"
          }`}
        >
          {opt.hex ? (
            <span className="h-8 w-8 rounded-full ring-1 ring-black/10" style={{ backgroundColor: opt.hex }} />
          ) : (
            <span className="text-xl">{opt.emoji ?? "•"}</span>
          )}
          <span className="text-center font-round text-[11px] leading-tight text-ink/70">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
