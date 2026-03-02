/* ===================================================
   CLOUD GUARD — Admin Panel Logic
   Auth · Routing · CRUD · File Upload · Toasts
   =================================================== */

// ─── Cached content store ────────────────────────────
const store = {};
const ICONS = ['lock', 'cloud', 'bolt', 'globe', 'shield', 'desktop', 'server', 'key', 'zap', 'database', 'folder', 'file', 'cpu', 'wifi', 'refresh', 'star', 'heart', 'check'];

// ─── Toast ───────────────────────────────────────────
function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const iconSVG = type === 'success'
    ? '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
    : '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
  el.innerHTML = iconSVG + `<span>${msg}</span>`;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3500);
}

// ─── Auth ────────────────────────────────────────────
async function checkSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) showDashboard();
  else showLogin();
}

function showLogin() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('adminLayout').style.display = 'none';
}

function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminLayout').style.display = 'flex';
  loadAllContent();
  handleRouting();
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  const spinner = btn.querySelector('.btn-spinner');
  const label = btn.querySelector('span');
  const errorEl = document.getElementById('loginError');
  errorEl.textContent = '';
  label.style.display = 'none';
  spinner.style.display = 'block';

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  label.style.display = '';
  spinner.style.display = 'none';

  if (error) {
    errorEl.textContent = error.message;
  } else {
    toast('Signed in successfully');
    showDashboard();
  }
});

async function logout() {
  await supabase.auth.signOut();
  showLogin();
  toast('Signed out', 'warning');
}

document.getElementById('logoutBtn').addEventListener('click', logout);
document.getElementById('logoutBtnMobile').addEventListener('click', logout);

// ─── Mobile Sidebar ─────────────────────────────────
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');

document.getElementById('mobileMenuBtn').addEventListener('click', () => {
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
});

overlay.addEventListener('click', () => {
  sidebar.classList.remove('open');
  overlay.classList.remove('open');
});

// ─── Hash Routing ───────────────────────────────────
function handleRouting() {
  const hash = location.hash.slice(1) || 'dashboard';
  document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
  const target = document.getElementById('sec-' + hash);
  if (target) target.style.display = 'block';
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const activeNav = document.querySelector(`.nav-item[data-section="${hash}"]`);
  if (activeNav) activeNav.classList.add('active');

  // Close mobile sidebar on navigate
  sidebar.classList.remove('open');
  overlay.classList.remove('open');
}

window.addEventListener('hashchange', handleRouting);

document.querySelectorAll('.nav-item').forEach(n => {
  n.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });
});

// ─── Load All Content ───────────────────────────────
async function loadAllContent() {
  const { data, error } = await supabase.from('website_content').select('*');
  if (error) { toast('Failed to load content: ' + error.message, 'error'); return; }

  data.forEach(row => { store[row.section] = row.content; });

  populateHero();
  populateFeatures();
  populateSteps();
  populateSecurity();
  populateDownload();
  populateTestimonials();
  populateDeveloper();
  populateSettings();
  updateDashboardStats();
}

// ─── Dashboard Stats ────────────────────────────────
function updateDashboardStats() {
  document.getElementById('statSections').textContent = Object.keys(store).length;
  const testimonials = store.testimonials || [];
  document.getElementById('statTestimonials').textContent = testimonials.length;
  const features = store.features || [];
  document.getElementById('statFeatures').textContent = features.length;
  const dl = store.download || {};
  document.getElementById('statDownloadVer').textContent = dl.version || '—';
}

// ─── Populate: Hero ─────────────────────────────────
function populateHero() {
  const d = store.hero || {};
  document.getElementById('heroBadge').value = d.badge || '';
  document.getElementById('heroLine1').value = d.title_line1 || '';
  document.getElementById('heroLine2').value = d.title_line2 || '';
  document.getElementById('heroLine3').value = d.title_line3 || '';
  document.getElementById('heroSubtitle').value = d.subtitle || '';

  const container = document.getElementById('heroStatsContainer');
  container.innerHTML = '';
  (d.stats || []).forEach((s, i) => addStatRow(s, i));
  addStatAddButton(container);
}

