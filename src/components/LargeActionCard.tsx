import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface LargeActionCardProps {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent?: "pink" | "lilac" | "sky" | "butter" | "mint";
}

const ACCENTS: Record<NonNullable<LargeActionCardProps["accent"]>, string> = {
  pink: "bg-pink/25",
  lilac: "bg-lilac/25",
  sky: "bg-sky/25",
  butter: "bg-butter/25",
  mint: "bg-mint/25",
};

export function LargeActionCard({
  href,
  title,
  description,
  icon: Icon,
  accent = "pink",
}: LargeActionCardProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition-transform hover:-translate-y-0.5 active:translate-y-0"
    >
      <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${ACCENTS[accent]}`}>
        <Icon size={32} className="text-ink" />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="font-heading text-lg font-bold text-ink">{title}</span>
        <span className="font-round text-sm text-ink/70">{description}</span>
      </span>
    </Link>
  );
}
