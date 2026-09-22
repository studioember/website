// Event definitions and GA4 setup: docs/measurement.md.
(() => {
  const settings = document.currentScript.dataset;
  const origin = new URL(settings.siteUrl).origin;
  const hostname = new URL(origin).hostname;
  const routes = {
    "/": "home",
    "/planning/": "planning",
    "/implementation/": "implementation",
    "/deliverables/": "deliverables",
    "/about/": "about",
  };
  const path = window.location.pathname.replace(/\/?$/, "/");
  const pageType = routes[path];
  if (!pageType) return;

  // Campaigns use public slugs, never visitor details or arbitrary URL values.
  const campaignKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ];
  const cleanCampaign = (get) =>
    Object.fromEntries(
      campaignKeys.flatMap((key) => {
        const value = get(key);
        return typeof value === "string" &&
          /^[a-z0-9][a-z0-9_-]{0,79}$/i.test(value)
          ? [[key, value]]
          : [];
      }),
    );
  const incoming = new URLSearchParams(window.location.search);
  const campaign = cleanCampaign((key) => incoming.get(key));
  window.emberAnalytics = { campaign };
  // Local/preview hosts never load GA or register measurement listeners.
  if (![hostname, `www.${hostname}`].includes(window.location.hostname)) return;

  const key = "ember-interest-v1";
  let previous = {};
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(key));
    const age = Date.now() - saved?.at;
    if (age >= 0 && age < 30 * 60 * 1000) previous = saved;
  } catch {
    /* Storage is optional. */
  }
  const services = ["planning", "implementation"];
  let servicePath = services.includes(pageType)
    ? pageType
    : pageType === "deliverables"
      ? "implementation"
      : services.includes(previous.service)
        ? previous.service
        : "general";
  // Keep attribution for a later Cal click, without restarting GA campaigns on
  // internal page views. Revalidate storage before reuse.
  const bookingCampaign = Object.keys(campaign).length
    ? campaign
    : cleanCampaign((name) => previous.campaign?.[name]);
  window.emberAnalytics.campaign = bookingCampaign;
  const saveContext = () => {
    try {
      window.sessionStorage.setItem(
        key,
        JSON.stringify({
          at: Date.now(),
          service: servicePath,
          campaign: bookingCampaign,
        }),
      );
    } catch {
      /* Contact still works without storage. */
    }
  };
  saveContext();

  let referrer = "";
  try {
    const url = new URL(document.referrer);
    if (["http:", "https:"].includes(url.protocol)) {
      referrer =
        url.origin === origin && routes[url.pathname]
          ? `${origin}${url.pathname}`
          : `${url.origin}/`;
    }
  } catch {
    /* Direct visits have no referrer. */
  }
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", settings.measurementId, {
    page_location: `${origin}${path}`,
    page_referrer: referrer,
    content_group: pageType,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    ...Object.fromEntries(
      Object.entries(campaign).map(([name, value]) => [
        name === "utm_campaign"
          ? "campaign_name"
          : name.replace("utm_", "campaign_"),
        value,
      ]),
    ),
  });
  const tag = document.createElement("script");
  tag.async = true;
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${settings.measurementId}`;
  document.head.appendChild(tag);

  const send = (name, parameters = {}) =>
    window.gtag("event", name, {
      page_type: pageType,
      service_path: servicePath,
      ...parameters,
      transport_type: "beacon",
    });
  const locations = new Set([
    "header",
    "footer",
    "hero",
    "journey",
    "proof",
    "faq",
    "contact",
    "services",
    "outputs",
    "fit",
    "process",
    "scope",
    "specialties",
    "approach",
    "examples",
    "architecture",
    "runbook",
    "validation",
    "breadcrumb",
  ]);
  const locationOf = (element) => {
    if (element.matches("cal-floating-button")) return "floating";
    const value = element.closest("[data-analytics-location]")?.dataset
      .analyticsLocation;
    return locations.has(value) ? value : "content";
  };
  let bookingContext;
  window.emberAnalytics.bookingComplete = () =>
    send("generate_lead", {
      method: "cal_com",
      ...(bookingContext || { cta_location: "unknown" }),
    });

  // Capture covers nested icons, keyboard clicks, and Cal's shadow DOM.
  document.addEventListener(
    "click",
    (event) => {
      const trigger = event
        .composedPath()
        .find(
          (element) =>
            element instanceof HTMLElement &&
            (element.matches("a[href]") ||
              element.matches("cal-floating-button")),
        );
      if (!trigger) return;
      const location = locationOf(trigger);
      if (
        trigger.matches("[data-booking]") ||
        trigger.matches("cal-floating-button")
      ) {
        bookingContext = { cta_location: location, service_path: servicePath };
        send("consultation_click", bookingContext);
        return;
      }
      const href = trigger.getAttribute("href");
      if (href?.startsWith(`mailto:${settings.contactEmail}?`)) {
        send("email_click", { cta_location: location, method: "email" });
        return;
      }
      const target = new URL(href, `${origin}${path}`);
      if (target.origin !== origin) return;
      const topic =
        target.pathname === "/deliverables/" &&
        ["#architecture", "#runbook", "#validation"].includes(target.hash)
          ? target.hash.slice(1)
          : null;
      const destination = routes[target.pathname];
      if (
        !topic &&
        (!destination || destination === "home" || target.pathname === path)
      )
        return;
      if (services.includes(destination) || destination === "deliverables") {
        servicePath =
          destination === "deliverables" ? "implementation" : destination;
        saveContext();
      }
      send("select_content", {
        content_type: topic
          ? "deliverable"
          : services.includes(destination)
            ? "service"
            : "page",
        content_id: topic || destination,
        cta_location: location,
      });
    },
    true,
  );

  const opened = new Set();
  const questions = new Set([
    "kubernetes_fit",
    "planning_independence",
    "pricing_scope",
    "operator_ownership",
  ]);
  document.addEventListener(
    "toggle",
    (event) => {
      const id = event.target.dataset?.faqId;
      if (!event.target.open || !questions.has(id) || opened.has(id)) return;
      opened.add(id);
      send("faq_open", { content_id: id, cta_location: "faq" });
    },
    true,
  );

  // Exposure, not proof of reading/demand: half a marked card/heading in view
  // for two uninterrupted foreground seconds, once per topic per page load.
  const topics = new Set([
    "planning",
    "implementation",
    "assessment",
    "architecture_roadmap",
    "team_enablement",
    "platform_foundation",
    "recovery",
    "handoff",
    "gpu_ai",
    "vm_migration",
    "automation",
    "architecture",
    "runbook",
    "validation",
  ]);
  if (!("IntersectionObserver" in window)) return;
  const visible = new Set(),
    timers = new Map(),
    viewed = new Set();
  const cancel = (element) => {
    clearTimeout(timers.get(element));
    timers.delete(element);
  };
  const schedule = (element) => {
    const id = element.dataset.interest;
    if (
      document.visibilityState !== "visible" ||
      viewed.has(id) ||
      timers.has(element)
    )
      return;
    timers.set(
      element,
      setTimeout(() => {
        timers.delete(element);
        if (
          document.visibilityState !== "visible" ||
          !visible.has(element) ||
          viewed.has(id)
        )
          return;
        viewed.add(id);
        send("topic_view", {
          content_id: id,
          service_path: [
            "planning",
            "assessment",
            "architecture_roadmap",
            "team_enablement",
          ].includes(id)
            ? "planning"
            : "implementation",
        });
      }, 2000),
    );
  };
  const observer = new window.IntersectionObserver(
    (entries) => {
      entries.forEach(({ target, isIntersecting, intersectionRatio }) => {
        if (isIntersecting && intersectionRatio >= 0.5) {
          visible.add(target);
          schedule(target);
        } else {
          visible.delete(target);
          cancel(target);
        }
      });
    },
    { threshold: [0, 0.5] },
  );
  document.querySelectorAll("[data-interest]").forEach((element) => {
    if (topics.has(element.dataset.interest)) observer.observe(element);
  });
  document.addEventListener("visibilitychange", () => {
    visible.forEach((element) =>
      document.visibilityState === "visible"
        ? schedule(element)
        : cancel(element),
    );
  });
})();
