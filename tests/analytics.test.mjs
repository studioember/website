import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

function analytics({
  hostname = "studioember.com",
  pathname = "/",
  search = "",
  saved,
  storageBlocked = false,
  observer = true,
  interest = "assessment",
} = {}) {
  const scripts = [],
    listeners = {},
    timers = new Map(),
    storage = new Map();
  if (saved) storage.set("ember-interest-v1", JSON.stringify(saved));
  class Element {
    constructor({
      href = "/planning/",
      location = "journey",
      booking = false,
      floating = false,
      interest,
    } = {}) {
      Object.assign(this, { href, location, booking, floating });
      this.dataset = { interest };
    }
    matches(selector) {
      return selector === "a[href]"
        ? !this.floating
        : selector === "[data-booking]"
          ? this.booking
          : selector === "cal-floating-button" && this.floating;
    }
    closest() {
      return { dataset: { analyticsLocation: this.location } };
    }
    getAttribute() {
      return this.href;
    }
  }
  const topic = new Element({ interest });
  let notifyObserver;
  const observed = new Set();
  const window = {
    location: { hostname, pathname, search },
    sessionStorage: {
      getItem(key) {
        if (storageBlocked) throw Error("blocked");
        return storage.get(key) || null;
      },
      setItem(key, value) {
        if (storageBlocked) throw Error("blocked");
        storage.set(key, value);
      },
    },
  };
  if (observer)
    window.IntersectionObserver = class {
      constructor(fn) {
        notifyObserver = fn;
      }
      observe(element) { observed.add(element); }
    };
  const document = {
    currentScript: {
      dataset: {
        siteUrl: "https://studioember.com",
        measurementId: "G-NYVTLFQRSZ",
        contactEmail: "contact@studioember.com",
      },
    },
    referrer: "https://search.example/search?q=private@example.com",
    visibilityState: "visible",
    createElement: () => ({}),
    head: { appendChild: (script) => scripts.push(script) },
    addEventListener: (name, fn) => {
      listeners[name] = fn;
    },
    querySelectorAll: () => [topic],
  };
  let sequence = 0;
  vm.runInNewContext(read("assets/js/analytics.js"), {
    window,
    document,
    URL,
    URLSearchParams,
    HTMLElement: Element,
    setTimeout: (fn, ms) => {
      assert.equal(ms, 2000);
      timers.set(++sequence, fn);
      return sequence;
    },
    clearTimeout: (id) => timers.delete(id),
  });
  return {
    window,
    document,
    scripts,
    listeners,
    storage,
    topic,
    click: (options) =>
      listeners.click({ composedPath: () => [{}, new Element(options)] }),
    intersect: (ratio) => {
      assert.ok(observed.has(topic), "topic must be registered for observation");
      return notifyObserver([
        { target: topic, isIntersecting: ratio > 0, intersectionRatio: ratio },
      ]);
    },
    tick: () => {
      for (const [id, fn] of [...timers]) {
        timers.delete(id);
        fn();
      }
    },
    events: (name) =>
      (window.dataLayer || []).filter(
        (event) => event[0] === "event" && (!name || event[1] === name),
      ),
  };
}

test("preview, localhost and unknown routes never load GA or measurement listeners", () => {
  for (const options of [
    { hostname: "localhost" },
    { hostname: "127.0.0.1" },
    { hostname: "preview.example.com" },
    { pathname: "/retired/" },
  ]) {
    const a = analytics(options);
    assert.equal(a.scripts.length, 0);
    assert.equal(a.window.gtag, undefined);
    assert.deepEqual(Object.keys(a.listeners), []);
  }
});

