(() => {
  if (new URLSearchParams(window.location.search).has("lead-bridge")) return;
  const heroCtaSelector = '#hero a[name="Primary Button"]';
  const scriptUrl = document.currentScript?.src || window.location.href;
  const illustrationUrl = new URL("./assests/wind-power.png", scriptUrl).href;
  const focusableSelector = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';
  let trigger = null;
  let isSubmitting = false;
  let hasSubmitted = false;
  let previousOverflow = "";

  const checkIcon = `
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="m3 8.2 3 3L13 4.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  const markup = `
    <div class="solar-lead-overlay" aria-hidden="true">
      <section class="solar-lead-dialog" id="solar-lead-dialog" role="dialog" aria-modal="true" aria-labelledby="solar-lead-title" aria-describedby="solar-lead-description" tabindex="-1">
        <button class="solar-lead-close" type="button" aria-label="Close solar consultation form">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 4l12 12M16 4 4 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
        </button>
        <div class="solar-lead-grid">
          <div class="solar-lead-intro">
            <span class="solar-lead-kicker">FREE SOLAR CONSULTATION</span>
            <h2 id="solar-lead-title">See How Much Solar Could Save You</h2>
            <p class="solar-lead-description" id="solar-lead-description">Tell us a little about your property. Our solar team will review your requirements and provide a free, no-obligation recommendation.</p>
            <ul class="solar-lead-benefits">
              <li><span class="solar-lead-check">${checkIcon}</span>Free system recommendation</li>
              <li><span class="solar-lead-check">${checkIcon}</span>No-obligation consultation</li>
              <li><span class="solar-lead-check">${checkIcon}</span>Designed for your property</li>
            </ul>
            <img class="solar-lead-art" src="${illustrationUrl}" alt="Wind and solar renewable energy illustration">
          </div>
          <div class="solar-lead-form-panel">
            <div class="solar-lead-form-wrap">
              <h3>Get Your Free Solar Assessment</h3>
              <form class="solar-lead-form" novalidate>
                <div class="solar-lead-field">
                  <label for="solar-full-name">Full name <span aria-hidden="true">*</span></label>
                  <input id="solar-full-name" name="Name" type="text" autocomplete="name" required>
                  <span class="solar-lead-field-error" id="solar-full-name-error"></span>
                </div>
                <div class="solar-lead-field">
                  <label for="solar-phone">Phone number <span aria-hidden="true">*</span></label>
                  <input id="solar-phone" name="Phone" type="tel" autocomplete="tel" required>
                  <span class="solar-lead-field-error" id="solar-phone-error"></span>
                </div>
                <div class="solar-lead-field is-wide">
                  <label for="solar-email">Email address <span aria-hidden="true">*</span></label>
                  <input id="solar-email" name="Email" type="email" autocomplete="email" required>
                  <span class="solar-lead-field-error" id="solar-email-error"></span>
                </div>
                <div class="solar-lead-field is-wide">
                  <label for="solar-address">Property address or area <span aria-hidden="true">*</span></label>
                  <input id="solar-address" name="Address" type="text" autocomplete="street-address" required>
                  <span class="solar-lead-field-error" id="solar-address-error"></span>
                </div>
                <div class="solar-lead-field">
                  <label for="solar-property">Property type <span aria-hidden="true">*</span></label>
                  <select id="solar-property" name="Location" required>
                    <option value="">Select property type</option>
                    <option value="Home">Home</option>
                    <option value="Villa">Villa</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Other">Other</option>
                  </select>
                  <span class="solar-lead-field-error" id="solar-property-error"></span>
                </div>
                <div class="solar-lead-field">
                  <label for="solar-bill">Average monthly electricity bill</label>
                  <input id="solar-bill" name="Electricity Bill" type="text" inputmode="decimal">
                  <span class="solar-lead-field-error"></span>
                </div>
                <div class="solar-lead-field is-wide">
                  <label for="solar-message">Message or project details</label>
                  <textarea id="solar-message" name="Message"></textarea>
                  <span class="solar-lead-field-error"></span>
                </div>
                <p class="solar-lead-submit-error" role="alert"></p>
                <button class="solar-lead-submit" type="submit">
                  <span class="solar-lead-spinner" aria-hidden="true"></span>
                  <span class="solar-lead-submit-label">GET MY FREE SOLAR ASSESSMENT</span>
                </button>
                <p class="solar-lead-privacy">Secure and confidential. No obligation.</p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>`;

  const iframe = document.createElement("iframe");
  iframe.className = "solar-legacy-form-bridge";
  iframe.src = "/contact/?lead-bridge=1";
  iframe.title = "Solar consultation submission service";
  iframe.tabIndex = -1;
  iframe.setAttribute("aria-hidden", "true");
  document.body.append(iframe);

  const shell = document.createElement("div");
  shell.innerHTML = markup;
  const overlay = shell.firstElementChild;
  document.body.append(overlay);

  const dialog = overlay.querySelector(".solar-lead-dialog");
  const closeButton = overlay.querySelector(".solar-lead-close");
  const form = overlay.querySelector(".solar-lead-form");
  const submitButton = overlay.querySelector(".solar-lead-submit");
  const submitLabel = overlay.querySelector(".solar-lead-submit-label");
  const submitError = overlay.querySelector(".solar-lead-submit-error");

  const openModal = (cta) => {
    if (overlay.classList.contains("is-open")) return;
    trigger = cta;
    form.dataset.selectedPackage = cta.dataset.solarPackage || "";
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    window.lenis?.stop?.();
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => dialog.focus());
  };

  const closeModal = () => {
    if (!overlay.classList.contains("is-open")) return;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = previousOverflow;
    window.lenis?.start?.();
    trigger?.focus({ preventScroll: true });
  };

  const setError = (input, message) => {
    const error = document.getElementById(`${input.id}-error`);
    input.setAttribute("aria-invalid", message ? "true" : "false");
    if (message) input.setAttribute("aria-describedby", error.id);
    else input.removeAttribute("aria-describedby");
    error.textContent = message;
  };

  const validate = () => {
    const name = form.elements.Name;
    const phone = form.elements.Phone;
    const email = form.elements.Email;
    const address = form.elements.Address;
    const property = form.elements.Location;
    const digits = phone.value.replace(/\D/g, "");
    const emailOkay = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());

    setError(name, name.value.trim() ? "" : "Please enter your full name.");
    setError(phone, digits.length >= 7 ? "" : "Please enter a valid phone number.");
    setError(email, emailOkay ? "" : "Please enter a valid email address.");
    setError(address, address.value.trim() ? "" : "Please enter your property address or area.");
    setError(property, property.value ? "" : "Please select a property type.");

    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    firstInvalid?.focus();
    return !firstInvalid;
  };

  const updateLegacyControl = (control, value) => {
    if (!control) return;
    const view = control.ownerDocument.defaultView;
    const prototype = control.tagName === "SELECT" ? view.HTMLSelectElement.prototype :
      control.tagName === "TEXTAREA" ? view.HTMLTextAreaElement.prototype : view.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, "value").set.call(control, value);
    control.dispatchEvent(new Event("input", { bubbles: true }));
    control.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const submitThroughLegacyForm = () => new Promise((resolve, reject) => {
    const legacyDocument = iframe.contentDocument;
    const legacyForm = legacyDocument?.querySelector('form[data-framer-name="Contact Form"]');
    if (!legacyForm) {
      reject(new Error("The secure form service is still loading. Please try again in a moment."));
      return;
    }

    const values = new FormData(form);
    const names = legacyForm.querySelectorAll('input[name="Name"]');
    const email = legacyForm.querySelector('input[name="Email"]');
    const property = legacyForm.querySelector('select[name="Location"]');
    const message = legacyForm.querySelector('textarea[name="Email"]');
    const propertyMap = {
      Home: "Residential Property",
      Villa: "Residential Property",
      Commercial: "Commercial Building",
      Other: "Industrial Facility",
    };
    const details = [
      `Selected solar package: ${form.dataset.selectedPackage || "Not specified"}`,
      `Property address or area: ${values.get("Address")}`,
      `Property type: ${values.get("Location")}`,
      `Average monthly electricity bill: ${values.get("Electricity Bill") || "Not provided"}`,
      `Message or project details: ${values.get("Message") || "Not provided"}`,
    ].join("\n");

    updateLegacyControl(names[0], values.get("Name"));
    updateLegacyControl(names[1], values.get("Phone"));
    updateLegacyControl(email, values.get("Email"));
    updateLegacyControl(property, propertyMap[values.get("Location")]);
    updateLegacyControl(message, details);

    const startedAt = Date.now();
    let timeout = 0;
    const finish = (callback) => {
      observer.disconnect();
      window.clearInterval(timeout);
      callback();
    };
    const observer = new MutationObserver(() => {
      const stateButton = legacyDocument.querySelector('form[data-framer-name="Contact Form"] button[type="submit"]');
      const state = stateButton?.getAttribute("data-framer-name")?.toLowerCase();
      if (state === "success") {
        finish(resolve);
      } else if (state === "error") {
        finish(() => reject(new Error("We could not send your request. Please check your details and try again.")));
      }
    });
    observer.observe(legacyDocument.body, { attributes: true, childList: true, subtree: true });

    legacyForm.requestSubmit();
    timeout = window.setInterval(() => {
      if (Date.now() - startedAt < 30000) return;
      finish(() => reject(new Error("The request took too long. Please try again without closing this form.")));
    }, 500);
  });

  const showSuccess = () => {
    const wrap = overlay.querySelector(".solar-lead-form-wrap");
    wrap.innerHTML = `
      <div class="solar-lead-success" tabindex="-1">
        <span class="solar-lead-success-icon">${checkIcon}</span>
        <h3>Thank You!</h3>
        <p>Your request has been received. Our solar team will contact you shortly.</p>
      </div>`;
    wrap.querySelector(".solar-lead-success").focus();
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSubmitting || hasSubmitted || !validate()) return;

    isSubmitting = true;
    submitButton.disabled = true;
    submitButton.classList.add("is-loading");
    submitLabel.textContent = "SENDING YOUR REQUEST…";
    submitError.classList.remove("is-visible");

    try {
      await submitThroughLegacyForm();
      hasSubmitted = true;
      showSuccess();
    } catch (error) {
      submitError.textContent = error.message || "Something went wrong. Please try again.";
      submitError.classList.add("is-visible");
      submitButton.disabled = false;
      submitButton.classList.remove("is-loading");
      submitLabel.textContent = "GET MY FREE SOLAR ASSESSMENT";
    } finally {
      isSubmitting = false;
    }
  });

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeModal();
  });
  closeButton.addEventListener("click", closeModal);

  document.addEventListener("keydown", (event) => {
    if (!overlay.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...dialog.querySelectorAll(focusableSelector)].filter((item) => item.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const prepareHeroCtas = () => {
    document.querySelectorAll(heroCtaSelector).forEach((cta) => {
      cta.removeAttribute("href");
      cta.removeAttribute("target");
      cta.setAttribute("role", "button");
      cta.setAttribute("aria-haspopup", "dialog");
      cta.setAttribute("aria-controls", "solar-lead-dialog");
    });
  };
  prepareHeroCtas();
  document.addEventListener("framer:pageview", prepareHeroCtas);

  const quoteTriggerSelector = `${heroCtaSelector}, [data-open-quote-modal]`;

  document.addEventListener("click", (event) => {
    const cta = event.target.closest(quoteTriggerSelector);
    if (!cta) return;
    event.preventDefault();
    if (cta.matches(heroCtaSelector)) event.stopImmediatePropagation();
    openModal(cta);
  }, true);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const cta = event.target.closest?.(heroCtaSelector);
    if (!cta) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openModal(cta);
  }, true);
})();
