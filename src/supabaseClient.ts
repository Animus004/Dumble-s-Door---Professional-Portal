import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// The check for these variables is now moved to the App component
// to show a graceful error screen instead of a white page crash.
// We pass empty strings if the env vars are not set, which prevents
// the client from throwing an error on initialization. Subsequent API calls will fail,
// but the app UI will at least explain why.
export const supabase = createClient<Database>(supabaseUrl || '', supabaseAnonKey || '');