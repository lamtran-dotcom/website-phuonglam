# Changelog

## 2026-11-12 — Checkout phone field shows errors while filling
- Leaving the phone field with a wrong number shows a red border and "Số điện thoại chưa đủ số" / "Số điện thoại không hợp lệ"; the error clears as soon as the number is right. Accepts mobile 03/05/07/08/09 + 8 digits, landline 02…, and +84 (rewritten to 0…).

## 2026-11-12 — Small orders pay 20.000đ shipping
- Item total under 150.000đ: flat 20.000đ shipping (TP.HCM and provinces). From 150.000đ: free standard shipping up to 5 kg (TP.HCM) / 3 kg (provinces), weight fee above as before; express still +15.000đ. Values are `shipping.smallOrderThreshold` / `smallOrderFee` in `data/settings.json` (also editable in the old admin "Phí ship").
- Same rule in `calculateShipping` (app.jsx) and the order Worker `shippingFee`. Cart shows "Mua thêm …đ để được miễn phí giao hàng"; promo popup says "Freeship toàn quốc đơn từ 150.000đ"; the shipping policy page text is generated from the settings.

## 2026-11-11 — Admin v2: a picture per variant
- Variant table has an "Ảnh" column: click the box to upload (WebP 900/720/480) or pick one of the product's pictures; it is the picture shown when a customer picks that variant. Group-1 values can also get an uploaded picture (used for rows without their own).

## 2026-11-11 — Admin v2: homepage and categories tab
- New tab "Trang chủ & danh mục": header slider images, best sellers (order, add from list, remove), categories (rename, icon, reorder, image, add new; delete only when empty).
- Category list moved from hand-written `assets/js/site-data.js` to `data/settings.json` → `categories` (seeded with the current 10, values unchanged); the build writes it back into `CATEGORIES`, so new categories get `/danh-muc/<id>/` pages and sitemap entries. The old local admin keeps `categories` when it saves settings.
- Worker publishes `products.json` and/or `settings.json` (only what changed, each with its own 409 check). Tests: 3 new Worker tests, 1 build test.

## 2026-11-11 — Admin v2: Shopee-style variants and a shipping section
- "Thông tin bán hàng": add up to 2 option groups, add/rename/reorder/remove values (Enter to add), image per value of group 1, table of every combination with Bán switch, giá bán, giá gạch, cân nặng, SKU, and "Áp dụng cho tất cả phân loại". Plain products show price/SKU and "+ Thêm nhóm phân loại".
- "Vận chuyển": product weight (gram) with a warning when missing; empty variant weights use it.
- Existing data is kept: sparse combinations stay off, flat imported lists become one group only when edited, the 6 hidden Vàng/Đỏ variants of "Nến tealight 4 giờ loại Trơn" are listed instead of deleted. Logic in `workers/product-admin/public/variants.js`, 7 tests in `tools/product_admin_variants.test.js` (one runs over every real product).

## 2026-11-11 — Online product admin (Admin v2), first version
- New `workers/product-admin/`: Cloudflare Worker + plain-JS UI. Product list with search/category filter, inline price/crossed-out price/hide, bulk price changes (+/− đ or %, set, rounded to 1.000đ, applied to variants too), product page editor (basic info, images with browser-side WebP 900/720/480 resize incl. an iPhone fallback encoder, variant table with apply-to-all, structured content that regenerates `description`, Google preview), add/duplicate/delete, change list, one-commit publish and deploy status.
- Login: one owner password (HttpOnly SameSite=Strict session cookie signed with a password-derived key, 30 days, 5 tries/min/IP); publish is refused when `data/products.json` changed since loading. 11 tests in `tools/product_admin_worker.test.js`. Deployed to https://phuonglam-admin.tranquanglam1998.workers.dev; secrets set and login verified by the owner; a bad GitHub token is now reported instead of bouncing back to the login form.

