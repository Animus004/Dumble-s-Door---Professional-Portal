// src/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Export the variables so we can check them inside our app
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize the client, using empty strings as fallbacks to prevent an immediate crash.
// The app itself will check if the keys are valid before trying to use the client.
export const supabase = createClient<Database>(supabaseUrl || '', supabaseAnonKey || '');