"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Undo2, Redo2, Shuffle, RotateCcw, Save, BookHeart } from "lucide-react";
import { TopHeader } from "@/components/TopHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { CharacterCanvas } from "@/components/fashion/CharacterCanvas";
import { OptionGrid } from "@/components/fashion/OptionGrid";
import { BackgroundPicker } from "@/components/BackgroundPicker";
import { DEFAULT_FASHION_STATE, type FashionState } from "@/lib/fashionState";
import {
  CHARACTER_BASES,
  SKIN_TONES,
  HAIRSTYLES,
  HAIR_COLORS,
  TOPS,
  BOTTOMS,
  DRESSES,
  SHOES,
  ACCESSORIES,
  NAIL_STYLES,
  NAIL_COLORS,
  CLOTHING_COLORS,
  PATTERNS,
} from "@/lib/fashionOptions";
import { createClient } from "@/lib/supabase/client";
import { ensureSession } from "@/lib/supabase/ensureSession";
import { uploadMedia } from "@/lib/media";

const CATEGORIES = [
  "Character",
  "Skin",
  "Hair",
  "Tops",
  "Bottoms",
  "Dresses",
  "Shoes",
  "Accessories",
  "Nails",
  "Colors",
  "Patterns",
  "Background",
] as const;

type Category = (typeof CATEGORIES)[number];

