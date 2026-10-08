# Changelog

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
