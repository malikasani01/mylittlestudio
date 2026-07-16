"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scissors, Camera, Mic, Shirt, BookOpen } from "lucide-react";
import { ensureSession } from "@/lib/supabase/ensureSession";
import { createClient } from "@/lib/supabase/client";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function WelcomePage() {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  async function startCreating() {
    setStarting(true);
    setError("");
    try {
      const session = await ensureSession();
      const supabase = createClient();
      const { data: child } = await supabase
        .from("child_profiles")
        .select("id")
        .eq("parent_user_id", session.user.id)
        .limit(1)
        .maybeSingle();
      router.push(child ? "/home" : "/setup");
    } catch {
      setError("That didn't work. Please try again.");
      setStarting(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-gradient-to-b from-pink/25 via-cream to-lilac/15 px-6 py-12 text-center">
      <div className="flex flex-col items-center gap-3">
        <h1 className="font-heading text-3xl font-bold text-ink">Welcome to My Little Studio</h1>
        <p className="max-w-sm font-round text-base text-ink/70">
          A special place for your stories, crafts, songs, pictures, and fashion ideas.
        </p>
      </div>

      <div className="flex gap-3 rounded-3xl bg-white/70 p-4 shadow-sm">
        {[Scissors, Camera, Mic, Shirt, BookOpen].map((Icon, i) => (
          <span
            key={i}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm"
          >
            <Icon size={22} className="text-ink/70" />
          </span>
        ))}
      </div>

      <div className="flex flex-col items-center gap-2">
        <PrimaryButton
          onClick={startCreating}
          disabled={starting}
          className="min-h-[52px] px-10 text-lg"
        >
          {starting ? "Getting ready…" : "Start Creating"}
        </PrimaryButton>
        {error && <p className="font-round text-sm text-ink/60">{error}</p>}
      </div>
    </main>
  );
}
