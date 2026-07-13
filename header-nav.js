(() => {
  const menuLabels = [
    "Home", "About", "Packages", "Products",
    "Gallery", "Blogs", "Reviews", "Contact",
  ];

  const chevron = `
    <svg class="solaris-chevron" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  const arrow = `
    <svg viewBox="0 0 18 18" aria-hidden="true">
      <path d="M4 9h9.2M9.8 5.6 13.2 9l-3.4 3.4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  const makeItem = (label, mobile = false) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = mobile ? "solaris-mobile-nav-item" : "solaris-nav-item";
    button.innerHTML = `<span>${label}</span>${label === "Products" ? chevron : ""}`;
    button.addEventListener("click", (event) => event.preventDefault());
    return button;
  };

  const makeQuoteButton = (extraClass = "") => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `solaris-quote-cta ${extraClass}`.trim();
    button.setAttribute("data-open-quote-modal", "");
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-controls", "solar-lead-dialog");
    button.innerHTML = `
      <span class="solaris-quote-fill" aria-hidden="true"></span>
      <span class="solaris-quote-label">Get Quote</span>
      <span class="solaris-quote-arrow">${arrow}</span>`;
    return button;
  };

  const initHeader = () => {
    const originalHeader = document.querySelector(".framer-efto20-container");
    const originalLogo = originalHeader?.querySelector(".framer-yi202p-container");
    if (!originalHeader || !originalLogo || document.querySelector(".solaris-site-header")) return;

    const header = document.createElement("header");
    header.className = "solaris-site-header";
    header.setAttribute("aria-label", "Site header");

    const inner = document.createElement("div");
    inner.className = "solaris-header-inner";

    const brand = document.createElement("div");
    brand.className = "solaris-brand";
    brand.append(originalLogo.cloneNode(true));

    const desktopNav = document.createElement("nav");
    desktopNav.className = "solaris-nav";
    desktopNav.setAttribute("aria-label", "Visual menu options");
    menuLabels.forEach((label) => desktopNav.append(makeItem(label)));

    const cta = document.createElement("div");
    cta.className = "solaris-header-cta";
    cta.append(makeQuoteButton());

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "solaris-menu-toggle";
    toggle.setAttribute("aria-label", "Open menu");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = "<span></span><span></span>";

    const mobileMenu = document.createElement("nav");
    mobileMenu.className = "solaris-mobile-menu";
    mobileMenu.setAttribute("aria-label", "Mobile visual menu options");
    menuLabels.forEach((label) => mobileMenu.append(makeItem(label, true)));
    mobileMenu.append(makeQuoteButton("solaris-mobile-quote"));

    const closeMenu = () => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      mobileMenu.classList.remove("is-open");
    };

    toggle.addEventListener("click", () => {
      const willOpen = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(willOpen));
      toggle.setAttribute("aria-label", willOpen ? "Close menu" : "Open menu");
      mobileMenu.classList.toggle("is-open", willOpen);
    });

    mobileMenu.querySelector("[data-open-quote-modal]").addEventListener("click", closeMenu);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    inner.append(brand, desktopNav, cta, toggle, mobileMenu);
    header.append(inner);
    document.body.prepend(header);
    document.body.classList.add("header-upgraded");

    const updateScrollState = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 28);
    };
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeader, { once: true });
  } else {
    initHeader();
  }
})();
