// Bootstrap-friendly slideshow + lightbox
// - Keeps your existing home-page 3-image slideshow
// - Adds support for multiple .slideshow blocks on the Gallery page (each with its own timer)

document.addEventListener('DOMContentLoaded', () => {
  /* -----------------------------
     Single featured slideshow on Home (id="slideshow")
     ----------------------------- */
  const homepageBox = document.getElementById('slideshow');
  if (homepageBox) {
    setupSlideshow(homepageBox);
  }

  /* -----------------------------
     Multiple slideshows on Gallery (class="slideshow")
     ----------------------------- */
  const gallerySlideshows = Array.from(document.querySelectorAll('.album .slideshow, .gallery-list .slideshow'))
    .filter(el => el !== homepageBox); // avoid double init on Home
  gallerySlideshows.forEach(box => setupSlideshow(box));

  /* -----------------------------
     Global Lightbox shared everywhere
     ----------------------------- */
  const lb = document.getElementById('lightbox');
  const lbImg = lb ? lb.querySelector('img') : null;
  const lbClose = lb ? lb.querySelector('.lb-close') : null;

  function openLightbox(src, alt){
    if (!lb || !lbImg) return;
    lbImg.src = src;
    lbImg.alt = alt || '';
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    if (lbClose) lbClose.focus();
    document.addEventListener('keydown', onKey);
  }

  function closeLightbox(){
    if (!lb || !lbImg) return;
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    lbImg.removeAttribute('src');
    lbImg.removeAttribute('alt');
    document.removeEventListener('keydown', onKey);
  }

  function onKey(e){
    if (e.key === 'Escape') closeLightbox();
  }

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lb) lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });

  /* -----------------------------
     Helpers
     ----------------------------- */
  function setupSlideshow(box){
    const slides = Array.from(box.querySelectorAll('img'));
    if (!slides.length) return;

    // Start with the first active or default to index 0
    let i = slides.findIndex(img => img.classList.contains('active'));
    if (i < 0) i = 0;

    const INTERVAL_MS = parseInt(box.getAttribute('data-interval') || '5000', 10);
    let timer = null;

    function show(n){
      slides.forEach((img, idx) => img.classList.toggle('active', idx === n));
    }

    function start(){
      stop();
      timer = setInterval(() => {
        i = (i + 1) % slides.length;
        show(i);
      }, INTERVAL_MS);
    }

    function stop(){
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    // initialize
    show(i);
    start();

    // clicking any image opens lightbox
    slides.forEach((img, idx) => {
      img.addEventListener('click', () => {
        i = idx;
        show(i);
        openLightbox(img.src, img.alt);
        // pause while the lightbox is open
        stop();
      });
    });

    // resume slideshow when lightbox closes
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') start();
    });
    if (lbClose) lbClose.addEventListener('click', start);
    if (lb) lb.addEventListener('click', (e) => { if (e.target === lb) start(); });
  }
});
