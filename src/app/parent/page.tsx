"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { PostRow, ExportRequestRow } from "@/lib/types";
import { CATEGORY_META } from "@/lib/categories";

export default function ParentDashboardPage() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [exports, setExports] = useState<ExportRequestRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
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

      const { data: postRows } = await supabase
        .from("posts")
        .select("*")
        .eq("child_profile_id", child.id)
        .neq("status", "trashed");
      setPosts(postRows ?? []);

      const { data: exportRows } = await supabase
        .from("export_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      setExports(exportRows ?? []);

      setLoading(false);
    });
  }, []);

  const flagged = posts.filter((p) => p.safety_flag);
  const counts = Object.keys(CATEGORY_META).reduce<Record<string, number>>((acc, key) => {
    acc[key] = posts.filter((p) => p.category === key).length;
    return acc;
  }, {});

  if (loading) return <p className="font-round text-sm text-ink/50">Loading&hellip;</p>;

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="mb-2 font-heading text-lg font-bold text-ink">Content Summary</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-black/5">
            <p className="font-heading text-2xl font-bold text-ink">{posts.length}</p>
            <p className="font-round text-xs text-ink/60">Total Creations</p>
          </div>
          {Object.entries(CATEGORY_META).map(([key, meta]) => (
            <div key={key} className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-black/5">
              <p className="font-heading text-2xl font-bold text-ink">{counts[key] ?? 0}</p>
              <p className="font-round text-xs text-ink/60">{meta.label}</p>
            </div>
          ))}
        </div>
      </section>

      {flagged.length > 0 && (
        <section>
          <h2 className="mb-2 flex items-center gap-2 font-heading text-lg font-bold text-ink">
            <AlertTriangle size={18} className="text-ink/70" /> Needs Your Attention
          </h2>
          <div className="flex flex-col gap-2">
            {flagged.map((p) => (
              <div key={p.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
                <p className="font-round text-sm font-semibold text-ink">This creation may need your attention.</p>
                <p className="mt-1 font-round text-xs text-ink/60">{p.safety_reason || "Flagged during creation."}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-2 font-heading text-lg font-bold text-ink">Sharing Approvals</h2>
        {exports.length === 0 ? (
          <p className="font-round text-sm text-ink/50">No exports yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {exports.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5">
                <span className="font-round text-sm text-ink/70">{e.export_type} export</span>
                <span className="font-round text-xs text-ink/50">{new Date(e.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