## 2026-11-11 — Orders are charged at current web prices
- The order Worker (`workers/order-webhook/worker.js`) recomputes item prices, weight and shipping from `/assets/js/order-pricing.json` (written by every build) and sends that amount as THU COD; when the customer's total differs, Telegram shows both and asks the shop to call first. Orders are never rejected for this; if the price list cannot be read, the order goes through with a warning.
- Carts saved in the browser are re-priced from the current catalog when the storefront opens, so customers see today's price before ordering.

## 2026-11-11 — Codebase audit: delete what is not used
- Storefront bundle: old in-app admin, sample orders, unreachable in-app blog-post page, export/tweak leftovers and dead helpers removed (`app.jsx` 4,950 → 3,035 lines, `app.min.js` 252 KB → 160 KB). Logo click goes home at once (the hidden 5-click admin entry made it wait 600 ms).
- Repo: 568 images no page references (≈31 MB), `_headers` (ignored by GitHub Pages), the `compress-images` workflow (its output was never used), three April product backups, `reports/`, the Shopee mirror script and the April QA report deleted.
- Admin server: unused blog ZIP upload flow removed.
- Fixed while auditing: category and hero images from `settings.json` now get 480/720 px copies (14 requests were 404 on every homepage visit); category cards show "Từ …đ" from real prices (all ten hand-typed labels were wrong).

## 2026-11-10 — Thảo mộc price increase
- 9 products in Thảo Mộc Xông: every selling price +8.000đ (product and variants); crossed-out prices +15% rounded to 1.000đ. The duplicate Túi Thơm product kept its prices (seller choice).

## 2026-11-10 — SEO fixes from the checklist report
- 20 live posts: 13 titles shortened to end with " | Phương Lâm" (30–60 chars; H1 unchanged except the bộ xông thảo mộc post, which lost its brand suffix); `BLOG_POSTS.title` synced.
- Every BlogPosting now has `publisher.logo`; visible breadcrumb added to 12 posts; dates given time + `+07:00` (day unchanged); the vỏ bưởi post's schema (image URL, mainEntityOfPage, logo) repaired; BlogPosting added to the đèn xông tinh dầu post.
- Image alt written from the pictures (12 posts, 52 images; captions follow); draft image comments removed from 4 posts; lazy loading and size/ratio fixed on old posts.
- FAQPage JSON-LD synced to the visible Q&A in 9 posts; safety notes (ventilation, kids, no unattended flame) added to 13 posts; generic "Xem ngay" links reworded; heading levels fixed in "2h, 4h, 8h"; step lists made `<ol>`.
- Follow-up: dates aligned (page, JSON-LD, `BLOG_POSTS`), BlogPosting added to the "2h, 4h, 8h" post, 5 featured/og images switched to existing ≥1200 px images, approved C4/C5 wording applied, leftover health-claim lines (kháng khuẩn, kích ứng hô hấp, "cháy suốt đêm") softened.
- Admin template (`tools/local_admin_server.js`): new posts get publisher logo, a visible breadcrumb also for `<article class="article-wrap">`, a descriptive alt instead of "Ảnh 1 · Ảnh bìa", and drafts' `<!-- PROMPT ẢNH -->` comments are dropped; the SEO audit warns on label-only alt. Tests in `tools/blog_normalize.test.js`.

## 2026-11-09 — Blog internal links and titles
- Fixed a dead product link used in 13 posts and two malformed post links.
- Shorter titles (≤60 characters) and complete descriptions for 7 posts.
- Every post links to 3 related posts and, mid-article, to one post and one product; product and category pages list 3 related guides.
- New admin drafts written as `<article>` now get the related-posts panel.
- The "Trang trí bàn tiệc" post is back in the blog list.

## 2026-11-09 — Guides page shows every post
- The in-app "Hướng Dẫn" page listed only the first 6 posts; it now has page buttons (‹ 1 2 3 ›), 6 posts per page.
- The in-app "Hướng Dẫn" page and `/blog/` list the newest post first (by post date).

