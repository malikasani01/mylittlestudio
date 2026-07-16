# My Little Studio

A private, child-friendly creative journal PWA — crafts, stories, songs, photos, video,
and a fashion design studio, all saved to one child's private journal under one parent
account. See the original product brief for the full spec.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Supabase (Postgres, Auth, Storage) ·
Anthropic Claude (post generation) · OpenAI Whisper (speech-to-text)

## First-time setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment variables** — `.env.local` already exists locally with your Supabase
   project and AI keys (never commit it — it's gitignored). If you need to recreate it,
   copy `.env.local.example` and fill in:

   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
     from your Supabase project settings.
   - `ANTHROPIC_API_KEY` for AI post generation. Without it, post generation falls back to
     a deterministic mock (minimal cleanup of the transcript) so the flow still works.
   - `OPENAI_API_KEY` for Whisper transcription. Without it, transcription falls back to a
     placeholder sentence so the recording flow still works end-to-end.

3. **Apply the database schema.** This project can't run DDL for you (only anon/service
   keys were provided, not a database password or Supabase CLI link). In the Supabase
   dashboard, open **SQL Editor** and run, in order:

   - `supabase/migrations/0001_init.sql` — tables, RLS policies, the
     `parent_users` auto-provisioning trigger.
   - `supabase/migrations/0002_storage.sql` — private storage buckets
     (`profile-images`, `post-images`, `post-audio`, `post-videos`,
     `fashion-renders`, `exports`) and owner-scoped storage policies.

   If you'd rather use the CLI: `npx supabase link --project-ref uklaflxasjoqkcruipyd`
   then `npx supabase db push`.

4. **Enable email auth.** In Supabase Auth settings, make sure Email (magic link / OTP)
   sign-in is enabled. No password is required — this app uses passwordless sign-in for
   the parent only; the child never needs an email address.

5. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open http://localhost:3000. On first load: **Welcome → parent sign-in via email
   link → Child Profile Setup → Home**.

## What's implemented (first milestone)

- Splash → Welcome → parent magic-link sign-in → Child Profile Setup → Home
- Bottom navigation: Home · Create · Studio · Journal
- **Create a Post**: type selection (story / craft / song / photos / video), voice
  recording with live waveform + timer, server-side transcription (OpenAI Whisper),
  AI post generation with the three writing modes (Keep My Words / Make It Clearer /
  Make It Magical) via Claude, a visual Post Editor (title, story, category,
  background, up to 5 stickers), Preview, and Save to Journal.
- **My Journal**: filterable/sortable grid, search, favorites, post detail with
  edit/favorite/export/delete-to-trash.
- **Fashion Studio**: layered SVG character (paper-doll style placeholder art — swap
  in real illustrations later), category tabs for skin/hair/tops/bottoms/dresses/
  shoes/accessories/nails/colors/patterns/background, undo/redo/random/start-over,
  save look and/or add to journal (renders a PNG snapshot of the SVG into
  `fashion-renders`).
- **Parent Area** (PIN-gated, 5-minute unlock window): Dashboard (content summary,
  safety-flag review queue, export approvals), Settings (privacy toggles, media
  limits, AI mode toggles), Trash (restore / permanently delete).
- **Export**: parent-PIN-gated preview that renders the post into a downloadable
  PNG (html2canvas) and logs an `export_requests` row.
- Child-safety handling: the Claude prompt is instructed to set `safetyFlag` on
  sensitive transcripts instead of generating a playful post; flagged posts surface
  in the Parent Dashboard.
- Basic PWA: web manifest, installable icon, a minimal service worker that caches
  the app shell for offline viewing, and an offline banner.

## Known simplifications vs. the full spec

- The Fashion Studio renders a simplified SVG "paper doll" rather than illustrated
  artwork — the data model (hairstyles, clothing, patterns, accessories, nails) is
  complete, so real character art can be swapped in without a schema change.
- `public/icon.svg` is a placeholder app icon — replace with real brand icons
  (including PNG variants for stricter iOS home-screen caching) before shipping.
- Video/photo editing is upload + preview only, no cropping/trimming, per MVP scope.
- The offline queue is "view what's cached"; drafts created offline are not yet
  queued for background sync — creating a post while offline requires reconnecting
  before saving.

## Project structure

```
src/
  app/
    (main)/            Home, Create, Studio, Journal — screens with bottom nav
    auth/               Parent magic-link sign-in + callback
    setup/              Child Profile Setup
    parent/             PIN-gated Parent Area (dashboard, settings, trash)
    export/[postId]/    Parent-approved export preview
    api/                 transcribe, generate-post, parent PIN set/verify
  components/           Design system + feature components
  components/create/     Create-flow wizard pieces
  components/fashion/    Fashion Studio pieces
  lib/                   Supabase clients, AI service interfaces, types, data helpers
supabase/migrations/     SQL schema + storage policies to run in the SQL Editor
```

## Notes on the AI services

`src/lib/ai/generatePost.ts` and `src/lib/ai/transcribe.ts` are the only two places
that call external AI APIs, both server-only. Each has a clean function signature and
a deterministic fallback, so swapping providers or running fully offline in local dev
never requires touching call sites.
