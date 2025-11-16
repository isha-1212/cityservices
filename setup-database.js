import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Use your credentials
const supabaseUrl = 'https://iecothmegflxbpvndnru.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllY290aG1lZ2ZseGJwdm5kbnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NzQ1ODUsImV4cCI6MjA3NDU1MDU4NX0.I4zmPYXfyqNA3ajhyAJlJ5yCLekNWo491BPUDOfcUeI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('Checking database setup...');
  
  try {
    // Test if profiles table exists by querying it
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
      
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation "public.profiles" does not exist')) {
        console.log('❌ Profiles table does not exist');
        console.log('📋 Please create it manually in Supabase Dashboard:');
        console.log('\n🔗 Go to: https://app.supabase.com/project/iecothmegflxbpvndnru/editor');
        console.log('\n📝 Copy and paste this SQL in the SQL Editor:');
        console.log(`
-- CREATE PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  phone TEXT,
  city TEXT,
  profession TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- CREATE POLICIES
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- GRANT PERMISSIONS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
        `);
        console.log('\n✅ After running this SQL, your admin promotion will work!');
      } else {
        console.log('❌ Database connection error:', error);
      }
    } else {
      console.log('✅ Profiles table already exists!');
      console.log('✅ Database is ready for admin promotion!');
      console.log('\n🎉 You can now use the "Become Admin" feature with key: ADMIN2024');
    }
  } catch (err) {
    console.error('Setup check failed:', err.message);
  }
}

setupDatabase();