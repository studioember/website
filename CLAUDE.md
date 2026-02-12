# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Studio Ember marketing website — a static site built with **Eleventy (11ty) v4 alpha** and **Tailwind CSS v4**. Content is authored in Markdown with Nunjucks templating. No client-side framework; interactivity is vanilla JS.

## Commands

- **`yarn dev`** — Start dev servers (Eleventy + Tailwind CSS watcher in parallel)
- **`yarn build`** — Production build: compiles CSS, builds HTML, formats with Prettier
- **`yarn build:css`** — Build Tailwind CSS only
- **`yarn build:eleventy`** — Build Eleventy only
- **`yarn format:html`** — Format output HTML with Prettier

No test suite or linter is configured.

## Architecture

### Content & Routing

- `index.md` — Homepage
- `pages/*.md` — Site pages (auto-collected into `collections.pages` sorted alphabetically)
- `posts/*.md` — Blog posts
- All content files use YAML frontmatter for layout, title, date, and navigation metadata
- Dates use `date: "git Last Modified"` to pull from git history

### Templates

- `_includes/layouts/base.njk` — Root HTML layout (head, theme script, nav, footer)
- `_includes/layouts/posts.njk` — Blog post layout (extends base)
- `_includes/components/navigation.njk` — Header nav with JS-powered dropdown for pages collection
- `_includes/components/footer.njk` — Footer with dynamic year

### Styling

- Tailwind CSS input: `frameworks/tailwind/tailwind.css`
- Theme variables (HSL): `assets/css/theme/theme.css` — defines light/dark mode color tokens
- Custom colors in `tailwind.config.js` reference CSS custom properties (`--primary`, `--secondary`, `--accent`, etc.)
- Custom font family: `logo` (IBM Plex Mono)
- Typography plugin (`@tailwindcss/typography`) for prose styling on markdown content
- Dark mode via `[data-theme="dark"]` attribute with `prefers-color-scheme` detection

### Configuration

- `eleventy.config.js` — Output to `output/site/`, passthrough copies assets, registers plugins (navigation, syntax highlight), defines `pages` collection and `dateSimple` filter
- `tailwind.config.js` — Scans `**/*.{html,md,njk}` for classes, extends theme with brand colors
- Build output (`output/`) is gitignored

### Deployment

GitHub Actions (`.github/workflows/gh-pages.yml`) deploys on push to `main`. Note: the workflow currently references Hugo and needs updating to use Eleventy.
