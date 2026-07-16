"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { VideoRecorder } from "@/components/VideoRecorder";
import { PhotoUploader } from "@/components/PhotoUploader";
import { PostEditor, type EditableDraft } from "@/components/create/PostEditor";
import { AiModeSelector } from "@/components/create/AiModeSelector";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TopHeader } from "@/components/TopHeader";
import { ErrorState } from "@/components/ErrorState";
import { BACKGROUNDS } from "@/components/BackgroundPicker";
import { createClient } from "@/lib/supabase/client";
import { ensureSession } from "@/lib/supabase/ensureSession";
import { uploadMedia } from "@/lib/media";
import type { AiMode, PostCategory } from "@/lib/types";
import type { GeneratedPost } from "@/lib/ai/generatePost";

export type CreateType = "story" | "craft" | "song" | "photos" | "video";

const TYPE_CONFIG: Record<
  CreateType,
  { category: PostCategory; steps: string[]; heading: string }
> = {
  story: { category: "stories", steps: ["record", "generate", "edit", "preview", "saved"], heading: "Tell me about your creation" },
  craft: { category: "crafts", steps: ["photos", "record", "generate", "edit", "preview", "saved"], heading: "Show your craft" },
  song: { category: "songs", steps: ["record", "edit", "preview", "saved"], heading: "Record your sound" },
  photos: { category: "pictures", steps: ["photos", "edit", "preview", "saved"], heading: "Add your pictures" },
  video: { category: "videos", steps: ["video", "edit", "preview", "saved"], heading: "Make a short video" },
};

