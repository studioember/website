import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

function analytics(hostname) {
  const scripts = [],
    listeners = {};
  class Element {
    constructor(kind, section) {
      this.kind = kind;
      this.section = section;
    }
    matches(selector) {
      return selector === this.kind;
    }
    closest(selector) {
      return selector === "section" ? { id: this.section } : null;
    }
  }
  const window = { location: { hostname } };
  const document = {
    currentScript: {
      dataset: {
        siteUrl: "https://studioember.com",
        measurementId: "G-NYVTLFQRSZ",
      },
    },
    createElement: () => ({}),
    head: { appendChild: (script) => scripts.push(script) },
    addEventListener: (name, fn) => {
      listeners[name] = fn;
    },
  };
  vm.runInNewContext(read("assets/js/analytics.js"), {
    window,
    document,
    URL,
    HTMLElement: Element,
  });
  return { window, scripts, listeners, Element };
}

test("GA is disabled on local and preview hosts", () => {
  for (const host of ["localhost", "127.0.0.1", "preview.example.com"]) {
    const { scripts, window } = analytics(host);
    assert.equal(scripts.length, 0);
    assert.equal(window.gtag, undefined);
  }
});

test("production loads the provided GA4 ID exactly once", () => {
  for (const host of ["studioember.com", "www.studioember.com"]) {
    const { scripts, window } = analytics(host);
    assert.equal(scripts.length, 1);
    assert.equal(scripts[0].async, true);
    assert.equal(
      scripts[0].src,
      "https://www.googletagmanager.com/gtag/js?id=G-NYVTLFQRSZ",
    );
    assert.equal(window.dataLayer[1][0], "config");
    assert.equal(window.dataLayer[1][1], "G-NYVTLFQRSZ");
  }
});

test("CTA events include location and handle floating shadow DOM without claiming a lead", () => {
  const { window, listeners, Element } = analytics("studioember.com");
  for (const [kind, section, expected] of [
    ["[data-booking]", "pricing", "pricing"],
    ["cal-floating-button", null, "floating"],
  ]) {
    listeners.click({ composedPath: () => [{}, new Element(kind, section)] });
    const event = window.dataLayer.at(-1);
    assert.equal(event[1], "consultation_click");
    assert.equal(event[2].cta_location, expected);
  }
  assert.equal(
    window.dataLayer.filter((event) => event[1] === "generate_lead").length,
    0,
  );
});

test("Cal completion records a deduplicated lead without personal or booking data", () => {
  const events = [];
  const window = {
    location: { search: "" },
    gtag: (...args) => events.push(args),
  };
  const document = {
    querySelectorAll: () => [],
    body: {},
    addEventListener: () => {},
    createElement: () => ({}),
    head: { appendChild: () => {} },
  };
  window.document = document;
  const context = {
    window,
    document,
    URLSearchParams,
    MutationObserver: class {
      observe() {}
    },
  };
  Object.defineProperty(context, "Cal", { get: () => window.Cal });
  vm.runInNewContext(read("assets/js/booking.js"), context);
  const registration = window.Cal.ns.studioember.q.find(
    (args) => args[0] === "on" && args[1].action === "bookingSuccessfulV2",
  );
  assert.ok(registration);
  const event = {
    detail: {
      data: {
        uid: "test-id",
        email: "private@example.com",
        videoCallUrl: "private",
      },
    },
  };
  registration[1].callback(event);
  registration[1].callback(event);
  assert.equal(events.length, 1);
  assert.equal(
    JSON.stringify(events[0]),
    JSON.stringify(["event", "generate_lead", { method: "cal_com" }]),
  );
});

test("built SEO uses one canonical route and valid linked JSON-LD", () => {
  const html = read("output/site/index.html");
  assert.match(
    html,
    /<title>Private Kubernetes Infrastructure &amp; Consulting \| Studio Ember<\/title>/,
  );
  assert.match(html, /rel="canonical" href="https:\/\/studioember.com\/"/);
  const structured = JSON.parse(
    html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1],
  );
  assert.equal(
    structured["@graph"].filter((item) => item["@type"] === "Service").length,
    4,
  );
  const sitemap = read("output/site/sitemap.xml");
  assert.equal((sitemap.match(/<loc>/g) || []).length, 1);
  assert.ok(sitemap.includes("<loc>https://studioember.com/</loc>"));
  assert.ok(
    read("output/site/robots.txt").includes(
      "Sitemap: https://studioember.com/sitemap.xml",
    ),
  );
});
