-- Quick fix for admin services schema
-- This adds the admin_id column to existing services table

-- Add admin_id column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'admin_id'
    ) THEN
        ALTER TABLE services ADD COLUMN admin_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Add index for admin_id
CREATE INDEX IF NOT EXISTS idx_services_admin_id ON services(admin_id);

-- Update RLS policies to handle admin_id
DROP POLICY IF EXISTS "Only admins can insert services" ON services;
DROP POLICY IF EXISTS "Only admins can update services" ON services;
DROP POLICY IF EXISTS "Only admins can delete services" ON services;

-- New policies that work with admin_id
CREATE POLICY "Only admins can insert services" 
  ON services FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );

CREATE POLICY "Admins can update their own services" 
  ON services FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
    AND (admin_id = auth.uid() OR admin_id IS NULL)
  );

CREATE POLICY "Admins can delete their own services" 
  ON services FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
    AND (admin_id = auth.uid() OR admin_id IS NULL)
  );