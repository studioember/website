// Production-only GA4: local previews and test builds do not send traffic.
(() => {
  const settings = document.currentScript.dataset;
  const canonicalHost = new URL(settings.siteUrl).hostname;
  if (
    ![canonicalHost, `www.${canonicalHost}`].includes(window.location.hostname)
  )
    return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", settings.measurementId);
  const tag = document.createElement("script");
  tag.async = true;
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${settings.measurementId}`;
  document.head.appendChild(tag);

  // Capture handles the Cal floating button's shadow DOM and direct-link fallback.
  document.addEventListener(
    "click",
    (event) => {
      const trigger = event
        .composedPath()
        .find(
          (element) =>
            element instanceof HTMLElement &&
            (element.matches("[data-booking]") ||
              element.matches("cal-floating-button")),
        );
      if (!trigger) return;
      const location = trigger.matches("cal-floating-button")
        ? "floating"
        : trigger.closest("header")
          ? "header"
          : trigger.closest("section")?.id || "hero";
      window.gtag("event", "consultation_click", {
        cta_location: location,
        transport_type: "beacon",
      });
    },
    true,
  );
})();
