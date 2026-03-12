import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import { RenderPlugin } from "@11ty/eleventy";
import moment from "moment";

export default async function (eleventyConfig) {
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
