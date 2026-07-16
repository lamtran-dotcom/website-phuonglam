# Changelog

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
