# ✦ Karutoki Blogs

## About this repo

**Karutoki Blogs** is Avni Goel aka Karutoki's personal corner of the internet —
poems, blogs, and midnight thoughts: *"words for the things left unsaid."*

- **Reader site:** home with hero + featured shelf, category pages
  (`/poems`, `/blogs`, `/midnight-talks`), all-writings list (`/writings`),
  single-writing pages (`/writings/[slug]`) with prev/next, global search overlay
  + `/search`, tags (`/tags`, `/tags/[tag]`), archive (`/archive`), about and
  contact.
- **Admin studio (`/admin`):** password login, overview metrics
  (published / drafts / scheduled / likes / views / unread inbox), writings
  manager (search, filter, publish/unpublish, delete, email subscribers about a
  post), new-post editor (`/admin/new`) with autosave drafts, cover-image
  upload, scheduling + featured flag, edit page (`/admin/edit/[id]`), contact
  inbox (read/unread, delete), and Hero/About site-settings editors — no
  database touching required day-to-day.
- **Craft details:** 8 paper-like themes, day/night toggle, reading progress +
  font-size control, likes with burst animation, view counters, global search
  (`Ctrl/Cmd + K`), newsletter via Resend, scheduled publishing, cursor dot
  trail, hanging-melody music charm, announcement bar, page transitions and
  scroll reveals.

Source: `https://github.com/avni-karutoki/karutoki-blogs`

---

## Stack (all free tiers)

| Layer | Tool | Notes |
|---|---|---|
| Framework | Next.js 16, React 19, TypeScript | App Router, Server Components + Server Actions |
| Styling | Tailwind CSS v4 | theme tokens in `src/app/globals.css` (`@theme inline`), no `tailwind.config.js` |
| Animation | Framer Motion 11 | page transitions, scroll reveals, hover micro-motion |
| Backend / DB / Auth / Storage | Supabase | Postgres + RLS, Auth, `post-images` bucket |
| Letters | Resend (optional) | batch email to subscribers via `/api/admin/notify` |
| VCS | GitHub | `main` branch, repo: `avni-karutoki/karutoki-blogs` |

---

## 1. Install and run

```bash
npm install
cp .env.example .env.local     # then fill in your Supabase values
npm run dev                    # http://localhost:3000
```

Other scripts: `npm run build`, `npm start`, `npm run lint`.

> **Windows / PowerShell:** if `npm` is blocked with a `PSSecurityException`,
> your machine's execution policy blocks `npm.ps1`. Either use **Command
> Prompt** (`cmd` then `npm run dev`), run `npx next dev`, or allow scripts for
> the session with `Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process`.

### Environment variables

Copy `.env.example` to `.env.local` and fill it in. `.env.local` is
git-ignored — never commit real keys.

| Key | Required | What it is |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **yes** | Supabase project URL (Project → Settings → API) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **yes** | Supabase publishable key (safe client-side) |
| `NEXT_PUBLIC_SITE_URL` | recommended | canonical URL used in email links; falls back to the request host |
| `RESEND_API_KEY` | only for newsletter broadcast | from resend.com |
| `RESEND_FROM` | no | defaults to `Karutoki <onboarding@resend.dev>` (test sender only delivers to your own address until you verify a domain) |

> Never put a Supabase *secret* / *service-role* key in this project. The
> publishable key is the only key the site uses.

---

## 2. Set up the database (one-time, ~5 min)

Canonical schema: **`supabase/schema.sql`** (single source of truth).

1. Supabase dashboard → **SQL Editor → New query**.
2. Paste the entire contents of `supabase/schema.sql` and run it.
   Creates the `posts`, `newsletter_subscribers`, `contact_messages` and
   `site_settings` tables (with seeded `hero` + `about` values), the public
   `post-images` storage bucket, and all RLS policies:
   - public can read published posts + site settings
   - public can submit contact messages and subscribe to the newsletter
   - only admins can manage posts, inbox, subscribers, settings and uploads
3. Run **`supabase/migrate-scheduling-stats.sql`** in a second query.
   Adds `scheduled_for`, `likes` and `views` columns plus the
   `increment_post_views` / `change_post_likes` RPCs and an optional
   `pg_cron` snippet (every 15 min). Safe to re-run. Until you run it, the
   site keeps working — scheduling, likes and view counts just stay disabled.

Both files are **idempotent** — re-running them is safe if you ever need to
fix a policy.

---

## 3. Create your admin login