test("one production tag and clean page/referrer URLs; safe UTM campaign attribution", () => {
  for (const hostname of ["studioember.com", "www.studioember.com"]) {
    const a = analytics({
      hostname,
      pathname: "/planning/",
      search:
        "?utm_source=newsletter&utm_medium=email&utm_campaign=platform_2026&utm_content=header&utm_term=private%40example.com&email=private%40example.com",
    });
    assert.equal(a.scripts.length, 1);
    assert.equal(
      a.scripts[0].src,
      "https://www.googletagmanager.com/gtag/js?id=G-NYVTLFQRSZ",
    );
    const config = a.window.dataLayer[1][2];
    assert.equal(config.page_location, "https://studioember.com/planning/");
    assert.equal(config.page_referrer, "https://search.example/");
    assert.equal(config.campaign_name, "platform_2026");
    assert.equal(config.campaign_source, "newsletter");
    assert.equal(config.content_group, "planning");
    assert.equal(config.allow_google_signals, false);
    assert.equal(config.campaign_term, undefined);
    assert.doesNotMatch(
      JSON.stringify(a.window.dataLayer),
      /private@|private%40/,
    );
  }
});

test("contact intent includes exact placement and service; only completion records a lead", () => {
  const a = analytics({ pathname: "/planning/" });
  for (const location of ["header", "hero", "contact"]) {
    a.click({ booking: true, location });
    const event = a.events("consultation_click").at(-1)[2];
    assert.equal(event.cta_location, location);
    assert.equal(event.service_path, "planning");
    assert.equal(event.page_type, "planning");
  }
  a.click({ floating: true });
  assert.equal(
    a.events("consultation_click").at(-1)[2].cta_location,
    "floating",
  );
  a.click({
    href: "mailto:contact@studioember.com?subject=private&body=private",
    location: "footer",
  });
  assert.equal(a.events("email_click")[0][2].cta_location, "footer");
  assert.doesNotMatch(
    JSON.stringify(a.events()),
    /subject|body|mailto|private/,
  );
  assert.equal(a.events("generate_lead").length, 0);
  a.window.emberAnalytics.bookingComplete();
  assert.equal(a.events("generate_lead")[0][2].cta_location, "floating");
});

test("service selection and deliverable navigation use stable content IDs, including keyboard-style clicks", () => {
  const a = analytics();
  a.click({ href: "/planning/" });
  assert.equal(a.events("select_content")[0][2].content_type, "service");
  assert.equal(a.events("select_content")[0][2].service_path, "planning");
  a.click({ href: "/deliverables/#runbook" });
  const event = a.events("select_content").at(-1)[2];
  assert.equal(event.content_id, "runbook");
  assert.equal(event.content_type, "deliverable");
  assert.equal(event.service_path, "implementation");
  a.click({ href: "https://unrelated.example/planning/" });
  a.click({ href: "#content" });
  assert.equal(a.events("select_content").length, 2);
});

test("service attribution survives internal navigation, expires, and tolerates blocked storage", () => {
  const saved = {
    at: Date.now(),
    service: "planning",
    campaign: {
      utm_source: "newsletter",
      email: "private",
      utm_campaign: "private@example.com",
    },
  };
  const a = analytics({ pathname: "/about/", saved });
  a.click({ booking: true });
  assert.equal(a.events()[0][2].service_path, "planning");
  assert.equal(a.window.emberAnalytics.campaign.utm_source, "newsletter");
  assert.equal(a.window.emberAnalytics.campaign.utm_campaign, undefined);
  assert.equal(a.window.dataLayer[1][2].campaign_source, undefined);
  for (const options of [
    { saved: { ...saved, at: Date.now() - 31 * 60 * 1000 } },
    { saved: { ...saved, service: "private-name" } },
    { storageBlocked: true },
  ]) {
    const b = analytics({ ...options, pathname: "/about/", observer: false });
    b.click({ booking: true });
    assert.equal(b.events()[0][2].service_path, "general");
  }
  const c = analytics({ pathname: "/implementation/", saved });
  c.click({ booking: true });
  assert.equal(c.events()[0][2].service_path, "implementation");
});

test("FAQ opens count once per question, excluding closes and unknown IDs", () => {
  const a = analytics();
  for (const [id, open] of [
    ["pricing_scope", false],
    ["pricing_scope", true],
    ["pricing_scope", true],
    ["private-question", true],
  ]) {
    a.listeners.toggle({ target: { dataset: { faqId: id }, open } });
  }
  assert.equal(a.events("faq_open").length, 1);
  assert.equal(a.events("faq_open")[0][2].content_id, "pricing_scope");
});