function addStatRow(stat = {}, idx) {
  const container = document.getElementById('heroStatsContainer');
  const row = document.createElement('div');
  row.className = 'item-row';
  row.innerHTML = `
    <input type="text" placeholder="Number" value="${stat.number || ''}" data-stat="number" style="max-width:80px;" />
    <input type="text" placeholder="Suffix" value="${stat.suffix || ''}" data-stat="suffix" style="max-width:80px;" />
    <input type="text" placeholder="Label" value="${stat.label || ''}" data-stat="label" />
    <button class="btn-danger" onclick="this.parentElement.remove()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
    </button>`;
  // Insert before Add button if it exists
  const addBtn = container.querySelector('.btn-outline');
  if (addBtn) container.insertBefore(row, addBtn);
  else container.appendChild(row);
}

function addStatAddButton(container) {
  const btn = document.createElement('button');
  btn.className = 'btn-outline btn-sm';
  btn.style.marginTop = '12px';
  btn.textContent = '+ Add Stat';
  btn.onclick = () => addStatRow({}, -1);
  container.appendChild(btn);
}

// ─── Populate: Features ─────────────────────────────
function populateFeatures() {
  const container = document.getElementById('featuresContainer');
  container.innerHTML = '';
  (store.features || []).forEach((f, i) => addFeatureCard(f, i));
}

function addFeature() {
  addFeatureCard({ title: '', description: '', icon: 'lock', visible: true }, -1);
}

function addFeatureCard(f = {}, idx) {
  const container = document.getElementById('featuresContainer');
  const card = document.createElement('div');
  card.className = 'editable-card';
  const iconOptions = ICONS.map(ic => `<option value="${ic}" ${ic === f.icon ? 'selected' : ''}>${ic}</option>`).join('');
  card.innerHTML = `
    <div class="editable-card-header">
      <h4>Feature ${container.querySelectorAll('.editable-card').length + 1}</h4>
      <div class="card-actions">
        <label style="display:flex;align-items:center;gap:4px;font-size:0.8rem;color:var(--text-muted);cursor:pointer;">
          <input type="checkbox" class="feat-visible" ${f.visible !== false ? 'checked' : ''} /> Visible
        </label>
        <button class="btn-danger" onclick="this.closest('.editable-card').remove()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Title</label>
        <input type="text" class="feat-title" value="${escapeAttr(f.title)}" placeholder="Feature name" />
      </div>
      <div class="form-group">
        <label>Icon</label>
        <select class="feat-icon">${iconOptions}</select>
      </div>
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea class="feat-desc" rows="2" placeholder="Feature description">${escapeHTML(f.description)}</textarea>
    </div>`;
  container.appendChild(card);
}

// ─── Populate: Steps ────────────────────────────────
function populateSteps() {
  const container = document.getElementById('stepsContainer');
  container.innerHTML = '';
  (store.steps || []).forEach((s, i) => addStepCard(s, i));
}

function addStep() {
  const container = document.getElementById('stepsContainer');
  const num = String(container.querySelectorAll('.editable-card').length + 1).padStart(2, '0');
  addStepCard({ number: num, title: '', description: '' }, -1);
}

function addStepCard(s = {}, idx) {
  const container = document.getElementById('stepsContainer');
  const card = document.createElement('div');
  card.className = 'editable-card';
  card.innerHTML = `
    <div class="editable-card-header">
      <h4>Step ${container.querySelectorAll('.editable-card').length + 1}</h4>
      <button class="btn-danger" onclick="this.closest('.editable-card').remove()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </div>
    <div class="form-row">
      <div class="form-group" style="max-width:100px;">
        <label>Number</label>
        <input type="text" class="step-number" value="${escapeAttr(s.number)}" placeholder="01" />
      </div>
      <div class="form-group">
        <label>Title</label>
        <input type="text" class="step-title" value="${escapeAttr(s.title)}" placeholder="Step title" />
      </div>
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea class="step-desc" rows="2" placeholder="Step description">${escapeHTML(s.description)}</textarea>
    </div>`;
  container.appendChild(card);
}

// ─── Populate: Security ─────────────────────────────
function populateSecurity() {
  const d = store.security || {};
  document.getElementById('securityDesc').value = d.description || '';
  const container = document.getElementById('securityItemsContainer');
  container.innerHTML = '';
  (d.items || []).forEach(item => addSecurityItemRow(item));
}

