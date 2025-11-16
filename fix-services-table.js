import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Use your credentials
const supabaseUrl = 'https://iecothmegflxbpvndnru.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllY290aG1lZ2ZseGJwdm5kbnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NzQ1ODUsImV4cCI6MjA3NDU1MDU4NX0.I4zmPYXfyqNA3ajhyAJlJ5yCLekNWo491BPUDOfcUeI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixServicesTable() {
  console.log('Checking services table structure...');
  
  try {
    // Test if services table exists and get its structure
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .limit(1);
      
    if (error) {
      console.log('❌ Services table error:', error.message);
      console.log('\n📝 Please run this SQL in Supabase SQL Editor to create/fix services table:');
      console.log(`
-- CREATE OR UPDATE SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
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
  amenities TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if they don't exist
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS contact TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS amenities TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image TEXT;

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Services are viewable by everyone" ON public.services;
DROP POLICY IF EXISTS "Only admins can insert services" ON public.services;
DROP POLICY IF EXISTS "Only admins can update services" ON public.services;
DROP POLICY IF EXISTS "Only admins can delete services" ON public.services;

CREATE POLICY "Services are viewable by everyone" ON public.services FOR SELECT USING (true);
CREATE POLICY "Only admins can insert services" ON public.services FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.is_admin = true OR profiles.role = 'admin')
  )
);
CREATE POLICY "Only admins can update services" ON public.services FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.is_admin = true OR profiles.role = 'admin')
  )
);
CREATE POLICY "Only admins can delete services" ON public.services FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.is_admin = true OR profiles.role = 'admin')
  )
);

-- Grant permissions
GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
      `);
    } else {
      console.log('✅ Services table exists!');
      console.log('⚠️  But might be missing some columns. Run the SQL above to ensure all columns exist.');
    }
  } catch (err) {
    console.error('Check failed:', err.message);
    console.log('\n📝 Please run the SQL above in Supabase Dashboard to fix the services table.');
  }
}

fixServicesTable();