import { createClient } from '@supabase/supabase-js';

// Helper to check for environment variables in different bundlers (Vite vs Webpack/CRA)
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      // @ts-ignore
      return process.env[key];
    }
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    return undefined;
  }
  return undefined;
};

// Use environment variables or fallback to provided keys
const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL') || getEnv('VITE_SUPABASE_URL') || 'https://kewczprkxgegyeutuplg.supabase.co';
const supabaseAnonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtld2N6cHJreGdlZ3lldXR1cGxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMzg1ODYsImV4cCI6MjA4MzYxNDU4Nn0.Jn2-h_5JvUOffBqijt6z7wMvQAwIC8U-vCZS86sRqmQ';

// Check if keys are actually present and not placeholders
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== 'https://placeholder-project.supabase.co';

// Initialize Supabase client
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);