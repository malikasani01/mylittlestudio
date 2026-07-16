import Link from "next/link";
import { Lock } from "lucide-react";
import { SpeakButton } from "@/components/SpeakButton";

interface TopHeaderProps {
  title: string;
  subtitle?: string;
  showParentIcon?: boolean;
  speak?: string;
}

export function TopHeader({ title, subtitle, showParentIcon = true, speak }: TopHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-3 px-5 pt-6 pb-2">
      <div className="flex items-start gap-2">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">{title}</h1>
          {subtitle && <p className="mt-1 font-round text-base text-ink/70">{subtitle}</p>}
        </div>
        {speak && <SpeakButton text={speak} />}
      </div>
      {showParentIcon && (
        <Link
          href="/parent"
          aria-label="Grown-ups only"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-lilac/40"
        >
          <Lock size={20} className="text-ink/60" />
        </Link>
      )}
    </header>
  );
}
