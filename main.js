const slider = document.getElementById("slider");

let angle = 0;
let rotating = true;
let rotateInterval;

function startRotation() {
  if (rotating) return;
  rotateInterval = setInterval(() => {
    angle += 0.2;
    slider.style.transform = `rotateX(-15deg) rotateY(${angle}deg)`;
  }, 16);
  rotating = true;
}

function stopRotation() {
  if (!rotating) return;
  clearInterval(rotateInterval);
  angle = Math.round(angle / 120) * 120;
  slider.style.transform = `rotateX(-15deg) rotateY(${angle}deg)`;
  rotating = false;
}

// Inicia rotación automática
startRotation();

// Al tocar el carrusel (tap), pausa o reanuda
slider.addEventListener("click", () => {
  if (rotating) {
    stopRotation();
  } else {
    startRotation();
  }
});