Admin access is a flag on your Supabase Auth user, not a database table.
`isAdminUser()` (`src/lib/supabase/authorization.ts`) checks
`user.app_metadata.role === "admin"`, and every RLS policy checks
`(auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'`. Never use
`user_metadata` for this — signed-in users can edit their own.

1. Supabase → **Authentication → Users → Add user**. Create yourself with
   email + password, and copy the user `id`.
2. Supabase → **SQL Editor**, run (with your real id):
   ```sql
   update auth.users
   set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
   where id = 'PASTE-YOUR-USER-ID';
   ```
3. Supabase → **Authentication → Sign In / Providers → Email** → turn off
   "Allow new users to sign up", so random visitors can't create accounts.
4. Visit `/admin/login` and sign in. `/admin` auto-publishes any due
   scheduled posts on load (`publishDuePosts()` in `src/lib/publishing.ts`),
   so scheduling works even without enabling `pg_cron`.

---

## 4. Push to GitHub

Remote is `https://github.com/avni-karutoki/karutoki-blogs.git` (`main`).

```bash
git status --short --branch
git add .
git commit -m "Your message"
git push origin main
```

Set your git identity once so commits are attributed to your profile:

```bash
git config user.name  "Avni Goel"
git config user.email "avnigoyal2014@gmail.com"
```

### Suggested GitHub → About settings

- **Description:** `A personal writing studio for poems, blogs & midnight talks — Next.js 16 + Supabase + Resend, with an admin dashboard, scheduling, themes & newsletter.`
- **Website:** your live URL once you deploy.
- **Topics:** `nextjs` `typescript` `tailwindcss` `supabase` `resend` `blog` `poetry` `framer-motion`

---

## Admin cheat-sheet

| I want to… | Where |
|---|---|
| Write | `/admin/new` — title auto-slug `/writings/…`, excerpt, category (`poem`/`blog`/`midnight-talk`), tags, featured, publish-now toggle, optional future schedule, 5 MB cover upload; drafts autosave to `localStorage` (`karutoki-draft-new`) |
| Edit | `/admin/edit/[id]` |
| Publish / unpublish / delete | `/admin` → Writings tab (Server Actions in `src/app/admin/actions.ts`) |
| Email subscribers about a post | `/admin` → Notify button → `POST /api/admin/notify { slug }` (needs `RESEND_API_KEY`) |
| Read inbox | `/admin` → Inbox tab (mark read/unread, delete) |
| Reword homepage hero / about | `/admin` → Settings tab → `site_settings` (`hero`, `about`; fallbacks in `src/lib/site.ts`) |
| Schedule hands-free | optional `pg_cron` block at the bottom of `migrate-scheduling-stats.sql`; otherwise just open `/admin` and due posts flip live |

---

## Routes

| Route | What it does |
|---|---|
| `/` | Home — hero, featured shelf, counts, about preview, newsletter |
| `/poems` `/blogs` `/midnight-talks` | Category shelves |
| `/writings` | All writings, filterable by category (`?category=poem`) |
| `/writings/[slug]` | Single writing — reading progress, likes, views, share, prev/next |
| `/tags` `/tags/[tag]` | Tag index + tag shelf |
| `/archive` | Chronological archive, grouped by month |
| `/search` | Full search page (also the global `Ctrl/Cmd + K` overlay) |
| `/about` `/contact` | Static-ish pages |
| `/admin` | Dashboard (admins only) |
| `/admin/login` `/admin/new` `/admin/edit/[id]` | Studio pages |
| `/api/admin/notify` | `POST { slug }` — admin-only Resend broadcast |
| `/test-db` | Dev-only Supabase connectivity check (not linked in nav) |

---

## Project structure

