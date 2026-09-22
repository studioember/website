import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("built SEO describes only current services and each page has its own canonical", () => {
  const html = read("output/site/index.html");
  assert.match(
    html,
    /<title>Cloud-Native Consulting &amp; Kubernetes Platforms \| Studio Ember<\/title>/,
  );
  assert.match(html, /rel="canonical" href="https:\/\/studioember.com\/"/);
  const structured = JSON.parse(
    html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1],
  );
  assert.equal(
    structured["@graph"].filter((item) => item["@type"] === "Service").length,
    2,
  );
  for (const route of ["planning", "implementation", "about", "deliverables"]) {
    const page = read(`output/site/${route}/index.html`);
    assert.match(
      page,
      new RegExp(`rel="canonical" href="https://studioember.com/${route}/"`),
    );
    const pageSchema = JSON.parse(
      page.match(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
      )[1],
    );
    assert.ok(
      pageSchema["@graph"].some(
        (item) =>
          [item["@type"]].flat().includes("WebPage") &&
          item.url === `https://studioember.com/${route}/`,
      ),
    );
  }
  const sitemap = read("output/site/sitemap.xml");
  assert.equal((sitemap.match(/<loc>/g) || []).length, 5);
  assert.ok(sitemap.includes("<loc>https://studioember.com/</loc>"));
  assert.ok(
    read("output/site/robots.txt").includes(
      "Sitemap: https://studioember.com/sitemap.xml",
    ),
  );
});

test("every published page has unique metadata, one H1, and consistent social URLs", () => {
  const titles = new Set(),
    descriptions = new Set();
  const routes = JSON.parse(read("_data/routes.json"));
  for (const { url } of routes) {
    const html = read(`output/site${url}index.html`);
    const title = html.match(/<title>([\s\S]*?)<\/title>/)[1].trim();
    const description = html.match(/name="description"\s+content="([^"]+)"/)[1];
    assert.ok(!titles.has(title));
    titles.add(title);
    assert.ok(!descriptions.has(description));
    descriptions.add(description);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, url);
    assert.ok(!html.includes("noindex"));
    assert.match(
      html,
      new RegExp(
        `property="og:url"\\s+content="https://studioember.com${url}"`,
      ),
    );
    const graph = JSON.parse(
      html.match(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
      )[1],
    )["@graph"];
    const page = graph.find((node) =>
      [node["@type"]].flat().includes("WebPage"),
    );
    assert.equal(page.name, title.replaceAll("&amp;", "&"));
    if (url !== "/") {
      const breadcrumb = graph.find(
        (node) => node["@type"] === "BreadcrumbList",
      );
      assert.equal(page.breadcrumb["@id"], breadcrumb["@id"]);
      assert.equal(
        breadcrumb.itemListElement[1].item,
        `https://studioember.com${url}`,
      );
      assert.match(html, /aria-label="Breadcrumb"/);
    }
    if (["/planning/", "/implementation/"].includes(url)) {
      const service = graph.find((node) => node["@type"] === "Service");
      assert.equal(page.mainEntity["@id"], service["@id"]);
      assert.equal(service.url, page.url);
    }
    if (url === "/about/") {
      const person = graph.find((node) => node["@type"] === "Person");
      assert.equal(person.name, "Nathan Grey");
      assert.equal(page.mainEntity["@id"], person["@id"]);
    }
    assert.doesNotMatch(
      JSON.stringify(graph),
      /AggregateRating|Review|priceCurrency|Offer|LocalBusiness/,
    );
  }
});

test("crawlable internal links and fragment targets resolve across the published site", () => {
  const routes = JSON.parse(read("_data/routes.json")).map(
    (route) => route.url,
  );
  for (const route of routes) {
    const html = read(`output/site${route}index.html`);
    for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
      const href = match[1];
      if (!href.startsWith("/") && !href.startsWith("#")) continue;
      const target = new URL(href, `https://studioember.com${route}`);
      assert.ok(
        routes.includes(target.pathname),
        `${route} links to unpublished ${href}`,
      );
      if (target.hash) {
        assert.ok(
          read(`output/site${target.pathname}index.html`).includes(
            `id="${target.hash.slice(1)}"`,
          ),
          `Missing ${href}`,
        );
      }
    }
  }
});
