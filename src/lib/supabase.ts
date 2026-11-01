import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here'
);

let supabaseInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    console.info('MedPulse ERP: Connected to live Supabase backend at', supabaseUrl);
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
} else {
  console.info('MedPulse ERP: Running in local Demo Mode with persistent mock storage.');
}

export const supabase = supabaseInstance;
