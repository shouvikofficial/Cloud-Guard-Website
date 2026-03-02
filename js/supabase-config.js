/* ===================================================
   CLOUD GUARD WEBSITE — Supabase Configuration
   Shared between admin panel and frontend loader
   =================================================== */

const SUPABASE_URL = 'https://knzogkwgczsnfaypokto.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtuem9na3dnY3pzbmZheXBva3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMTUzNjEsImV4cCI6MjA4NTc5MTM2MX0.i-aHu3ZcbtN2WPgLl8nvY6m5fhKgeNlwnZt-QMwRQFg';

// Initialize Supabase client (supabase-js v2 loaded via CDN)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