function addSecurityItem() {
  addSecurityItemRow('');
}

function addSecurityItemRow(text = '') {
  const container = document.getElementById('securityItemsContainer');
  const row = document.createElement('div');
  row.className = 'item-row';
  row.innerHTML = `
    <input type="text" class="security-item" value="${escapeAttr(text)}" placeholder="Security feature..." />
    <button class="btn-danger" onclick="this.parentElement.remove()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
    </button>`;
  container.appendChild(row);
}

// ─── Populate: Download ─────────────────────────────
function populateDownload() {
  const d = store.download || {};
  document.getElementById('dlVersion').value = d.version || '';
  document.getElementById('dlMinAndroid').value = d.min_android || '';
  document.getElementById('dlFilename').value = d.apk_filename || '';
  document.getElementById('dlNote').value = d.note || '';
  document.getElementById('dlIosAvailable').checked = !!d.ios_available;

  if (d.apk_url) {
    document.getElementById('apkCurrentFile').style.display = 'flex';
    document.getElementById('apkCurrentName').textContent = d.apk_filename || 'APK uploaded';
    document.getElementById('apkCurrentUrl').href = d.apk_url;
  }
}

// ─── Populate: Testimonials ─────────────────────────
function populateTestimonials() {
  const container = document.getElementById('testimonialsContainer');
  container.innerHTML = '';
  (store.testimonials || []).forEach((t, i) => addTestimonialCard(t, i));
}

function addTestimonial() {
  addTestimonialCard({ name: '', role: '', text: '', rating: 5, avatar_color: 'avatar-1' }, -1);
}

function addTestimonialCard(t = {}, idx) {
  const container = document.getElementById('testimonialsContainer');
  const card = document.createElement('div');
  card.className = 'editable-card';
  const avatarOptions = ['avatar-1', 'avatar-2', 'avatar-3', 'avatar-4', 'avatar-5'].map(
    c => `<option value="${c}" ${c === t.avatar_color ? 'selected' : ''}>${c}</option>`
  ).join('');
  card.innerHTML = `
    <div class="editable-card-header">
      <h4>Testimonial ${container.querySelectorAll('.editable-card').length + 1}</h4>
      <button class="btn-danger" onclick="this.closest('.editable-card').remove()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Name</label>
        <input type="text" class="testi-name" value="${escapeAttr(t.name)}" placeholder="John Doe" />
      </div>
      <div class="form-group">
        <label>Role</label>
        <input type="text" class="testi-role" value="${escapeAttr(t.role)}" placeholder="Software Developer" />
      </div>
      <div class="form-group">
        <label>Avatar Color</label>
        <select class="testi-avatar">${avatarOptions}</select>
      </div>
    </div>
    <div class="form-group">
      <label>Review Text</label>
      <textarea class="testi-text" rows="3" placeholder="What they said...">${escapeHTML(t.text)}</textarea>
    </div>
    <div class="form-group">
      <label>Rating</label>
      <div class="rating-select">
        ${[1,2,3,4,5].map(n => `<svg class="star ${n <= (t.rating || 5) ? 'active' : ''}" data-val="${n}" onclick="setRating(this)" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`).join('')}
      </div>
    </div>`;
  container.appendChild(card);
}

function setRating(star) {
  const val = parseInt(star.dataset.val);
  const stars = star.parentElement.querySelectorAll('.star');
  stars.forEach(s => {
    s.classList.toggle('active', parseInt(s.dataset.val) <= val);
  });
}

// ─── Populate: Developer ────────────────────────────
function populateDeveloper() {
  const d = store.developer || {};
  document.getElementById('devName').value = d.name || '';
  document.getElementById('devTitle').value = d.title || '';
  document.getElementById('devDesc').value = d.description || '';
  document.getElementById('devTags').value = (d.tags || []).join(', ');
  document.getElementById('devGithub').value = (d.socials || {}).github || '';
  document.getElementById('devLinkedin').value = (d.socials || {}).linkedin || '';
  document.getElementById('devPortfolio').value = (d.socials || {}).portfolio || '';

  if (d.photo_url) {
    document.getElementById('photoCurrentFile').style.display = 'flex';
    document.getElementById('photoPreview').src = d.photo_url;
    document.getElementById('photoCurrentName').textContent = d.photo_url.split('/').pop();
  }
}

// ─── Populate: Settings ─────────────────────────────
function populateSettings() {
  const d = store.settings || {};
  document.getElementById('setSiteName').value = d.site_name || '';
  document.getElementById('setCopyright').value = d.copyright_year || '';
  document.getElementById('setTagline').value = d.tagline || '';
  document.getElementById('setMetaDesc').value = d.meta_description || '';
}

// ─── Collect Data from Forms ────────────────────────
function collectHero() {
  const stats = [];
  document.querySelectorAll('#heroStatsContainer .item-row').forEach(row => {
    const number = row.querySelector('[data-stat="number"]').value.trim();
    const suffix = row.querySelector('[data-stat="suffix"]').value.trim();
    const label = row.querySelector('[data-stat="label"]').value.trim();
    if (number || label) stats.push({ number, suffix, label });
  });
  return {
    badge: document.getElementById('heroBadge').value.trim(),
    title_line1: document.getElementById('heroLine1').value.trim(),
    title_line2: document.getElementById('heroLine2').value.trim(),
    title_line3: document.getElementById('heroLine3').value.trim(),
    subtitle: document.getElementById('heroSubtitle').value.trim(),
    stats
  };
}

function collectFeatures() {
  const arr = [];
  document.querySelectorAll('#featuresContainer .editable-card').forEach(card => {
    arr.push({
      title: card.querySelector('.feat-title').value.trim(),
      description: card.querySelector('.feat-desc').value.trim(),
      icon: card.querySelector('.feat-icon').value,
      visible: card.querySelector('.feat-visible').checked
    });
  });
  return arr;
}

function collectSteps() {
  const arr = [];
  document.querySelectorAll('#stepsContainer .editable-card').forEach(card => {
    arr.push({
      number: card.querySelector('.step-number').value.trim(),
      title: card.querySelector('.step-title').value.trim(),
      description: card.querySelector('.step-desc').value.trim()
    });
  });
  return arr;
}

function collectSecurity() {
  const items = [];
  document.querySelectorAll('#securityItemsContainer .security-item').forEach(input => {
    const v = input.value.trim();
    if (v) items.push(v);
  });
  return {
    description: document.getElementById('securityDesc').value.trim(),
    items
  };
}

function collectDownload() {
  return {
    version: document.getElementById('dlVersion').value.trim(),
    min_android: document.getElementById('dlMinAndroid').value.trim(),
    apk_filename: document.getElementById('dlFilename').value.trim(),
    note: document.getElementById('dlNote').value.trim(),
    ios_available: document.getElementById('dlIosAvailable').checked,
    apk_url: store.download?.apk_url || 'assets/cloud-guard.apk'
  };
}

function collectTestimonials() {
  const arr = [];
  document.querySelectorAll('#testimonialsContainer .editable-card').forEach(card => {
    const activeStars = card.querySelectorAll('.star.active').length;
    arr.push({
      name: card.querySelector('.testi-name').value.trim(),
      role: card.querySelector('.testi-role').value.trim(),
      text: card.querySelector('.testi-text').value.trim(),
      rating: activeStars || 5,
      avatar_color: card.querySelector('.testi-avatar').value
    });
  });
  return arr;
}

function collectDeveloper() {
  const tags = document.getElementById('devTags').value.split(',').map(t => t.trim()).filter(Boolean);
  return {
    name: document.getElementById('devName').value.trim(),
    title: document.getElementById('devTitle').value.trim(),
    description: document.getElementById('devDesc').value.trim(),
    tags,
    socials: {
      github: document.getElementById('devGithub').value.trim(),
      linkedin: document.getElementById('devLinkedin').value.trim(),
      portfolio: document.getElementById('devPortfolio').value.trim()
    },
    photo_url: store.developer?.photo_url || 'assets/developer.jpg'
  };
}

function collectSettings() {
  return {
    site_name: document.getElementById('setSiteName').value.trim(),
    copyright_year: document.getElementById('setCopyright').value.trim(),
    tagline: document.getElementById('setTagline').value.trim(),
    meta_description: document.getElementById('setMetaDesc').value.trim()
  };
}