```
src/
  app/
    page.tsx                    Home: hero, featured shelf, counts, about preview, newsletter
    layout.tsx                  fonts, ThemeProvider, SearchProvider, nav/footer, overlays
    globals.css                 8 themes + typography + cards + ambient background
    poems|blogs|midnight-talks/ Category shelves
    writings/page.tsx           All writings (filterable)
    writings/[slug]/page.tsx    Single writing: reading progress, likes, views, share, prev/next
    tags/page.tsx  tags/[tag]/page.tsx   Tag index + tag shelf
    archive/page.tsx            Chronological archive
    search/page.tsx             Full search page (+ global Ctrl/Cmd+K overlay)
    about/page.tsx  contact/page.tsx
    test-db/page.tsx            Dev-only Supabase connectivity check
    admin/
      page.tsx                  gate (redirects non-admins) + data load
      DashboardClient.tsx       overview / writings / inbox / settings tabs
      actions.ts                togglePublished, deletePost, inbox + site-settings actions
      new/page.tsx              editor + autosave + cover upload + scheduling
      edit/[id]/page.tsx        edit existing post
      login/page.tsx  logout-button.tsx  delete-button.tsx  delete-confirmation.tsx
    api/admin/notify/route.ts   admin-only Resend broadcast to newsletter_subscribers
  components/
    Navbar.tsx  Footer.tsx  Hero.tsx  WritingCard.tsx  RecentWritings.tsx
    SearchOverlay.tsx  SearchContext.tsx  NewsletterForm.tsx  ContactForm.tsx
    ThemeProvider.tsx  ThemeToggle.tsx  FontSizeToggle.tsx  ReadingProgress.tsx
    LikeButton.tsx  ViewCounter.tsx  ShareButtons.tsx
    Reveal.tsx                  scroll-reveal primitives (Reveal, StaggeredReveal, SpringReveal)
    MotionPrimitives.tsx        animated primitives (MotionButton, MotionLink, MotionCard, …)
    ScrollAnimations.tsx        scroll effects (ScrollProgress, Parallax, FloatingElement, …)
    PageTransition.tsx  CursorDog.tsx  HangingMelody.tsx  AnnouncementBar.tsx
    SectionHeading.tsx  Swirl.tsx  ScrollToTop.tsx  DecorativeDivider.tsx  …
  lib/
    types.ts                    Post, Category ('poem'|'blog'|'midnight-talk'), Hero/AboutSettings
    site.ts                     getSiteSetting() + DEFAULT_HERO / DEFAULT_ABOUT
    publishing.ts               publishDuePosts() — flips due scheduled posts live
    email.ts                    Resend batch sender (100/chunk) + letter HTML
    flatten-children.ts         flattens nested JSX children (stagger helpers)
    supabase/client.ts          browser client
    supabase/server.ts          server client (Server Components / Actions)
    supabase/middleware.ts      session refresh + /admin protection
    supabase/authorization.ts   isAdminUser() — app_metadata.role === 'admin'
middleware.ts                   wires session refresh into every request
supabase/
  schema.sql                    CANONICAL schema + RLS + storage (run this first)
  migrate-scheduling-stats.sql  scheduling + likes/views upgrade (run second)
public/logo/                    Karutoki logo assets
```

---

## Design notes

- **Type roles:** Caveat (cursive) for emotional headlines
  ("Words that were never said."); Cormorant Garamond for excerpts/reading;
  Inter, small and letter-spaced, for nav/labels/UI.
- **Themes (8):** Karutoki Cream (default light), Moonlit Ink (default dark),
  Blush Letter, Lavender Dusk, Matcha Calm, Honeyed Paper, Deep Ocean,
  Sakura Night — CSS vars in `globals.css`, FOUC-free init script in
  `layout.tsx`, persisted as `karutoki-theme` in `localStorage`.
- **Motion:** orchestrated fade-and-rise per route (`PageTransition.tsx`),
  scroll reveals, hover underlines/card lifts; `prefers-reduced-motion` fully
  respected; transform-only animations so scrolling stays smooth.
- **Hydration:** anything read from `localStorage` is resolved *after* mount so
  the server HTML and the first client render always match. The theme and
  reading size are applied pre-hydration by the inline script in
  `layout.tsx`, so there is no flash.
- **Images:** folded-photo placeholders (`.photo-stack`) until you upload
  covers to the `post-images` bucket; each post's `cover_image` holds the
  public URL. `next.config.ts` allows remote images and optimizes
  `framer-motion` imports.
- **Content model:** `content` is plain text with line breaks; likes/views go
  through `SECURITY DEFINER` RPCs so anonymous readers can only bump counters.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `npm` blocked by PowerShell | Use `cmd`, or `npx next dev`, or `Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process` |
| `column "reading_time" does not exist` | Re-run `supabase/schema.sql` — it adds every column with `if not exists` |
| `Module not found: '@vercel/turbopack-next/internal/font/...'` | Delete the `.next` folder and restart `npm run dev` |
| Admin can log in but cannot save posts | The RLS policies expect `app_metadata.role = 'admin'`. Re-run `supabase/schema.sql` and confirm step 2 of §3 was run |
| "A tree hydrated but some attributes didn't match" | A client component is reading browser-only state during render. Read it in a `useEffect` instead |
| Likes / views / scheduling do nothing | Run `supabase/migrate-scheduling-stats.sql` |
| Newsletter emails go only to your own inbox | Resend's test sender is limited to your address — verify a domain and set `RESEND_FROM` |
