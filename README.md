# Studio Ember — Website

Single-page consultation landing site for private Kubernetes infrastructure, GPU and AI workflows, and legacy VM migration. Built with Eleventy v4 alpha, Tailwind CSS v4, Nunjucks, and vanilla JavaScript.

## Development

- `yarn install --frozen-lockfile` — install dependencies
- `yarn dev` — start Eleventy and Tailwind watchers
- `yarn build` — compile CSS, build the site, and format output HTML

The generated site is in `output/site/`. Eleventy clears this directory before each build so retired routes cannot survive. Old `pages/` and `posts/` sources are excluded from publication; no redirects are generated.

## Editing content

- `index.njk` — landing-page structure and introductory copy
- `_data/landing.json` — packages, care plans, specialist options, services, FAQ, delivery steps, deployment placeholders, and booking URL
- `_data/site.json` — site identity and metadata
- `assets/css/theme/theme.css` — fixed palette and responsive visual design
- `assets/js/booking.js` — Cal.com integration

Deployment examples are explicitly labeled unfinished placeholders. Replace each example’s description and visual in the template with approved project details before presenting it as completed work. Do not invent client results.

All conversion actions book the same Cal.com consultation. Links work directly when JavaScript is disabled or the embed script cannot load. If changing the event, update both the booking URL in the data and the event path in `booking.js`.

The care commitment is required for 12 months. Monthly Care is $1,000/month; Twice-Monthly Care is $2,000/month. VM assessment pricing is separate from migration implementation.

## Verification

Run `yarn build` and `node --check assets/js/booking.js`. Review at mobile and desktop widths, open and dismiss the booking popup, check keyboard access and FAQ expansion, and verify only `index.html` is generated. Do not submit a real booking during testing.

No standalone test suite or linter is configured. Browser checks should cover blocked embed loading, direct-link fallbacks, reduced motion, overflow, and booking-widget placement.

## Deployment

The GitHub Pages workflow deploys on a published release or manual workflow dispatch. It installs Node.js 24 and Yarn Classic 1.22.22, installs the locked dependencies, builds the site, runs the SEO/analytics tests, and uploads only `output/site/`. Deployment runs only after validation passes. Pages write/OIDC permissions are limited to the deployment job, and active deployments are not cancelled by newer runs.

Repository Settings → Pages must use **GitHub Actions** as the publishing source, with `studioember.com` retained as the custom domain. No project subpath is needed for this custom-domain site. Push the workflow and site changes before publishing a release or manually dispatching it.

## SEO and analytics

The homepage uses a service-focused title and description, canonical URL, Open Graph/Twitter metadata, and Organization, WebSite, WebPage, and Service JSON-LD. Structured data contains only published service descriptions, without invented reviews, addresses, or credentials. `sitemap.xml` includes only the canonical homepage; `robots.txt` advertises it. No artificial last-modified date is emitted.

GA4 measurement ID `G-NYVTLFQRSZ` is configured in `_data/site.json`. `assets/js/analytics.js` loads the Google tag only on `studioember.com` and `www.studioember.com`, keeping localhost and other previews out of reports. The Google tag records page views; `consultation_click` records booking-button intent with a `cta_location` parameter, including the floating button. `generate_lead` fires only after Cal.com reports a successful new embedded booking (which may still await confirmation). The event sends no booking payload, email, name, meeting URL, or booking identifier. Direct bookings completed on cal.com after fallback navigation cannot be observed by this page.

Run `yarn build && yarn test:seo` to validate generated SEO and analytics behavior without sending test traffic to Google.

After publishing:

1. In GA4, verify the production visit in Realtime/DebugView and mark `generate_lead` as a key event. Register `cta_location` as an event-scoped custom dimension to break down button locations.
2. Verify ownership of `studioember.com` in Google Search Console and submit `https://studioember.com/sitemap.xml`. Domain verification requires the Google-provided DNS token; no token is invented or stored here.
3. Inspect the published homepage in Search Console and Google’s Rich Results Test. Indexing, report ingestion, and account settings cannot be confirmed from a local build.

References: [Google Analytics events](https://developers.google.com/analytics/devguides/collection/ga4/events), [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [Cal.com embed events](https://cal.com/help/embedding/embed-events).
