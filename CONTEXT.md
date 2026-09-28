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
Published product SEO/content and reading upgrades for all 25 visible products in commit `2331db0a52d832ee59ea5d9b73eff8807199f9be`; verified the Pages build and all 27 public product/CSS/storefront responses.
Current release adds Buy Now to checkout on static product pages, clearer address entry, the configured candle-cup delivery check, checkout receipt/autofill/mobile layout, and shipping-promotion terms/styles. The admin editor is being improved in the original local checkout only; do not publish its local server/API because admin remains local-only.
Local checkout QA: selected variant/price retained into checkout; manual address entry and out-of-area candle-cup notice displayed; promotion states 3kg standard shipping outside HCMC and 5kg in HCMC. No order was submitted. Verify HCMC coverage with the shop/provider before expanding it.

## Open Issues
- Admin image upload/draft restoration and divergent-remote flows need additional manual verification. See `docs/ADMIN-PRODUCT-REVIEW.md` in the local workspace.
- Verify current HCMC delivery coverage with the shop/provider.
- Legacy product claims/specifications need seller confirmation.
- Search Console summary remains on its Sep 21 snapshot; check after Google refreshes.
- Instatic is early 0.0.x software; keep it as inspiration rather than a production migration target.

## Next Suggested Task
- Confirm HCMC delivery rules with the fulfillment provider and finish local admin upload/draft browser checks.
- Recheck Search Console and compare full 28-day performance windows after reports refresh.
