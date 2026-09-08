/* Real links remain usable if Cal.com cannot load or JavaScript is disabled. */
(() => {
  // Cal renders into an open shadow root. Keep background content out of the
  // keyboard order while its dialog is open, then restore the original trigger.
  let returnFocus;
  let activeModal;
  const background = () =>
    document.querySelectorAll(
      ".site-header, main, .site-footer, .skip-link, cal-floating-button",
    );
  const prepareModal = (modal) => {
    if (modal.dataset.focusManaged) return;
    modal.dataset.focusManaged = "true";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Book a consultation");
    const opened = () => {
      if (activeModal === modal) return;
      returnFocus =
        document.activeElement?.shadowRoot?.activeElement ||
        document.activeElement;
      activeModal = modal;
      background().forEach((element) => {
        element.inert = true;
      });
      modal.shadowRoot?.querySelector('button[aria-label="Close"]')?.focus();
    };
    modal.addEventListener("open", opened);
    modal.addEventListener("close", () => {
      background().forEach((element) => {
        element.inert = false;
      });
      activeModal = null;
      returnFocus?.focus({ preventScroll: true });
    });
    if (getComputedStyle(modal).visibility !== "hidden") opened();
  };
  new MutationObserver(() => {
    document.querySelectorAll("cal-modal-box").forEach(prepareModal);
  }).observe(document.body, { childList: true });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && activeModal) {
      window.Cal.ns.studioember("closeModal");
    }
  });
  const links = [...document.querySelectorAll("[data-booking]")];
  const calLink = "nathan-grey/studioember";
  const config = { layout: "month_view", useSlotsViewOnSmallScreen: "true" };
  // Preserve query attribution for both the popup and the direct-link fallback.
  links.forEach((link) => {
    const url = new URL(link.href);
    new URLSearchParams(window.location.search).forEach((value, key) =>
      url.searchParams.append(key, value),
    );
    link.href = url.href;
  });
  (function (C, A, L) {
    const p = (a, ar) => a.q.push(ar);
    const d = C.document;
    C.Cal =
      C.Cal ||
      function () {
        const cal = C.Cal;
        const ar = arguments;
        if (!cal.loaded) {
          cal.ns = {};
          cal.q = cal.q || [];
          const script = d.createElement("script");
          script.src = A;
          // Only intercept links after the actual embed library is available.
          script.onload = () =>
            links.forEach((link) => {
              link.setAttribute("data-cal-link", calLink);
              link.setAttribute("data-cal-namespace", "studioember");
              link.setAttribute("data-cal-config", JSON.stringify(config));
              // Cal handles the bubbling click, but anchors still need their
              // default navigation suppressed once the embed is ready.
              link.addEventListener("click", (event) => {
                if (
                  !event.metaKey &&
                  !event.ctrlKey &&
                  !event.shiftKey &&
                  !event.altKey
                ) {
                  event.preventDefault();
                }
              });
            });
          d.head.appendChild(script);
          cal.loaded = true;
        }
        if (ar[0] === L) {
          const api = function () {
            p(api, arguments);
          };
          const namespace = ar[1];
          api.q = api.q || [];
          if (typeof namespace === "string") {
            cal.ns[namespace] = cal.ns[namespace] || api;
            p(cal.ns[namespace], ar);
            p(cal, ["initNamespace", namespace]);
          } else p(cal, ar);
          return;
        }
        p(cal, ar);
      };
  })(window, "https://app.cal.com/embed/embed.js", "init");
  Cal("init", "studioember", { origin: "https://app.cal.com" });
  Cal.config = Cal.config || {};
  Cal.config.forwardQueryParams = true;
  Cal.ns.studioember("floatingButton", {
    calLink,
    config,
    buttonText: "Book a consultation",
    buttonColor: "#172653",
    buttonTextColor: "#fff7f0",
  });
  // Count only successful new embedded bookings as leads, never button clicks.
  // Booking identifiers are used locally for deduplication, not sent to GA.
  const recordedBookings = new Set();
  Cal.ns.studioember("on", {
    action: "bookingSuccessfulV2",
    callback: (event) => {
      const uid = event.detail.data.uid;
      if (uid && recordedBookings.has(uid)) return;
      if (uid) recordedBookings.add(uid);
      window.gtag?.("event", "generate_lead", { method: "cal_com" });
    },
  });
  Cal.ns.studioember("ui", {
    hideEventTypeDetails: false,
    layout: "month_view",
  });
})();
