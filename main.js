window.onload = () => {
  const slider = document.getElementById("slider");
  let angle = 0;
  let rotating = true;

  function animate() {
    if (rotating) {
      angle += 0.2;
      slider.style.transform = `rotateX(-15deg) rotateY(${angle}deg)`;
    }
    requestAnimationFrame(animate);
  }
  animate();

  let startX = 0;

  slider.addEventListener("touchstart", (e) => {
    rotating = false;
    startX = e.touches[0].clientX;
  });

  slider.addEventListener("touchmove", (e) => {
    const deltaX = e.touches[0].clientX - startX;
    angle += deltaX * 0.3;
    slider.style.transform = `rotateX(-15deg) rotateY(${angle}deg)`;
    startX = e.touches[0].clientX;
  });

  slider.addEventListener("touchend", () => {
    rotating = true;
  });

  slider.addEventListener("mousedown", (e) => {
    rotating = false;
    startX = e.clientX;

    const onMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      angle += deltaX * 0.3;
      slider.style.transform = `rotateX(-15deg) rotateY(${angle}deg)`;
      startX = e.clientX;
    };

    const onMouseUp = () => {
      rotating = true;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  });
};