"use client";

import { useRef, useState } from "react";
import { Camera, ImagePlus, X } from "lucide-react";
import { PrimaryButton } from "@/components/PrimaryButton";

interface PhotoUploaderProps {
  max?: number;
  onDone: (files: File[]) => void;
}

export function PhotoUploader({ max = 10, onDone }: PhotoUploaderProps) {
  const [photos, setPhotos] = useState<{ file: File; url: string }[]>([]);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    const next = Array.from(fileList)
      .slice(0, Math.max(0, max - photos.length))
      .map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPhotos((prev) => [...prev, ...next]);
  }

  function remove(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="flex gap-3">
        <PrimaryButton icon={Camera} variant="secondary" onClick={() => cameraInputRef.current?.click()}>
          Take a Picture
        </PrimaryButton>
        <PrimaryButton icon={ImagePlus} variant="secondary" onClick={() => libraryInputRef.current?.click()}>
          Choose From Photos
        </PrimaryButton>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />
      <input
        ref={libraryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((p, i) => (
            <div key={p.url} className="relative aspect-square overflow-hidden rounded-xl bg-cream">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => remove(i)}
                aria-label="Remove photo"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="font-round text-xs text-ink/50">{photos.length} / {max} photos</p>

      <PrimaryButton disabled={photos.length === 0} onClick={() => onDone(photos.map((p) => p.file))}>
        Use These Pictures
      </PrimaryButton>
    </div>
  );
}
