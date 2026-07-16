export type AiMode = "keepMyWords" | "makeItClearer" | "makeItMagical";

export type PostCategory =
  | "crafts"
  | "stories"
  | "fashion"
  | "songs"
  | "videos"
  | "pictures"
  | "other";

export type PostStatus = "draft" | "publishedToJournal" | "trashed";

export type MediaType = "image" | "audio" | "video" | "fashionImage";

export interface Sticker {
  id: string;
  emoji: string;
  slot: number;
}

export interface ParentSettings {
  allowImageExport: boolean;
  requireParentApproval: boolean;
  allowVideoRecording: boolean;
  allowAudioRecording: boolean;
  allowAiRewriting: boolean;
  keepOriginalAudio: boolean;
  keepOriginalTranscript: boolean;
  maxAudioSeconds: number;
  maxVideoSeconds: number;
  maxPhotosPerPost: number;
  aiModes: AiMode[];
}

export interface ParentUserRow {
  id: string;
  pin_hash: string | null;
  failed_pin_attempts: number;
  pin_locked_until: string | null;
  subscription_status: string;
  settings: ParentSettings;
  created_at: string;
  updated_at: string;
}

export interface ChildProfileRow {
  id: string;
  parent_user_id: string;
  nickname: string;
  avatar_url: string | null;
  favorite_color: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostRow {
  id: string;
  child_profile_id: string;
  title: string;
  original_transcript: string | null;
  edited_text: string | null;
  ai_mode: AiMode | null;
  category: PostCategory;
  background: string;
  stickers: Sticker[];
  status: PostStatus;
  is_favorite: boolean;
  safety_flag: boolean;
  safety_reason: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MediaAssetRow {
  id: string;
  post_id: string;
  type: MediaType;
  storage_path: string;
  thumbnail_path: string | null;
  duration: number | null;
  sort_order: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface FashionDesignRow {
  id: string;
  child_profile_id: string;
  post_id: string | null;
  title: string;
  character_base: string;
  skin_tone: string;
  hairstyle: string;
  hair_color: string;
  clothing_items: Record<string, string | null>;
  shoes: string | null;
  accessories: string[];
  nails: { color?: string; pattern?: string };
  colors: Record<string, string>;
  patterns: Record<string, string>;
  background: string;
  rendered_image_url: string | null;
  design_configuration: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ExportRequestRow {
  id: string;
  post_id: string;
  requested_by_child: boolean;
  approved_by_parent: boolean;
  export_type: "square" | "portrait" | "printable";
  exported_file_url: string | null;
  created_at: string;
  approved_at: string | null;
}

// Minimal Database type so the Supabase client stays typed without generating
// the full CLI schema (swap for `supabase gen types` output once linked).
export type Database = {
  public: {
    Tables: {
      parent_users: { Row: ParentUserRow; Insert: Partial<ParentUserRow>; Update: Partial<ParentUserRow> };
      child_profiles: { Row: ChildProfileRow; Insert: Partial<ChildProfileRow>; Update: Partial<ChildProfileRow> };
      posts: { Row: PostRow; Insert: Partial<PostRow>; Update: Partial<PostRow> };
      media_assets: { Row: MediaAssetRow; Insert: Partial<MediaAssetRow>; Update: Partial<MediaAssetRow> };
      fashion_designs: { Row: FashionDesignRow; Insert: Partial<FashionDesignRow>; Update: Partial<FashionDesignRow> };
      export_requests: { Row: ExportRequestRow; Insert: Partial<ExportRequestRow>; Update: Partial<ExportRequestRow> };
    };
  };
};
