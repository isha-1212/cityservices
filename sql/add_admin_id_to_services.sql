-- Add admin_id column to services table for admin isolation
-- Run this in Supabase SQL Editor

-- Step 1: Add admin_id column if it doesn't exist
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS admin_id TEXT;

-- Step 2: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_services_admin_id ON services(admin_id);

-- Step 3: Add RLS policy to ensure admins can only access their own services
-- First, enable RLS on services table if not already enabled
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Services are viewable by everyone" ON services;
DROP POLICY IF EXISTS "Authenticated users can create services" ON services;
DROP POLICY IF EXISTS "Admins can update their own services" ON services;
DROP POLICY IF EXISTS "Admins can delete their own services" ON services;

-- Create new policies for admin isolation
CREATE POLICY "Services are viewable by everyone" ON services
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert their own services" ON services
  FOR INSERT WITH CHECK (admin_id = current_setting('app.current_user_id', true));

CREATE POLICY "Admins can update their own services" ON services
  FOR UPDATE USING (admin_id = current_setting('app.current_user_id', true));

CREATE POLICY "Admins can delete their own services" ON services
  FOR DELETE USING (admin_id = current_setting('app.current_user_id', true));

-- Step 4: Set existing services to have a default admin_id (optional - for existing data)
-- This sets existing services to the first admin user found
UPDATE services 
SET admin_id = (SELECT id FROM profiles WHERE is_admin = true LIMIT 1)
WHERE admin_id IS NULL;

-- Verification query
SELECT 
  COUNT(*) as total_services,
  COUNT(CASE WHEN admin_id IS NOT NULL THEN 1 END) as services_with_admin_id,
  COUNT(DISTINCT admin_id) as unique_admin_count
FROM services;
