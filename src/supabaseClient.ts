import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Export the variables so we can check them inside our React components
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize the client with empty strings as fallbacks to prevent a crash.
// The App component will handle showing an error if the keys are actually missing.
export const supabase = createClient<Database>(supabaseUrl || '', supabaseAnonKey || '');