// ─── Save Section ───────────────────────────────────
async function saveSection(section) {
  let content;
  switch (section) {
    case 'hero':         content = collectHero(); break;
    case 'features':     content = collectFeatures(); break;
    case 'steps':        content = collectSteps(); break;
    case 'security':     content = collectSecurity(); break;
    case 'download':     content = collectDownload(); break;
    case 'testimonials': content = collectTestimonials(); break;
    case 'developer':    content = collectDeveloper(); break;
    case 'settings':     content = collectSettings(); break;
    default: return;
  }

  const { error } = await supabase
    .from('website_content')
    .upsert({ section, content, updated_at: new Date().toISOString() });

  if (error) {
    toast('Save failed: ' + error.message, 'error');
  } else {
    store[section] = content;
    updateDashboardStats();
    toast(`${section.charAt(0).toUpperCase() + section.slice(1)} saved successfully!`);
  }
}

// ─── File Uploads ───────────────────────────────────
function setupUploadZone(zoneId, inputId, accept, onUpload) {
  const zone = document.getElementById(zoneId);
  const input = document.getElementById(inputId);
  if (!zone || !input) return;

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    if (e.dataTransfer.files.length) onUpload(e.dataTransfer.files[0]);
  });
  input.addEventListener('change', () => {
    if (input.files.length) onUpload(input.files[0]);
    input.value = '';
  });
}

async function uploadFile(file, folder, onProgress) {
  const ext = file.name.split('.').pop();
  const path = `${folder}/${Date.now()}.${ext}`;

  // Supabase JS v2 doesn't expose XHR progress, so we simulate it
  if (onProgress) onProgress(10);

  const { data, error } = await supabase.storage
    .from('website-assets')
    .upload(path, file, { cacheControl: '3600', upsert: true });

  if (error) throw error;

  if (onProgress) onProgress(90);

  const { data: urlData } = supabase.storage
    .from('website-assets')
    .getPublicUrl(data.path);

  if (onProgress) onProgress(100);
  return urlData.publicUrl;
}

// APK Upload
setupUploadZone('apkUploadZone', 'apkFileInput', '.apk', async (file) => {
  if (!file.name.endsWith('.apk')) { toast('Please upload an APK file', 'error'); return; }
  if (file.size > 200 * 1024 * 1024) { toast('File too large (max 200 MB)', 'error'); return; }

  const bar = document.getElementById('apkProgressBar');
  const fill = document.getElementById('apkProgressFill');
  const text = document.getElementById('apkProgressText');
  bar.style.display = 'block';

  try {
    const url = await uploadFile(file, 'apk', (pct) => {
      fill.style.width = pct + '%';
      text.textContent = pct + '%';
    });

    // Update store
    if (!store.download) store.download = {};
    store.download.apk_url = url;

    // Show current file
    document.getElementById('apkCurrentFile').style.display = 'flex';
    document.getElementById('apkCurrentName').textContent = file.name;
    document.getElementById('apkCurrentUrl').href = url;

    toast('APK uploaded successfully!');
  } catch (err) {
    toast('Upload failed: ' + err.message, 'error');
  } finally {
    setTimeout(() => { bar.style.display = 'none'; fill.style.width = '0%'; }, 1000);
  }
});

// Developer Photo Upload
setupUploadZone('photoUploadZone', 'photoFileInput', 'image/*', async (file) => {
  if (!file.type.startsWith('image/')) { toast('Please upload an image', 'error'); return; }
  if (file.size > 10 * 1024 * 1024) { toast('Image too large (max 10 MB)', 'error'); return; }

  try {
    const url = await uploadFile(file, 'images', () => {});

    if (!store.developer) store.developer = {};
    store.developer.photo_url = url;

    document.getElementById('photoCurrentFile').style.display = 'flex';
    document.getElementById('photoPreview').src = url;
    document.getElementById('photoCurrentName').textContent = file.name;

    toast('Photo uploaded!');
  } catch (err) {
    toast('Upload failed: ' + err.message, 'error');
  }
});

// ─── Utilities ──────────────────────────────────────
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ─── Init ───────────────────────────────────────────
checkSession();
