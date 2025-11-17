// Manual test for Supabase authentication
import { supabase } from './src/config/supabase.js';

async function testManualSignup() {
  console.log('🧪 Testing Manual Signup...');
  
  // Test with a fresh email
  const testEmail = `test${Math.random().toString(36).substr(2, 9)}@example.com`;
  const testPassword = 'testpassword123';
  
  console.log(`Testing with: ${testEmail}`);
  
  try {
    // First, try to sign up
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
          username: 'testuser'
        }
      }
    });
    
    console.log('\n📋 Sign Up Result:');
    console.log('Data:', data);
    console.log('Error:', error);
    
    if (error) {
      console.error('❌ Sign up failed:', error.message);
      return;
    }
    
    if (data.user && data.session) {
      console.log('✅ Immediate login successful!');
      console.log('User ID:', data.user.id);
      console.log('Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
    } else if (data.user && !data.session) {
      console.log('📧 Email confirmation required');
      console.log('User created but needs email verification');
    }
    
  } catch (err) {
    console.error('💥 Test failed with error:', err);
  }
}

// Test existing user login
async function testExistingLogin() {
  console.log('\n🔐 Testing Existing User Login...');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'help210305@gmail.com',
      password: 'testpassword123'
    });
    
    console.log('\n📋 Login Result:');
    console.log('Data:', data);
    console.log('Error:', error);
    
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        console.log('📧 Email confirmation needed for existing user');
      } else if (error.message.includes('Invalid login credentials')) {
        console.log('❌ Invalid credentials');
      } else {
        console.log('❌ Other error:', error.message);
      }
    } else if (data.user) {
      console.log('✅ Login successful!');
    }
    
  } catch (err) {
    console.error('💥 Login test failed:', err);
  }
}

// Run tests
console.log('🚀 Starting Supabase Auth Tests...\n');
testManualSignup().then(() => {
  return testExistingLogin();
}).then(() => {
  console.log('\n✅ Tests completed!');
}).catch(console.error);