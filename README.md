<h1 align="center">✦ Karutoki Blogs</h1>

<p align="center">
  <a href="#tech-stack"><img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black"></a>
  <a href="#tech-stack"><img alt="React" src="https://img.shields.io/badge/React-19-blue"></a>
  <a href="#tech-stack"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-blue"></a>
  <a href="#tech-stack"><img alt="Tailwind" src="https://img.shields.io/badge/Tailwind-v4-38bdf8"></a>
  <a href="#tech-stack"><img alt="Supabase" src="https://img.shields.io/badge/Supabase-Postgres-green"></a>
</p>

**Karutoki Blogs** is Avni Goel's (*aka Karutoki*) personal corner of the internet — poems, blogs and midnight thoughts: *"words for the things left unsaid."* It is both a reading experience and a **self-hosted writing studio**: a password-gated admin dashboard manages every word, picture and setting on the site without touching the database day-to-day.

---

## ✍️ What's inside

### The reading site
- **Home** — hero with an auto-cycling **photo slideshow** (curated in the dashboard; every slide can link to a writing, e.g. clicking a picture opens the poem it belongs to), featured shelf, category counts, about preview, newsletter
- **Category shelves** — `/poems`, `/blogs`, `/midnight-talks`, plus the all-writings list `/writings` (filterable by category)
- **Writing pages** (`/writings/[slug]`) — reading progress bar, adjustable font size, **likes with burst animation**, view counters, share buttons, prev/next navigation, related readings
- **Archive** — a **vertical timeline**: one long thread with year medallions, month seals and entries alternating left/right around the spine, each with its cover thumbnail and a big vintage day stamp
- **Tags** (`/tags`, `/tags/[tag]`) and **full-text search** — both in-page and a global `Ctrl/Cmd + K` overlay
- **About** — markdown-formatted bio in a round layered portrait frame with an orbit ring, plus a *"Scraps from the desk"* polaroid gallery
- **Comments on every writing** — public threads under each page ("In the margins"): visitors comment and **reply to each other**, everyone reads the whole conversation; no login needed; loaded client-side so they stay fresh on cached pages
- **Contact** — message form feeding a private inbox; newsletter subscription

### The admin studio (`/admin`, login-gated)
- **Overview** — published / drafts / scheduled / likes / views / unread-inbox metrics
- **Writings manager** — search, filter, publish/unpublish, delete
- **Editor** (`/admin/new`, `/admin/edit/[id]`) — auto-slugged titles, excerpt, category, tags, featured flag, publish-now toggle, optional future scheduling; drafts **autosave to localStorage** (including the cover URL) so a reload never loses work
- **Image pickers** — cover, hero slideshow (with a per-image click-link field), about portrait & gallery; uploads land directly in Supabase storage and persist as URLs — pick-once, never lost
- **Crop & adjust** — every hero/about picture supports fill mode, zoom and X/Y focus tuning from a live-preview panel
- **Site settings** — hero copy & slideshow, about bio/portrait, editable in-app (saved as JSON in `site_settings`, no database gymnastics)
- **Contact inbox** — read/unread, delete
- **Newsletter broadcast** — one click emails subscribers about a new writing (Resend)

### Craft details
- **8 paper-like themes** (Cream, Moonlit Ink, Blush, Lavender, Matcha, Honeyed Paper, Deep Ocean, Sakura Night) + day/night toggle — applied pre-hydration so there is no theme flash
- Announcement bar, page transitions, scroll reveals, cursor dot trail, a hanging music charm, scroll progress bar — all transform-only, `prefers-reduced-motion` respected throughout
- Dark-mode-first emoji/typography guardrails; mobile layouts tighten without losing the timeline/slideshow feel

---

## 🧰 Tech stack

| Layer | Tool |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack), **React 19**, TypeScript |
| Styling | **Tailwind CSS v4** — theme tokens in `globals.css` (`@theme inline`), no config file |
| Animation | **Framer Motion 11** |
| Backend | **Supabase** — Postgres + RLS, Auth, Storage (`post-images` bucket) |
| Email | **Resend** (newsletter broadcast, optional) |
| Hosting | Vercel-style pull deploys — every push to `main` goes live |
| Repo | `github.com/avni-karutoki/karutoki-blogs` |

---

## 🧠 How to understand this project

### Data model (Supabase)
- **`posts`** — one row per writing: `title`, `slug`, `category` (`poem` / `blog` / `midnight-talk`), `excerpt`, `content`, `cover_image`, `tags`, `featured`, `published`, `scheduled_for`, `likes`, `views`, `gallery_images`
- **`site_settings`** — key/value JSON store (`hero`, `about`) holding all homepage/about copy, picture lists and crop settings; the code ships safe defaults (`src/lib/site.ts`) so pages render even before settings exist
- **`newsletter_subscribers`, `contact_messages`** — newsletter list and the contact inbox
- **likes/views** are bumped through **`SECURITY DEFINER` RPCs** so anonymous readers can only increment counters, never edit rows

### Auth model (important)
Admin access is **not a table** — it is a flag on the Supabase Auth user: `app_metadata.role === "admin"` (`src/lib/supabase/authorization.ts`). Every RLS policy checks the same JWT claim, so only admins can write posts, read the inbox, save settings or upload. Signed-in visitors can do nothing privileged. Never store this flag in `user_metadata` — users can edit their own.

