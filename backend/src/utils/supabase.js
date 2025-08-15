const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Service role key for backend operations

// Check if we're in demo mode (no Supabase credentials)
const isDemoMode = !supabaseUrl || supabaseUrl === 'your_supabase_project_url' || 
                   !supabaseServiceKey || supabaseServiceKey === 'your_supabase_service_role_key';

if (isDemoMode) {
  console.log('🚨 DEMO MODE: Running without Supabase. Set up Supabase credentials for full functionality.');
  console.log('📋 To set up Supabase:');
  console.log('1. Create project at https://supabase.com');
  console.log('2. Run supabase-schema.sql in SQL Editor');
  console.log('3. Update backend/.env with your credentials');
  console.log('');
}

// Create Supabase client with service role key (bypasses RLS)
let supabase = null;

if (!isDemoMode) {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} else {
  // Mock Supabase client for demo mode
  supabase = {
    from: () => ({
      select: () => ({ data: null, error: new Error('Demo mode: Please set up Supabase') }),
      insert: () => ({ data: null, error: new Error('Demo mode: Please set up Supabase') }),
      update: () => ({ data: null, error: new Error('Demo mode: Please set up Supabase') }),
      delete: () => ({ data: null, error: new Error('Demo mode: Please set up Supabase') }),
      eq: () => ({ data: null, error: new Error('Demo mode: Please set up Supabase') }),
      single: () => ({ data: null, error: new Error('Demo mode: Please set up Supabase') })
    })
  };
}

module.exports = { supabase, isDemoMode };