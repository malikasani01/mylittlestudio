"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PrimaryButton } from "@/components/PrimaryButton";
import { EmptyState } from "@/components/EmptyState";
import type { PostRow } from "@/lib/types";

export default function ParentTrashPage() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data: child } = await supabase
      .from("child_profiles")
      .select("id")
      .eq("parent_user_id", user.id)
      .limit(1)
      .single();
    if (!child) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("child_profile_id", child.id)
      .eq("status", "trashed")
      .order("deleted_at", { ascending: false });
    setPosts(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function restore(id: string) {
    const supabase = createClient();
    await supabase.from("posts").update({ status: "publishedToJournal", deleted_at: null }).eq("id", id);
    load();
  }

  async function permanentlyDelete(id: string) {
    const supabase = createClient();
    await supabase.from("posts").delete().eq("id", id);
    load();
  }

  if (loading) return <p className="font-round text-sm text-ink/50">Loading&hellip;</p>;
  if (posts.length === 0) return <EmptyState message="The trash is empty." />;

  return (
    <div className="flex flex-col gap-3">
      {posts.map((post) => (
        <div key={post.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <div>
            <p className="font-round text-sm font-semibold text-ink">{post.title}</p>
            <p className="font-round text-xs text-ink/50">
              Deleted {post.deleted_at ? new Date(post.deleted_at).toLocaleDateString() : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <PrimaryButton variant="secondary" icon={RotateCcw} onClick={() => restore(post.id)}>
              Restore
            </PrimaryButton>
            <PrimaryButton variant="ghost" icon={Trash2} onClick={() => permanentlyDelete(post.id)}>
              Delete Forever
            </PrimaryButton>
          </div>
        </div>
      ))}
    </div>
  );
}
