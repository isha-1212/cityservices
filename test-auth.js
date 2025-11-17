// Test script to check Supabase authentication
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? 'Present' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  try {
    // Test with a different email to avoid rate limits
    const testEmail = 'testuser123@example.com';
    const testPassword = 'testpassword123';

    console.log('\n=== Testing Sign In (existing user) ===');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    console.log('Sign in result:', { data: signInData, error: signInError });

    if (signInError && signInError.message.includes('Invalid login credentials')) {
      console.log('\n=== User does not exist, testing Sign Up ===');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            development: true
          }
        }
      });

      console.log('Sign up result:', { data: signUpData, error: signUpError });
    }

    // Check current user
    console.log('\n=== Current User ===');
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user);

    // Test the existing user (help210305@gmail.com)
    console.log('\n=== Testing existing user (help210305@gmail.com) ===');
    const { data: existingUserData, error: existingUserError } = await supabase.auth.signInWithPassword({
      email: 'help210305@gmail.com',
      password: 'testpassword123'
    });

    console.log('Existing user result:', { data: existingUserData, error: existingUserError });

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAuth();