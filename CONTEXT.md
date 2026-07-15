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
Date: 2026-07-15
Done: Added a shipping promotion bar and a delayed first-visit popup for HCMC shipping offers, then replaced its generic illustration with the approved real product arrangement and emphasized the outer-city shipping price with a gentle pulse.
Files changed: `assets/js/app.jsx`, `assets/css/site.css`, generated `assets/js/app.min.js` and static pages, `assets/media/generated/shipping-promo-popup-v1.png`, `docs/DECISIONS.md`, `docs/CHANGELOG.md`, `CONTEXT.md`.
New decisions: The popup appears after 1.2 seconds, dismisses for seven days, keeps a compact shipping bar visible, and its CTA scrolls to bestselling products. Its visual uses the real terracotta burner, tealight candles, and herbal combo references; the 16.000đ offer uses a subtle animation that respects reduced-motion preferences.

## Open Issues
- Keep `CONTEXT.md` concise as future work accumulates.
- Review old generated product/category/blog HTML only when a task directly requires it.
- Instatic is early 0.0.x software, so treat it as inspiration or a sandbox experiment rather than production migration target.

## Next Suggested Task
- Review shipping zone wording with the business, then consider making the promotion copy editable from the local admin workflow.
