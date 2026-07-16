"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import type { PostRow, MediaAssetRow } from "@/lib/types";
import { CATEGORY_META } from "@/lib/categories";
import { getSignedMediaUrl } from "@/lib/media";

interface JournalCardProps {
  post: PostRow;
  coverAsset?: MediaAssetRow;
}

export function JournalCard({ post, coverAsset }: JournalCardProps) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const meta = CATEGORY_META[post.category];

  useEffect(() => {
    let cancelled = false;
    if (coverAsset) {
      getSignedMediaUrl(coverAsset.type, coverAsset.storage_path).then((url) => {
        if (!cancelled) setCoverUrl(url);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [coverAsset]);

  return (
    <Link
      href={`/journal/${post.id}`}
      className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition-transform hover:-translate-y-0.5"
    >
      <div className={`relative flex h-28 items-center justify-center ${meta.accent}`}>
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-4xl">{meta.emoji}</span>
        )}
        {post.is_favorite && (
          <span className="absolute right-2 top-2 rounded-full bg-white/90 p-1">
            <Heart size={14} className="fill-pink text-pink" />
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 p-3">
        <span className="truncate font-heading text-sm font-bold text-ink">{post.title || "Untitled"}</span>
        <span className="font-round text-xs text-ink/60">
          {meta.label} · {new Date(post.created_at).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
}
