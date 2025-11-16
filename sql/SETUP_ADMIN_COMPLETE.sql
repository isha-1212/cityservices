-- ==========================================
-- ADMIN PANEL SETUP SCRIPT
-- Run this in Supabase SQL Editor
-- ==========================================

-- Step 1: Create services table
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT,
  price NUMERIC DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  description TEXT,
  address TEXT,
  contact TEXT,
  email TEXT,
  website TEXT,
  amenities TEXT[],
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Add admin column to profiles (if not exists)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_services_type ON services(type);
CREATE INDEX IF NOT EXISTS idx_services_city ON services(city);
CREATE INDEX IF NOT EXISTS idx_services_created_at ON services(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = TRUE;

-- Step 4: Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies if they exist
DROP POLICY IF EXISTS "Services are viewable by everyone" ON services;
DROP POLICY IF EXISTS "Only admins can insert services" ON services;
DROP POLICY IF EXISTS "Only admins can update services" ON services;
DROP POLICY IF EXISTS "Only admins can delete services" ON services;

-- Step 6: Create RLS policies
CREATE POLICY "Services are viewable by everyone" 
  ON services FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can insert services" 
  ON services FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );

CREATE POLICY "Only admins can update services" 
  ON services FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );

CREATE POLICY "Only admins can delete services" 
  ON services FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );

-- Step 7: Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create trigger
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 9: Grant permissions
GRANT SELECT ON services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON services TO authenticated;

-- ==========================================
-- MAKE USERS ADMIN
-- Add multiple admin users here
-- ==========================================

-- Method 1: Add multiple admins by email (RECOMMENDED)
UPDATE profiles 
SET is_admin = TRUE 
WHERE email IN (
  'admin1@example.com',
  'admin2@example.com',
  'admin3@example.com'
  -- Add more admin emails as needed
);

-- Method 2: Add admins one by one
-- UPDATE profiles SET is_admin = TRUE WHERE email = 'user1@example.com';
-- UPDATE profiles SET is_admin = TRUE WHERE email = 'user2@example.com';

-- Method 3: Use user IDs if you know them
-- UPDATE profiles SET is_admin = TRUE WHERE id IN ('user-id-1', 'user-id-2');

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Check if services table exists and is empty
SELECT COUNT(*) as service_count FROM services;

-- Check your admin status (replace with your email)
SELECT id, email, is_admin, role, created_at 
FROM profiles 
WHERE email = 'your-email@example.com';

-- List all admins
SELECT id, email, is_admin, role 
FROM profiles 
WHERE is_admin = true OR role = 'admin';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'services';

-- ==========================================
-- ADD A TEST SERVICE (Optional)
-- ==========================================

INSERT INTO services (
  id, name, type, city, area, price, rating, 
  description, contact, amenities, image
) VALUES (
  'test-service-1',
  'Test Hotel Ahmedabad',
  'accommodation',
  'Ahmedabad',
  'Satellite',
  5000,
  4.5,
  'A comfortable hotel for testing the admin panel',
  '+91-9876543210',
  ARRAY['WiFi', 'AC', 'Parking', 'Restaurant'],
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'
);

-- Verify the test service was added
SELECT * FROM services WHERE id = 'test-service-1';

-- ==========================================
-- CLEANUP (if needed)
-- ==========================================

-- To remove the test service:
-- DELETE FROM services WHERE id = 'test-service-1';

-- To remove admin status:
-- UPDATE profiles SET is_admin = FALSE WHERE email = 'your-email@example.com';

-- ==========================================
-- SUCCESS!
-- ==========================================

-- If all queries ran successfully:
-- 1. Your services table is ready
-- 2. Your user is marked as admin
-- 3. RLS policies are configured
-- 4. You can now use the Admin Panel in the app
-- 
-- Next steps:
-- 1. Restart your frontend: npm run dev
-- 2. Login to your application
-- 3. Look for "Admin" in the navigation menu
-- 4. Start adding services!
