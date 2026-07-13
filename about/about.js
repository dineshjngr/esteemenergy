(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const revealItems = [...document.querySelectorAll("[data-reveal]")];

  revealItems.forEach((item) => {
    const delay = Number(item.dataset.revealDelay || 0);
    item.style.setProperty("--reveal-delay", `${delay * 90}ms`);
  });

  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -7%" });
    revealItems.forEach((item) => observer.observe(item));
  }

  const parallaxItems = [...document.querySelectorAll(".about-parallax img")];
  let frame = 0;
  const updateParallax = () => {
    frame = 0;
    if (reducedMotion.matches || window.innerWidth < 768) {
      parallaxItems.forEach((image) => image.style.removeProperty("--parallax-y"));
      return;
    }
    const midpoint = window.innerHeight / 2;
    parallaxItems.forEach((image) => {
      const rect = image.parentElement.getBoundingClientRect();
      const distance = (rect.top + rect.height / 2 - midpoint) / window.innerHeight;
      const offset = Math.max(-16, Math.min(16, distance * -18));
      image.style.setProperty("--parallax-y", `${offset.toFixed(1)}px`);
    });
  };
  const requestParallax = () => {
    if (!frame) frame = requestAnimationFrame(updateParallax);
  };
  updateParallax();
  window.addEventListener("scroll", requestParallax, { passive: true });
  window.addEventListener("resize", requestParallax, { passive: true });
})();
