"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Undo2, Redo2, Shuffle, RotateCcw, Save, BookHeart } from "lucide-react";
import { TopHeader } from "@/components/TopHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { CharacterCanvas } from "@/components/fashion/CharacterCanvas";
import { createClient } from "@/lib/supabase/client";
import { ensureSession } from "@/lib/supabase/ensureSession";
import { uploadMedia } from "@/lib/media";
import {
  buildDoll,
  petPreviewSvg,
  catConfig,
  defaultCharacters,
  randomizeChar,
  CATS,
  type DollConfig,
} from "@/lib/doll";

// Small helper to drop a doll/pet SVG string into a fixed box.
function Thumb({ html, className = "" }: { html: string; className?: string }) {
  return (
    <div
      className={`overflow-hidden [&>svg]:mx-auto [&>svg]:block [&>svg]:h-full [&>svg]:w-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function FashionStudioPage() {
  const router = useRouter();
  const [history, setHistory] = useState<DollConfig[][]>(() => [defaultCharacters()]);
  const [hIndex, setHIndex] = useState(0);
  const [idx, setIdx] = useState(0);
  const [cat, setCat] = useState("hair");
  const [saving, setSaving] = useState(false);
  const [savedName, setSavedName] = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [pendingAddToJournal, setPendingAddToJournal] = useState(false);

  const roster = history[hIndex];
  const cur = roster[idx];
  const cfg = catConfig(cat);

  function commit(nextChar: DollConfig) {
    const nextRoster = roster.map((c, i) => (i === idx ? nextChar : c));
    const trimmed = history.slice(0, hIndex + 1);
    setHistory([...trimmed, nextRoster]);
    setHIndex(trimmed.length);
  }

  function setField<K extends keyof DollConfig>(field: K, value: DollConfig[K]) {
    commit({ ...cur, [field]: value });
  }

  function undo() {
    setHIndex((i) => Math.max(0, i - 1));
  }
  function redo() {
    setHIndex((i) => Math.min(history.length - 1, i + 1));
  }
  function startOver() {
    commit(defaultCharacters()[idx]);
  }
  function surprise() {
    commit(randomizeChar(cur));
  }

  async function renderSvgToBlob(): Promise<Blob> {
    const svg = document.querySelector("#character-svg svg") as SVGSVGElement;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    // Give the exported SVG an explicit intrinsic size so it rasterises reliably.
    clone.setAttribute("width", "220");
    clone.setAttribute("height", "380");
    const svgString = new XMLSerializer().serializeToString(clone);
    const url = URL.createObjectURL(new Blob([svgString], { type: "image/svg+xml" }));

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 440;
        canvas.height = 760;
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

  function saveLook(addToJournal: boolean) {
    setPendingAddToJournal(addToJournal);
    setShowNamePrompt(true);
  }

  async function confirmSave() {
    setShowNamePrompt(false);
    setSaving(true);
    const supabase = createClient();

    try {
      const session = await ensureSession();
      const { data: child } = await supabase
        .from("child_profiles")
        .select("id")
        .eq("parent_user_id", session.user.id)
        .limit(1)
        .maybeSingle();
      if (!child) {
        setSaving(false);
        return;
      }

      const title = savedName.trim() || "My New Look";
      const imageBlob = await renderSvgToBlob();
      const renderPath = await uploadMedia("fashionImage", session.user.id, imageBlob, "look");

      let postId: string | null = null;
      if (pendingAddToJournal) {
        const { data: post } = await supabase
          .from("posts")
          .insert({
            child_profile_id: child.id,
            title,
            edited_text: `I designed ${title}.`,
            category: "fashion",
            background: "cream",
            status: "publishedToJournal",
          })
          .select("id")
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

      const worn = [cur.glasses, cur.hat, cur.jewelry, cur.bag, cur.wings].filter((v) => v && v !== "none");
      await supabase.from("fashion_designs").insert({
        child_profile_id: child.id,
        post_id: postId,
        title,
        character_base: cur.name ?? "custom",
        skin_tone: cur.skin,
        hairstyle: cur.hairStyle,
        hair_color: cur.hairColor,
        clothing_items: { top: cur.top, bottom: cur.bottom },
        shoes: cur.shoes,
        accessories: worn,
        nails: {},
        colors: { top: cur.topColor, bottom: cur.bottomColor, hair: cur.hairColor, shoe: cur.shoeColor },
        patterns: {},
        background: "cream",
        rendered_image_url: renderPath,
        design_configuration: cur,
      });

      setSaving(false);
      if (postId) router.push(`/journal/${postId}`);
      else router.push("/journal");
    } catch {
      setSaving(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-4 px-5 pb-4">
      <TopHeader title="My Fashion Studio" />

      <div id="character-svg" className="flex justify-center rounded-3xl bg-gradient-to-b from-white to-pink/10 p-4 shadow-sm ring-1 ring-black/5">
        <CharacterCanvas config={cur} />
      </div>

      {/* base-character roster */}
      <div className="flex justify-center gap-2 overflow-x-auto">
        {roster.map((c, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-pressed={i === idx}
            aria-label={c.name}
            className={`shrink-0 rounded-2xl p-1 ring-2 transition-colors ${i === idx ? "ring-pink bg-pink/15" : "ring-transparent bg-white"}`}
          >
            <Thumb html={buildDoll(c)} className="h-14 w-10" />
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-2">
        <button onClick={undo} disabled={hIndex === 0} aria-label="Undo" className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-black/5 disabled:opacity-40">
          <Undo2 size={16} />
        </button>
        <button onClick={redo} disabled={hIndex === history.length - 1} aria-label="Redo" className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-black/5 disabled:opacity-40">
          <Redo2 size={16} />
        </button>
        <button onClick={surprise} aria-label="Surprise outfit" className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-black/5">
          <Shuffle size={16} />
        </button>
        <button onClick={startOver} aria-label="Start over" className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-black/5">
          <RotateCcw size={16} />
        </button>
      </div>

      {/* category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATS.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setCat(id)}
            aria-pressed={cat === id}
            className={`shrink-0 rounded-2xl px-4 py-1.5 font-round text-sm font-semibold transition-colors ${
              cat === id ? "bg-pink text-ink" : "bg-white text-ink/60 ring-1 ring-black/5"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-3xl bg-cream p-3">
        {/* style options */}
        {cfg.styles && cfg.styleField && (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {cfg.styles.map(([key, label]) => {
              const field = cfg.styleField!;
              const selected = cur[field] === key;
              const preview =
                cat === "pet"
                  ? key === "none"
                    ? null
                    : petPreviewSvg(key)
                  : buildDoll({ ...cur, [field]: key });
              return (
                <button
                  key={key}
                  onClick={() => setField(field, key)}
                  aria-pressed={selected}
                  className={`flex flex-col items-center gap-1 rounded-2xl p-1.5 ring-2 transition-colors ${
                    selected ? "ring-pink bg-pink/15" : "ring-transparent bg-white"
                  }`}
                >
                  {preview ? (
                    <Thumb html={preview} className="h-20 w-full" />
                  ) : (
                    <span className="flex h-20 w-full items-center justify-center text-2xl">🚫</span>
                  )}
                  <span className="text-center font-round text-[11px] font-semibold leading-tight text-ink/70">{label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* colour swatches */}
        {cfg.colors && cfg.colorField && (
          <div className="flex flex-col gap-2">
            <p className="font-round text-xs font-semibold uppercase tracking-wide text-ink/50">{cfg.colorLabel}</p>
            <div className="flex flex-wrap gap-2">
              {cfg.colors.map((hex) => {
                const selected = cur[cfg.colorField!] === hex;
                return (
                  <button
                    key={hex}
                    onClick={() => setField(cfg.colorField!, hex)}
                    aria-pressed={selected}
                    aria-label={hex}
                    style={{ backgroundColor: hex }}
                    className={`h-9 w-9 rounded-full ring-2 ring-offset-2 transition-all ${selected ? "ring-ink" : "ring-black/10"}`}
                  />
                );
              })}
            </div>
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
