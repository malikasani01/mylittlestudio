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

4. **Enable anonymous sign-ins.** In the Supabase dashboard, go to
   **Authentication → Sign In / Providers → Anonymous** and turn it on. This app is one
   installed PWA per family (not a multi-device account system), so there's no email
   step at all: tapping "Start Creating" transparently opens an anonymous Supabase
   session on that device, which is what RLS keys off. (An earlier version used
   email magic links for the parent, but iOS keeps an installed PWA's storage
   isolated from Safari, so a link opened in Safari never reached the installed app's
   session — anonymous sign-in sidesteps that entirely.) The Parent Area PIN is the
   actual privacy gate, not this sign-in step.

5. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open http://localhost:3000. On first load: **Welcome → tap Start Creating →
   Child Profile Setup → Home**.

## What's implemented (first milestone)

- Splash → Welcome → anonymous sign-in (silent) → Child Profile Setup → Home
- Bottom navigation: Home · Create · Studio · Journal
- **Create a Post**: type selection (story / craft / song / photos / video), voice
  recording with live waveform + timer, server-side transcription (OpenAI Whisper),
  AI post generation with the three writing modes (Keep My Words / Make It Clearer /
  Make It Magical) via Claude, a visual Post Editor (title, story, category,
  background, up to 5 stickers), Preview, and Save to Journal.
- **My Journal**: filterable/sortable grid, search, favorites, post detail with
  edit/favorite/export/delete-to-trash.
- **Fashion Studio**: a layered SVG paper-doll engine (`src/lib/doll.ts`,
  ported from the family's own "Dress-Up Studio" design) with 6 base
  characters, anime-style eyes, and independent layers for skin, eyes, hair
  (7 styles), top (6), bottom (3), shoes (3), glasses, hat, jewelry, bag,
  **wings** (fairy/butterfly), and a **pet** companion (8 animals). Category
  tabs + per-category colour swatches, a base-character roster, undo/redo/
  surprise/start-over, and save / add-to-journal (renders a PNG snapshot of the
  SVG into `fashion-renders` and stores the full layer config in
  `fashion_designs.design_configuration`).
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
- Branded app icon (favicon, `apple-touch-icon`, manifest icons) and six iPad-sized
  "Add to Home Screen" launch splash screens, so it looks like a real app once
  installed on the iPad.

## App icon & iPad splash screens

`scripts/icon-source.svg` is the single source of truth for the app icon (a
gradient sparkle mark). `scripts/generate-icons.mjs` rasterizes it into every size
the app needs and renders the six iPad splash screens (one per device class, at
its native pixel resolution). To change the icon design or splash copy, edit
`icon-source.svg` and/or the `renderSplashText` function in the script, then
re-run:

```bash
node scripts/generate-icons.mjs
```

This regenerates:
- `public/icon.svg` and `src/app/icon.svg` — favicon (Next.js picks this up
  automatically via its file-based metadata convention).
- `src/app/apple-icon.png` — iOS home-screen icon (also automatic).
- `public/icons/icon-{16,32,180,192,512}.png` — referenced by the web manifest.
- `public/splash/*.png` — referenced from `appleWebApp.startupImage` in
  `src/app/layout.tsx`, one per iPad screen size/DPR combination.

The script embeds the real Baloo 2 / Quicksand font files (fetched from Google
Fonts) via `@napi-rs/canvas` rather than relying on SVG `<text>` — the SVG
rasterizer here has no fontconfig and silently substitutes a generic font
otherwise, which only shows up once you look at the output.

## Known simplifications vs. the full spec

- The Fashion Studio uses layered SVG art (in `src/lib/doll.ts`) rather than
  illustrated artwork; layers are independent, so richer art can be swapped in
  per-layer without a schema change.
- Video/photo editing is upload + preview only, no cropping/trimming, per MVP scope.
- The offline queue is "view what's cached"; drafts created offline are not yet
  queued for background sync — creating a post while offline requires reconnecting
  before saving.

## Project structure

```
src/
  app/
    (main)/            Home, Create, Studio, Journal — screens with bottom nav
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
