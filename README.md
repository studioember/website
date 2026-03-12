# Studio Ember — Website

Marketing website for [Studio Ember](https://studioember.com), a cloud infrastructure consultancy that helps teams assess vendor lock-in, reduce cloud dependency, and design infrastructure they control.

## Stack

- **[Eleventy (11ty) v4 alpha](https://www.11ty.dev/)** — static site generator
- **[Tailwind CSS v4](https://tailwindcss.com/)** — utility-first styling
- **Nunjucks** — templating
- **Vanilla JS** — no client-side framework

## Getting Started

```bash
yarn install
yarn dev       # Start Eleventy + Tailwind watchers in parallel
```

Build for production:

```bash
yarn build     # Compile CSS, build HTML, format with Prettier
```

Output is written to `output/site/` (gitignored).

## Commands

| Command               | Description                          |
| --------------------- | ------------------------------------ |
| `yarn dev`            | Start dev servers (Eleventy + CSS)   |
| `yarn build`          | Full production build                |
| `yarn build:css`      | Build Tailwind CSS only              |
| `yarn build:eleventy` | Build Eleventy only                  |
| `yarn format:html`    | Format output HTML with Prettier     |

## Project Structure

```
.
├── index.md                  # Homepage
├── pages/                    # Site pages (contact, services, FAQ, etc.)
├── posts/                    # Blog posts
├── _includes/
│   ├── layouts/              # base.njk, posts.njk
│   └── components/           # navigation.njk, footer.njk
├── assets/
│   └── css/theme/theme.css   # HSL color tokens (light/dark mode)
├── frameworks/tailwind/      # Tailwind CSS entry point
├── eleventy.config.js        # Eleventy configuration
└── tailwind.config.js        # Tailwind configuration
```

## Deployment

Deployed to GitHub Pages via GitHub Actions on push to `main`. See `.github/workflows/gh-pages.yml`.
