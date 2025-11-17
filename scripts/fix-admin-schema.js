const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAdminSchema() {
  try {
    console.log('🔧 Fixing admin schema...');

    // First, check if admin_id column already exists
    const { data: columns, error: columnsError } = await supabase
      .rpc('exec', {
        sql: `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'services' AND column_name = 'admin_id';
        `
      });

    if (columnsError) {
      console.error('❌ Error checking columns:', columnsError);
      return;
    }

    if (columns && columns.length > 0) {
      console.log('✅ admin_id column already exists');
      return;
    }

    // Add admin_id column if it doesn't exist
    const { error: alterError } = await supabase
      .rpc('exec', {
        sql: `
          ALTER TABLE services 
          ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES auth.users(id);
        `
      });

    if (alterError) {
      console.error('❌ Error adding admin_id column:', alterError);
      return;
    }

    // Add index for admin_id
    const { error: indexError } = await supabase
      .rpc('exec', {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_services_admin_id ON services(admin_id);
        `
      });

    if (indexError) {
      console.error('❌ Error adding index:', indexError);
      return;
    }

    console.log('✅ Admin schema fixed successfully!');
    console.log('📋 Changes applied:');
    console.log('   - Added admin_id column to services table');
    console.log('   - Added index on admin_id for faster queries');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixAdminSchema();