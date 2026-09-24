import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const built = (path) =>
  readFileSync(new URL(`../output/site/${path}`, import.meta.url), "utf8");

const routes = [
  "",
  "planning/",
  "implementation/",
  "about/",
  "deliverables/",
  "kubernetes-consulting/",
];

test("publishes the intended routes with individual canonical URLs", () => {
  const sitemap = built("sitemap.xml");
  for (const route of routes) {
    const html = built(`${route}index.html`);
    const url = `https://studioember.com/${route}`;
    assert.match(html, new RegExp(`rel="canonical" href="${url}"`));
    assert.ok(sitemap.includes(`<loc>${url}</loc>`));
    assert.match(html, /<title>[^<]+<\/title>/);
  }
  assert.equal((sitemap.match(/<loc>/g) || []).length, routes.length);
});

test("homepage makes planning and implementation distinct entry points", () => {
  const html = built("index.html");
  assert.ok(html.indexOf("01 / PLAN") < html.indexOf("02 / BUILD"));
  assert.match(html, /href="\/planning\/"/);
  assert.match(html, /href="\/implementation\/"/);
  assert.match(html, /simpler (?:option|approach|solution)/i);
});

test("published pages offer contextual email links with no visitor data", () => {
  for (const [route, inquiry] of [
    ["", "General question"],
    ["planning/", "Planning question"],
    ["kubernetes-consulting/", "Consulting question"],
    ["implementation/", "Implementation question"],
    ["about/", "General question"],
    ["deliverables/", "Deliverables question"],
  ]) {
    const html = built(`${route}index.html`);
    const links = [...html.matchAll(/href="(mailto:[^"]+)"/g)].map(
      (match) => new URL(match[1].replaceAll("&amp;", "&")),
    );
    assert.ok(links.length > 0, `${route || "home"} has an email link`);
    const contextual = links.find((link) =>
      link.searchParams.get("subject")?.includes(inquiry),
    );
    assert.ok(contextual, `${route || "home"} has a ${inquiry} link`);
    assert.equal(contextual.pathname, "contact@studioember.com");
    assert.match(contextual.searchParams.get("body"), /My question:\n/);
    assert.ok(
      contextual.searchParams
        .get("body")
        .includes(`https://studioember.com/${route}`),
    );
    assert.doesNotMatch(contextual.href, /utm_|email=|referrer=/i);
  }
});

test("new pages describe bounded offers and label illustrative evidence", () => {
  const planning = built("planning/index.html");
  const implementation = built("implementation/index.html");
  const about = built("about/index.html");
  const deliverables = built("deliverables/index.html");
  assert.match(planning, /paid advisory/i);
  assert.match(planning, /workshop/i);
  assert.match(planning, /even if.*(?:do not|never).*build/is);
  assert.match(implementation, /fixed.scope/i);
  assert.match(implementation, /24\/7/);
  assert.match(about, /Nathan Grey/);
  assert.match(about, /Principal Engineer/);
  assert.match(deliverables, /illustrative/i);
  assert.match(deliverables, /architecture/i);
  assert.match(deliverables, /runbook/i);
  assert.match(deliverables, /validation/i);
});

test("retired prices and routes are absent from the published site", () => {
  const html = routes.map((route) => built(`${route}index.html`)).join("\n");
  assert.doesNotMatch(
    html,
    /data-configurator|\$\s*[\d,]+|EXAMPLE PLACEHOLDER/,
  );
  assert.doesNotMatch(built("sitemap.xml"), /cloud-sovereignty|\/services\//);
});
