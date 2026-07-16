import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "ghost";
}

const VARIANTS: Record<NonNullable<PrimaryButtonProps["variant"]>, string> = {
  primary: "bg-pink text-ink hover:bg-pink/80",
  secondary: "bg-lilac/40 text-ink hover:bg-lilac/60",
  ghost: "bg-transparent text-ink/70 hover:bg-black/5",
};

export function PrimaryButton({
  icon: Icon,
  variant = "primary",
  className = "",
  children,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      className={`flex min-h-[44px] items-center justify-center gap-2 rounded-2xl px-6 py-3 font-round text-base font-bold shadow-sm transition-colors disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
}
