"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, Download, Trash2, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PrimaryButton } from "@/components/PrimaryButton";
import { MediaGallery } from "@/components/MediaGallery";
import { PostEditor, type EditableDraft } from "@/components/create/PostEditor";
import { BACKGROUNDS } from "@/components/BackgroundPicker";
import { CATEGORY_META } from "@/lib/categories";
import type { PostRow, MediaAssetRow } from "@/lib/types";

export default function JournalPostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const router = useRouter();
  const [post, setPost] = useState<PostRow | null>(null);
  const [assets, setAssets] = useState<MediaAssetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<EditableDraft | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("posts")
      .select("*, media_assets(*)")
      .eq("id", postId)
      .single()
      .then(({ data }) => {
        if (data) {
          setPost(data);
          setAssets(data.media_assets ?? []);
          setDraft({
            title: data.title,
            body: data.edited_text ?? "",
            category: data.category,
            background: data.background,
            stickers: data.stickers ?? [],
          });
        }
        setLoading(false);
      });
  }, [postId]);

  async function toggleFavorite() {
    if (!post) return;
    const supabase = createClient();
    const next = !post.is_favorite;
    setPost({ ...post, is_favorite: next });
    await supabase.from("posts").update({ is_favorite: next }).eq("id", post.id);
  }

  async function saveEdit() {
    if (!post || !draft) return;
    const supabase = createClient();
    await supabase
      .from("posts")
      .update({
        title: draft.title,
        edited_text: draft.body,
        category: draft.category,
        background: draft.background,
        stickers: draft.stickers,
      })
      .eq("id", post.id);
    setPost({ ...post, ...draft, edited_text: draft.body });
    setEditing(false);
  }

  async function moveToTrash() {
    if (!post) return;
    const supabase = createClient();
    await supabase
      .from("posts")
      .update({ status: "trashed", deleted_at: new Date().toISOString() })
      .eq("id", post.id);
    router.push("/journal");
  }

  if (loading) return <p className="px-5 py-8 text-center font-round text-sm text-ink/50">Loading&hellip;</p>;
  if (!post) return <p className="px-5 py-8 text-center font-round text-sm text-ink/50">We couldn&rsquo;t find that creation.</p>;

  const meta = CATEGORY_META[post.category];

  return (
    <main className="flex flex-1 flex-col gap-4 px-5 pb-6">
      <div className="flex items-center justify-between pt-6">
        <button
          onClick={() => router.push("/journal")}
          aria-label="Back to journal"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5"
        >
          <ArrowLeft size={18} />
        </button>
        <button onClick={toggleFavorite} aria-label="Favorite" className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
          <Heart size={18} className={post.is_favorite ? "fill-pink text-pink" : "text-ink/50"} />
        </button>
      </div>

      {editing && draft ? (
        <>
          <PostEditor draft={draft} onChange={setDraft} />
          <div className="flex gap-3">
            <PrimaryButton variant="secondary" onClick={() => setEditing(false)}>Cancel</PrimaryButton>
            <PrimaryButton onClick={saveEdit}>Save Changes</PrimaryButton>
          </div>
        </>
      ) : (
        <div className={`flex flex-col gap-3 rounded-3xl p-6 shadow-sm ring-1 ring-black/5 ${BACKGROUNDS[post.background] ?? BACKGROUNDS.cream}`}>
          <div className="flex flex-wrap gap-1 text-2xl">
            {post.stickers?.map((s) => (
              <span key={s.id}>{s.emoji}</span>
            ))}
          </div>
          <h1 className="font-heading text-2xl font-bold text-ink">{post.title}</h1>
          <p className="font-round text-sm text-ink/50">
            {meta.emoji} {meta.label} · {new Date(post.created_at).toLocaleDateString()}
          </p>
          <p className="whitespace-pre-wrap font-round text-base leading-relaxed text-ink/80">{post.edited_text}</p>
          <MediaGallery assets={assets} />
        </div>
      )}

      {!editing && (
        <div className="flex flex-wrap gap-3">
          <PrimaryButton icon={Pencil} variant="secondary" onClick={() => setEditing(true)}>
            Edit
          </PrimaryButton>
          <Link href={`/export/${post.id}`}>
            <PrimaryButton icon={Download} variant="secondary">Export</PrimaryButton>
          </Link>
          <PrimaryButton icon={Trash2} variant="ghost" onClick={() => setConfirmingDelete(true)}>
            Delete
          </PrimaryButton>
        </div>
      )}

      {confirmingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6">
          <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-3xl bg-white p-6 text-center shadow-lg">
            <p className="font-round text-base text-ink/80">Do you want to move this creation to the trash?</p>
            <div className="flex gap-3">
              <PrimaryButton variant="secondary" onClick={() => setConfirmingDelete(false)}>Keep It</PrimaryButton>
              <PrimaryButton onClick={moveToTrash}>Move to Trash</PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
