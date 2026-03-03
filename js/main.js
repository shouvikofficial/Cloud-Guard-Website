/* ===================================================
   CLOUD GUARD — Landing Page Scripts
   Smooth interactions, scroll animations, counters
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initThemeToggle();
  initNavbar();
  initScrollAnimations();
  initCounters();
  initSmoothScroll();
  initScrollToTop();
  initCursorFollower();
  initTiltCards();
});

/* ---------- THEME TOGGLE ---------- */
function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  const html = document.documentElement;

  // Load saved preference or detect system preference
  const saved = localStorage.getItem('cg-theme');
  if (saved) {
    html.setAttribute('data-theme', saved);
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    html.setAttribute('data-theme', 'light');
  }

  toggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    localStorage.setItem('cg-theme', next);
  });

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!localStorage.getItem('cg-theme')) {
      html.setAttribute('data-theme', e.matches ? 'light' : 'dark');
    }
  });
}

/* ---------- NAVBAR ---------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  }, { passive: true });

  // Mobile toggle
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // Close mobile nav on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  // Active section highlighting
  const sections = document.querySelectorAll('section[id]');
  const navItems = navLinks.querySelectorAll('a[href^="#"]');

  function highlightNav() {
    const scrollY = window.scrollY + navbar.offsetHeight + 60;

    let currentSection = '';
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        currentSection = section.getAttribute('id');
      }
    });

    navItems.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentSection) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', highlightNav, { passive: true });
  highlightNav();
}

/* ---------- SCROLL ANIMATIONS ---------- */
function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-animate]:not(.visible)');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, parseInt(delay));
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

// Expose globally so content-loader can re-trigger after patching DOM
window.reinitAnimations = initScrollAnimations;

/* ---------- ANIMATED COUNTERS ---------- */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
  const target = parseInt(element.dataset.count);
  const duration = 2000;
  const startTime = performance.now();

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutExpo(progress);
    const current = Math.round(easedProgress * target);

    element.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/* ---------- SMOOTH SCROLL ---------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const navHeight = document.getElementById('navbar').offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* ---------- PARALLAX on HERO (subtle) ---------- */
window.addEventListener('scroll', () => {
  const hero = document.querySelector('.hero-bg-glow');
  if (hero) {
    const scrolled = window.scrollY;
    hero.style.transform = `translateX(-50%) translateY(${scrolled * 0.2}px)`;
  }
}, { passive: true });

/* ---------- 3D TILT EFFECT on FEATURE CARDS ---------- */
function initTiltCards() {
  const cards = document.querySelectorAll('.feature-card');
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      card.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(99, 102, 241, 0.06), transparent 40%)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.background = '';
    });
  });
}

/* ---------- CURSOR FOLLOWER (desktop) ---------- */
function initCursorFollower() {
  const cursor = document.getElementById('cursorFollower');
  if (!cursor || window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!cursor.classList.contains('visible')) {
      cursor.classList.add('visible');
    }
  });

  document.addEventListener('mouseleave', () => {
    cursor.classList.remove('visible');
  });

  // Hover detection for interactive elements
  const hoverTargets = 'a, button, .feature-card, .download-btn, .testimonial-card, .dev-socials a';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
  });

  // Smooth lag animation
  function animate() {
    const speed = 0.15;
    cursorX += (mouseX - cursorX) * speed;
    cursorY += (mouseY - cursorY) * speed;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    requestAnimationFrame(animate);
  }
  animate();
}

/* ---------- PRELOADER ---------- */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('hidden');
    }, 400);

    // Remove from DOM after animation
    setTimeout(() => {
      preloader.remove();
    }, 1000);
  });
}

/* ---------- SCROLL TO TOP ---------- */
function initScrollToTop() {
  const btn = document.getElementById('scrollToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
