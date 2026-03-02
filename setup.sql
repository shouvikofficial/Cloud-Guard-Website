-- ============================================================
-- CLOUD GUARD WEBSITE — Supabase Database Setup
-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL)
-- ============================================================

-- 1. Website content table (key-value JSON store per section)
CREATE TABLE IF NOT EXISTS website_content (
  section TEXT PRIMARY KEY,
  content JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;

-- 3. Public read access (website visitors can load content)
CREATE POLICY "Public can read website content"
  ON website_content FOR SELECT
  USING (true);

-- 4. Only authenticated users (admin) can modify
CREATE POLICY "Authenticated users can insert"
  ON website_content FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update"
  ON website_content FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete"
  ON website_content FOR DELETE
  TO authenticated
  USING (true);

-- 5. Create storage bucket for website assets (APK, images)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('website-assets', 'website-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage policies — public read, authenticated write
CREATE POLICY "Public can read website assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'website-assets');

CREATE POLICY "Authenticated users can upload website assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'website-assets');

CREATE POLICY "Authenticated users can update website assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'website-assets');

CREATE POLICY "Authenticated users can delete website assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'website-assets');

-- 7. Seed default content (optional — matches your current static HTML)
INSERT INTO website_content (section, content) VALUES
('hero', '{
  "badge": "Free & Unlimited Storage",
  "title_line1": "Your files.",
  "title_line2": "Your control.",
  "title_line3": "Cloud Guard.",
  "subtitle": "A blazing-fast cloud storage app with military-grade encryption, automatic backups, and unlimited space — all for free.",
  "stats": [
    { "number": "256", "suffix": "-bit", "label": "AES Encryption" },
    { "number": "100", "suffix": "%", "label": "Free Forever" },
    { "number": "∞", "suffix": "", "label": "Storage Space" }
  ]
}'),
('features', '[
  { "title": "End-to-End Encryption", "description": "AES-256-GCM encryption happens on your device before upload. Not even we can see your files.", "icon": "lock", "visible": true },
  { "title": "Auto Backup", "description": "Your photos and videos are automatically backed up in the background. Never lose a memory again.", "icon": "cloud", "visible": true },
  { "title": "Blazing Fast", "description": "Built with Flutter and powered by Telegram''s MTProto protocol for lightning-speed transfers.", "icon": "bolt", "visible": true },
  { "title": "Unlimited Storage", "description": "No storage caps. No monthly fees. Upload as much as you want, completely free, forever.", "icon": "globe", "visible": true },
  { "title": "Private by Design", "description": "Files are stored encrypted in your own private channel. Zero-knowledge architecture means total privacy.", "icon": "shield", "visible": true },
  { "title": "Cross-Platform", "description": "Available on Android with iOS and Web coming soon. Your files follow you everywhere.", "icon": "desktop", "visible": true }
]'),
('steps', '[
  { "number": "01", "title": "Sign Up", "description": "Create your account instantly with Google Sign-In or email. No credit card required, ever." },
  { "number": "02", "title": "Upload & Encrypt", "description": "Pick any file or enable auto-backup. Cloud Guard encrypts everything on-device before uploading." },
  { "number": "03", "title": "Access Anywhere", "description": "Download and decrypt your files instantly from any device. Only you hold the keys." }
]'),
('security', '{
  "description": "Cloud Guard uses AES-256-GCM encryption — the same standard used by governments and military. Encryption and decryption happen entirely on your device. We never see your data, and neither does anyone else.",
  "items": [
    "Client-side AES-256-GCM encryption",
    "Zero-knowledge architecture",
    "Biometric app lock support",
    "Supabase auth with Row-Level Security",
    "No third-party trackers or analytics"
  ]
}'),
('testimonials', '[
  { "name": "Alex Chen", "role": "Software Developer", "text": "Finally a cloud app that takes encryption seriously. The auto-backup is seamless, and I love knowing my files are truly private.", "rating": 5, "avatar_color": "avatar-1" },
  { "name": "Priya Sharma", "role": "Digital Marketer", "text": "Unlimited free storage that actually works? I was skeptical at first, but Cloud Guard has been rock solid. Zero issues in months.", "rating": 5, "avatar_color": "avatar-2" },
  { "name": "Marcus Williams", "role": "Photographer", "text": "The upload speed blew me away. I backed up 10 GB of photos in minutes. Best cloud storage app I''ve used — and it costs nothing.", "rating": 5, "avatar_color": "avatar-3" }
]'),
('download', '{
  "version": "1.0",
  "min_android": "8.0+",
  "apk_url": "assets/cloud-guard.apk",
  "apk_filename": "Cloud-Guard.apk",
  "ios_available": false,
  "note": "Free forever"
}'),
('developer', '{
  "name": "Shouvik Dhali",
  "title": "Computer Science Engineer",
  "description": "Passionate about building secure, performant, and beautifully crafted applications that put users first.",
  "photo_url": "assets/developer.jpg",
  "tags": ["Flutter", "Python", "FastAPI", "Supabase", "Telegram API", "HTML", "CSS", "JavaScript"],
  "socials": {
    "github": "https://github.com/shouvikofficial",
    "linkedin": "https://www.linkedin.com/in/mehshouvik420",
    "portfolio": "https://www.shouvikdhali.me/"
  }
}'),
('settings', '{
  "site_name": "Cloud Guard",
  "tagline": "Unlimited encrypted cloud storage, powered by you.",
  "meta_description": "Cloud Guard is a high-performance cloud storage app with end-to-end AES-256 encryption, automatic photo & video backup, and unlimited free storage.",
  "copyright_year": "2026"
}')
ON CONFLICT (section) DO NOTHING;
