const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from your .env file
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL not found in environment');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ Supabase service key not found. Please add SUPABASE_SERVICE_ROLE_KEY to your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAdminOwnership() {
  try {
    console.log('🔧 Adding admin_id column to services table...');

    // Add admin_id column
    const { error: alterError } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE services ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES auth.users(id);
        CREATE INDEX IF NOT EXISTS idx_services_admin_id ON services(admin_id);
      `
    });

    if (alterError) {
      console.error('❌ Error adding admin_id column:', alterError.message);
      // Try alternative approach
      console.log('🔄 Trying alternative SQL execution...');
      
      const { error: addColumnError } = await supabase
        .from('_sql')
        .insert([{ 
          query: 'ALTER TABLE services ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES auth.users(id)' 
        }]);
      
      if (addColumnError) {
        console.error('❌ Alternative approach failed:', addColumnError.message);
        console.log('📋 Manual SQL to run in Supabase Dashboard:');
        console.log('ALTER TABLE services ADD COLUMN admin_id UUID REFERENCES auth.users(id);');
        console.log('CREATE INDEX idx_services_admin_id ON services(admin_id);');
        return;
      }
    }

    console.log('✅ Admin_id column added successfully!');
    
    // Update existing services to assign them to the first admin found
    console.log('🔄 Assigning existing services to admins...');
    
    const { data: admins, error: adminError } = await supabase
      .from('profiles')
      .select('id')
      .or('is_admin.eq.true,role.eq.admin')
      .limit(1);
    
    if (adminError) {
      console.error('❌ Error finding admins:', adminError.message);
      return;
    }
    
    if (admins && admins.length > 0) {
      const { error: updateError } = await supabase
        .from('services')
        .update({ admin_id: admins[0].id })
        .is('admin_id', null);
      
      if (updateError) {
        console.error('❌ Error updating services:', updateError.message);
      } else {
        console.log('✅ Existing services assigned to admin');
      }
    }

    console.log('🎉 Admin ownership system is now ready!');
    console.log('📋 Next: Restart your app to see the changes');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

fixAdminOwnership();