## 2026-11-09 — Thank-you card landing page
- New `cam-on/` page for the QR on the thank-you card: category chips, honey-yellow "giảm 20% so với sàn" poster with a 5-minute per-visitor countdown, 9 chosen products, pick variant and quantity, "Mua ngay" opens the existing checkout; Zalo/call fallback. `noindex`, kept out of the sitemap.

## 2026-10-26 — Admin keeps its checkout in step with GitHub
- The running admin catches up with GitHub on start and every 10 minutes (lossless only; skipped while admin changes wait to be pushed). `GET /api/git.php` returns the last result as `checkoutSync`, so tools can warn when a sync was refused and why.

## 2026-10-26 — Blog writes catch up with GitHub first
- Saving or scheduling a blog post first fast-forwards a clean, stale checkout to GitHub (lossless only). Fixes "Nội dung scheduled-posts/... đã được thay đổi trên web" when GitHub had already published and removed an earlier queued update.

## 2026-10-13 — Build and deploy on GitHub
- New `Deploy website` workflow: build, test, collect public files, deploy to Pages; failures keep the previous site.
- Admin "Push Git" is now "Đăng lên web": always publishes to `main`, syncs the local checkout when safe, and shows when the site is live.
- Admin no longer restores a product draft made from older data.
- Scheduled-post and image-compression workflows trigger the deploy after their pushes.

## 2026-10-13 — Checkout and weight-based shipping
- Shipping fee rules moved into `data/settings.json` (`shipping`) with an admin "Phí ship" tab; the build bakes them into the storefront.
- Checkout shows only the shipping amount; express states delivery within 1 hour and its surcharge.
- Order Worker: two Telegram messages per order (copyable delivery details, then items and COD amount), order codes, subtotal mismatch warning; source kept in `workers/order-webhook/`.
- Easier address entry: autofill works, unaccented names and common aliases resolve to the listed province/district/ward, phone accepts spaces and +84, errors focus the field, optional saved profile on the customer's device.

## 2026-10-12 — Structured product content
- New optional `content` field (intro, highlights, specs, steps, care) rendered as fixed sections; nav labels now match the H2s; legacy description/usage is the fallback.
- Admin "Mô tả" tab edits the structured fields and regenerates `description`; server validates the shape.
- Rewrote all 38 visible products into the outline (146–306 words) and filled missing SEO titles/descriptions; removed product codes, shipping weight, emoji, ALL-CAPS and health/spiritual claims.

## 2026-10-08 — Audit follow-up (approved P2 set)
- `_config.yml` excludes internal docs, tools, data, reports, scheduled posts, admin UI and the `.command` launcher from GitHub Pages; verified 404 live.
- Hidden products keep their page with `noindex, follow` and are omitted from the sitemap; both build modes agree.
- Admin: atomic settings/site-data writes, newest-30 product backups, 60 MB body / 25 MB image limits with magic-byte checks, stricter static path check, duplicate asks for a new name, visible products cannot share a name, delete warns about 404.
- Build: content-hash `?v=` (rebuilds are no-ops), hero preload from settings, only first six bestseller images eager.
- Storefront: removed the hard-coded admin password; in-app admin only on localhost; slim cart items.
- Candle category image resized to 900 px (778 KB → 127 KB).

## 2026-10-08 — Audit fixes (branch audit/2026-10, unpushed)
- Re-ran the normal build so `app.min.js` again contains every bestseller and category image from `data/settings.json`.
- Committed the local admin server, product push helper, admin UI and their tests, which had never been tracked.
- Admin Push Git publishes `assets/js/app.jsx` alongside the bundle so baked data cannot drift.
- Local admin refuses non-loopback Host headers and cross-site write requests; malformed URLs return 400.
- Added `tools/admin_server_security.test.js`; wrote `docs/AUDIT-2026-10.md`.

## 2026-10-07 — Add Túi thơm and Gỗ thơm categories
- Added both categories immediately after Thảo Mộc Xông in the shared category navigation.
- Generated static destinations with an empty-category message and added both URLs to the sitemap.
- Kept existing products in their current categories.

