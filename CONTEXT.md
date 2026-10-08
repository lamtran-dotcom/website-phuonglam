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
Audit 2026-10 — 2026-10-08, branch `audit/2026-10` (worktree `/Users/lamtran/worktrees/phuonglam-audit`), **not pushed**. Report: `docs/AUDIT-2026-10.md` (keep it off the public site until the exposure item E is resolved). Fixed: re-baked bundle after `d5c32d8` dropped a bestseller and two category images (P0); committed the admin tooling that existed only in the Desktop checkout; Push Git now also publishes `assets/js/app.jsx`; admin rejects non-loopback Host and cross-site writes; malformed URLs return 400 instead of killing the server. 24/24 tests pass. Waiting on owner: hidden products still generate indexable pages, the "- bản sao" duplicate product, internal files public on phuonglam.com, and P2/P3 list. The Desktop checkout is 32 commits behind origin with stale `app.jsx`/admin edits; do not push from it.

Catalog subcategories — 2026-10-07: added `Túi thơm` and `Gỗ thơm` immediately after `Thảo Mộc Xông` in the shared category list. Static pages now exist for both empty categories with a clear update message; category pages and sitemap include them. Existing Shopee product remains assigned to `thao-moc-xong`.

Shopee product import — 2026-10-07: added Shopee item `54367578815` to `data/products.json` and the `thao-moc-xong` category. Imported description, 8 gallery images, 9 variant images/options/SKUs and VND prices from the supplied exports; ignored MY prices and stock. Added optimized local image assets and generated product/category/sitemap output. Published in commit `7f4c9c7`; verified live product and category pages return HTTP 200.

Homepage refresh — 2026-09-28: replaced the list-style hero with “Thắp chút ấm áp. Ươm hương an yên.”, warm cream/green styling and one configurable hero image visible on desktop and mobile. Reordered the homepage to lead with category discovery; use responsive category/product grids; added a combo entry point and reduced guides to three. Removed broad homepage safety/quality claims. Synchronized React, static initial HTML, build template, metadata, CSS and minified bundle while keeping product/category pages and sitemap unchanged. Details: `docs/HOMEPAGE-UPGRADE-PROPOSAL.md`.

Date: 2026-09-28
Published product SEO/content and reading upgrades for all 25 visible products in commit `2331db0a52d832ee59ea5d9b73eff8807199f9be`; verified the Pages build and all 27 public product/CSS/storefront responses.
Current release adds Buy Now to checkout on static product pages, clearer address entry, the configured candle-cup delivery check, checkout receipt/autofill/mobile layout, and shipping-promotion terms/styles. Commit `63fb9a05` is live: GitHub Pages succeeded; all 41 existing product-page URLs and the CSS, site-data.js and React bundle match release files byte-for-byte. Live browser confirmed promotion copy/modal, Buy Now preserves selected variant/price and opens checkout, address entry updates shipping, and candle cups show an outside-HCMC warning. Test cart was emptied; no order submitted. Local admin editor tabs/search/filters/SEO preview/sticky save controls are synced to `admin-upload.html`; admin remains local-only.
Local checkout QA: selected variant/price retained into checkout; manual address entry and out-of-area candle-cup notice displayed; promotion states 3kg standard shipping outside HCMC and 5kg in HCMC. No order was submitted. Verify HCMC coverage with the shop/provider before expanding it.

Popup copy update — 2026-09-28: shipping panel now says “Freeship toàn quốc” and “Giao hỏa tốc trong vòng 1 giờ tại nội thành TP.HCM”. React source/bundle and homepage script cache version updated.

Candle-cup delivery update — 2026-09-28: removed the HCMC-only checkout gate and the special district requirement for nến ly. Standard delivery can proceed to any entered province/address; express remains limited to inner TP.HCM. Both candle-cup detail pages now state nationwide delivery. Local checkout reached order review for a test Hanoi address without a district; no order was sent.

Product-page purchase buttons — 2026-09-28: added a subtle raised hover/shadow effect, pressed state, keyboard focus ring, and reduced-motion fallback to the shared static product-page CSS. Updated the stylesheet cache key on all 41 product detail pages.

Checkout display — 2026-09-28: removed the customer-visible free-shipping threshold and amount above that threshold from the shipping breakdown. The internal weight limits and shipping fee calculations remain unchanged.

## Open Issues
- Admin image upload/draft restoration and divergent-remote flows need additional manual verification. See `docs/ADMIN-PRODUCT-REVIEW.md` in the local workspace.
- Verify current HCMC delivery coverage with the shop/provider.
- Legacy product claims/specifications need seller confirmation.
- Search Console summary remains on its Sep 21 snapshot; check after Google refreshes.
- Instatic is early 0.0.x software; keep it as inspiration rather than a production migration target.

## Next Suggested Task
- Confirm HCMC delivery rules with the fulfillment provider and finish local admin upload/draft browser checks.
- Recheck Search Console and compare full 28-day performance windows after reports refresh.
