import type { PostCategory } from "@/lib/types";

export const CATEGORY_META: Record<PostCategory, { label: string; emoji: string; accent: string }> = {
  crafts: { label: "Crafts", emoji: "✂️", accent: "bg-butter/30" },
  stories: { label: "Stories", emoji: "📖", accent: "bg-lilac/30" },
  fashion: { label: "Fashion", emoji: "👗", accent: "bg-pink/30" },
  songs: { label: "Songs", emoji: "🎵", accent: "bg-sky/30" },
  videos: { label: "Videos", emoji: "🎬", accent: "bg-mint/30" },
  pictures: { label: "Pictures", emoji: "📷", accent: "bg-butter/30" },
  other: { label: "Other", emoji: "✨", accent: "bg-lilac/30" },
};
