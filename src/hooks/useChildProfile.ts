"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChildProfileRow } from "@/lib/types";

export function useChildProfile() {
  const [profile, setProfile] = useState<ChildProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("child_profiles")
        .select("*")
        .eq("parent_user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!cancelled) {
        setProfile(data ?? null);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { profile, loading };
}
