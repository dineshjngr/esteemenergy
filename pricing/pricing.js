(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hero = document.querySelector(".pricing-hero");

  requestAnimationFrame(() => requestAnimationFrame(() => hero?.classList.add("is-ready")));

  const revealItems = [...document.querySelectorAll("[data-reveal], [data-reveal-left], [data-reveal-right]")];
  revealItems.forEach((item) => {
    const delay = Number(item.dataset.revealDelay || 0);
    item.style.setProperty("--reveal-delay", `${delay * 90}ms`);
  });

  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    document.querySelector("[data-process]")?.classList.add("is-visible");
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -7%" });
    revealItems.forEach((item) => revealObserver.observe(item));

    const process = document.querySelector("[data-process]");
    if (process) {
      const processObserver = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        process.classList.add("is-visible");
        processObserver.disconnect();
      }, { threshold: 0.24, rootMargin: "0px 0px -10%" });
      processObserver.observe(process);
    }
  }

  document.querySelector("[data-scroll-pricing]")?.addEventListener("click", () => {
    document.getElementById("pricing-showroom")?.scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "start",
    });
  });

  const faqItems = [...document.querySelectorAll(".pricing-faq-item")];
  const closeFaq = (item) => {
    item.classList.remove("is-open");
    item.querySelector("button")?.setAttribute("aria-expanded", "false");
  };
  faqItems.forEach((item, index) => {
    const button = item.querySelector("button");
    const answer = item.querySelector(".pricing-answer");
    if (!button || !answer) return;
    button.id = `pricing-question-${index + 1}`;
    answer.setAttribute("aria-labelledby", button.id);
    button.addEventListener("click", () => {
      const willOpen = button.getAttribute("aria-expanded") !== "true";
      faqItems.forEach(closeFaq);
      if (!willOpen) return;
      item.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
    });
  });

  const parallaxImages = [...document.querySelectorAll(".pricing-parallax img")];
  let frame = 0;
  const updateParallax = () => {
    frame = 0;
    if (reducedMotion.matches || window.innerWidth < 768) {
      parallaxImages.forEach((image) => image.style.removeProperty("--parallax-y"));
      return;
    }
    const midpoint = window.innerHeight / 2;
    parallaxImages.forEach((image) => {
      const rect = image.parentElement.getBoundingClientRect();
      const distance = (rect.top + rect.height / 2 - midpoint) / window.innerHeight;
      const offset = Math.max(-12, Math.min(12, distance * -14));
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
