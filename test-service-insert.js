import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iecothmegflxbpvndnru.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllY290aG1lZ2ZseGJwdm5kbnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NzQ1ODUsImV4cCI6MjA3NDU1MDU4NX0.I4zmPYXfyqNA3ajhyAJlJ5yCLekNWo491BPUDOfcUeI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testServiceInsert() {
  console.log('Testing service insertion...');
  
  try {
    // Try to insert a test service to see what columns are missing
    const testService = {
      id: 'test-' + Date.now(),
      name: 'Test Service',
      type: 'Accommodation',
      city: 'Rajkot',
      area: 'madhapar',
      price: 25000,
      rating: 4,
      contact: '5316866555',
      email: 'demo5@gmail.com',
      description: 'Test description',
      address: 'madha par, rajkot',
      website: 'https://example.com',
      image: 'https://example.com/image.jpg',
      amenities: 'wifi'
    };

    const { data, error } = await supabase
      .from('services')
      .insert(testService);

    if (error) {
      console.error('❌ Insert failed:', error);
      console.log('\n📝 Run this SQL in Supabase to add ALL missing columns:');
      
      // Extract missing column from error message
      const missingColumn = error.message.match(/Could not find the '(\w+)' column/);
      if (missingColumn) {
        console.log(`\n⚠️  Missing column: ${missingColumn[1]}`);
      }
      
      console.log(`
-- ADD ALL REQUIRED COLUMNS TO SERVICES TABLE
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS area TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS contact TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS amenities TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
      `);
    } else {
      console.log('✅ Test service inserted successfully!');
      
      // Clean up test service
      await supabase.from('services').delete().eq('id', testService.id);
      console.log('🧹 Test service cleaned up');
    }
  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

testServiceInsert();