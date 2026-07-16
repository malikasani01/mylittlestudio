import { createClient } from "@/lib/supabase/client";
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

export async function uploadMedia(type: MediaType, userId: string, file: Blob, fileName: string) {
  const supabase = createClient();
  const path = `${userId}/${crypto.randomUUID()}-${fileName}`;
  const { error } = await supabase.storage.from(bucketForType(type)).upload(path, file, {
    contentType: file.type || undefined,
  });
  if (error) throw error;
  return path;
}
