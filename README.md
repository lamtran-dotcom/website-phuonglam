# phuonglam.com

## What this project does
This repository contains the static e-commerce website for Phuong Lam. It publishes SEO-friendly product pages, category pages, blog articles, and a local admin workflow for updating products/blog content before pushing static files to production.

## Current status
The project is static-first and production-oriented. The public site is generated into checked-in HTML/CSS/JS/assets, while local admin scripts help edit product data, rebuild SEO pages, and prepare deploys.

## Quick start
Read setup instructions in [`docs/SETUP.md`](docs/SETUP.md).

Typical local admin run:

```bash
node tools/local_admin_server.js
```

Then open:

```text
http://127.0.0.1:8000/admin-upload.html
```

## Important docs
- `AGENTS.md`: Codex rules
- `CONTEXT.md`: current project memory
- `docs/ARCHITECTURE.md`: architecture
- `docs/DECISIONS.md`: long-term decisions
- `docs/CHANGELOG.md`: completed work
- `docs/TASKS.md`: backlog
- `docs/SETUP.md`: setup guide

## Daily files
- `admin-upload.html`: local browser admin UI
- `data/products.json`: product catalog source of truth
- `data/settings.json`: homepage/display settings
- `tools/local_admin_server.js`: local admin server
- `tools/build_static_site.js`: static SEO page builder
- `assets/js/app.jsx`: source client UI
- `assets/js/app.min.js`: built production client script
- `san-pham/`: product SEO pages
- `danh-muc/`: category SEO pages
- `blog/`: blog/article pages
- `sitemap.xml`: URLs for search engines
- `robots.txt`: sitemap discovery

## SEO rules
- Product pages need stable URLs under `/san-pham/`.
- Category pages need stable URLs under `/danh-muc/`.
- Blog pages need stable URLs under `/blog/`.
- Keep title, description, canonical, schema, internal links, and sitemap updates intact.
- Do not embed large base64 images in HTML or JSON.
