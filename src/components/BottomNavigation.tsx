"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, Shirt, BookHeart } from "lucide-react";

const TABS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/create", label: "Create", icon: Sparkles },
  { href: "/studio", label: "Studio", icon: Shirt },
  { href: "/journal", label: "Journal", icon: BookHeart },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="sticky bottom-0 z-20 flex justify-around border-t border-lilac/40 bg-white/95 px-2 py-2 backdrop-blur"
    >
      {TABS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`flex min-w-[64px] flex-col items-center gap-1 rounded-2xl px-3 py-1.5 transition-colors ${
              isActive ? "bg-pink/30 text-ink" : "text-ink/60 hover:bg-pink/10"
            }`}
          >
            <Icon size={26} strokeWidth={isActive ? 2.5 : 2} />
            <span className="font-round text-xs font-semibold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
