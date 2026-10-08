# Tasks

## Now
- [ ] Review and push branch `audit/2026-10` (P0 bundle fix should go live first).
- [ ] Decide: hidden products (4) still get indexable pages and sitemap URLs — noindex/remove from sitemap or keep.
- [ ] Decide with seller: visible duplicate product "… - bản sao" (`p_1791429972397_g7kgf`).
- [ ] Decide: hide internal files (docs, CONTEXT/AGENTS, tools, reports, data backups, `.command`, admin UI) from GitHub Pages, e.g. Jekyll `_config.yml` `exclude`.
- [ ] Approve or reject P2/P3 items A1–A13, N1–N4 in `docs/AUDIT-2026-10.md`.
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
