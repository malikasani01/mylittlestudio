import { createClient } from "@/lib/supabase/client";
import { uuid } from "@/lib/uuid";
import { extForMime } from "@/lib/recording";
import type { MediaType } from "@/lib/types";

const BUCKET_BY_TYPE: Record<MediaType, string> = {
  image: "post-images",
  audio: "post-audio",
  video: "post-videos",
  fashionImage: "fashion-renders",
};

export function bucketForType(type: MediaType) {
  return BUCKET_BY_TYPE[type];
}

export async function getSignedMediaUrl(type: MediaType, storagePath: string, expiresIn = 3600) {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(bucketForType(type))
    .createSignedUrl(storagePath, expiresIn);
  if (error) return null;
  return data.signedUrl;
}

const FALLBACK_EXT: Record<MediaType, string> = {
  image: "jpg",
  audio: "m4a",
  video: "mp4",
  fashionImage: "png",
};

export async function uploadMedia(type: MediaType, userId: string, file: Blob, baseName: string) {
  const supabase = createClient();
  // Derive the extension from the blob's real mime type so iOS recordings
  // (mp4/m4a) aren't mislabelled as .webm.
  const ext = extForMime(file.type, FALLBACK_EXT[type]);
  const path = `${userId}/${uuid()}-${baseName}.${ext}`;
  const { error } = await supabase.storage.from(bucketForType(type)).upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) throw error;
  return path;
}
