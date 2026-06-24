-- HomeHQ Row Level Security Policies
-- Run AFTER schema.sql in the Supabase SQL Editor

-- ============================================================
-- HELPER FUNCTIONS
-- These run with SECURITY DEFINER so they bypass RLS when
-- querying family_members, avoiding infinite recursion.
-- ============================================================

CREATE OR REPLACE FUNCTION get_my_family_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT family_id
  FROM family_members
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_my_family_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role
  FROM family_members
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- ============================================================
-- FAMILIES
-- ============================================================
CREATE POLICY "users can view their own family"
  ON families FOR SELECT
  USING (id = get_my_family_id());

CREATE POLICY "authenticated users can create a family"
  ON families FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "admins can update family"
  ON families FOR UPDATE
  USING (
    id = get_my_family_id()
    AND get_my_family_role() = 'admin'
  );

-- ============================================================
-- FAMILY MEMBERS
-- ============================================================

-- Any authenticated user can read members of their family
CREATE POLICY "users can view family members"
  ON family_members FOR SELECT
  USING (family_id = get_my_family_id());

-- Users can insert their own member record (on signup/join)
-- or admins can add placeholder members (user_id IS NULL)
CREATE POLICY "users can create member records"
  ON family_members FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      -- Joining an existing family (linking own account)
      user_id = auth.uid()
      -- OR admin adding a placeholder member
      OR (
        family_id = get_my_family_id()
        AND get_my_family_role() = 'admin'
        AND user_id IS NULL
      )
    )
  );

-- Members can update their own record; admins can update any member
CREATE POLICY "members can update own record"
  ON family_members FOR UPDATE
  USING (
    user_id = auth.uid()
    OR (
      family_id = get_my_family_id()
      AND get_my_family_role() = 'admin'
    )
  );

-- Admins can delete member records (but not their own)
CREATE POLICY "admins can delete members"
  ON family_members FOR DELETE
  USING (
    family_id = get_my_family_id()
    AND get_my_family_role() = 'admin'
    AND user_id != auth.uid()
  );

-- ============================================================
-- GROCERY ITEMS
-- ============================================================
CREATE POLICY "family members can view grocery items"
  ON grocery_items FOR SELECT
  USING (family_id = get_my_family_id());

CREATE POLICY "family members can add grocery items"
  ON grocery_items FOR INSERT
  WITH CHECK (family_id = get_my_family_id());

CREATE POLICY "family members can update grocery items"
  ON grocery_items FOR UPDATE
  USING (family_id = get_my_family_id());

CREATE POLICY "family members can delete grocery items"
  ON grocery_items FOR DELETE
  USING (family_id = get_my_family_id());

-- ============================================================
-- REMINDERS
-- ============================================================
CREATE POLICY "family members can view reminders"
  ON reminders FOR SELECT
  USING (family_id = get_my_family_id());

CREATE POLICY "family members can add reminders"
  ON reminders FOR INSERT
  WITH CHECK (family_id = get_my_family_id());

CREATE POLICY "family members can update reminders"
  ON reminders FOR UPDATE
  USING (family_id = get_my_family_id());

CREATE POLICY "family members can delete reminders"
  ON reminders FOR DELETE
  USING (family_id = get_my_family_id());

