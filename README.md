# Studio Ember website

Studio Ember's static marketing site, built with Eleventy v4 alpha, Tailwind CSS v4, Nunjucks, and vanilla JavaScript. The six published routes are `/`, `/planning/`, `/implementation/`, `/about/`, `/deliverables/`, and `/kubernetes-consulting/`.

## Development

- `yarn install --frozen-lockfile` installs dependencies.
- `yarn dev` starts Eleventy and Tailwind watchers.
- `yarn build` produces `output/site/` and formats output HTML.
- `yarn test` runs the route, contact, SEO, and analytics checks after a build.

Eleventy clears `output/site/` before each build. Old `pages/` and `posts/` sources remain excluded by `.eleventyignore`; they are not published.

## Content and contact

- `index.njk` presents the two-stage journey.
- The four top-level page folders contain planning, implementation, About, and illustrative deliverables content.
- `_data/site.json` contains site identity, metadata, and the general-question address.
- `_data/landing.json` contains the Cal.com discovery URL.
- `assets/css/theme/theme.css` defines the fixed palette and responsive design.

Discovery call links use Cal.com with a direct-link fallback when the embed is unavailable. General-question links use a server-rendered `mailto:` URL with a contextual subject, inquiry type, source page, and blank question prompt. No visitor data, referrer, or tracking parameters are put into the email. Update the address in `_data/site.json` if it changes.

The deliverables page is an illustrative preview, not a client case study or proof of a completed deployment. Do not replace its labels with outcome claims until the corresponding evidence and publication permission exist.

## Verification

Run `yarn build && yarn test` and `node --check assets/js/booking.js && node --check assets/js/analytics.js`. Review all routes at mobile and desktop widths, including navigation, the timeline, email links, booking popup and fallback, keyboard access, reduced motion, and overflow. Do not submit a real booking during testing.

Each page has its own title, description, canonical URL, Open Graph metadata, and WebPage JSON-LD. Planning and implementation Service JSON-LD appears only where relevant. `sitemap.xml` lists the six published routes.

GA4 loads only on `studioember.com` and `www.studioember.com`. Service selections, topic exposure, FAQ opens, email intent, booking intent, and confirmed embedded bookings have separate events. Service context follows internal navigation for up to 30 minutes in the same tab. Only validated public campaign slugs are forwarded to Cal; custom events omit raw URLs, email contents, and booking payloads.

See [the measurement guide](docs/measurement.md) for event definitions, KPI denominators, GA4 custom dimensions/key-event setup, Search Console steps, saved report recipes, and verification limits. Account-side setup is required to make the custom parameters usable in reports. `_data/routes.json` controls the sitemap and breadcrumb inventory; `docs/` is not published.

## Deployment

The GitHub Pages workflow deploys on pushes to `main` or manual dispatch after its build and validation checks. It uploads only `output/site/`. The Pages publishing source must be GitHub Actions, with `studioember.com` retained as the custom domain.

## First advertising campaign

`kubernetes-consulting/index.njk` is the dedicated planning campaign landing page. It shares the existing navigation, booking, contact, and SEO layout. The video area is a clearly labeled, non-interactive YouTube placeholder; it does not load YouTube or claim a video is playable. See [the campaign guide](docs/first-advertising-campaign.md) for the recording outline, replacement instructions, and launch checklist.
