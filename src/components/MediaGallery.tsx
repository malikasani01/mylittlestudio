"use client";

import { useEffect, useState } from "react";
import type { MediaAssetRow } from "@/lib/types";
import { getSignedMediaUrl } from "@/lib/media";

function useSignedUrl(asset: MediaAssetRow) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    getSignedMediaUrl(asset.type, asset.storage_path).then((signed) => {
      if (!cancelled) setUrl(signed);
    });
    return () => {
      cancelled = true;
    };
  }, [asset]);
  return url;
}

function ImageAsset({ asset }: { asset: MediaAssetRow }) {
  const url = useSignedUrl(asset);
  if (!url) return <div className="aspect-square animate-pulse rounded-2xl bg-lilac/10" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className="aspect-square rounded-2xl object-cover" />;
}

function AudioAsset({ asset }: { asset: MediaAssetRow }) {
  const url = useSignedUrl(asset);
  if (!url) return null;
  // eslint-disable-next-line jsx-a11y/media-has-caption
  return <audio controls src={url} className="w-full" />;
}

function VideoAsset({ asset }: { asset: MediaAssetRow }) {
  const url = useSignedUrl(asset);
  if (!url) return null;
  // eslint-disable-next-line jsx-a11y/media-has-caption
  return <video controls src={url} className="w-full rounded-2xl" />;
}

export function MediaGallery({ assets }: { assets: MediaAssetRow[] }) {
  const images = assets.filter((a) => a.type === "image" || a.type === "fashionImage");
  const audios = assets.filter((a) => a.type === "audio");
  const videos = assets.filter((a) => a.type === "video");

  return (
    <div className="flex flex-col gap-4">
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((a) => (
            <ImageAsset key={a.id} asset={a} />
          ))}
        </div>
      )}
      {audios.map((a) => (
        <AudioAsset key={a.id} asset={a} />
      ))}
      {videos.map((a) => (
        <VideoAsset key={a.id} asset={a} />
      ))}
    </div>
  );
}
