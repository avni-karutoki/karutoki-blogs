# ✦ Karutoki Blogs

A personal writing platform: poems, blogs and midnight talks, built on
Next.js 16 (TypeScript, App Router), Tailwind CSS v4, and Supabase.

This README replaces the placeholder one from `create-next-app` with actual
setup steps for this project.

## Stack (all free tiers, no paid plan required)

| Layer | Tool | Notes |
|---|---|---|
| Framework | Next.js 16 (TypeScript) | already in your package.json |
| Styling | Tailwind CSS v4 | theme lives in `src/app/globals.css`, no `tailwind.config.js` needed |
| Animation | Framer Motion | one added dependency, MIT licensed |
| Backend/DB/Auth | Supabase | your project is already connected (see `.env.local`) |
| Hosting | Vercel Hobby plan | free, deploys Next.js natively |
| Version control | GitHub | free public/private repos |

## 1. Install and run

```bash
npm install
npm run dev
```

`.env.local` already has your real Supabase project URL and publishable key,
so the site will talk to your actual database right away — it just has no
tables yet until step 2.

## 2. Set up your database (one-time)

1. Open your Supabase project → **SQL Editor** → New query.
2. Paste the entire contents of `supabase/schema.sql` and run it.
   This creates `posts`, `contact_messages`, `newsletter_signups`, and
   `admins`, with row-level security so the public site can only read
   published posts and submit forms — never read other people's messages or
   write posts directly. It also seeds 3 sample posts so the site isn't empty.

## 3. Create your admin login

The `/admin` dashboard is protected — only an email listed in the `admins`
table can sign in.

1. Supabase → **Authentication → Users → Add user**. Create yourself a user
   with your email and a password.
2. Supabase → **SQL Editor**, run:
   ```sql
   insert into admins (email) values ('you@example.com');
   ```
   (use the exact email from step 1)
3. Supabase → **Authentication → Sign In / Providers → Email** → turn off
   "Allow new users to sign up". This is the only step that keeps random
   visitors from creating their own accounts — do this once, right after
   creating your own user.
4. Visit `/admin/login` on your site and sign in. From `/admin` you can add,
   publish/unpublish, and delete writings without touching the database
   directly.

## 4. Push to GitHub (free)

```bash
git init
git add .
git commit -m "Initial commit: Karutoki site"
```

Create an empty repo on github.com, then:

```bash
git remote add origin https://github.com/YOUR-USERNAME/karutoki.git
git branch -M main
git push -u origin main
```

`.env.local` is already git-ignored — your Supabase keys won't be pushed.
The publishable key is safe to expose client-side either way (that's what
it's for); just never put a Supabase *secret* key in this project.

## 5. Deploy for free on Vercel

1. vercel.com → sign up with GitHub → "Add New Project" → import this repo.
2. Add the two environment variables from `.env.local` in the Vercel project
   settings (Settings → Environment Variables).
3. Deploy. You get a free `.vercel.app` URL immediately.

## Project structure

```
src/
  app/
    layout.tsx              global fonts, nav, footer, page-transition wrapper
    page.tsx                Home
    writings/page.tsx       Writings list (All / Poems / Blogs / Midnight Talks)
    writings/[slug]/page.tsx  Single writing, with prev/next
    about/page.tsx          About
    contact/page.tsx        Contact (writes to Supabase)
    search/page.tsx         Live search over posts
    admin/login/page.tsx    Admin sign-in
    admin/page.tsx          Admin dashboard: publish / unpublish / delete
    admin/new/page.tsx      Create a new writing
  components/               Nav, Footer, Swirl (SVG divider), forms
  lib/
    supabase/client.ts      browser Supabase client
    supabase/server.ts      server-side Supabase client (Server Components)
    supabase/middleware.ts  session refresh + /admin route protection
    types.ts                shared Post type
middleware.ts                wires the above into Next's request pipeline
supabase/schema.sql          run once in Supabase's SQL editor
```

## Design notes

- Type roles: **Caveat** (cursive) for emotional headlines like "Words that
  were never said.", matching the handwriting-style headings in your
  mockups; **Cormorant Garamond** for body/reading text; **Inter**, small
  and letter-spaced, for nav/labels.
- Palette: paper `#F4EFE3`, ink `#1C1A16`, hairline `#D8D0BC` — defined once
  in `src/app/globals.css` under `@theme` (Tailwind v4's CSS-based config,
  no separate `tailwind.config.js` file needed).
- Motion: one orchestrated fade-and-rise on every page load/route change
  (`PageTransition.tsx`), plus small hover-underline and background-shift
  transitions — kept deliberately restrained.
- The folded-photo shapes from your mockup are recreated with layered CSS
  boxes (`.photo-stack` in `globals.css`); swap in real photos via Supabase
  Storage whenever you have them, using each post's `cover_image` field.

## Extending it

- **Real images**: create a public `post-covers` bucket in Supabase Storage
  (free, 1GB) and set a post's `cover_image` to the uploaded file's public URL.
- **Rich text**: `content` is stored as plain text with line breaks; add
  `react-markdown` (also free) if you want bold/links inside posts.
- **Editing existing posts**: not built into the dashboard yet — for now,
  edit a post's fields directly in Supabase's Table Editor, or delete and
  re-create it from `/admin/new`.
