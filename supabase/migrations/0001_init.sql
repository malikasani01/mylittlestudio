-- My Little Studio - initial schema
-- Run this in the Supabase SQL Editor (or via `supabase db push` if you link the CLI).

create extension if not exists "pgcrypto";

-- ParentUser: one row per authenticated parent (auth.users is the source of identity/email).
create table if not exists public.parent_users (
  id uuid primary key references auth.users(id) on delete cascade,
  pin_hash text,
  failed_pin_attempts int not null default 0,
  pin_locked_until timestamptz,
  subscription_status text not null default 'free',
  settings jsonb not null default '{
    "allowImageExport": true,
    "requireParentApproval": true,
    "allowVideoRecording": true,
    "allowAudioRecording": true,
    "allowAiRewriting": true,
    "keepOriginalAudio": true,
    "keepOriginalTranscript": true,
    "maxAudioSeconds": 180,
    "maxVideoSeconds": 60,
    "maxPhotosPerPost": 10,
    "aiModes": ["keepMyWords", "makeItClearer", "makeItMagical"]
  }'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references public.parent_users(id) on delete cascade,
  nickname text not null,
  avatar_url text,
  favorite_color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references public.child_profiles(id) on delete cascade,
  title text not null default '',
  original_transcript text,
  edited_text text,
  ai_mode text check (ai_mode in ('keepMyWords', 'makeItClearer', 'makeItMagical')),
  category text not null default 'other' check (category in ('crafts','stories','fashion','songs','videos','pictures','other')),
  background text not null default 'cream',
  stickers jsonb not null default '[]',
  status text not null default 'draft' check (status in ('draft','publishedToJournal','trashed')),
  is_favorite boolean not null default false,
  safety_flag boolean not null default false,
  safety_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  type text not null check (type in ('image','audio','video','fashionImage')),
  storage_path text not null,
  thumbnail_path text,
  duration numeric,
  sort_order int not null default 0,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.fashion_designs (
  id uuid primary key default gen_random_uuid(),
  child_profile_id uuid not null references public.child_profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete set null,
  title text not null default 'My Look',
  character_base text not null default 'base-1',
  skin_tone text not null default 'medium',
  hairstyle text not null default 'ponytail',
  hair_color text not null default 'brown',
  clothing_items jsonb not null default '{}',
  shoes text,
  accessories jsonb not null default '[]',
  nails jsonb not null default '{}',
  colors jsonb not null default '{}',
  patterns jsonb not null default '{}',
  background text not null default 'cream',
  rendered_image_url text,
  design_configuration jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.export_requests (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  requested_by_child boolean not null default true,
  approved_by_parent boolean not null default false,
  export_type text not null check (export_type in ('square','portrait','printable')),
  exported_file_url text,
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

-- updated_at triggers
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_parent_users_updated on public.parent_users;
create trigger trg_parent_users_updated before update on public.parent_users
  for each row execute function public.set_updated_at();

drop trigger if exists trg_child_profiles_updated on public.child_profiles;
create trigger trg_child_profiles_updated before update on public.child_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_posts_updated on public.posts;
create trigger trg_posts_updated before update on public.posts
  for each row execute function public.set_updated_at();

drop trigger if exists trg_fashion_designs_updated on public.fashion_designs;
create trigger trg_fashion_designs_updated before update on public.fashion_designs
  for each row execute function public.set_updated_at();

-- Row Level Security: everything scoped to the owning parent via auth.uid().
alter table public.parent_users enable row level security;
alter table public.child_profiles enable row level security;
alter table public.posts enable row level security;
alter table public.media_assets enable row level security;
alter table public.fashion_designs enable row level security;
alter table public.export_requests enable row level security;

create policy "parent reads/writes own row" on public.parent_users
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "parent manages own children" on public.child_profiles
  for all using (parent_user_id = auth.uid()) with check (parent_user_id = auth.uid());

create policy "parent manages own posts" on public.posts
  for all using (
    child_profile_id in (select id from public.child_profiles where parent_user_id = auth.uid())
  ) with check (
    child_profile_id in (select id from public.child_profiles where parent_user_id = auth.uid())
  );

create policy "parent manages own media" on public.media_assets
  for all using (
    post_id in (
      select p.id from public.posts p
      join public.child_profiles c on c.id = p.child_profile_id
      where c.parent_user_id = auth.uid()
    )
  ) with check (
    post_id in (
      select p.id from public.posts p
      join public.child_profiles c on c.id = p.child_profile_id
      where c.parent_user_id = auth.uid()
    )
  );

create policy "parent manages own fashion designs" on public.fashion_designs
  for all using (
    child_profile_id in (select id from public.child_profiles where parent_user_id = auth.uid())
  ) with check (
    child_profile_id in (select id from public.child_profiles where parent_user_id = auth.uid())
  );

create policy "parent manages own export requests" on public.export_requests
  for all using (
    post_id in (
      select p.id from public.posts p
      join public.child_profiles c on c.id = p.child_profile_id
      where c.parent_user_id = auth.uid()
    )
  ) with check (
    post_id in (
      select p.id from public.posts p
      join public.child_profiles c on c.id = p.child_profile_id
      where c.parent_user_id = auth.uid()
    )
  );

-- Auto-create a parent_users row whenever a new auth user signs up.
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.parent_users (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
