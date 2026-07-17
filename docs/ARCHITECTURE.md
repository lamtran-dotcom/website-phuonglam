# Architecture

## Overview
This repository contains the static website for `phuonglam.com`. It is built around a static-first SEO strategy: important public pages are stored as HTML files so Google and users can read products, categories, and blog articles without waiting for the React app.

Local admin tools update source data and regenerate static pages. Production hosting can serve the repository as static files through GitHub Pages, Cloudflare Pages, Nginx, or similar static hosting.

## Main Modules
- Public static pages: `index.html`, `san-pham/`, `danh-muc/`, and `blog/`.
- Catalog data: `data/products.json`, `data/settings.json`, and keyword JSON files.
- Client UI: `assets/js/app.jsx`, built into `assets/js/app.min.js`.
- Styling: `assets/css/site.css` for the app and `assets/css/static-seo.css` for static SEO pages.
- Local admin: `admin-upload.html` and `tools/local_admin_server.js`.
- Build tools: `tools/build_static_site.js`, image utilities, and generated reports.
- SEO discovery: `sitemap.xml`, `robots.txt`, canonical tags, and structured data inside generated pages.

## Data Flow
1. Product/catalog changes are made through the local admin UI or directly in `data/products.json`.
2. `tools/local_admin_server.js` saves data and triggers the static build.
3. `tools/build_static_site.js` generates or updates:
   - homepage assets
   - category pages in `danh-muc/`
   - product pages in `san-pham/`
   - `assets/js/site-data.js`
   - `assets/js/app.min.js`
   - `sitemap.xml` and `robots.txt`
4. Blog pages live under `blog/`; the admin pipeline normalizes article HTML and assets.
5. A scheduled blog is written to non-public `scheduled-posts/<category>/<slug>/` with its normalized `index.html` and `article.json` manifest. Images remain under `assets/blog/` so the promoted page has stable public URLs.
6. GitHub Actions runs `tools/publish_scheduled_posts.js` every five minutes. Due entries move to `blog/`, update `assets/js/site-data.js`, rebuild static pages/sitemap, then commit and push.
7. Static files are committed and pushed for production deploy.

## External Services
- GitHub repository and GitHub Pages-style static deployment.
- Domain DNS for `phuonglam.com`.
- Optional CDN/static hosting such as Cloudflare Pages.
- Optional Google Search Console / Merchant Center integrations outside this repo.
- GitHub Actions for cloud promotion of scheduled SEO articles.

## Important Constraints
- Do not commit secrets or local environment files.
- Do not commit `.codegraph/`; it is a generated local index.
- Product and article pages must preserve SEO metadata, canonical URLs, structured data, and sitemap updates.
- Avoid base64 images in HTML/JSON; use optimized image files under `assets/`.
- Local admin is not an authenticated production backend.
