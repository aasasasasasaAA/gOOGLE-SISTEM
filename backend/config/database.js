import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Check if we have valid Supabase configuration
const hasValidSupabaseConfig = supabaseUrl && 
                              supabaseServiceKey && 
                              supabaseUrl !== 'your_supabase_url_here' &&
                              supabaseServiceKey !== 'your_supabase_service_key_here';

let supabase = null;

if (hasValidSupabaseConfig) {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} else {
  console.warn('⚠️  Supabase configuration is missing or using placeholder values. Database functionality will be disabled.');
}

export { supabase };

// Test database connection
export const testConnection = async () => {
  try {
    if (!supabase) {
      console.log('❌ Database not configured');
      return false;
    }
    
    const { data, error } = await supabase.from('accounts').select('count').limit(1);
    if (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
};