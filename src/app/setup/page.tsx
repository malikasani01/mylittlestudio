"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ensureSession } from "@/lib/supabase/ensureSession";
import { PrimaryButton } from "@/components/PrimaryButton";

const AVATARS = ["🦄", "🧚", "🌸", "🐱", "⭐", "🎀", "🐬", "🦋"];
const COLORS = [
  { name: "pink", hex: "#F7B8D4" },
  { name: "lilac", hex: "#C9B6F2" },
  { name: "sky", hex: "#A9D8F5" },
  { name: "butter", hex: "#F8E49A" },
  { name: "mint", hex: "#BCE8D5" },
];

export default function ChildSetupPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [favoriteColor, setFavoriteColor] = useState(COLORS[0].name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim()) return;
    setSaving(true);
    setError("");

    try {
      const supabase = createClient();
      const session = await ensureSession();

      const { error: insertError } = await supabase.from("child_profiles").insert({
        parent_user_id: session.user.id,
        nickname: nickname.trim(),
        avatar_url: avatar,
        favorite_color: favoriteColor,
      });

      if (insertError) throw insertError;
      router.push("/home");
    } catch {
      setError("That didn't save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10">
      <h1 className="font-heading text-2xl font-bold text-ink">Set Up My Studio</h1>

      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-6">
        <label className="flex flex-col gap-2">
          <span className="font-round text-sm font-semibold text-ink/70">What should we call you?</span>
          <input
            required
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Nickname"
            maxLength={20}
            className="min-h-[44px] rounded-2xl border border-lilac/40 bg-white px-4 py-2 font-round text-base outline-none focus:ring-2 focus:ring-lilac"
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="font-round text-sm font-semibold text-ink/70">Choose an avatar</span>
          <div className="grid grid-cols-4 gap-2">
            {AVATARS.map((a) => (
              <button
                type="button"
                key={a}
                onClick={() => setAvatar(a)}
                aria-pressed={avatar === a}
                className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ring-2 transition-colors ${
                  avatar === a ? "ring-pink bg-pink/20" : "ring-transparent bg-white"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-round text-sm font-semibold text-ink/70">Favorite color</span>
          <div className="flex gap-3">
            {COLORS.map((c) => (
              <button
                type="button"
                key={c.name}
                onClick={() => setFavoriteColor(c.name)}
                aria-pressed={favoriteColor === c.name}
                aria-label={c.name}
                style={{ backgroundColor: c.hex }}
                className={`h-10 w-10 rounded-full ring-2 ring-offset-2 transition-all ${
                  favoriteColor === c.name ? "ring-ink" : "ring-transparent"
                }`}
              />
            ))}
          </div>
        </div>

        {error && <p className="font-round text-sm text-ink/70">{error}</p>}

        <PrimaryButton type="submit" disabled={saving || !nickname.trim()}>
          {saving ? "Creating…" : "Create My Studio"}
        </PrimaryButton>
      </form>
    </main>
  );
}
