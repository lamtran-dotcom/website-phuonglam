# CONTEXT.md

## Project Goal
Maintain and improve `phuonglam.com`, a static e-commerce website for Phuong Lam products, with SEO-friendly product pages, category pages, blog articles, and a local admin workflow for safe product/blog updates.

## Current State
The site is a static GitHub Pages-style website. Public pages are generated from local data and source files:
- Product data lives in `data/products.json`.
- Homepage/category/product/blog HTML is checked into the repo.
- The local admin server edits data and rebuilds static pages.
- The repo now has long-term Codex memory/docs and a local `.codegraph/` index initialized for source exploration.

## Non-Negotiable Rules
- Always read this file before doing any task.
- Always update this file after completing a task.
- Do not rely on previous chat memory unless it is written here.
- Do not refactor unrelated code.
- Do not change architecture unless explicitly requested.
- Prefer small, safe, reviewable changes.
- Keep SEO intact: canonical, sitemap, structured data, internal links, and readable static content matter.

## Fixed Decisions
- Public website remains static-first for speed and SEO.
- Admin remains local-only unless a later task explicitly adds hosted backend/auth.
- Product/category/blog pages should be readable without depending on React runtime.
- Generated/local indexes such as `.codegraph/` must not be committed.
- Future Codex sessions must use `AGENTS.md` and this file as the durable project memory.

## Important Files
- `AGENTS.md`: standing rules for Codex work in this repo.
- `CONTEXT.md`: short current project memory.
- `README.md`: human entry point for the project.
- `docs/ARCHITECTURE.md`: system structure and data flow.
- `docs/SETUP.md`: local run, build, deploy, and CodeGraph notes.
- `admin-upload.html`: browser UI for local product/blog management.
- `tools/local_admin_server.js`: local admin server and save/build endpoints.
- `tools/build_static_site.js`: static page generation and SEO build script.
- `data/products.json`: source of truth for product catalog data.
- `data/settings.json`: homepage and display configuration.
- `assets/js/app.jsx`: source React UI for the client experience.
- `assets/js/app.min.js`: built client script for production pages.
- `assets/css/static-seo.css`: shared static SEO page styling.
- `san-pham/`, `danh-muc/`, `blog/`: generated/public SEO pages.
- `sitemap.xml`, `robots.txt`: search engine discovery files.

## Latest Completed Task
Date: 2026-09-28
Prepared product-page release from origin/main, preserving the latest homepage schema fix. Updated content for 25 visible products, semantic description sections, navigation, readable column, specification tables where applicable, separate caution/storage callouts, metadata and related links. Fixed variant-price fallback in generated browser script. Product-only build leaves hidden pages, categories, homepage and admin unchanged.
Files: data/products.json, tools/build_static_site.js, assets/css/static-seo.css, assets/js/site-data.js, 25 visible product pages.
Verification: product-only build, syntax/JSON-LD/anchor/H1 checks across all 25 pages, diff whitespace check, browser variant selection (70,000 VND for white/50 tealights), add-to-cart and mobile styles passed. No checkout order submitted.
Release: user explicitly authorized publishing to phuonglam.com; push to main and verify GitHub Pages and public content.

## Open Issues
- Legacy product claims and specifications still need seller verification; do not invent facts.
- Unrelated local admin/homepage changes remain in the original workspace and are not included in this release.

## Next Suggested Task
- Verify production deployment and record the release result in the original workspace memory.
