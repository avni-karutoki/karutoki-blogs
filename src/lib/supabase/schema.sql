-- =========================================================
-- KARUTOKI BLOGS — SUPABASE DATABASE SCHEMA & RLS POLICIES
-- =========================================================

-- 1. Create Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('poem', 'blog', 'midnight-talk')),
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by slug & category
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON public.posts(published);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);

-- 2. Create Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Contact Messages Table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for message ordering & status
CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON public.contact_messages(read);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON public.contact_messages(created_at DESC);

-- 4. Create Site Settings Table (for Hero & About managers)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default Site Settings if not present
INSERT INTO public.site_settings (key, value)
VALUES 
  ('hero', '{"title": "Words that were never said.", "subtitle": "A little corner for poems, stories, midnight thoughts, and everything in between.", "buttonText": "EXPLORE"}'::jsonb),
  ('about', '{"title": "About Karutoki.", "subtitle": "A little about the girl behind the words.", "bio": "I am someone who finds comfort in words... Karutoki is my little corner of the internet."}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================

-- An administrator is an authenticated user whose immutable Auth app_metadata
-- contains { "role": "admin" }. Assign this only with the Supabase dashboard
-- or Admin API; never put authorization roles in user_metadata.
-- Example (run with a real auth user id):
-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
-- WHERE id = '00000000-0000-0000-0000-000000000000';

-- Enable RLS on all tables
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ---------- POSTS POLICIES ----------
DROP POLICY IF EXISTS "Public can view published posts" ON public.posts;
DROP POLICY IF EXISTS "Admin full select on posts" ON public.posts;
DROP POLICY IF EXISTS "Admin insert posts" ON public.posts;
DROP POLICY IF EXISTS "Admin update posts" ON public.posts;
DROP POLICY IF EXISTS "Admin delete posts" ON public.posts;
-- Anyone can view published posts
CREATE POLICY "Public can view published posts" 
  ON public.posts 
  FOR SELECT 
  USING (published = true);

-- Authenticated admins can view all posts (including drafts)
CREATE POLICY "Admin full select on posts" 
  ON public.posts 
  FOR SELECT 
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Authenticated admins can insert posts
CREATE POLICY "Admin insert posts" 
  ON public.posts 
  FOR INSERT 
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Authenticated admins can update posts
CREATE POLICY "Admin update posts" 
  ON public.posts 
  FOR UPDATE 
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Authenticated admins can delete posts
CREATE POLICY "Admin delete posts" 
  ON public.posts 
  FOR DELETE 
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ---------- NEWSLETTER SUBSCRIBERS POLICIES ----------
DROP POLICY IF EXISTS "Public insert newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admin select newsletter" ON public.newsletter_subscribers;
-- Anyone can subscribe
CREATE POLICY "Public insert newsletter" 
  ON public.newsletter_subscribers 
  FOR INSERT 
  WITH CHECK (true);

-- Only authenticated admin can view subscribers
CREATE POLICY "Admin select newsletter" 
  ON public.newsletter_subscribers 
  FOR SELECT 
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ---------- CONTACT MESSAGES POLICIES ----------
DROP POLICY IF EXISTS "Public insert contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admin select contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admin update contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admin delete contact_messages" ON public.contact_messages;
-- Anyone can submit a contact message
CREATE POLICY "Public insert contact_messages" 
  ON public.contact_messages 
  FOR INSERT 
  WITH CHECK (true);

-- Only authenticated admin can view contact messages
CREATE POLICY "Admin select contact_messages" 
  ON public.contact_messages 
  FOR SELECT 
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Only authenticated admin can update contact messages (mark read/unread)
CREATE POLICY "Admin update contact_messages" 
  ON public.contact_messages 
  FOR UPDATE 
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Only authenticated admin can delete contact messages
CREATE POLICY "Admin delete contact_messages" 
  ON public.contact_messages 
  FOR DELETE 
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ---------- SITE SETTINGS POLICIES ----------
DROP POLICY IF EXISTS "Public select site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin update site_settings" ON public.site_settings;
-- Anyone can read site settings
CREATE POLICY "Public select site_settings" 
  ON public.site_settings 
  FOR SELECT 
  USING (true);

-- Only authenticated admin can update site settings
CREATE POLICY "Admin update site_settings" 
  ON public.site_settings 
  FOR ALL 
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ---------- POST IMAGE STORAGE ----------
-- Public cover images are readable, while only designated administrators can
-- create, replace, or remove objects in the post-images bucket.
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can read post images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload post images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update post images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete post images" ON storage.objects;

CREATE POLICY "Public can read post images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');

CREATE POLICY "Admin can upload post images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'post-images'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admin can update post images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'post-images'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    bucket_id = 'post-images'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admin can delete post images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'post-images'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
