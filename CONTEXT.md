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
- Products are edited in the online Admin v2 (`workers/product-admin/`, Cloudflare Worker with owner-password login, commits to `main` via GitHub API, live at https://phuonglam-admin.tranquanglam1998.workers.dev). The old local admin stays for blog/orders/settings until moved. See `docs/ADMIN-V2.md`.
- Product/category/blog pages should be readable without depending on React runtime.
- Generated/local indexes such as `.codegraph/` must not be committed.
- Future Codex sessions must use `AGENTS.md` and this file as the durable project memory.

## Important Files
- `AGENTS.md`: standing rules for Codex work in this repo.
- `CONTEXT.md`: short current project memory.
- `README.md`: human entry point for the project.
- `docs/ARCHITECTURE.md`: system structure and data flow.
- `docs/SETUP.md`: local run, build, deploy, and CodeGraph notes.
- `docs/SEO-BLOG-CHECKLIST.md`: SEO rules for blog posts + AI check prompt + Claude Code fix prompt.
- `admin-upload.html`: browser UI for local product/blog management.
- `tools/local_admin_server.js`: local admin server and save/build endpoints.
- `tools/build_static_site.js`: static page generation and SEO build script.
- `data/products.json`: source of truth for product catalog data.
- `data/settings.json`: homepage settings (featured, header images, category images, categories, shipping).
- `assets/js/app.jsx`: source React UI for the client experience.
- `assets/js/app.min.js`: built client script for production pages.
- `assets/css/static-seo.css`: shared static SEO page styling.
- `san-pham/`, `danh-muc/`, `blog/`: generated/public SEO pages.
- `sitemap.xml`, `robots.txt`: search engine discovery files.

## Latest Completed Task
Checkout like Coolmate — 2026-11-12: address field first with TP.HCM street suggestions (`assets/js/hcm-streets.json` from OSM historic district outlines, `tools/fetch_hcm_streets.js`) and whole-address parsing (`parseFullAddress` in app.jsx, tests `tools/checkout_address.test.js`); "!" error icon; Anh/Chị (`salutation`, sent in the order); cart perk banner, crossed-out prices, savings and % off. Order Worker change to print Anh/Chị is committed but NOT deployed (ask owner).

Shipping rule + order Worker deploy — 2026-11-12: item total < 150.000đ pays a flat 20.000đ (settings `shipping.smallOrderThreshold` / `smallOrderFee`), free from 150.000đ up to the weight limits, weight fee above; express +15.000đ. Same rule in app.jsx `calculateShipping`, order Worker `shippingFee`, policy page text (`shippingRuleHtml`). Cart shows "Mua thêm …đ". Order Worker deployed by wrangler (version 0164caaa, compat 2026-04-28, `--keep-vars`; deploy: `cd workers/order-webhook && npx wrangler deploy worker.js --name phuonglam-order-webhook --compatibility-date 2026-04-28 --keep-vars`). It now charges server-side prices. Telegram vars are plain-text env vars; the bot token was exposed in a chat deploy log → owner should rotate it and store it as a secret. Not verified: a real order end to end.

Admin v2 (online product admin), first version — 2026-11-11, DEPLOYED to https://phuonglam-admin.tranquanglam1998.workers.dev (Cloudflare account Tranquanglam1998; wrangler logged in on this Mac). Login switched from Cloudflare Access to one owner password (`ADMIN_PASSWORD` secret, owner chose a 4-digit PIN against advice; HMAC session cookie 30 days; 5 tries/min/IP + 3 tries/min global) because Zero Trust Free needs a card. Secrets `ADMIN_PASSWORD` and `GITHUB_TOKEN` are set (token: fine-grained, this repo, contents RW + actions R, expires 2027-11-10); owner logged in and the catalog loads. A first token was pasted into a terminal prompt and exposed in the chat log: owner told to delete it on GitHub. Commit `805ce15` in public history contains `.wrangler/cache/wrangler-account.json` (account id + account name with email); history not rewritten. `workers/product-admin/worker.js` (API: session check, `/api/catalog`, `/api/publish` one commit with products.json + images, 409 if products.json changed since load, `/api/status`), `public/` UI (list, inline/bulk price edits, editor, browser WebP resize with jsquash fallback for Safari, draft in localStorage). Tests: `tools/product_admin_worker.test.js`; local preview: `tools/product_admin_dev_server.js` (port 8788, fake API). Verified in preview: bulk +8.000đ, change list, publish payload, image upload (native + fallback), mobile layout. Variants are now Shopee-style (2 groups, combination table, value images) with a separate "Vận chuyển" weight section — `public/variants.js`, tests `tools/product_admin_variants.test.js`. "Nến tealight 4 giờ loại Trơn" has 6 variants (Vàng/Đỏ) outside its Màu values, hidden on the storefront; admin lists them for the owner to keep or delete. Tab "Trang chủ & danh mục" edits header images, best sellers and categories; categories now live in `data/settings.json` (build writes `CATEGORIES` into site-data.js). Owner uses it alone. Next: first real publish (one small change) and check the live page + deploy badge. Only products.json is committed; committed generated pages lag until a local build (CI builds live site fresh).

Order price check — 2026-11-11: Worker source recomputes prices/shipping from `/assets/js/order-pricing.json` (build output, git-ignored) and flags differences in Telegram; storefront re-prices saved carts on load (`repriceCart` in app.jsx). Tests: `tools/order_worker.test.js`. Site part pushed; **the Worker itself must be pasted into the Cloudflare dashboard by the seller** (no wrangler login on this Mac) — until then the live Worker still trusts the browser.

Codebase audit — 2026-11-11 (pushed live): deleted the old React in-app admin and its localStorage overrides from `assets/js/app.jsx` (bundle 252 → 160 KB; all editing is in `admin-upload.html`), `SAMPLE_ORDERS`/`BLOG_ARTICLES` from `site-data.js`, the unused blog ZIP flow in `tools/local_admin_server.js`, 568 unreferenced images, `_headers`, `compress-images.yml`, old backups/reports/mirror script. `_config.yml` is only the exclude list read by `tools/prepare_pages_artifact.js`. Category "Từ …đ" labels are computed (`getCategoryFromLabel` in app.jsx, `fromLabel` in the build); `CATEGORIES` has no `from` field. `tools/generate_responsive_product_images.py` also covers `settings.json` images. Verified in a local preview: home, static product → cart → checkout review (no order sent), blog list, `cam-on/`, category page; no console errors, no missing images. Kept on purpose: `data/seo-keywords.json`, `data/social-keywords.json` (reference notes), reviews tool, 5-minute scheduled-post cron. Not done: legacy extraction paths in `externalizeIndex`; Worker still trusts client prices.

Thảo mộc price increase — 2026-11-10 (pushed live): the 9 products in category `thao-moc-xong` got every selling price +8.000đ (seller chose flat +8.000đ over +15%), crossed-out `originalPrice` +15% rounded to 1.000đ; Túi Thơm "bản sao" excluded. Edited `data/products.json`, rebuilt pages. Category label "từ 45.000đ" on the homepage is hand-typed and was not changed.

SEO report fixes — 2026-11-10 (committed and pushed live): 20 live blog posts fixed per the checklist report; the checker script's own checks (title/description length, JSON-LD, links, alt, dates agree across page + `datePublished` + `BLOG_POSTS`, og:image ≥1200 px) all pass. Dates: `datePublished` kept as the truth except `huong-dan-dung-bep` (restored to the original 2026-04-26, the admin had overwritten it with 2026-10-13); display + `BLOG_POSTS.date` aligned to it; `phan-biet` keeps the seller's original 25/04/2025. Featured/og images for 5 posts now use existing ≥1200 px images already on the site (nothing upscaled); swap in real originals later if wanted. C4/C5 wording applied with seller approval; admin template fixes in `tools/local_admin_server.js` with tests. Still not checked: P1/P2 (mobile layout/popup), and soft claims the AI checker may flag (e.g. cited "kháng khuẩn, đuổi côn trùng" quote in vỏ bưởi). Details in `docs/CHANGELOG.md`.

SEO checklist for posts — 2026-11-09: `docs/SEO-BLOG-CHECKLIST.md` holds the rule set (codes T/M/C/L/I/S/P/R, severity blocker/major/minor, [G] Google-based vs [PL] house rules, auto/site/judge), the prompt for the seller's AI checker (JSON report), and the prompt for Claude Code to fix a report (sync rules for title/description/scheduled copies, no slug/date changes, ask before content-meaning edits, no commit/push without approval).

Blog internal links + SEO cleanup — 2026-11-09, live (commit `fbe9e9e`). Audit of 18 live posts + 3 queued (`scheduled-posts/`):
- Broken links fixed: `/san-pham/nen-tealight-4-gio-phuong-lam-trang-tri-thu-gian-khong-khoi/` (404, in 13 posts + the queued bếp xông update) → `.../nen-tealight-4-gio-phuong-lam-xong-thao-moc-thu-gian-khong-khoi-khong-mui-loai-mai/`; two post links missing `/blog/<cat>/`.
- 7 titles cut to ≤60 chars (`… | Phương Lâm`), H1 kept natural without brand; truncated/over-long descriptions (ending "…" or >155) rewritten from each post's own headings. Updated `<title>`, description, og/twitter, JSON-LD headline/description, breadcrumb, `BLOG_POSTS` title/excerpt, and the queued bếp xông `article.json` meta so the 17:10 scheduled update does not revert it.
- Every post has a curated "Bài viết liên quan" (3 posts) and one mid-article `p.article-read-more` line (1 post + 1 product). Newer posts had no related panel because the admin only inserted it before `</article></main>`; fixed in `ensureBlogArticleShell` (falls back to the last `</article>`), test in `tools/blog_normalize.test.js`.
- Product and category pages now end with "Hướng dẫn liên quan" (3 posts) chosen by `pickGuidePosts` in `tools/build_static_site.js` (category topic phrases + product-name phrases, title matches weigh more); also used by `--product-pages-only`.
- "Trang trí bàn tiệc bằng nến tealight" was live but missing from `BLOG_POSTS` (its id 22 was reused on 2026-07-27); restored as id 27.
- Result: 0 broken internal links; every live post now has 4–26 inbound internal links (several had 0). Tests pass. Not changed: post bodies' health/feng-shui wording (e.g. bồ kết "an toàn cho trẻ nhỏ" vs later "không xông khi có trẻ sơ sinh") — seller to review.

Blog list pagination + newest first — 2026-11-09: the React "Hướng Dẫn" page (`BlogPage` in `assets/js/app.jsx`, opened from the header nav) only showed the first 6 of 17 posts (`slice(0, 6)`). It now pages 6 per page with ‹ 1 2 3 › buttons, resets to page 1 on tag change, scrolls to the grid on page change. Both the React page and static `/blog/` (`renderBlogIndexPage`) now list newest first: `sortBlogPostsNewestFirst` parses `date` ("26 tháng 4, 2026"), ties → higher `id` first; data order in `site-data.js` is unchanged, so the homepage's 3 guide cards (first 3 entries, seller-pinned) are unchanged. Test added in `tools/build_static_site.test.js`. Rebuilt `app.min.js`, `index.html` cache key, `blog/index.html`; all tests pass; checked in local preview (17 posts → pages of 6/6/5, 13/10/2026 first, 25/4/2025 last).

Thank-you card landing page — 2026-11-09, live at https://phuonglam.com/cam-on/ (commit `650883e`; live check: 200, noindex, not in sitemap, 9 products at publish, Mua ngay → checkout with correct subtotal, no order sent): `cam-on/index.html` (QR target for the thank-you card). Standalone mobile page, `noindex`, not in sitemap; reads live products from `assets/js/site-data.js`, shows the IDs in `PRODUCT_IDS` (10: 6 bestsellers + đèn xông gốm + tinh dầu 10ml + bộ bếp xông cao cấp `shopee_55553449576` + thanh gỗ Palo Santo `shopee_48864137960`, added at seller's request; first row = đèn xông, tinh dầu, nến tealight 4h); option groups appear one at a time like the product page; a scrollable row of category chips under the header links to `/danh-muc/<id>/` (built from `CATEGORIES`, only categories with visible products); animated promo poster "Giá đã giảm 20% so với sàn" + per-visitor countdown (`PROMO_MINUTES` = 5 from first visit, honey-yellow poster (matches cream + green) with large amber countdown boxes, start kept in `phuonglam-camon-promo-start`, survives reload, poster hides when over, new window after `PROMO_RENEW_DAYS` = 7). Seller states web prices are already ~20% below Shopee and chose (2026-11-09) to keep the poster and 5-minute countdown as is, with no extra discount or gift; this was not verified here, and the countdown does not change any price, bottom sheet for variant + qty, writes `phuonglam-cart` in the same item shape as static product pages and opens the existing checkout via `/?checkout=open`; sticky cart bar, Zalo/call fallback. Verified in a local preview (variant → checkout subtotal correct); no order sent. Not done: seller's product list, real discount code (needs checkout + Worker), order source tag. Seller was warned that QR/web links in Shopee parcels risk Shopee off-platform penalties. Python preview cannot read ~/Desktop (macOS privacy), so previews run from a copy.

Background catch-up — 2026-10-26: `backgroundCatchUp()` runs on admin start and every 10 min (skipped while `.admin-backups/pending-*.json` exist); last sync result in `GET /api/git.php` → `checkoutSync`. Hand edits left uncommitted in this checkout block the sync and are reported, never overwritten. Suite 55/55.

Blog write catch-up — 2026-10-26: `POST /api/blog.php` and `/api/blog-schedule.php` call `catchUpBeforeContentWrite()` (= `syncCheckoutToOrigin(publishBranch())`) before writing, so pending changes are recorded against GitHub's files. Test in `tools/admin_products.test.js` (suite 54/54).

Deploy pipeline — 2026-10-13, branch `feat/ci-pages`. GitHub Pages now deploys via `.github/workflows/deploy-pages.yml` (build → tests → `tools/prepare_pages_artifact.js` → deploy, writes `/build-info.json`). Admin button "Đăng lên web" always publishes to origin's default branch, then `syncCheckoutToOrigin` resets the Desktop checkout to the published commit only if lossless, and the UI polls `/api/publish-status.php` until the live commit matches. Stale product drafts are no longer restored (kept under `phuonglam_admin_product_draft_v1_old`). Scheduled-post and compress-images workflows dispatch the deploy after pushing. The running admin server must be restarted to pick up the new code.

Blog normalizer — 2026-10-13: re-saving a page that already has the site shell (seo-header + related-posts panel) keeps its `<title>`, breadcrumb and related block; titles/descriptions are entity-decoded before escaping (no more `&amp;amp;`). New drafts are normalized as before. Tests: `tools/blog_normalize.test.js` (suite 52/52). Lets SEO Writer edit all 18 published posts safely.

Checkout & shipping — 2026-10-13, branch `feat/checkout-shipping`. Shipping fees now live in `data/settings.json` → `shipping` (grams/VND: hcmFreeWeight 5000, otherFreeWeight 3000, firstKgFee 16000, extraKgFee 4000, expressFee 15000, defaultItemWeight 500), edited in admin tab "Phí ship", normalized by `tools/shipping_settings.js` and baked into `app.jsx` (`BAKED_SHIPPING`). Customers see only the fee amount (no weight/breakdown). Express copy = "trong 1 giờ, +15.000đ". Checkout keeps the 63-province list (seller choice) but: autofill-safe fields, unaccented/alias input snaps to listed names ("hcm", "ha noi", "huế"), Enter picks a suggestion, +84 phone normalized, city must match the list, first error focused, optional "remember on this device" profile (`phuonglam-checkout-profile`), 16px inputs on mobile. Order Worker source now lives in `workers/order-webhook/worker.js` (deployed 2026-10-13, current version 358d3023 (blank lines between copyable rows), earlier f31409d2, original bb586da3): two Telegram messages per order (delivery details with tap-to-copy name/phone/address, then items + THU COD), order code like PL1310-6388 returned to the checkout receipt, warning when subtotal ≠ item total. It still trusts client prices/fees; 3 products lack variant weights (2 túi thơm, gỗ xông nhà) and use the 0.5 kg default.

Structured product content — 2026-10-12, branch `feat/structured-content` (commits `c0b8dc7`, `3d32df6`). Products may carry `content: {intro, highlights, specs[{label,value}], steps, care}`; the product page renders Giới thiệu / Thông số / Cách dùng / Lưu ý & bảo quản with nav labels equal to the H2s, `description` is regenerated from it, and the admin "Mô tả" tab edits it (`tools/product_content.js`). All 38 visible products rewritten from existing facts only (no emoji, ALL-CAPS, product codes, shipping weight, health/spiritual claims) with SEO title ≤60 and description 140–155 chars. 44/44 tests pass. Seller still to confirm: tealight mica "set 50" vs 5–50 variants; tealight 2h Mai "100 viên/hộp" + foreign SKU; Bộ phụ kiện variants; nến ly nơ đại "120 giờ" vs 5–6 ngày; combo thảo mộc package names (Xua muỗi/Giải cảm/Tẩy uế). Open: "- bản sao" product, 3 hidden placeholder reviews.

Audit 2026-10 — 2026-10-08, branch `audit/2026-10` in `/Users/lamtran/worktrees/phuonglam-audit`, pushed to `main`. Report: `docs/AUDIT-2026-10.md` (docs/ is no longer public). Done: bundle re-bake (P0), admin tooling committed, Push Git publishes `app.jsx`, admin loopback/cross-site guard, malformed-URL crash, Jekyll `_config.yml` hides internal files, hidden products noindex + out of sitemap, atomic admin writes, 30-backup cap, upload/body limits, traversal check, content-hash cache busting, settings-driven hero preload, lazy bestseller images, 900px candle category image, admin password removed from the public bundle (in-app admin localhost-only), slim cart items, admin duplicate-name guard and rename-on-duplicate. 34/34 tests pass. **Owner must change the password that was in app.jsx anywhere it is used** (it stays in git history). Open: "- bản sao" product (seller intent: it is in Thảo mộc xông + bestsellers while the original is in Túi thơm), duplicate SKUs on `shopee_22080262041`, order Worker review, unused large media. The Desktop checkout is behind origin and runs the old admin; update it before using the admin again.

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
- Admin v2: first real publish test, then variant option editing.
- `cam-on/`: seller prints the QR to `https://phuonglam.com/cam-on/`; optional later: tag orders from the card, real gift/discount tied to the countdown.
- Confirm HCMC delivery rules with the fulfillment provider and finish local admin upload/draft browser checks.
- Recheck Search Console and compare full 28-day performance windows after reports refresh.
