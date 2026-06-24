-- HomeHQ Database Schema
-- Run this in the Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- FAMILIES
-- ============================================================
CREATE TABLE IF NOT EXISTS families (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  invite_code  TEXT UNIQUE DEFAULT lower(substr(md5(random()::text), 1, 8)),
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ============================================================
-- FAMILY MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS family_members (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id    UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  role         TEXT CHECK (role IN ('admin', 'adult', 'child')) DEFAULT 'adult' NOT NULL,
  avatar_color TEXT DEFAULT '#2563EB' NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for quick user lookups
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);

-- ============================================================
-- GROCERY ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS grocery_items (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id      UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  name           TEXT NOT NULL,
  quantity       TEXT DEFAULT '1',
  category       TEXT DEFAULT 'groceries',
  needed_by      DATE,
  added_by       UUID REFERENCES family_members(id) ON DELETE SET NULL,
  assigned_store TEXT,
  priority       TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium' NOT NULL,
  completed      BOOLEAN DEFAULT FALSE NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_grocery_items_family_id ON grocery_items(family_id);

-- ============================================================
-- REMINDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS reminders (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id        UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  title            TEXT NOT NULL,
  assigned_to      UUID REFERENCES family_members(id) ON DELETE SET NULL,
  due_date         TIMESTAMPTZ,
  repeat_frequency TEXT CHECK (repeat_frequency IN ('none', 'daily', 'weekly', 'monthly', 'yearly')) DEFAULT 'none',
  priority         TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium' NOT NULL,
  category         TEXT DEFAULT 'other' NOT NULL,
  notes            TEXT,
  completed        BOOLEAN DEFAULT FALSE NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reminders_family_id ON reminders(family_id);

-- ============================================================
-- UPLOADS
-- ============================================================
CREATE TABLE IF NOT EXISTS uploads (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id           UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  storage_path        TEXT NOT NULL,
  title               TEXT NOT NULL,
  file_type           TEXT,
  category            TEXT DEFAULT 'other' NOT NULL,
  notes               TEXT,
  assigned_to         UUID REFERENCES family_members(id) ON DELETE SET NULL,
  linked_reminder_id  UUID REFERENCES reminders(id) ON DELETE SET NULL,
  created_by          UUID REFERENCES family_members(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_uploads_family_id ON uploads(family_id);

-- ============================================================
-- BILLS
-- ============================================================
CREATE TABLE IF NOT EXISTS bills (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id  UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  title      TEXT NOT NULL,
  due_date   DATE,
  amount     NUMERIC(10, 2),
  autopay    BOOLEAN DEFAULT FALSE NOT NULL,
  paid       BOOLEAN DEFAULT FALSE NOT NULL,
  notes      TEXT,
  category   TEXT DEFAULT 'bills' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bills_family_id ON bills(family_id);

-- ============================================================
-- VEHICLES
-- ============================================================
CREATE TABLE IF NOT EXISTS vehicles (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id           UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  name                TEXT NOT NULL,
  make                TEXT,
  model               TEXT,
  year                INTEGER,
  mileage             INTEGER,
  insurance_expiry    DATE,
  inspection_expiry   DATE,
  registration_expiry DATE,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vehicles_family_id ON vehicles(family_id);

-- ============================================================
-- VEHICLE MAINTENANCE
-- ============================================================
CREATE TABLE IF NOT EXISTS vehicle_maintenance (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  family_id  UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  title      TEXT NOT NULL,
  due_mileage INTEGER,
  due_date    DATE,
  completed   BOOLEAN DEFAULT FALSE NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_vehicle_id ON vehicle_maintenance(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_family_id ON vehicle_maintenance(family_id);

-- ============================================================
-- HOME PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS home_projects (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id   UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  title       TEXT NOT NULL,
  priority    TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium' NOT NULL,
  status      TEXT CHECK (status IN ('planned', 'in_progress', 'completed')) DEFAULT 'planned' NOT NULL,
  notes       TEXT,
  due_date    DATE,
  assigned_to UUID REFERENCES family_members(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_home_projects_family_id ON home_projects(family_id);

-- ============================================================
-- MEAL PLANS
-- ============================================================
CREATE TABLE IF NOT EXISTS meal_plans (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id  UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  plan_date  DATE NOT NULL,
  meal_type  TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
  title      TEXT NOT NULL,
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_meal_plans_family_id ON meal_plans(family_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_date ON meal_plans(plan_date);

-- ============================================================
-- Enable Row Level Security on all tables
-- ============================================================
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
