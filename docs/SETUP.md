# Setup

## Requirements
- Node.js for the local admin server and static build scripts.
- Python 3 for simple static preview servers and image tooling when needed.
- Git for commit/push deployment workflow.
- CodeGraph CLI is optional but recommended for repos with source code.

## Environment Variables
See `.env.example`.

This repo should not commit real secrets. Local-only environment files are ignored by `.gitignore`.

## Install

There is no committed `package.json` dependency workflow at this time. The repository includes the local vendor files it needs for the current static build flow.

If a future task adds dependencies, document the exact install command here.

## Run

Start the local admin server from the repository root:

```bash
node tools/local_admin_server.js
```

Open:

```text
http://127.0.0.1:8000/admin-upload.html
```

Preview the website:

```text
http://127.0.0.1:8000/
```

For a plain static preview without admin endpoints:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://127.0.0.1:8080/
```

## Build

The local admin server normally rebuilds static pages after saving. To build manually:

```bash
node tools/build_static_site.js
```

This updates static pages, built JS/data assets, sitemap, and robots output.

## Test

There is no formal test suite documented yet. Use targeted checks:

```bash
node -c tools/local_admin_server.js
node -c tools/build_static_site.js
python3 tools/generate_responsive_product_images.py --check
node --test tools/publish_scheduled_posts.test.js
git diff --check
```

After frontend/static page changes, preview representative pages in a browser.

## CodeGraph Setup

If CodeGraph is installed and the repo contains source code, initialize the local code graph:

```bash
codegraph init
```

This creates `.codegraph/`, a local generated index used by Codex for codebase exploration.

Add `.codegraph/` to `.gitignore`; do not commit it.

After `codegraph init`, future Codex tasks should use CodeGraph first to inspect relevant flows, symbols, callers, callees, and impact radius before broad manual file reading.

## Deploy / Production Notes
- Static files are committed and pushed to the GitHub repository.
- Hosting may be GitHub Pages-style static hosting, Cloudflare Pages, or an Nginx VPS.
- After push, allow a few minutes for the hosting platform to deploy.
- Keep `sitemap.xml`, `robots.txt`, canonical URLs, and structured data correct after SEO changes.
- For scheduled SEO posts, Content AI Studio pushes a queue entry to `scheduled-posts/`. The `Publish Scheduled Blog Posts` GitHub Actions workflow checks every five minutes on the default branch, so the Mac does not need to remain on. GitHub may execute a few minutes after the requested time; use a schedule at least five minutes in the future.
