/* ===================================================
   CLOUD GUARD WEBSITE — Supabase Configuration
   Shared between admin panel and frontend loader
   =================================================== */

const SUPABASE_URL = 'https://xzbetcgjyxoeahdvjgrb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6YmV0Y2dqeXhvZWFoZHZqZ3JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0Nzk3NDgsImV4cCI6MjA4ODA1NTc0OH0.zFxxbBZQ8jTsww6YDRPChjmNl08gQNMjMye4pd6EGys';

// Initialize Supabase client (supabase-js v2 loaded via CDN)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
