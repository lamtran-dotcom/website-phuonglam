# Decisions

## Decision Log

### 2026-07-17 - Record and expose scheduled publication state
Decision: Maintain a bounded JSON history after a scheduled article is promoted and expose it with the remaining queue and the most recent GitHub Actions run.
Reason: The queue directory is deleted on successful publish, so it cannot answer whether a scheduled article was actually deployed.
Impact: The promotion script writes `data/scheduled-blog-history.json`; the local admin supplies a read-only schedule status API for Content AI Studio. GitHub workflow runs are offset from minute zero and serialized so publishing jobs do not race each other.
Status: Active

### 2026-07-17 - Require responsive copies for product images
Decision: Every product image served from `assets/products/uploads/` or `assets/products/mirrored/` must have 480px and 720px WebP derivatives before the static site builds.
Reason: The storefront uses `srcset`; missing responsive candidates cause browser-visible broken-image icons even when the original image exists.
Impact: Uploads generate both derivatives immediately, the build rejects a catalog with missing copies, and the client retries the original source as a last-resort fallback.
Status: Active

### 2026-07-17 - Promote scheduled SEO articles with GitHub Actions
Decision: Keep future SEO articles in `scheduled-posts/` until their explicit ISO publish time, then use a repository workflow to promote them into public `blog/` and rebuild the static site.
Reason: Scheduling must work when the local admin/Mac is off, while public pages must remain static and SEO-complete once live.
Impact: The queue is committed at scheduling time; the workflow runs every five minutes with repository write permission, writes `BLOG_POSTS`, updates generated pages/sitemap, commits the result, and deploys through the existing Git-based hosting flow. The requested time is Vietnam time from the operator UI, but actual delivery can be a few minutes late.
Status: Active

### 2026-07-15 - Keep SEO article chrome in the website template
Decision: The local website admin owns the reusable article shell, cover metadata, CTA layout, category navigation, and related-content cards; generated HTML supplies the article body and semantic SEO content.
Reason: Repeating presentation markup in AI output made individual articles inconsistent and required one-off repairs.
Impact: Every article saved through the admin gets a focused reading width, a 16:9 lead visual, 4:3 supporting visuals, a responsive CTA, and up to four dynamically selected local-image related cards.
Status: Active

### 2026-07-15 - Use a frequency-limited shipping promotion popup
Decision: Show a compact shipping bar on public pages and a delivery promotion popup 1.2 seconds after a visitor arrives. Dismissing the popup suppresses it for seven days; its CTA scrolls to bestselling products.
Reason: The promotion needs to be noticeable without repeatedly interrupting returning visitors.
Impact: The shipping offer remains visible as a small bar after the popup is closed, while the full promotion uses browser storage to control frequency.
Status: Active

### 2026-07-15 - Keep related SEO content within the reading column
Decision: The local admin article template inserts category and related-article links inside `.article-wrap`, using responsive card grids.
Reason: Inserting the panel after the article closing tag expanded it to the page width and left excessive unused space.
Impact: Current and future SEO articles retain a focused reading layout on desktop and collapse cleanly to one column on mobile.
Status: Active

### 2026-07-02 - Use durable project memory for Codex
Decision: Future Codex sessions must read `AGENTS.md` and `CONTEXT.md` before work, then update `CONTEXT.md` after completed tasks.
Reason: The project has long chat history and needs reliable handoff without rereading the whole repo.
Impact: Project memory is now explicit and short; long history belongs in `docs/CHANGELOG.md` and long-term decisions belong here.
Status: Active

### 2026-07-02 - Keep public site static-first
Decision: Product, category, and blog content should remain available as static HTML whenever practical.
Reason: Static pages improve SEO, perceived speed, and crawlability for product/shop pages.
Impact: Build/admin changes must preserve generated HTML pages, sitemap, canonical metadata, and structured data.
Status: Active

### 2026-07-02 - Treat CodeGraph as local code structure index
Decision: Use CodeGraph first for code exploration when `.codegraph/` exists, but keep project memory in `CONTEXT.md`.
Reason: CodeGraph helps inspect source flows and impact radius; it does not replace business/project context.
Impact: `.codegraph/` is ignored by git and documented as optional local tooling.
Status: Active