export default function FashionStudioPage() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>("Character");
  const [history, setHistory] = useState<FashionState[]>([DEFAULT_FASHION_STATE]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedName, setSavedName] = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [pendingAddToJournal, setPendingAddToJournal] = useState(false);

  const state = history[historyIndex];

  function commit(next: FashionState) {
    const trimmed = history.slice(0, historyIndex + 1);
    setHistory([...trimmed, next]);
    setHistoryIndex(trimmed.length);
  }

  function set<K extends keyof FashionState>(key: K, value: FashionState[K]) {
    commit({ ...state, [key]: value });
  }

  function toggleAccessory(id: string) {
    const next = state.accessories.includes(id)
      ? state.accessories.filter((a) => a !== id)
      : [...state.accessories, id];
    commit({ ...state, accessories: next });
  }

  function undo() {
    setHistoryIndex((i) => Math.max(0, i - 1));
  }
  function redo() {
    setHistoryIndex((i) => Math.min(history.length - 1, i + 1));
  }
  function startOver() {
    commit(DEFAULT_FASHION_STATE);
  }
  function randomLook() {
    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
    commit({
      ...state,
      skinTone: pick(SKIN_TONES).id,
      hairstyle: pick(HAIRSTYLES).id,
      hairColor: pick(HAIR_COLORS).id,
      clothingMode: Math.random() > 0.5 ? "dress" : "outfit",
      dress: pick(DRESSES).id,
      top: pick(TOPS).id,
      bottom: pick(BOTTOMS).id,
      shoes: pick(SHOES).id,
      primaryColor: pick(CLOTHING_COLORS).id,
      secondaryColor: pick(CLOTHING_COLORS).id,
      nailColor: pick(NAIL_COLORS).id,
    });
  }

  async function renderSvgToBlob(): Promise<Blob> {
    const svg = document.querySelector("#character-svg svg") as SVGSVGElement;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 400;
        canvas.height = 600;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#FFF9F2";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => resolve(blob!), "image/png");
      };
      img.src = url;
    });
  }

  async function saveLook(addToJournal: boolean) {
    setPendingAddToJournal(addToJournal);
    setShowNamePrompt(true);
  }

  async function confirmSave() {
    setShowNamePrompt(false);
    setSaving(true);
    const supabase = createClient();

    let session;
    try {
      session = await ensureSession();
    } catch {
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
      setSaving(false);
      return;
    }

    const title = savedName.trim() || "My New Look";
    const imageBlob = await renderSvgToBlob();
    // fashion-renders is a private bucket; this is a storage path, resolved to a signed URL on display.
    const renderPath = await uploadMedia("fashionImage", session.user.id, imageBlob, "look.png");

    let postId: string | null = null;
    if (pendingAddToJournal) {
      const { data: post } = await supabase
        .from("posts")
        .insert({
          child_profile_id: child.id,
          title,
          edited_text: `I designed ${title}.`,
          category: "fashion",
          background: state.background,
          status: "publishedToJournal",
        })
        .select()
        .single();
      if (post) {
        postId = post.id;
        await supabase.from("media_assets").insert({
          post_id: post.id,
          type: "fashionImage",
          storage_path: renderPath,
          sort_order: 0,
        });
      }
    }

    await supabase.from("fashion_designs").insert({
      child_profile_id: child.id,
      post_id: postId,
      title,
      character_base: state.characterBase,
      skin_tone: state.skinTone,
      hairstyle: state.hairstyle,
      hair_color: state.hairColor,
      clothing_items: { top: state.top, bottom: state.bottom, dress: state.dress },
      shoes: state.shoes,
      accessories: state.accessories,
      nails: { style: state.nailStyle, color: state.nailColor },
      colors: { primary: state.primaryColor, secondary: state.secondaryColor },
      patterns: { main: state.pattern },
      background: state.background,
      rendered_image_url: renderPath,
      design_configuration: state,
    });

    setSaving(false);
    if (postId) router.push(`/journal/${postId}`);
    else router.push("/studio");
  }

  return (
    <main className="flex flex-1 flex-col gap-4 px-5 pb-4">
      <TopHeader title="My Fashion Studio" />

      <div id="character-svg" className="flex justify-center rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <CharacterCanvas state={state} />
      </div>

      <div className="flex justify-center gap-2">
        <button onClick={undo} disabled={historyIndex === 0} aria-label="Undo" className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-black/5 disabled:opacity-40">
          <Undo2 size={16} />
        </button>
        <button onClick={redo} disabled={historyIndex === history.length - 1} aria-label="Redo" className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-black/5 disabled:opacity-40">
          <Redo2 size={16} />
        </button>
        <button onClick={randomLook} aria-label="Random look" className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-black/5">
          <Shuffle size={16} />
        </button>
        <button onClick={startOver} aria-label="Start over" className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-black/5">
          <RotateCcw size={16} />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={`shrink-0 rounded-2xl px-4 py-1.5 font-round text-sm font-semibold transition-colors ${
              category === c ? "bg-pink text-ink" : "bg-white text-ink/60 ring-1 ring-black/5"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="rounded-3xl bg-cream p-1">
        {category === "Character" && <OptionGrid options={CHARACTER_BASES} value={state.characterBase} onSelect={(id) => set("characterBase", id)} />}
        {category === "Skin" && <OptionGrid options={SKIN_TONES} value={state.skinTone} onSelect={(id) => set("skinTone", id)} />}
        {category === "Hair" && (
          <div className="flex flex-col gap-4">
            <OptionGrid options={HAIRSTYLES} value={state.hairstyle} onSelect={(id) => set("hairstyle", id)} />
            <OptionGrid options={HAIR_COLORS} value={state.hairColor} onSelect={(id) => set("hairColor", id)} />
          </div>
        )}
        {category === "Tops" && <OptionGrid options={TOPS} value={state.top} onSelect={(id) => commit({ ...state, clothingMode: "outfit", top: id })} />}
        {category === "Bottoms" && <OptionGrid options={BOTTOMS} value={state.bottom} onSelect={(id) => commit({ ...state, clothingMode: "outfit", bottom: id })} />}
        {category === "Dresses" && <OptionGrid options={DRESSES} value={state.dress} onSelect={(id) => commit({ ...state, clothingMode: "dress", dress: id })} />}
        {category === "Shoes" && <OptionGrid options={SHOES} value={state.shoes} onSelect={(id) => set("shoes", id)} />}
        {category === "Accessories" && <OptionGrid multi options={ACCESSORIES} value={state.accessories} onSelect={toggleAccessory} />}
        {category === "Nails" && (
          <div className="flex flex-col gap-4">
            <OptionGrid options={NAIL_STYLES} value={state.nailStyle} onSelect={(id) => set("nailStyle", id)} />
            <OptionGrid options={NAIL_COLORS} value={state.nailColor} onSelect={(id) => set("nailColor", id)} />
          </div>
        )}
        {category === "Colors" && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-1 font-round text-xs font-semibold text-ink/60">Main Color</p>
              <OptionGrid options={CLOTHING_COLORS} value={state.primaryColor} onSelect={(id) => set("primaryColor", id)} />
            </div>
            <div>
              <p className="mb-1 font-round text-xs font-semibold text-ink/60">Second Color</p>
              <OptionGrid options={CLOTHING_COLORS} value={state.secondaryColor} onSelect={(id) => set("secondaryColor", id)} />
            </div>
          </div>
        )}
        {category === "Patterns" && <OptionGrid options={PATTERNS} value={state.pattern} onSelect={(id) => set("pattern", id)} />}
        {category === "Background" && (
          <div className="p-3">
            <BackgroundPicker value={state.background} onChange={(bg) => set("background", bg)} />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <PrimaryButton icon={Save} disabled={saving} onClick={() => saveLook(false)}>
          Save My Look
        </PrimaryButton>
        <PrimaryButton icon={BookHeart} variant="secondary" disabled={saving} onClick={() => saveLook(true)}>
          Add to Journal
        </PrimaryButton>
      </div>

      {showNamePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6">
          <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-3xl bg-white p-6 text-center shadow-lg">
            <p className="font-round text-base text-ink/80">What should we call this look?</p>
            <input
              value={savedName}
              onChange={(e) => setSavedName(e.target.value)}
              placeholder="Sparkle Princess Look"
              maxLength={40}
              className="w-full rounded-2xl border border-lilac/40 px-4 py-2 text-center font-round text-base outline-none focus:ring-2 focus:ring-lilac"
              autoFocus
            />
            <div className="flex gap-3">
              <PrimaryButton variant="secondary" onClick={() => setShowNamePrompt(false)}>Cancel</PrimaryButton>
              <PrimaryButton onClick={confirmSave}>{saving ? "Saving…" : "Save"}</PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
