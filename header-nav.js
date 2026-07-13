(() => {
  const menuLabels = [
    "About", "Pricing", "Products",
    "Gallery", "Blogs", "Reviews", "Contact",
  ];

  const menuRoutes = Object.freeze({
    About: "/about",
    Pricing: "/pricing",
    Blogs: "/blogs",
    Contact: "/contact",
  });

  const chevron = `
    <svg class="solaris-chevron" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  const arrow = `
    <svg viewBox="0 0 18 18" aria-hidden="true">
      <path d="M4 9h9.2M9.8 5.6 13.2 9l-3.4 3.4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  const currentPath = () => window.location.pathname.replace(/\/+$/, "") || "/";

  const makeItem = (label, mobile = false) => {
    const route = menuRoutes[label];
    const item = document.createElement(route ? "a" : "button");
    if (route) {
      item.href = route;
      if (currentPath() === route) {
        item.classList.add("is-active");
        item.setAttribute("aria-current", "page");
      }
    } else {
      item.type = "button";
      item.addEventListener("click", (event) => event.preventDefault());
    }
    item.classList.add(mobile ? "solaris-mobile-nav-item" : "solaris-nav-item");
    item.innerHTML = `<span>${label}</span>${label === "Products" ? chevron : ""}`;
    return item;
  };

  const updateFooterNavigationLinks = () => {
    document.querySelectorAll("footer .framer-by8pig").forEach((list) => {
      let pricingLink = [...list.querySelectorAll("a")]
        .find((link) => /^(packages|pricing)$/i.test(link.textContent.trim()));

      list.querySelectorAll("a").forEach((link) => {
        if (!/^about(?: us)?$/i.test(link.textContent.trim())) return;
        link.href = "/about";
        const label = link.querySelector("p") || link;
        if (label.textContent.trim() !== "About Us") label.textContent = "About Us";
        if (currentPath() === "/about") link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });

      if (!pricingLink) {
        pricingLink = document.createElement("a");
        pricingLink.className = "esteem-footer-pricing-link";
        pricingLink.textContent = "Pricing";
        const aboutLink = [...list.querySelectorAll("a")]
          .find((link) => /^about us$/i.test(link.textContent.trim()));
        const aboutItem = aboutLink?.parentElement;
        if (aboutItem && aboutItem !== list) aboutItem.insertAdjacentElement("afterend", pricingLink);
        else list.append(pricingLink);
      }

      pricingLink.href = "/pricing";
      const pricingLabel = pricingLink.querySelector("p") || pricingLink;
      if (pricingLabel.textContent.trim() !== "Pricing") pricingLabel.textContent = "Pricing";
      if (currentPath() === "/pricing") pricingLink.setAttribute("aria-current", "page");
      else pricingLink.removeAttribute("aria-current");
    });
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
    const brandLink = brand.querySelector("a");
    if (brandLink) {
      brandLink.href = "/";
      brandLink.setAttribute("aria-label", "Esteem Energy home");
    }

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
    mobileMenu.querySelectorAll('a[href="/about"], a[href="/pricing"]')
      .forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    inner.append(brand, desktopNav, cta, toggle, mobileMenu);
    header.append(inner);
    document.body.prepend(header);
    document.body.classList.add("header-upgraded");
    updateFooterNavigationLinks();

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
  document.addEventListener("framer:pageview", updateFooterNavigationLinks);
})();
