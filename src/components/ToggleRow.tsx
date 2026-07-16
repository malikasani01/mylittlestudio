"use client";

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <span className="font-round text-sm text-ink/80">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 rounded-full transition-colors ${checked ? "bg-pink" : "bg-lilac/30"}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </label>
  );
}