### Scheduled publishing
Scheduled posts (`scheduled_for` in the future, `published = false`) flip live when someone loads `/admin` (`publishDuePosts()` in `src/lib/publishing.ts`) — no cron required; an optional `pg_cron` snippet exists for hands-off automation.

### Image pipeline
All pictures live in the public `post-images` bucket, organized by purpose (`covers/`, `site/hero`, `site/hero-slideshow`, `site/about`, `site/about-gallery`, plus per-category folders). Uploads happen **the moment an image is picked** in the editor; only the resulting public URL is stored in the database — that's why covers survive reloads and failed saves.

### Hero slideshow resolution order
1. Admin-curated slideshow list (with optional per-slide link) →
2. single hero image →
3. featured writings' covers **only when the list is empty** (auto-linked to their own writing, so the shelf never duplicates what you hand-picked).
Only slides with a link are clickable; everything else stays a picture.

### Graceful column degradation
`src/lib/supabase/schema-safe.ts` wraps writes/selects with a **retry that drops columns the live database doesn't have yet** (`Could not find the 'X' column` errors skip that field instead of failing the whole save). Feature parity therefore depends only on running the matching SQL migration (`supabase/schema.sql` → `supabase/migrate-scheduling-stats.sql` → `supabase/migrate-add-columns.sql`) — the app works in any state.

### Content model
- Writing `content` is plain text with line breaks (paragraph gaps preserved)
- The About **bio** is lightweight markdown — `###` headings, `**bold**`, `*italic*` — rendered by `src/components/RichText.tsx`
- The homepage bio teaser shows just the opening lines of the markdown (`firstTextBlock` / `InlineText`)

---

## 🔀 Routes

| Route | Purpose |
|---|---|
| `/` | Home — hero slideshow, featured shelf, counts, about preview, newsletter |
| `/poems` `/blogs` `/midnight-talks` | Category shelves |
| `/writings`, `/writings/[slug]` | All writings · single writing with progress, likes, views, share, prev/next |
| `/tags`, `/tags/[tag]` | Tag index · tag shelf |
| `/archive` | The timeline |
| `/search` | Full search page (also the `Ctrl/Cmd + K` overlay) |
| `/about` `/contact` | About (markdown bio + gallery) · contact form |
| `/admin`, `/admin/login`, `/admin/new`, `/admin/edit/[id]` | The writing studio (gated) |
| `/api/admin/notify` | Admin-only newsletter broadcast (`POST { slug }`) |

---

## 📁 Project structure (essentials)

```
src/
  app/
    page.tsx                    Home (hero slideshow, featured shelf, about teaser)
    archive/page.tsx            Vertical timeline
    about/page.tsx              Markdown bio + portrait frame + desk-scraps gallery
    writings/…  tags/…          Shelves, single writings, tags
    search/page.tsx             Search page
    admin/
      page.tsx                  Gate + data load (publishes due posts on visit)
      DashboardClient.tsx       Overview / writings / inbox / settings tabs
      actions.ts                Server Actions (toggle, delete, inbox, site settings)
      new/page.tsx              Editor (autosave + ImagePicker cover + scheduling)
      edit/[id]/page.tsx        Editing
      ImagePickers.tsx          Upload-on-pick pickers (single + list with links)
      PictureAdjuster.tsx       Crop & adjust panel (fill/zoom/focus, live preview)
    api/admin/notify/route.ts   Resend broadcast endpoint
  components/
    Hero.tsx                    Slideshow resolution, clickable linked slides, crop transform
    RichText.tsx                Bio markdown renderer (###, **bold**, *italic*)
    WritingComments.tsx         Threaded comments per writing (fetch + reply tree)
    WritingCard.tsx  Reveal.tsx  ScrollAnimations.tsx  PageTransition.tsx
    ThemeProvider.tsx  SearchOverlay.tsx  NewsletterForm.tsx  ContactForm.tsx  …
  lib/
    types.ts                    Post, Category, Hero/AboutSettings (incl. slideshowLinks)
    site.ts                     getSiteSetting() + DEFAULT_HERO / DEFAULT_ABOUT
    publishing.ts               publishDuePosts()
    email.ts                    Resend batch sender
    supabase/
      client.ts  server.ts      Browser & server clients
      authorization.ts          isAdminUser() — app_metadata.role === 'admin'
      schema-safe.ts            Missing-column retry helpers for writes/selects
middleware.ts                   Session refresh + /admin protection
supabase/
  schema.sql                    Canonical schema, RLS, storage bucket
  migrate-scheduling-stats.sql  scheduling / likes / views upgrade
  migrate-add-columns.sql       tags / featured / gallery_images upgrade
  migrate-comments.sql          comments table + public write / admin delete RLS
public/
  theme-init.js                 Pre-hydration theme & reading-size bootstrap
```

---

## ✦ Fonts & design language
- **Caveat** (script) for emotional headlines and the day stamps
- **Cormorant Garamond** for excerpts and long-form reading
- **Inter**, small and letter-spaced, for labels and UI
- Vintage polaroid cards (`vintage-card`), quote marquees, film rolls and night-sky sections as reusable motifs in `globals.css`

---

*Made with ink and moonlight by Avni Goel (Karutoki).*
