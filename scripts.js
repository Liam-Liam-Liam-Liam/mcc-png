// Placeholder for future interactivity
console.log("Gallery loaded.");

window.addEventListener("load", () => {
  const images = document.querySelectorAll(".fade-img");
  images.forEach((img, index) => {
    setTimeout(() => {
      img.style.opacity = 1;
    }, index * 2000); // Delay each image fade-in
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const rotator = document.getElementById('rotator');
  if (!rotator) return;

  const slides = Array.from(rotator.querySelectorAll('.rotator-img'));
  let idx = slides.findIndex(s => s.classList.contains('active'));
  if (idx < 0) idx = 0;

  let intervalMs = 3000;
  let timer = start();

  function show(i) {
    slides.forEach(s => s.classList.remove('active'));
    slides[i].classList.add('active');
  }

  function next() {
    idx = (idx + 1) % slides.length;
    show(idx);
  }

  function start() {
    return setInterval(next, intervalMs);
  }

  function stop() {
    clearInterval(timer);
  }

  // Pause on hover
  rotator.addEventListener('mouseenter', stop);
  rotator.addEventListener('mouseleave', () => { timer = start(); });

  // Click to open your existing modal
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-img');
  const closeBtn = document.querySelector('.modal .close');

  rotator.addEventListener('click', (e) => {
    const active = rotator.querySelector('.rotator-img.active');
    if (!active || !modal || !modalImg) return;
    modal.style.display = 'block';
    modalImg.src = active.src;
  });

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }
});