export function CreateWizard({ type }: { type: CreateType }) {
  const config = TYPE_CONFIG[type];
  const [stepIndex, setStepIndex] = useState(0);
  const step = config.steps[stepIndex];

  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState("");
  const [transcribing, setTranscribing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genResults, setGenResults] = useState<Partial<Record<AiMode, GeneratedPost>>>({});
  const [activeMode, setActiveMode] = useState<AiMode>("keepMyWords");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedPostId, setSavedPostId] = useState<string | null>(null);

  const [draft, setDraft] = useState<EditableDraft>({
    title: "",
    body: "",
    category: config.category,
    background: "cream",
    stickers: [],
  });

  function goNext() {
    setStepIndex((i) => Math.min(i + 1, config.steps.length - 1));
  }

  async function handleAudioReady(blob: Blob) {
    setAudioBlob(blob);
    if (type === "song") {
      goNext();
      return;
    }
    setTranscribing(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      const res = await fetch("/api/transcribe", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTranscript(data.transcript);
      goNext();
      await runGeneration(data.transcript, "keepMyWords");
    } catch {
      setError("I couldn't hear that recording. Let's try again.");
    } finally {
      setTranscribing(false);
    }
  }

  async function runGeneration(text: string, mode: AiMode) {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text, aiMode: mode, category: config.category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGenResults((prev) => ({ ...prev, [mode]: data }));
    } catch {
      setError("I couldn't turn your words into a post right now. Your recording is still safe.");
    } finally {
      setGenerating(false);
    }
  }

  function handleSelectMode(mode: AiMode) {
    setActiveMode(mode);
    if (!genResults[mode]) runGeneration(transcript, mode);
  }

  function continueFromGeneration() {
    const result = genResults[activeMode];
    setDraft((d) => ({
      ...d,
      title: result?.title ?? d.title,
      body: result?.body ?? transcript,
      category: (result?.category as PostCategory) ?? d.category,
    }));
    goNext();
  }

  function continueFromPhotos(files: File[]) {
    setPhotoFiles(files);
    goNext();
  }

  function continueFromVideo(blob: Blob) {
    setVideoBlob(blob);
    goNext();
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const supabase = createClient();
    let session;
    try {
      session = await ensureSession();
    } catch {
      setError("That didn't save. Please try again.");
      setSaving(false);
      return;
    }

    const { data: child } = await supabase
      .from("child_profiles")
      .select("id")
      .eq("parent_user_id", session.user.id)
      .limit(1)
      .single();

    if (!child) {
      setError("We couldn't find your profile.");
      setSaving(false);
      return;
    }

    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        child_profile_id: child.id,
        title: draft.title || "Untitled",
        edited_text: draft.body,
        original_transcript: transcript || null,
        ai_mode: transcript ? activeMode : null,
        category: draft.category,
        background: draft.background,
        stickers: draft.stickers,
        status: "publishedToJournal",
      })
      .select()
      .single();

    if (postError || !post) {
      setError("That didn't save. Please try again.");
      setSaving(false);
      return;
    }

    try {
      let sortOrder = 0;
      for (const file of photoFiles) {
        const path = await uploadMedia("image", session.user.id, file, file.name);
        await supabase.from("media_assets").insert({
          post_id: post.id,
          type: "image",
          storage_path: path,
          sort_order: sortOrder++,
        });
      }
      if (audioBlob) {
        const path = await uploadMedia("audio", session.user.id, audioBlob, "audio.webm");
        await supabase.from("media_assets").insert({
          post_id: post.id,
          type: "audio",
          storage_path: path,
          sort_order: sortOrder++,
        });
      }
      if (videoBlob) {
        const path = await uploadMedia("video", session.user.id, videoBlob, "video.webm");
        await supabase.from("media_assets").insert({
          post_id: post.id,
          type: "video",
          storage_path: path,
          sort_order: sortOrder++,
        });
      }
    } catch {
      // Post itself saved; media upload issues surface via SyncStatus later rather than blocking save.
    }

    setSavedPostId(post.id);
    setSaving(false);
    goNext();
  }

  const heading = useMemo(() => {
    if (step === "edit") return "Make Your Post Special";
    if (step === "preview") return "Your Post";
    if (step === "saved") return "Your creation is saved!";
    return config.heading;
  }, [step, config.heading]);

  return (
    <main className="flex flex-1 flex-col gap-5 px-5 pb-4">
      <div className="flex items-center gap-2 pt-6">
        {stepIndex > 0 && step !== "saved" && (
          <button
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            aria-label="Back"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5"
          >
            <ArrowLeft size={18} />
          </button>
        )}
      </div>

      <TopHeader title={heading} showParentIcon={step !== "saved"} speak={step === "record" ? "Tap the microphone and start talking." : undefined} />

      {error && (
        <ErrorState
          message={error}
          actions={[{ label: "Try Again", onClick: () => setError("") }]}
        />
      )}

      {step === "photos" && <PhotoUploader onDone={continueFromPhotos} />}

      {step === "video" && <VideoRecorder onDone={continueFromVideo} />}

      {step === "record" && (
        <>
          <VoiceRecorder onDone={handleAudioReady} />
          {transcribing && <p className="text-center font-round text-sm text-ink/60">Turning your words into a story&hellip;</p>}
        </>
      )}

      {step === "generate" && (
        <AiModeSelector
          activeMode={activeMode}
          results={genResults}
          loading={generating}
          onSelectMode={handleSelectMode}
        />
      )}
      {step === "generate" && (
        <PrimaryButton disabled={!genResults[activeMode]} onClick={continueFromGeneration}>
          Use This Post
        </PrimaryButton>
      )}

      {step === "edit" && (
        <>
          <PostEditor draft={draft} onChange={setDraft} />
          <PrimaryButton onClick={goNext}>Preview</PrimaryButton>
        </>
      )}

      {step === "preview" && (
        <div className="flex flex-col gap-4">
          <div className={`flex flex-col gap-3 rounded-3xl p-6 shadow-sm ring-1 ring-black/5 ${
            BACKGROUNDS[draft.background] ?? BACKGROUNDS.cream
          }`}>
            <div className="flex flex-wrap gap-1 text-2xl">
              {draft.stickers.map((s) => (
                <span key={s.id}>{s.emoji}</span>
              ))}
            </div>
            <h2 className="font-heading text-2xl font-bold text-ink">{draft.title || "Untitled"}</h2>
            <p className="font-round text-sm text-ink/50">{new Date().toLocaleDateString()}</p>
            <p className="whitespace-pre-wrap font-round text-base leading-relaxed text-ink/80">{draft.body}</p>
            {photoFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {photoFiles.map((f, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={URL.createObjectURL(f)} alt="" className="aspect-square rounded-xl object-cover" />
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <PrimaryButton variant="secondary" onClick={() => setStepIndex(config.steps.indexOf("edit"))}>
              Edit
            </PrimaryButton>
            <PrimaryButton icon={Check} disabled={saving} onClick={handleSave}>
              {saving ? "Saving…" : "Save to My Journal"}
            </PrimaryButton>
          </div>
        </div>
      )}

      {step === "saved" && (
        <div className="flex flex-col items-center gap-6 py-8 text-center">
          <span className="text-6xl">🎉</span>
          <p className="font-round text-lg text-ink/80">Great job creating!</p>
          <div className="flex flex-col gap-3">
            {savedPostId && (
              <Link href={`/journal/${savedPostId}`}>
                <PrimaryButton>View in My Journal</PrimaryButton>
              </Link>
            )}
            <Link href="/create">
              <PrimaryButton variant="secondary">Create Something Else</PrimaryButton>
            </Link>
            <Link href="/home">
              <PrimaryButton variant="ghost">Go Home</PrimaryButton>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
