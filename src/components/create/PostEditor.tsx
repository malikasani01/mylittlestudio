"use client";

import { Mic } from "lucide-react";
import { BackgroundPicker } from "@/components/BackgroundPicker";
import { StickerPicker } from "@/components/StickerPicker";
import type { PostCategory, Sticker } from "@/lib/types";
import { CATEGORY_META } from "@/lib/categories";

export interface EditableDraft {
  title: string;
  body: string;
  category: PostCategory;
  background: string;
  stickers: Sticker[];
}

interface PostEditorProps {
  draft: EditableDraft;
  onChange: (draft: EditableDraft) => void;
}

export function PostEditor({ draft, onChange }: PostEditorProps) {
  function speakTitleEdit() {
    if (typeof window === "undefined" || !("webkitSpeechRecognition" in window)) return;
    type SpeechRecognitionCtor = new () => SpeechRecognition;
    const Recognition = (window as unknown as { webkitSpeechRecognition: SpeechRecognitionCtor })
      .webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const said = event.results[0][0].transcript;
      onChange({ ...draft, title: said });
    };
    recognition.start();
  }

  return (
    <div className="flex flex-col gap-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <label className="flex flex-col gap-2">
        <span className="font-round text-sm font-semibold text-ink/70">Title</span>
        <div className="flex items-center gap-2">
          <input
            value={draft.title}
            onChange={(e) => onChange({ ...draft, title: e.target.value })}
            maxLength={60}
            className="min-h-[44px] flex-1 rounded-2xl border border-lilac/40 bg-cream px-4 py-2 font-round text-base outline-none focus:ring-2 focus:ring-lilac"
          />
          {typeof window !== "undefined" && "webkitSpeechRecognition" in window && (
            <button
              type="button"
              onClick={speakTitleEdit}
              aria-label="Say the new title"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky/30"
            >
              <Mic size={18} />
            </button>
          )}
        </div>
      </label>

      <label className="flex flex-col gap-2">
        <span className="font-round text-sm font-semibold text-ink/70">Story</span>
        <textarea
          value={draft.body}
          onChange={(e) => onChange({ ...draft, body: e.target.value })}
          rows={6}
          className="rounded-2xl border border-lilac/40 bg-cream px-4 py-3 font-round text-base leading-relaxed outline-none focus:ring-2 focus:ring-lilac"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="font-round text-sm font-semibold text-ink/70">Category</span>
        <select
          value={draft.category}
          onChange={(e) => onChange({ ...draft, category: e.target.value as PostCategory })}
          className="min-h-[44px] rounded-2xl border border-lilac/40 bg-cream px-4 py-2 font-round text-base outline-none focus:ring-2 focus:ring-lilac"
        >
          {Object.entries(CATEGORY_META).map(([key, meta]) => (
            <option key={key} value={key}>
              {meta.emoji} {meta.label}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-2">
        <span className="font-round text-sm font-semibold text-ink/70">Background</span>
        <BackgroundPicker value={draft.background} onChange={(background) => onChange({ ...draft, background })} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-round text-sm font-semibold text-ink/70">Stickers</span>
        <StickerPicker stickers={draft.stickers} onChange={(stickers) => onChange({ ...draft, stickers })} />
      </div>
    </div>
  );
}
