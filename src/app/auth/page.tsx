"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Mail } from "lucide-react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setStatus(error ? "error" : "sent");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky/30">
        <Mail size={28} className="text-ink/70" />
      </div>
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink">Grown-Up Sign In</h1>
        <p className="mt-1 max-w-xs font-round text-sm text-ink/70">
          Enter a parent email address. We&rsquo;ll send a link to sign in — no password needed.
        </p>
      </div>

      {status === "sent" ? (
        <p className="font-round text-base text-ink/80">
          Check <strong>{email}</strong> for a sign-in link, then come back to this tab.
        </p>
      ) : (
        <form onSubmit={sendMagicLink} className="flex w-full max-w-xs flex-col gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="parent@example.com"
            className="min-h-[44px] rounded-2xl border border-lilac/40 bg-white px-4 py-2 font-round text-base text-ink outline-none focus:ring-2 focus:ring-lilac"
          />
          <PrimaryButton type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Send Sign-In Link"}
          </PrimaryButton>
          {status === "error" && (
            <p className="font-round text-sm text-ink/70">
              That didn&rsquo;t work. Please check the email and try again.
            </p>
          )}
        </form>
      )}
    </main>
  );
}
