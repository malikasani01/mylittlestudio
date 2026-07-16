import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";
import { PrimaryButton } from "@/components/PrimaryButton";

interface EmptyStateProps {
  icon?: LucideIcon;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon = Sparkles, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-16 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-lilac/25">
        <Icon size={40} className="text-ink/60" />
      </span>
      <p className="font-round text-base text-ink/70">{message}</p>
      {actionLabel && onAction && <PrimaryButton onClick={onAction}>{actionLabel}</PrimaryButton>}
    </div>
  );
}