test("topic exposure requires sustained foreground visibility and deduplicates", () => {
  const a = analytics();
  a.intersect(0.4);
  a.tick();
  assert.equal(a.events().length, 0);
  a.intersect(0.6);
  a.intersect(0);
  a.tick();
  assert.equal(a.events().length, 0);
  a.intersect(0.6);
  a.document.visibilityState = "hidden";
  a.listeners.visibilitychange();
  a.tick();
  assert.equal(a.events().length, 0);
  a.document.visibilityState = "visible";
  a.listeners.visibilitychange();
  a.tick();
  assert.equal(a.events("topic_view").length, 1);
  assert.equal(a.events("topic_view")[0][2].content_id, "assessment");
  assert.equal(a.events("topic_view")[0][2].service_path, "planning");
  a.intersect(0);
  a.intersect(1);
  a.tick();
  assert.equal(a.events("topic_view").length, 1);
});

function booking() {
  const scripts = [],
    attributes = {},
    listeners = {},
    events = [];
  const link = {
    href: "https://cal.com/nathan-grey/studioember",
    setAttribute: (key, value) => {
      attributes[key] = value;
    },
    addEventListener: (key, fn) => {
      listeners[key] = fn;
    },
  };
  const document = {
    querySelectorAll: (s) => (s === "[data-booking]" ? [link] : []),
    body: {},
    addEventListener: () => {},
    createElement: () => ({}),
    head: { appendChild: (s) => scripts.push(s) },
  };
  const window = {
    document,
    location: { search: "?email=private@example.com&utm_source=newsletter" },
    emberAnalytics: {
      campaign: { utm_source: "newsletter" },
      bookingComplete: () => events.push("lead"),
    },
  };
  const context = {
    window,
    document,
    URL,
    MutationObserver: class {
      observe() {}
    },
  };
  Object.defineProperty(context, "Cal", { get: () => window.Cal });
  vm.runInNewContext(read("assets/js/booking.js"), context);
  const callback = window.Cal.ns.studioember.q.find(
    (args) => args[0] === "on" && args[1].action === "bookingSuccessfulV2",
  )[1].callback;
  return { window, scripts, attributes, listeners, events, callback, link };
}

test("Cal retains direct fallback, passes only public campaigns, and preserves modified clicks", () => {
  const b = booking();
  assert.equal(
    b.link.href,
    "https://cal.com/nathan-grey/studioember?utm_source=newsletter",
  );
  assert.equal(b.listeners.click, undefined);
  assert.equal(b.window.Cal.config.forwardQueryParams, false);
  b.scripts[0].onload();
  assert.equal(
    JSON.parse(b.attributes["data-cal-config"]).utm_source,
    "newsletter",
  );
  let prevented = 0;
  b.listeners.click({ preventDefault: () => prevented++ });
  b.listeners.click({ ctrlKey: true, preventDefault: () => prevented++ });
  assert.equal(prevented, 1);
});

test("only a valid, unique Cal completion is counted; booking payload never enters analytics", () => {
  const b = booking();
  b.callback({});
  b.callback({ detail: { data: {} } });
  for (let i = 0; i < 2; i++)
    b.callback({
      detail: { data: { uid: "booking-id", email: "private@example.com" } },
    });
  assert.deepEqual(b.events, ["lead"]);
});

test("About story exposure preserves service context without inferring implementation demand", () => {
  for (const interest of ["about_delivery", "about_tooling", "about_studio"]) {
    for (const service of ["general", "planning", "implementation"]) {
      const a = analytics({
        pathname: "/about/",
        interest,
        saved: { at: Date.now(), service },
      });
      a.intersect(0.6);
      a.tick();
      const event = a.events("topic_view")[0];
      assert.ok(event);
      assert.equal(event[2].content_id, interest);
      assert.equal(event[2].page_type, "about");
      assert.equal(event[2].service_path, service);
      a.click({ booking: true, location: "contact" });
      assert.equal(a.events("consultation_click")[0][2].service_path, service);
    }
  }
});
