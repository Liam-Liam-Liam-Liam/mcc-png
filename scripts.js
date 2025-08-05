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
