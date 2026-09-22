import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import { RenderPlugin } from "@11ty/eleventy";
import moment from "moment";
import { rm } from "node:fs/promises";
import site from "./_data/site.json" with { type: "json" };
import routes from "./_data/routes.json" with { type: "json" };

export default async function (eleventyConfig) {
  // Builds must never retain retired routes from earlier builds.
  eleventyConfig.on("eleventy.before", async () => {
    await rm("output/site", { recursive: true, force: true });
  });
  eleventyConfig.addShortcode("year", () => new Date().getFullYear());

  // Configure Eleventy
  eleventyConfig.setOutputDirectory("output/site");

  // Copy `assets` to `output/site/assets`
  eleventyConfig.addPassthroughCopy("assets");

  // Plugins
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(RenderPlugin);

  // Collections
  eleventyConfig.addCollection("pages", function (collectionApi) {
    const pages = collectionApi.getFilteredByGlob("pages/**/*.{md,njk,html}");
    return pages.sort((a, b) => {
      const aTitle = (a.data?.title || a.fileSlug || "").toLowerCase();
      const bTitle = (b.data?.title || b.fileSlug || "").toLowerCase();
      return aTitle.localeCompare(bTitle);
    });
  });

  // Escape inline JSON so content cannot terminate the script element.
  eleventyConfig.addFilter("jsonLd", (value) =>
    JSON.stringify(value).replace(/</g, "\\u003c"),
  );

  eleventyConfig.addFilter("contactHref", (inquiry, path = "/") => {
    const source = new URL(path, `${site.url}/`).href;
    const subject = `Studio Ember — ${inquiry}`;
    const body = `Inquiry type: ${inquiry}\nSource page: ${source}\n\nMy question:\n`;
    return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  eleventyConfig.addFilter("pageSeo", (page, title, description) => {
    const url = new URL(page.url, `${site.url}/`).href;
    const home = `${site.url}/`;
    const organization = `${home}#organization`;
    const person = `${home}about/#nathan-grey`;
    const route = routes.find((route) => route.url === page.url);
    const serviceId = ["/planning/", "/implementation/"].includes(page.url)
      ? page.url.split("/")[1]
      : null;
    const services = [
      {
        id: "planning",
        name: "Cloud-native planning and team enablement",
        description:
          "Scoped advisory work covering assessment, architecture, roadmaps, workshops, and team instruction.",
      },
      {
        id: "implementation",
        name: "Private Kubernetes platform implementation",
        description:
          "Scoped client-owned platform builds with validation, documentation, and operating handoff.",
      },
    ];
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": organization,
          name: site.name,
          url: home,
          logo: `${site.url}/assets/img/logo.png`,
          description: site.description,
          email: site.email,
          founder: { "@id": person },
        },
        {
          "@type": "Person",
          "@id": person,
          name: site.author,
          url: `${home}about/`,
          jobTitle: "Principal Engineer",
          worksFor: { "@id": organization },
        },
        {
          "@type": "WebSite",
          "@id": `${home}#website`,
          name: site.name,
          url: home,
          publisher: { "@id": organization },
          inLanguage: "en-US",
        },
        {
          "@type":
            page.url === "/about/" ? ["WebPage", "AboutPage"] : "WebPage",
          "@id": `${url}#webpage`,
          name: title,
          url,
          description,
          isPartOf: { "@id": `${home}#website` },
          about: { "@id": page.url === "/about/" ? person : organization },
          ...(serviceId
            ? { mainEntity: { "@id": `${home}#service-${serviceId}` } }
            : {}),
          ...(page.url === "/about/" ? { mainEntity: { "@id": person } } : {}),
          ...(page.url !== "/"
            ? { breadcrumb: { "@id": `${url}#breadcrumb` } }
            : {}),
          inLanguage: "en-US",
        },
        ...(page.url !== "/" && route
          ? [
              {
                "@type": "BreadcrumbList",
                "@id": `${url}#breadcrumb`,
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: home,
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: route.label,
                    item: url,
                  },
                ],
              },
            ]
          : []),
        ...(page.url === "/"
          ? services
          : services.filter((service) => page.url === `/${service.id}/`)
        ).map((service) => ({
          "@type": "Service",
          "@id": `${home}#service-${service.id}`,
          name: service.name,
          description: service.description,
          serviceType: service.name,
          provider: { "@id": organization },
          url: `${site.url}/${service.id}/`,
        })),
      ],
    };
  });

  // Filters
  eleventyConfig.addFilter("dateSimple", function (date) {
    return moment(date).format("LLL");
  });

  eleventyConfig.addFilter("dateISO", function (date) {
    return moment(date).toISOString().split("T")[0];
  });

  return {
    pathPrefix: process.env.ELEVENTY_PATH_PREFIX || "/",
  };
}
