"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useChildProfile } from "@/hooks/useChildProfile";
import { TopHeader } from "@/components/TopHeader";
import { JournalCard } from "@/components/JournalCard";
import { EmptyState } from "@/components/EmptyState";
import type { PostCategory, PostRow, MediaAssetRow } from "@/lib/types";

type FilterKey = "all" | PostCategory;
type SortKey = "newest" | "oldest" | "favorites";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "crafts", label: "Crafts" },
  { key: "stories", label: "Stories" },
  { key: "fashion", label: "Fashion" },
  { key: "songs", label: "Songs" },
  { key: "videos", label: "Videos" },
  { key: "pictures", label: "Pictures" },
];

export default function JournalPage() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useChildProfile();
  const [posts, setPosts] = useState<(PostRow & { media_assets: MediaAssetRow[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!profile) return;
    const supabase = createClient();
    supabase
      .from("posts")
      .select("*, media_assets(*)")
      .eq("child_profile_id", profile.id)
      .eq("status", "publishedToJournal")
      .then(({ data }) => {
        setPosts((data as (PostRow & { media_assets: MediaAssetRow[] })[]) ?? []);
        setLoading(false);
      });
  }, [profile]);

  const visible = useMemo(() => {
    let list = posts;
    if (filter !== "all") list = list.filter((p) => p.category === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.edited_text ?? "").toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    if (sort === "newest") sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
    if (sort === "oldest") sorted.sort((a, b) => a.created_at.localeCompare(b.created_at));
    if (sort === "favorites") sorted.sort((a, b) => Number(b.is_favorite) - Number(a.is_favorite));
    return sorted;
  }, [posts, filter, sort, search]);

  return (
    <main className="flex flex-1 flex-col gap-4 px-5 pb-4">
      <TopHeader title="My Journal" />

      <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 shadow-sm ring-1 ring-black/5">
        <Search size={18} className="text-ink/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your creations"
          className="w-full bg-transparent font-round text-sm outline-none"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={`shrink-0 rounded-2xl px-4 py-1.5 font-round text-sm font-semibold transition-colors ${
              filter === f.key ? "bg-pink text-ink" : "bg-white text-ink/60 ring-1 ring-black/5"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        {(["newest", "oldest", "favorites"] as SortKey[]).map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            aria-pressed={sort === s}
            className={`rounded-xl px-3 py-1 font-round text-xs font-semibold capitalize ${
              sort === s ? "bg-lilac/40 text-ink" : "text-ink/50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {(loading || profileLoading) && (
        <p className="py-8 text-center font-round text-sm text-ink/50">Loading your journal&hellip;</p>
      )}

      {!loading && !profileLoading && visible.length === 0 && (
        <EmptyState
          message="Your journal is ready for your first creation."
          actionLabel="Create Something"
          onAction={() => router.push("/create")}
        />
      )}

      {!loading && visible.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {visible.map((post) => (
            <JournalCard key={post.id} post={post} coverAsset={post.media_assets?.[0]} />
          ))}
        </div>
      )}
    </main>
  );
}
