import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import moment from "moment";
import path from "node:path";
import Image from "@11ty/eleventy-img";
import fs from "node:fs";

export default async function (eleventyConfig) {
  // Configure Eleventy
  eleventyConfig.setOutputDirectory("output/site");

  // Copy `images/` to `output/site/assets/images/`
  eleventyConfig.addPassthroughCopy("assets/images/**/*");

  // Copy `css/fonts/` to `output/site/assets/css`
  eleventyConfig.addPassthroughCopy("assets/css/**/*");

  // Plugins
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(syntaxHighlight);

  // Filters
  eleventyConfig.addFilter("dateSimple", function (date) {
    return moment(date).format("LLL");
  });
}
