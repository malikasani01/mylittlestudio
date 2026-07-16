"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, Sparkles, Shirt, BookHeart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useChildProfile } from "@/hooks/useChildProfile";
import { LargeActionCard } from "@/components/LargeActionCard";
import { JournalCard } from "@/components/JournalCard";
import type { PostRow, MediaAssetRow } from "@/lib/types";

export default function HomePage() {
  const { profile, loading } = useChildProfile();
  const [recent, setRecent] = useState<(PostRow & { media_assets: MediaAssetRow[] })[]>([]);

  useEffect(() => {
    if (!profile) return;
    const supabase = createClient();
    supabase
      .from("posts")
      .select("*, media_assets(*)")
      .eq("child_profile_id", profile.id)
      .eq("status", "publishedToJournal")
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setRecent((data as (PostRow & { media_assets: MediaAssetRow[] })[]) ?? []));
  }, [profile]);

  if (loading) return null;

  return (
    <main className="flex flex-1 flex-col gap-6 px-5 pb-4 pt-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">
            Hi, {profile?.nickname ?? "there"}! {profile?.avatar_url}
          </h1>
          <p className="mt-1 font-round text-base text-ink/70">What do you want to create today?</p>
        </div>
        <Link
          href="/parent"
          aria-label="Grown-ups only"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-lilac/40"
        >
          <Lock size={20} className="text-ink/60" />
        </Link>
      </header>

      <section className="flex flex-col gap-3">
        <LargeActionCard
          href="/create"
          title="Create a Post"
          description="Tell a story, show a craft, sing, or add pictures."
          icon={Sparkles}
          accent="pink"
        />
        <LargeActionCard
          href="/studio"
          title="Fashion Studio"
          description="Create a character and design a new look."
          icon={Shirt}
          accent="lilac"
        />
        <LargeActionCard
          href="/journal"
          title="My Journal"
          description="See everything you have created."
          icon={BookHeart}
          accent="sky"
        />
      </section>

      {recent.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-lg font-bold text-ink">Recent Creations</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {recent.map((post) => (
              <JournalCard
                key={post.id}
                post={post}
                coverAsset={post.media_assets?.[0]}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