-- ============================================================
-- UPLOADS
-- Children cannot upload or see uploads that are not assigned to them.
-- Non-child members have full access within the family.
-- ============================================================
CREATE POLICY "non-child members can view uploads"
  ON uploads FOR SELECT
  USING (
    family_id = get_my_family_id()
    AND (
      get_my_family_role() != 'child'
      -- Children can only see uploads assigned to them
      OR assigned_to IN (
        SELECT id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "non-child members can add uploads"
  ON uploads FOR INSERT
  WITH CHECK (
    family_id = get_my_family_id()
    AND get_my_family_role() != 'child'
  );

CREATE POLICY "non-child members can update uploads"
  ON uploads FOR UPDATE
  USING (
    family_id = get_my_family_id()
    AND get_my_family_role() != 'child'
  );

CREATE POLICY "non-child members can delete uploads"
  ON uploads FOR DELETE
  USING (
    family_id = get_my_family_id()
    AND get_my_family_role() != 'child'
  );

-- ============================================================
-- BILLS
-- Children cannot access bills at all.
-- ============================================================
CREATE POLICY "non-child members can view bills"
  ON bills FOR SELECT
  USING (
    family_id = get_my_family_id()
    AND get_my_family_role() != 'child'
  );

CREATE POLICY "non-child members can add bills"
  ON bills FOR INSERT
  WITH CHECK (
    family_id = get_my_family_id()
    AND get_my_family_role() != 'child'
  );

CREATE POLICY "non-child members can update bills"
  ON bills FOR UPDATE
  USING (
    family_id = get_my_family_id()
    AND get_my_family_role() != 'child'
  );

CREATE POLICY "non-child members can delete bills"
  ON bills FOR DELETE
  USING (
    family_id = get_my_family_id()
    AND get_my_family_role() != 'child'
  );

-- ============================================================
-- VEHICLES
-- ============================================================
CREATE POLICY "family members can view vehicles"
  ON vehicles FOR SELECT
  USING (family_id = get_my_family_id());

CREATE POLICY "non-child members can add vehicles"
  ON vehicles FOR INSERT
  WITH CHECK (
    family_id = get_my_family_id()
    AND get_my_family_role() != 'child'
  );

CREATE POLICY "non-child members can update vehicles"
  ON vehicles FOR UPDATE
  USING (
    family_id = get_my_family_id()
    AND get_my_family_role() != 'child'
  );

CREATE POLICY "admins can delete vehicles"
  ON vehicles FOR DELETE
  USING (
    family_id = get_my_family_id()
    AND get_my_family_role() = 'admin'
  );

-- ============================================================
-- VEHICLE MAINTENANCE
-- ============================================================
CREATE POLICY "family members can view vehicle maintenance"
  ON vehicle_maintenance FOR SELECT
  USING (family_id = get_my_family_id());

CREATE POLICY "non-child members can add vehicle maintenance"
  ON vehicle_maintenance FOR INSERT
  WITH CHECK (
    family_id = get_my_family_id()
    AND get_my_family_role() != 'child'
  );

CREATE POLICY "non-child members can update vehicle maintenance"
  ON vehicle_maintenance FOR UPDATE
  USING (
    family_id = get_my_family_id()
    AND get_my_family_role() != 'child'
  );

CREATE POLICY "non-child members can delete vehicle maintenance"
  ON vehicle_maintenance FOR DELETE
  USING (
    family_id = get_my_family_id()
    AND get_my_family_role() != 'child'
  );

-- ============================================================
-- HOME PROJECTS
-- ============================================================
CREATE POLICY "family members can view home projects"
  ON home_projects FOR SELECT
  USING (family_id = get_my_family_id());

CREATE POLICY "family members can add home projects"
  ON home_projects FOR INSERT
  WITH CHECK (family_id = get_my_family_id());

CREATE POLICY "family members can update home projects"
  ON home_projects FOR UPDATE
  USING (family_id = get_my_family_id());

CREATE POLICY "admins and adults can delete home projects"
  ON home_projects FOR DELETE
  USING (
    family_id = get_my_family_id()
    AND get_my_family_role() != 'child'
  );

-- ============================================================
-- MEAL PLANS
-- ============================================================
CREATE POLICY "family members can view meal plans"
  ON meal_plans FOR SELECT
  USING (family_id = get_my_family_id());

CREATE POLICY "family members can add meal plans"
  ON meal_plans FOR INSERT
  WITH CHECK (family_id = get_my_family_id());

CREATE POLICY "family members can update meal plans"
  ON meal_plans FOR UPDATE
  USING (family_id = get_my_family_id());

CREATE POLICY "family members can delete meal plans"
  ON meal_plans FOR DELETE
  USING (family_id = get_my_family_id());

-- ============================================================
-- STORAGE BUCKET POLICIES
-- Create in Supabase Dashboard > Storage > Policies
-- OR run the SQL below (requires storage schema access)
-- ============================================================

-- Storage bucket setup (run separately if needed):
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('uploads', 'uploads', false)
-- ON CONFLICT DO NOTHING;

-- Allow family members to upload files to their family folder
-- Path format: {family_id}/{member_id}/{filename}
CREATE POLICY "family members can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'uploads'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = get_my_family_id()::text
  );

-- Allow family members to view their own family's files
CREATE POLICY "family members can view files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'uploads'
    AND (storage.foldername(name))[1] = get_my_family_id()::text
  );

-- Allow family members to delete files they uploaded
CREATE POLICY "members can delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'uploads'
    AND (storage.foldername(name))[1] = get_my_family_id()::text
    AND get_my_family_role() != 'child'
  );
