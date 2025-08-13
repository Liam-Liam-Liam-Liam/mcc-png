// mcc.png — simple 3-image slideshow + lightbox

document.addEventListener('DOMContentLoaded', () => {
  /* -----------------------------
     Slideshow
     ----------------------------- */
  const box = document.getElementById('slideshow');
  if (!box) return;

  const slides = Array.from(box.querySelectorAll('img'));
  if (slides.length === 0) return;

  let i = 0;
  const INTERVAL_MS = 5000;
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

  /* -----------------------------
     Lightbox
     ----------------------------- */
  const lb = document.getElementById('lightbox');
  const lbImg = lb ? lb.querySelector('img') : null;
  const lbClose = lb ? lb.querySelector('.lb-close') : null;

  function openLightbox(src, alt){
    if (!lb || !lbImg) return;
    stop(); // pause slideshow
    lbImg.src = src;
    lbImg.alt = alt || '';
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    // focus the close button for accessibility
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
    start(); // resume slideshow
  }

  function onKey(e){
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      // next image in lightbox and slideshow index
      i = (i + 1) % slides.length;
      show(i);
      if (lbImg) lbImg.src = slides[i].src;
    } else if (e.key === 'ArrowLeft') {
      i = (i - 1 + slides.length) % slides.length;
      show(i);
      if (lbImg) lbImg.src = slides[i].src;
    }
  }

  // open on click (any slide)
  slides.forEach((img, idx) => {
    img.addEventListener('click', () => {
      i = idx;        // ensure lightbox + slideshow are in sync
      show(i);
      openLightbox(img.src, img.alt);
    });
  });

  // close on X button
  if (lbClose) lbClose.addEventListener('click', closeLightbox);

  // close on backdrop click (but not when clicking the image itself)
  if (lb) {
    lb.addEventListener('click', (e) => {
      if (e.target === lb) closeLightbox();
    });
  }
});
