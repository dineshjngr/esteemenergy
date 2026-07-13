(() => {
  const setText = (selector, text) => {
    document.querySelectorAll(selector).forEach((element) => {
      if (element.textContent.trim() !== text) element.textContent = text;
    });
  };

  const updateContextualCtas = () => {
    // Deliberately excludes the custom header and the hero's Primary Button.
    setText("#faqs .framer-1anms0j-container a.framer-WMYoJ p", "Ask a Solar Expert");
    setText("footer .framer-1hepv0y-container a.framer-WMYoJ p", "Get a Free Solar Quote");
    document.querySelectorAll("footer .framer-1hepv0y-container a.framer-WMYoJ").forEach((cta) => {
      cta.classList.add("esteem-footer-quote-cta");
      cta.closest(".framer-1hepv0y-container")?.classList.add("esteem-footer-quote-wrap");
    });
  };

  const setItemState = (item, open) => {
    const trigger = item.querySelector(".framer-kiabgh");
    item.classList.toggle("is-open", open);
    item.setAttribute("data-framer-name", open ? "Open" : "Closed");
    trigger?.setAttribute("aria-expanded", String(open));
  };

  const initializeAccordion = (accordion) => {
    const items = [...accordion.querySelectorAll(":scope > div > .framer-3KJtR")];
    if (!items.length) return;

    items.forEach((item, index) => {
      if (item.dataset.esteemFaqReady === "true") return;

      const trigger = item.querySelector(".framer-kiabgh");
      const question = item.querySelector(".framer-m1lqsr p");
      const answer = item.querySelector(".framer-1fiznb2");
      if (!trigger || !question || !answer) return;

      const instance = Math.random().toString(36).slice(2, 9);
      const questionId = `esteem-faq-question-${instance}`;
      const answerId = `esteem-faq-answer-${instance}`;

      item.dataset.esteemFaqReady = "true";
      item.classList.add("esteem-faq-item");
      item.removeAttribute("tabindex");
      question.id = questionId;
      answer.id = answerId;
      answer.setAttribute("role", "region");
      answer.setAttribute("aria-labelledby", questionId);
      trigger.setAttribute("aria-controls", answerId);
      trigger.setAttribute("aria-label", `Show answer: ${question.textContent.trim()}`);

      const toggle = () => {
        const willOpen = !item.classList.contains("is-open");
        items.forEach((other) => setItemState(other, other === item && willOpen));
        trigger.setAttribute("aria-label", `${willOpen ? "Hide" : "Show"} answer: ${question.textContent.trim()}`);
      };

      item.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        toggle();
      }, true);

      trigger.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        event.stopImmediatePropagation();
        toggle();
      }, true);

      setItemState(item, index === 0);
      if (index === 0) trigger.setAttribute("aria-label", `Hide answer: ${question.textContent.trim()}`);
    });
  };

  const initializeFaqs = () => {
    setText("#faqs .framer-1s1ohwv h2", "Your Questions, Answered");
    setText(
      "#faqs .framer-1jsb5es p",
      "Find answers to common questions about solar systems, savings, installation, performance, and ongoing support."
    );
    document.querySelectorAll("#faqs .framer-SqIAO").forEach(initializeAccordion);
  };

  const applyFixes = () => {
    updateContextualCtas();
    initializeFaqs();
  };

  applyFixes();
  document.addEventListener("framer:pageview", applyFixes);

  const main = document.getElementById("main");
  if (main) {
    const observer = new MutationObserver(applyFixes);
    observer.observe(main, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 12000);
  }
})();
