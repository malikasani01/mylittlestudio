"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ToggleRow } from "@/components/ToggleRow";
import type { AiMode, ParentSettings } from "@/lib/types";

const DEFAULT_SETTINGS: ParentSettings = {
  allowImageExport: true,
  requireParentApproval: true,
  allowVideoRecording: true,
  allowAudioRecording: true,
  allowAiRewriting: true,
  keepOriginalAudio: true,
  keepOriginalTranscript: true,
  maxAudioSeconds: 180,
  maxVideoSeconds: 60,
  maxPhotosPerPost: 10,
  aiModes: ["keepMyWords", "makeItClearer", "makeItMagical"],
};

const AI_MODE_LABELS: Record<AiMode, string> = {
  keepMyWords: "Keep My Words",
  makeItClearer: "Make It Clearer",
  makeItMagical: "Make It Magical",
};

export default function ParentSettingsPage() {
  const [settings, setSettings] = useState<ParentSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from("parent_users").select("settings").eq("id", user.id).single();
      if (data?.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      setLoading(false);
    });
  }, []);

  function update<K extends keyof ParentSettings>(key: K, value: ParentSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaved(false);
  }

  function toggleAiMode(mode: AiMode) {
    const next = settings.aiModes.includes(mode)
      ? settings.aiModes.filter((m) => m !== mode)
      : [...settings.aiModes, mode];
    update("aiModes", next);
  }

  async function save() {
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("parent_users").update({ settings }).eq("id", user.id);
    setSaving(false);
    setSaved(true);
  }

  if (loading) return <p className="font-round text-sm text-ink/50">Loading&hellip;</p>;

  return (
    <div className="flex flex-col gap-6 pb-8">
      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-bold text-ink">Privacy</h2>
        <ToggleRow label="Allow Image Export" checked={settings.allowImageExport} onChange={(v) => update("allowImageExport", v)} />
        <ToggleRow label="Require Parent Approval for Every Export" checked={settings.requireParentApproval} onChange={(v) => update("requireParentApproval", v)} />
        <ToggleRow label="Allow Video Recording" checked={settings.allowVideoRecording} onChange={(v) => update("allowVideoRecording", v)} />
        <ToggleRow label="Allow Audio Recording" checked={settings.allowAudioRecording} onChange={(v) => update("allowAudioRecording", v)} />
        <ToggleRow label="Allow AI Rewriting" checked={settings.allowAiRewriting} onChange={(v) => update("allowAiRewriting", v)} />
        <ToggleRow label="Keep Original Audio" checked={settings.keepOriginalAudio} onChange={(v) => update("keepOriginalAudio", v)} />
        <ToggleRow label="Keep Original Transcript" checked={settings.keepOriginalTranscript} onChange={(v) => update("keepOriginalTranscript", v)} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-bold text-ink">Media Limits</h2>
        <label className="flex flex-col gap-1 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <span className="font-round text-sm text-ink/70">Maximum audio length (seconds)</span>
          <input
            type="number"
            min={30}
            max={600}
            value={settings.maxAudioSeconds}
            onChange={(e) => update("maxAudioSeconds", Number(e.target.value))}
            className="rounded-xl border border-lilac/40 px-3 py-2 font-round text-base outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <span className="font-round text-sm text-ink/70">Maximum video length (seconds)</span>
          <input
            type="number"
            min={10}
            max={300}
            value={settings.maxVideoSeconds}
            onChange={(e) => update("maxVideoSeconds", Number(e.target.value))}
            className="rounded-xl border border-lilac/40 px-3 py-2 font-round text-base outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <span className="font-round text-sm text-ink/70">Maximum photos per post</span>
          <input
            type="number"
            min={1}
            max={20}
            value={settings.maxPhotosPerPost}
            onChange={(e) => update("maxPhotosPerPost", Number(e.target.value))}
            className="rounded-xl border border-lilac/40 px-3 py-2 font-round text-base outline-none"
          />
        </label>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-bold text-ink">AI Settings</h2>
        {(Object.keys(AI_MODE_LABELS) as AiMode[]).map((mode) => (
          <ToggleRow
            key={mode}
            label={AI_MODE_LABELS[mode]}
            checked={settings.aiModes.includes(mode)}
            onChange={() => toggleAiMode(mode)}
          />
        ))}
      </section>

      <PrimaryButton disabled={saving} onClick={save}>
        {saving ? "Saving…" : saved ? "Saved!" : "Save Settings"}
      </PrimaryButton>
    </div>
  );
}