## 2026-10-07 — Import Shopee product 54367578815
- Added the product to the Thảo mộc xông category using the supplied Shopee basic-info, media and sales exports.
- Imported the product description, 8 gallery images, 9 variants and VND prices; left inventory out and optimized images into local responsive WebP assets.
- Generated the static product page and updated the category listing and sitemap.

## 2026-09-28 — Express delivery promotion timing
- Updated the promotion copy to say express delivery is within 1 hour in inner TP.HCM.

## 2026-09-28 — Checkout shipping detail
- Hid the free-shipping threshold and calculated overweight amount from customer-facing order details.
- Kept the existing weight thresholds and shipping fee calculation unchanged.

## 2026-09-28 — Product purchase button hover
- Added a subtle lift and shadow to the Add to Cart and Buy Now buttons across all product detail pages.
- Added pressed and keyboard-focus states, plus a reduced-motion fallback; bumped the shared CSS cache key on all 41 product pages.

## 2026-09-28 — Homepage refresh
- Replaced the list-style homepage heading with “Thắp chút ấm áp. Ươm hương an yên.” and a warm cream/green hero, with one configured image visible on mobile and desktop.
- Moved category discovery ahead of featured products, used 4/2-column category and product grids, added a combo entry point, and reduced homepage guides to three.
- Replaced broad trust/safety assertions with accurate catalog groups and aligned the main product CTA with the category section.
- Synced the React experience, static first render, build template, metadata, stylesheet and minified bundle. Kept generated product/category pages and sitemap unchanged in the release.

## 2026-08-26

### Changed
- Updated the shipping promotion popup and site-wide promo bar to lead with nationwide free shipping and a price comparison example: marketplace 250.000đ after voucher versus website 200.000đ, saving 50.000đ.
- Replaced the old HCMC/16.000đ popup copy with a per-product/per-variant price note.
- Added subtle popup motion: staged content reveal, image drift, candle glow, smoke, highlight sheen, and saving-value pulse, with a reduced-motion fallback.

### Notes
- Checkout shipping calculation remains unchanged until the exact nationwide free-shipping conditions are confirmed.

## 2026-08-04

### Verified
- Confirmed the checkout order webhook accepts the production JSON payload and returns success; one clearly labelled `TEST — KHÔNG XỬ LÝ` notification was sent to verify the Telegram notification route.

## 2026-07-17

### Added
- Added a non-public `scheduled-posts/` article queue, local admin endpoint, promotion script, regression test, and `Publish Scheduled Blog Posts` GitHub Actions workflow.
- Added automatic promotion of due articles into `blog/`, including `BLOG_POSTS`, static index, sitemap, and deploy commit updates.
- Added a bounded scheduled-publication history and a local read-only status endpoint with queue, history, and latest GitHub Actions run.

### Changed
- Moved the scheduled GitHub Actions trigger away from minute zero and serialized runs to reduce delay/race risk.
- Added a subtle raised hover and keyboard-focus state to desktop primary navigation links.
- Product uploads now create 480px and 720px WebP derivatives immediately; the storefront retries the original image if a responsive candidate fails.

### Fixed
- Fixed overlapping text in the CTA block of the newly published tealight article. CTA grid-area rules now override the article's base `!important` style, and a first-child paragraph becomes the heading only when no `h2`/`h3` precedes it.
- Fixed local publish failures after a GitHub Actions commit. The admin now fetches/rebases before push, automatically regenerating only conflicted static build output while preserving a safe stop for source-code conflicts.
- Fixed broken product-gallery and variant thumbnails by generating the missing responsive WebP files and validating responsive image references during builds.

## 2026-07-15

### Added
- Added a responsive HCMC shipping promotion bar and first-visit popup with a delivery illustration.
- Added a seven-day dismissal limit and a CTA that takes visitors to bestselling products.

