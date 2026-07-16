"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ParentPinModal } from "@/components/ParentPinModal";
import { PrimaryButton } from "@/components/PrimaryButton";
import { BACKGROUNDS } from "@/components/BackgroundPicker";
import { CATEGORY_META } from "@/lib/categories";
import type { PostRow } from "@/lib/types";

export default function ExportPreviewPage() {
  const { postId } = useParams<{ postId: string }>();
  const router = useRouter();
  const [approved, setApproved] = useState(false);
  const [post, setPost] = useState<PostRow | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("posts").select("*").eq("id", postId).single().then(({ data }) => setPost(data));
  }, [postId]);

  async function downloadImage() {
    if (!cardRef.current) return;
    setExporting(true);
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardRef.current, { backgroundColor: "#FFF9F2", scale: 2 });
    const link = document.createElement("a");
    link.download = `${post?.title || "my-little-studio"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    const supabase = createClient();
    await supabase.from("export_requests").insert({
      post_id: postId,
      requested_by_child: true,
      approved_by_parent: true,
      export_type: "square",
      approved_at: new Date().toISOString(),
    });
    setExporting(false);
  }

  if (!approved) {
    return (
      <ParentPinModal
        heading="Ask a Grown-Up to Share"
        onVerified={() => setApproved(true)}
        onCancel={() => router.back()}
      />
    );
  }

  if (!post) return <p className="px-5 py-8 text-center font-round text-sm text-ink/50">Loading&hellip;</p>;

  const meta = CATEGORY_META[post.category];

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-5 py-8">
      <h1 className="font-heading text-2xl font-bold text-ink">Export Preview</h1>

      <div
        ref={cardRef}
        className={`flex aspect-square w-full max-w-sm flex-col justify-between gap-3 rounded-3xl p-8 shadow-sm ring-1 ring-black/5 ${
          BACKGROUNDS[post.background] ?? BACKGROUNDS.cream
        }`}
      >
        <div>
          <p className="font-round text-sm text-ink/50">{meta.emoji} {meta.label}</p>
          <h2 className="font-heading text-2xl font-bold text-ink">{post.title}</h2>
        </div>
        <p className="whitespace-pre-wrap font-round text-base leading-relaxed text-ink/80">{post.edited_text}</p>
        <p className="text-right font-heading text-sm font-bold text-ink/60">My Little Studio ✨</p>
      </div>

      <PrimaryButton icon={Download} disabled={exporting} onClick={downloadImage}>
        {exporting ? "Preparing…" : "Download Image"}
      </PrimaryButton>
    </main>
  );
}
