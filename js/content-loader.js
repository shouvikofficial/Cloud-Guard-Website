/* ===================================================
   CLOUD GUARD — Dynamic Content Loader
   Fetches content from Supabase and patches the DOM.
   Static HTML serves as a fast fallback.
   =================================================== */

(function () {
  'use strict';

  // Wait until Supabase client is ready
  if (typeof supabase === 'undefined') return;

  // Icon name → SVG markup map (matches feature icons stored in DB)
  const ICON_MAP = {
    lock:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg>',
    cloud:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>',
    bolt:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    globe:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    shield:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    desktop:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    server:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>',
    key:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>',
    zap:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    database: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
    folder:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
    file:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>',
    cpu:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>',
    wifi:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>',
    refresh:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
    star:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    heart:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    check:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="20 6 9 17 4 12"/></svg>',
  };

  function esc(str) { return (str || '').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  async function loadContent() {
    try {
      const { data, error } = await supabase.from('website_content').select('*');
      if (error || !data) return; // Keep static fallback

      const map = {};
      data.forEach(r => { map[r.section] = r.content; });

      if (map.hero)          patchHero(map.hero);
      if (map.features)      patchFeatures(map.features);
      if (map.steps)         patchSteps(map.steps);
      if (map.security)      patchSecurity(map.security);
      if (map.download)      patchDownload(map.download);
      if (map.testimonials)  patchTestimonials(map.testimonials);
      if (map.developer)     patchDeveloper(map.developer);
      if (map.settings)      patchSettings(map.settings);

      // Re-init scroll animations for dynamically injected [data-animate] elements
      if (typeof window.reinitAnimations === 'function') {
        window.reinitAnimations();
      }
    } catch {
      // Supabase unreachable — silently keep the static HTML
    }
  }

  // ─── Hero ────────────────────────────────────────
  function patchHero(d) {
    const badge = document.querySelector('.hero-badge');
    if (badge && d.badge) {
      badge.innerHTML = '<span class="badge-dot"></span> ' + esc(d.badge);
    }

    const title = document.querySelector('.hero-title');
    if (title) {
      title.innerHTML =
        esc(d.title_line1) + '<br />' +
        esc(d.title_line2) + '<br />' +
        '<span class="gradient-text">' + esc(d.title_line3) + '</span>';
    }

    const sub = document.querySelector('.hero-subtitle');
    if (sub && d.subtitle) sub.textContent = d.subtitle;

    // Stats
    const statsEl = document.querySelector('.hero-stats');
    if (statsEl && Array.isArray(d.stats) && d.stats.length) {
      statsEl.innerHTML = d.stats.map((s, i) => {
        const isCountable = !isNaN(parseInt(s.number));
        const divider = i < d.stats.length - 1 ? '<div class="stat-divider"></div>' : '';
        return `<div class="stat">
          <span class="stat-number" ${isCountable ? 'data-count="' + s.number + '"' : ''}>${isCountable ? '0' : esc(s.number)}</span>${s.suffix ? '<span class="stat-suffix">' + esc(s.suffix) + '</span>' : ''}
          <span class="stat-label">${esc(s.label)}</span>
        </div>${divider}`;
      }).join('');
      // Re-trigger counter animation
      if (typeof initCounters === 'function') initCounters();
    }
  }

  // ─── Features ────────────────────────────────────
  function patchFeatures(features) {
    const grid = document.querySelector('.features-grid');
    if (!grid || !Array.isArray(features)) return;

    const visible = features.filter(f => f.visible !== false);
    grid.innerHTML = visible.map((f, i) => {
      const icon = ICON_MAP[f.icon] || ICON_MAP.lock;
      const delay = (i % 3) * 100;
      return `<div class="feature-card" data-animate="fade-up" data-delay="${delay}">
        <div class="feature-icon-wrap">${icon}</div>
        <h3>${esc(f.title)}</h3>
        <p>${esc(f.description)}</p>
      </div>`;
    }).join('');
  }

  // ─── Steps ───────────────────────────────────────
  function patchSteps(steps) {
    const container = document.querySelector('.steps');
    if (!container || !Array.isArray(steps)) return;

    container.innerHTML = steps.map((s, i) => {
      const lineEl = i < steps.length - 1 ? '<div class="step-line"></div>' : '';
      return `<div class="step" data-animate="fade-up" data-delay="${i * 150}">
        <div class="step-number">${esc(s.number)}</div>
        <div class="step-content">
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.description)}</p>
        </div>
        ${lineEl}
      </div>`;
    }).join('');
  }

  // ─── Security ────────────────────────────────────
  function patchSecurity(d) {
    const desc = document.querySelector('.security-desc');
    if (desc && d.description) desc.textContent = d.description;

    const list = document.querySelector('.security-list');
    if (list && Array.isArray(d.items)) {
      list.innerHTML = d.items.map(item =>
        `<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>${esc(item)}</li>`
      ).join('');
    }
  }

  // ─── Download ────────────────────────────────────
  function patchDownload(d) {
    const androidBtn = document.querySelector('.android-btn');
    if (androidBtn && d.apk_url) {
      androidBtn.href = d.apk_url;
      androidBtn.setAttribute('download', d.apk_filename || 'Cloud-Guard.apk');
    }

    const note = document.querySelector('.download-note');
    if (note) {
      note.textContent = `v${d.version || '1.0'} · Android ${d.min_android || '8.0+'} · ${d.note || 'Free forever'}`;
    }

    const iosBtn = document.querySelector('.coming-soon-btn');
    if (iosBtn && d.ios_available) {
      iosBtn.classList.remove('coming-soon-btn');
      iosBtn.classList.add('ios-btn');
      const small = iosBtn.querySelector('.btn-small');
      if (small) small.textContent = 'Download for';
    }
  }

  // ─── Testimonials ────────────────────────────────
  function patchTestimonials(testimonials) {
    const grid = document.querySelector('.testimonials-grid');
    if (!grid || !Array.isArray(testimonials) || !testimonials.length) return;

    const starSVG = '<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';

    grid.innerHTML = testimonials.map((t, i) => {
      const stars = starSVG.repeat(t.rating || 5);
      const initial = (t.name || '?')[0].toUpperCase();
      const avatarClass = t.avatar_color || 'avatar-1';
      return `<div class="testimonial-card" data-animate="fade-up" data-delay="${i * 100}">
        <div class="testimonial-stars">${stars}</div>
        <p class="testimonial-text">"${esc(t.text)}"</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar ${avatarClass}">${initial}</div>
          <div class="testimonial-author-info">
            <span class="testimonial-name">${esc(t.name)}</span>
            <span class="testimonial-role">${esc(t.role)}</span>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  // ─── Developer ───────────────────────────────────
  function patchDeveloper(d) {
    const name = document.querySelector('.dev-name');
    if (name && d.name) name.textContent = d.name;

    const title = document.querySelector('.dev-title');
    if (title && d.title) title.textContent = d.title;

    const desc = document.querySelector('.dev-desc');
    if (desc && d.description) desc.textContent = d.description;

    const photo = document.querySelector('.dev-photo');
    if (photo && d.photo_url) photo.src = d.photo_url;

    const tags = document.querySelector('.dev-tags');
    if (tags && Array.isArray(d.tags)) {
      tags.innerHTML = d.tags.map(t => `<span class="dev-tag">${esc(t)}</span>`).join('');
    }

    if (d.socials) {
      const links = document.querySelectorAll('.dev-socials a');
      if (links[0] && d.socials.github)    links[0].href = d.socials.github;
      if (links[1] && d.socials.linkedin)  links[1].href = d.socials.linkedin;
      if (links[2] && d.socials.portfolio) links[2].href = d.socials.portfolio;

      // Also patch footer socials
      const footerLinks = document.querySelectorAll('.footer-socials a');
      if (footerLinks[0] && d.socials.github)    footerLinks[0].href = d.socials.github;
      if (footerLinks[1] && d.socials.linkedin)  footerLinks[1].href = d.socials.linkedin;
      if (footerLinks[2] && d.socials.portfolio) footerLinks[2].href = d.socials.portfolio;
    }
  }

  // ─── Settings ────────────────────────────────────
  function patchSettings(d) {
    const footerDesc = document.querySelector('.footer-desc');
    if (footerDesc && d.tagline) footerDesc.textContent = d.tagline;

    const copyright = document.querySelector('.footer-bottom p');
    if (copyright && d.copyright_year && d.site_name) {
      const devLink = copyright.querySelector('.dev-credit');
      const devName = devLink ? devLink.textContent : 'Shouvik Dhali';
      const devHref = devLink ? devLink.getAttribute('href') : '#developer';
      copyright.innerHTML = `&copy; ${esc(d.copyright_year)} ${esc(d.site_name)}. Designed &amp; developed by <a href="${devHref}" class="dev-credit">${esc(devName)}</a>`;
    }

    if (d.meta_description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', d.meta_description);
    }
  }

  // ─── Boot ────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadContent);
  } else {
    loadContent();
  }
})();
