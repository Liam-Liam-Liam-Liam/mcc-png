/* ================================
   mcc.png — site scripts (clean)
   ================================ */

document.addEventListener('DOMContentLoaded', () => {
  setupHeroRotator();   // rotating hero on the homepage
  setupModal();         // lightbox modal for hero + gallery
  setupGalleryClicks(); // thumbnails open modal
});

/* --- small helper: preload an image --- */
function preload(src) {
  const img = new Image();
  img.src = src;
}

async function setupHeroRotator() {
  const rotator = document.getElementById('rotator');
  if (!rotator) return;

  const intervalMs = parseInt(rotator.dataset.interval, 10) || 5000;
  const dir = (rotator.dataset.srcdir || 'assets/images/front_page/')
    .replace(/\\/g, '/')
    .replace(/\/+$/, '') + '/';

  // 1) Try to parse inline data-srcs (CSV or JSON), else try featured.json, else fallback.
  let files = parseInlineList(rotator.dataset.srcs);
  if (!files.length) {
    try {
      const res = await fetch(dir + 'featured.json', { cache: 'no-store' });
      if (res.ok) {
        const arr = await res.json();
        if (Array.isArray(arr)) files = arr.filter(v => typeof v === 'string' && v.trim());
      }
    } catch (_) { /* no worries */ }
  }
  if (!files.length) files = ['hero1.jpg', 'hero2.jpg', 'hero3.jpg'];

  // 2) Ensure we have two <img> for a smooth crossfade
  let imgA = rotator.querySelector('img.rotator-img');
  let imgB = null;

  if (!imgA) {
    imgA = document.createElement('img');
    imgA.className = 'rotator-img active';
    imgA.alt = 'Featured image';
    imgA.loading = 'eager';
    rotator.appendChild(imgA);
  } else {
    imgA.classList.add('rotator-img', 'active');
  }

  imgB = document.createElement('img');
  imgB.className = 'rotator-img';
  imgB.alt = 'Featured image';
  rotator.appendChild(imgB);

  // 3) set up rotation state
  let idx = 0;
  imgA.src = dir + files[idx];
  preload(dir + files[(idx + 1) % files.length]);

  let active = imgA;
  let buffer = imgB;
  let timer = start();

  // Pause rotation on hover (nice UX)
  rotator.addEventListener('mouseenter', () => stop());
  rotator.addEventListener('mouseleave', () => { timer = start(); });

  // Click opens modal with current hero
  rotator.addEventListener('click', () => {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    if (modal && modalImg) {
      modal.style.display = 'block';
      modalImg.src = active.src;
    }
  });

  // Keyboard support (left/right) when page focused
  document.addEventListener('keydown', (e) => {
    if (!document.body.contains(rotator)) return;
    if (e.key === 'ArrowRight') { stop(); next(); timer = start(); }
    if (e.key === 'ArrowLeft')  { stop(); prev(); timer = start(); }
  });

  function start() { return setInterval(next, intervalMs); }
  function stop()  { clearInterval(timer); }

  function next() {
    idx = (idx + 1) % files.length;
    swapTo(idx);
  }
  function prev() {
    idx = (idx - 1 + files.length) % files.length;
    swapTo(idx);
  }

  function swapTo(i) {
    const nextSrc = dir + files[i];
    // prepare buffer
    buffer.src = nextSrc;
    // crossfade by toggling .active classes
    buffer.classList.add('active');
    active.classList.remove('active');
    // swap roles
    [active, buffer] = [buffer, active];
    // preload the following image
    preload(dir + files[(i + 1) % files.length]);
  }
}

/* parse data-srcs like: 'a.jpg,b.jpg,c.jpg' OR '["a.jpg","b.jpg"]' */
function parseInlineList(raw) {
  if (!raw) return [];
  // try JSON first
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr.filter(v => typeof v === 'string' && v.trim());
  } catch (_) {
    // fallback: CSV
    return raw.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

/* =====================================
   MODAL (shared by hero + gallery)
   ===================================== */
function setupModal() {
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-img');
  const closeBtn = modal?.querySelector('.close');
  if (!modal || !modalImg || !closeBtn) return;

  closeBtn.addEventListener('click', () => modal.style.display = 'none');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.style.display = 'none';
  });
}

/* =====================================
   GALLERY: click any thumb to open modal
   - works for #gallery img or video
   - supports data-full to open a larger file
   ===================================== */
function setupGalleryClicks() {
  const gallery = document.getElementById('gallery');
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-img');
  if (!gallery || !modal || !modalImg) return;

  gallery.addEventListener('click', (e) => {
    const el = e.target.closest('img, video');
    if (!el) return;
    modal.style.display = 'block';
    modalImg.src = el.dataset?.full || el.currentSrc || el.src || '';
  });
}
