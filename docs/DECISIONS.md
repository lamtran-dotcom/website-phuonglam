# Decisions

## Decision Log

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
