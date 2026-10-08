# Tasks

## Now
- [x] Review and push branch `audit/2026-10` (2026-10-08).
- [x] Hidden products: noindex + removed from sitemap, pages kept (2026-10-08).
- [ ] Decide with seller: "- bản sao" product `p_1791429972397_g7kgf` sits in Thảo mộc xông and bestsellers while the original `shopee_54367578815` is in Túi thơm; rename, hide, or support multiple categories.
- [x] Hide internal files from GitHub Pages via `_config.yml` (2026-10-08).
- [x] Apply approved P2 items A1–A10 (2026-10-08).
- [ ] **Owner: change the password that was hard-coded in app.jsx wherever it is used.**
- [ ] Update the Desktop checkout to origin/main before running the admin again (it still runs the old admin).
- [ ] Optional: delete unused `assets/media/generated/shipping-promo-popup-v1.png` (2 MB) and `embedded-020.jpg`.
- [ ] Review the order Worker re-validates prices (A12).
- [ ] Seller to supply unique SKUs for `shopee_22080262041` variants.
- [x] Update the express-delivery promotion to promise delivery within 1 hour in inner TP.HCM (2026-09-28).
- [x] Hide the free-shipping threshold and overweight calculation from customer-facing checkout; retain shipping logic (2026-09-28).
- [x] Remove the HCMC-only order restriction for candle cups, keep express local to inner HCMC, and update both product descriptions for nationwide delivery (2026-09-28).
- [x] Set popup copy to “Freeship toàn quốc” plus express delivery within 1 hour in inner TP.HCM (2026-09-28).
- [x] Add hover elevation/shadow to product detail purchase buttons and update the shared CSS on all 41 product pages (2026-09-28).
- [x] Keep `CONTEXT.md` updated after the next task.

## Next
- [x] Publish checkout and shipping-promotion updates (`63fb9a0`, 2026-09-28): GitHub Pages succeeded; all 41 product-page URLs and 3 shared assets match. Live browser verified promotion, Buy Now/variant retention, manual address and candle-cup coverage warning. No order submitted.
- [ ] Confirm HCMC candle-cup coverage with the fulfillment provider before changing supported areas.
- [ ] Smoke test the documented local admin workflow.
- [x] Add a GitHub Actions-backed scheduled publish flow for SEO articles.
- [x] Expose scheduled queue, completed history, and last GitHub job to Content AI Studio.
- [ ] Review whether existing setup instructions need screenshots or operator notes.

## Later
- [ ] Decide whether production should stay on GitHub Pages or move to Cloudflare Pages/VPS.
- [ ] Consider a separate hosted admin/backend only if business workflow requires editing away from the local Mac.

## Bugs
- [ ] Track any DNS/deploy issues in `CONTEXT.md` when they recur.

## Ideas
- [ ] Add a lightweight checklist for SEO validation before publishing new blog articles.
- [ ] Add draft/published status for products or blog posts if the admin workflow needs safer staging.
- [ ] Add media usage tracking so unused product/blog images can be found before cleanup.
- [ ] Add a simple owned form-submissions workflow if the site needs contact/lead forms without third-party SaaS.
- [ ] Add a basic admin action log or product version history before making the admin multi-user.
- [ ] Consider an Instatic sandbox only as a separate experiment, not as a replacement for the current production static site.