### Changed
- Standardized SEO article presentation: the lead image is 16:9, follow-on figures are 4:3, and CTA blocks are compact and responsive.
- Replaced hard-coded related links with up to four dynamically selected blog cards that use local cover images, category/read-time metadata, and small 112x84 thumbnails.
- Re-saved `cach-xong-nha-bang-thao-moc` through the local admin template so it immediately uses the new article standard.
- Replaced the popup's generic ceramic-burner illustration with the approved real product arrangement of a terracotta burner, tealight candles, and herbal combo.
- Emphasized the outer-city `chỉ từ 16.000đ` shipping offer with a subtle animated price badge.
- Added a raised hover and keyboard-focus treatment to the popup's “Mua ngay – nhận ưu đãi” button.
- Added a delivery parcel with a truck icon to the popup product arrangement.
- Fixed the popup layout on narrow phone screens: reduced height, clearer price line, full-width CTA, and lighter product backdrop.
- Optimized the popup background from a 1.9 MB PNG to a preloaded 41 KB WebP for faster initial display.

### Fixed
- Moved the related-content block for `cach-xong-nha-bang-thao-moc` into the article reading column.
- Updated the local admin article template so category links and related posts use compact responsive card grids.

## 2026-07-04

### Notes
- Reviewed Instatic as inspiration for this project.
- Current recommendation: keep `phuonglam.com` static-first with the local admin workflow; selectively borrow CMS ideas instead of migrating to Instatic while it is still early 0.0.x software.

## 2026-07-02

### Added
- Added `AGENTS.md` with standing Codex work rules.
- Added `CONTEXT.md` as the short project memory.
- Added documentation structure under `docs/`.
- Added `.env.example` with placeholder values only.
- Initialized local CodeGraph index with `codegraph init`.

### Changed
- Updated `README.md` to point humans and Codex sessions to the project memory and docs.
- Updated `.gitignore` to exclude `.codegraph/`.

### Fixed
- 

### Notes
- Source code was not refactored as part of this initialization.
- `.codegraph/` is local generated state and is ignored by git.

## 2026-09-28 — Product detail release
- Publish the local SEO/content and readability upgrade for all 25 visible products using a clean checkout of current origin/main.
- Add content navigation, constrained reading width, semantic lists/tables, caution and storage panels, related links and refined metadata.
- Fix undefined cheapestVariant browser reference; verify variant selection and add-to-cart. Preserve existing buy-now routing.
- Product-only build, all-page markup/script checks and browser interaction checks passed.


## 2026-09-28 — Checkout and storefront update
- Send “Mua ngay” on static product pages to checkout while retaining the selected variant and quantity.
- Let customers enter current province/district/ward names, keep district optional for unrestricted products, and retain the configured inner-HCMC delivery gate for candle cups.
- Add a checkout order summary/receipt when the existing order endpoint responds successfully, checkout autofill hints, and a compact mobile step indicator. Keep the shipping promotion out of checkout.
- Clarify standard-shipping weight thresholds and express/overweight fees in the promotion; refine CTA motion with reduced-motion support.
- Release built React bundle and all affected static product pages. Admin editor improvements remain local because admin is intentionally local-only.
- Local checks: product variant → checkout (70,000đ selected variant), manual address entry and out-of-area candle-cup notice; promotion terms display 3kg outside HCMC and 5kg in HCMC. No order was submitted.

## 2026-09-28 — Shipping popup copy
- Replaced the conditional weight/fee paragraph in the promotion popup with “Freeship toàn quốc” and “Giao hỏa tốc từ 1 đến 4h trong nội thành TP.HCM”.
- Rebuilt the React bundle and versioned the homepage script URL so browsers load the new copy. Previewed the popup locally.

## 2026-09-28 — Candle-cup delivery coverage
- Removed the HCMC-only checkout block and made district optional for nến ly. Standard delivery now accepts nationwide addresses; express remains limited to inner TP.HCM.
- Updated both candle-cup source descriptions and static product pages to say they ship nationwide.
- Local checkout for a Hanoi address advanced to order review without a district; no order was submitted.
