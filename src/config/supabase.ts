import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'implicit',
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'cityservices@1.0.0',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});

// Auth helper functions with retry logic
export const authHelpers = {
  // Test connection before attempting auth
  testConnection: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      return { connected: !error, error };
    } catch (err) {
      return { connected: false, error: err };
    }
  },

  signInWithGoogle: async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
          skipBrowserRedirect: false,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      return { data, error };
    } catch (err) {
      return { data: null, error: { message: 'Google sign-in failed: ' + err.message } };
    }
  },

  signUpWithEmail: async (email: string, password: string, metadata: any = {}) => {
    try {
      // Test connection first
      const connectionTest = await authHelpers.testConnection();
      if (!connectionTest.connected) {
        throw new Error('Unable to connect to authentication service. Please check your internet connection.');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: undefined, // Disable email redirect for now
        },
      });
      return { data, error };
    } catch (err) {
      return { 
        data: null, 
        error: { 
          message: err.message || 'Sign up failed. Please try again.'
        }
      };
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}`,
    });
    return { data, error };
  },

  updatePassword: async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { data, error };
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};