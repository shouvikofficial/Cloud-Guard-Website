// Build script — runs during Vercel deploy
// Reads environment variables and generates supabase-config.js

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('⚠️  Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables!');
  process.exit(1);
}

const configContent = `/* ===================================================
   CLOUD GUARD WEBSITE — Supabase Configuration
   Auto-generated during build from environment variables
   =================================================== */

const SUPABASE_URL = '${SUPABASE_URL}';
const SUPABASE_ANON_KEY = '${SUPABASE_ANON_KEY}';

// Initialize Supabase client (supabase-js v2 loaded via CDN)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
`;

const outPath = path.join(__dirname, 'js', 'supabase-config.js');
fs.writeFileSync(outPath, configContent, 'utf-8');
console.log('✅ Generated js/supabase-config.js from environment variables');
