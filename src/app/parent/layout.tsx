"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ensureSession } from "@/lib/supabase/ensureSession";
import { useParentGate } from "@/hooks/useParentGate";
import { ParentPinModal } from "@/components/ParentPinModal";
import { PinSetupForm } from "@/components/PinSetupForm";

const TABS = [
  { href: "/parent", label: "Dashboard" },
  { href: "/parent/settings", label: "Settings" },
  { href: "/parent/trash", label: "Trash" },
];

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const { unlocked, checked, unlock } = useParentGate();
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (unlocked) return;
    ensureSession().then(async (session) => {
      const supabase = createClient();
      const { data } = await supabase
        .from("parent_users")
        .select("pin_hash")
        .eq("id", session.user.id)
        .single();
      setHasPin(Boolean(data?.pin_hash));
    });
  }, [unlocked]);

  if (!checked) return null;

  if (!unlocked) {
    if (hasPin === null) return null;
    if (!hasPin) return <PinSetupForm onDone={unlock} />;
    return <ParentPinModal onVerified={unlock} onCancel={() => router.push("/home")} />;
  }

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-cream">
      <header className="flex items-center justify-between px-5 pt-6">
        <h1 className="font-heading text-xl font-bold text-ink">Grown-Ups Only</h1>
        <Link href="/home" aria-label="Close Parent Area" className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
          <X size={18} />
        </Link>
      </header>
      <nav className="flex gap-2 px-5 pt-4">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={pathname === tab.href ? "page" : undefined}
            className={`rounded-2xl px-4 py-1.5 font-round text-sm font-semibold ${
              pathname === tab.href ? "bg-pink text-ink" : "bg-white text-ink/60 ring-1 ring-black/5"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <div className="flex flex-1 flex-col px-5 py-5">{children}</div>
    </div>
  );
}
