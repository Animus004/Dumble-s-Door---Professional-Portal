import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vite automatically loads environment variables from .env files
  // in the project root.
  // IMPORTANT: Only variables prefixed with VITE_ are exposed to your
  // client-side code to prevent accidentally leaking server secrets.
  //
  // You can access them in your code like this:
  // import.meta.env.VITE_SUPABASE_URL
  //
  // No special configuration is needed here for them to work for both
  // development (vite) and production (vite build).
})