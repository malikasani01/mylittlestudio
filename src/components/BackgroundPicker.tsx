"use client";

export const BACKGROUNDS: Record<string, string> = {
  cream: "bg-cream",
  pink: "bg-pink/40",
  lilac: "bg-lilac/40",
  sky: "bg-sky/40",
  mint: "bg-mint/40",
  yellow: "bg-butter/40",
};

interface BackgroundPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function BackgroundPicker({ value, onChange }: BackgroundPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(BACKGROUNDS).map(([name, className]) => (
        <button
          key={name}
          type="button"
          onClick={() => onChange(name)}
          aria-pressed={value === name}
          aria-label={name}
          className={`h-11 w-11 rounded-2xl ${className} ring-2 ring-offset-2 transition-all ${
            value === name ? "ring-ink" : "ring-transparent"
          }`}
        />
      ))}
    </div>
  );
}
