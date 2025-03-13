import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Environment variables are automatically loaded in Next.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

/**
 * Creates a Supabase client with the service role key for server-only routes.
 * This client has admin privileges and should never be exposed to the client.
 */
export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  });
};