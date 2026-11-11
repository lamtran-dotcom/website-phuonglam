# Admin v2 — online product admin

Status: in progress (products only). The old local admin (`admin-upload.html` +
`tools/local_admin_server.js`) stays for blog, orders, settings and scheduled posts
until those move over.

## Goal
Edit products from any device (phone included) without running a local server or
using git. The public site stays static; `data/products.json` in git stays the only
source of product data.

## How it works

```
Browser ──► Cloudflare Worker "phuonglam-admin"
              │  https://phuonglam-admin.tranquanglam1998.workers.dev
              │  POST /api/login with the owner password → signed HttpOnly cookie (30 days)
              │  every other /api call checks that cookie; 5 login tries/min per IP
              │
              ├─ GET  /api/catalog   products.json + settings.json + base commit sha
              ├─ POST /api/publish   one commit: products.json and/or settings.json + new images
              └─ GET  /api/status    GitHub Actions run for a commit
                                        │
                                        ▼
                         GitHub Actions "Deploy website" (unchanged):
                         build → test → publish to GitHub Pages
```

- Code: `workers/product-admin/` (`worker.js` = API, `public/` = UI served as
  Workers static assets). No build step, no npm dependencies.
- Edits are kept as a local draft in the browser until **Xuất bản**; one publish =
  one commit = one site build (~1–2 min).
- Conflict rule: publish is refused (409) when `data/products.json` changed on
  `main` since the admin loaded it. Commits that touch other files (scheduled blog
  posts, the old admin) do not block a publish.
- Images are resized in the browser to WebP 900 px (`assets/products/uploads/`) plus
  480/720 px (`assets/products/responsive/<name>-480|720.webp`), the same layout the
  build checks with `verifyResponsiveProductImages`.
- `description` is regenerated from `content` with the same outline as
  `tools/product_content.js` (`composeDescription`).
- Only the products JSON and images are committed. Generated pages are rebuilt by
  CI for the live site; the committed copies of generated files catch up the next
  time the old admin or a local build runs.

- Login is a single owner password (secret `ADMIN_PASSWORD`; owner chose a short PIN, minimum 4 chars). Guessing is slowed by 5 tries/min per IP and 3 tries/min for everyone combined; an existing session is not affected. The session
  cookie is `<expiry>.<HMAC>` keyed from the password, so changing the password signs
  every device out. Cloudflare Access was not used: its Free plan needs a payment card.

- Variants are edited Shopee-style (`public/variants.js`): up to 2 groups, values can be
  added/renamed/reordered/removed, group-1 values can have an image (`optionImages`), and
  the table lists every combination with a "Bán" switch, price, crossed-out price, weight
  and SKU. Data stays sparse (a combination without a variant is not for sale). Products
  imported with a flat variant list become one group "Phân loại" on their first structural
  edit. Variants whose value is not in the group list are shown and only deleted on request.
  `product.price` follows the cheapest variant. Weight: "Vận chuyển" holds the product weight;
  an empty variant weight falls back to it (same rule as cart and order Worker).

- Tab "Trang chủ & danh mục" edits `data/settings.json`: header slider images (order,
  add, remove), best sellers (`featuredIds`, order; static home shows 6, app up to 12),
  categories (name, icon, order, image, add; delete only when no product uses it; the id
  of a published category is fixed because it is the /danh-muc/<id>/ URL).
  Categories now live in `settings.json` → `categories`; every build writes them into
  `assets/js/site-data.js` (`CATEGORIES`) and makes their pages and sitemap entries.
  Only the changed file(s) are sent, each with its own conflict check.

## Setup (one time)
See "Admin v2 (online)" in `docs/SETUP.md`.

## Not done yet
- Restore-previous-version button (use git history / GitHub revert meanwhile).
- Blog, orders, shipping settings.
