-- ==============================================================================
-- Talqa Net (طلقة نت) - Content Tables & Row Level Security (RLS)
-- Phase 2 Migration: Public read-only for published content, no anonymous write
-- ==============================================================================

-- 1. App Settings Table
CREATE TABLE IF NOT EXISTS public.app_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  network_name TEXT NOT NULL DEFAULT 'طلقة نت',
  support_phone TEXT NOT NULL DEFAULT '+967 718 097 168',
  support_whatsapp TEXT NOT NULL DEFAULT '967718097168',
  portal_url TEXT NOT NULL DEFAULT 'http://t.net',
  status_url TEXT NOT NULL DEFAULT 'http://t.net/status',
  announcement_ticker TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Packages Table
CREATE TABLE IF NOT EXISTS public.packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('hours', 'daily', 'weekly', 'monthly')),
  category_label TEXT NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ريال يمني',
  duration_label TEXT NOT NULL,
  validity_days_label TEXT NOT NULL,
  data_limit_label TEXT NOT NULL,
  data_limit_mb INTEGER NOT NULL,
  speed_limit_label TEXT NOT NULL,
  badge TEXT DEFAULT NULL,
  popular BOOLEAN NOT NULL DEFAULT FALSE,
  color_theme TEXT NOT NULL DEFAULT 'blue',
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Distributors Table
CREATE TABLE IF NOT EXISTS public.distributors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'مأرب',
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  open_hours TEXT NOT NULL,
  structured_hours JSONB DEFAULT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_placeholder BOOLEAN NOT NULL DEFAULT TRUE,
  available_cards JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('promotion', 'info', 'maintenance')),
  date_label TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  link_text TEXT DEFAULT NULL,
  link_url TEXT DEFAULT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Lounge Items Table
CREATE TABLE IF NOT EXISTS public.lounge_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('media', 'downloads', 'tools')),
  category_label TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  requires_lan BOOLEAN NOT NULL DEFAULT TRUE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  file_size TEXT DEFAULT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Live Channels Table
CREATE TABLE IF NOT EXISTS public.channels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  stream_url TEXT NOT NULL,
  logo TEXT DEFAULT NULL,
  category TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT FALSE, -- Disabled until licensed streaming confirmation
  requires_lan BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'offline',
  match_title TEXT DEFAULT NULL,
  tournament TEXT DEFAULT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- Row Level Security (RLS) Enforcements
-- Strict Rule: Public Anonymous users have SELECT only on published records.
-- Admin writes will be secured via Service Role in Phase 3.
-- ==============================================================================

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lounge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

-- App Settings: Read only
CREATE POLICY "Public read app_settings"
  ON public.app_settings FOR SELECT
  USING (true);

-- Packages: Read only published
CREATE POLICY "Public read published packages"
  ON public.packages FOR SELECT
  USING (is_published = true);

-- Distributors: Read only published
CREATE POLICY "Public read published distributors"
  ON public.distributors FOR SELECT
  USING (is_published = true);

-- Announcements: Read only active
CREATE POLICY "Public read active announcements"
  ON public.announcements FOR SELECT
  USING (active = true);

-- Lounge Items: Read only enabled
CREATE POLICY "Public read enabled lounge items"
  ON public.lounge_items FOR SELECT
  USING (enabled = true);

-- Channels: Read only
CREATE POLICY "Public read channels"
  ON public.channels FOR SELECT
  USING (true);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_packages_category ON public.packages(category, sort_order);
CREATE INDEX IF NOT EXISTS idx_distributors_city ON public.distributors(city, sort_order);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON public.announcements(active);
