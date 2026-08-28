-- ============================================================
-- ANUGERAH VENTURES — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
--
-- Supabase digunakan HANYA untuk:
--   ✓ Authentication (admin login)
--   ✓ Database (projects & articles tables)
--
-- Storage / asset upload menggunakan Cloudflare R2 (bukan Supabase Storage).
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROJECTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug          text UNIQUE NOT NULL,
  title         text NOT NULL,
  category      text,
  year          integer,
  description   text,
  content_json  jsonb DEFAULT '{}'::jsonb, -- Rich text content (TipTap JSON)
  hero_image_url text,            -- AVIF URL dari Cloudflare R2 CDN
  gallery_urls  text[],           -- Array of additional R2 CDN URLs
  tags          text[],
  -- Multi-site distribution flags (Single Source of Truth pattern)
  is_av_published       boolean DEFAULT false,
  is_personal_published boolean DEFAULT false,
  sort_order    integer DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- ============================================================
-- ARTICLES (INSIGHTS / JOURNAL) TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS articles (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug          text UNIQUE NOT NULL,
  title         text NOT NULL,
  excerpt       text,
  content_json  jsonb DEFAULT '{}'::jsonb NOT NULL, -- Rich text content (TipTap JSON)
  cover_image_url text,           -- AVIF URL dari Cloudflare R2 CDN
  published_at  timestamptz,
  reading_time  integer,          -- Estimated reading time in minutes
  tags          text[],
  -- Multi-site distribution flags
  is_av_published       boolean DEFAULT false,
  is_personal_published boolean DEFAULT false,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Public: hanya bisa baca konten yang sudah dipublish
CREATE POLICY "Public can read published projects"
  ON projects FOR SELECT
  USING (is_av_published = true);

CREATE POLICY "Public can read published articles"
  ON articles FOR SELECT
  USING (is_av_published = true);

-- Authenticated (admin): full access
CREATE POLICY "Authenticated users have full access to projects"
  ON projects FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users have full access to articles"
  ON articles FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
