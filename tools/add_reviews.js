#!/usr/bin/env node
// Add REAL customer reviews to products through the running local admin.
//
//   node tools/add_reviews.js reviews.json --dry-run
//   node tools/add_reviews.js reviews.json
//   node tools/add_reviews.js --remove-placeholders        (drops reviews that have no source)
//
// reviews.json is a list like:
//   [{ "productId": "55553449576", "name": "077***329", "rating": 5,
//      "comment": "Sản phẩm tốt, giao nhanh", "date": "2026-10-01", "source": "Shopee" }]
// "source" (Shopee, Zalo, Facebook, Google, Website) is required and is shown next to each
// review. Only add reviews customers actually wrote; copy the wording as they gave it.
const fs = require('fs');
const { REVIEW_SOURCES, normalizeReview, looksLikeUnmaskedPhone } = require('./reviews');

const parseArgs = (argv) => {
  const args = { file: '', dryRun: false, removePlaceholders: false, admin: 'http://127.0.0.1:8000' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--remove-placeholders') args.removePlaceholders = true;
    else if (arg === '--admin') args.admin = argv[++i];
    else if (!arg.startsWith('--')) args.file = arg;
  }
  return args;
};

const reviewKey = (review) => `${review.name}|${review.comment}`.toLocaleLowerCase('vi');

// Pure: returns the updated products plus a report; nothing is written here.
const applyReviews = (products, entries, { removePlaceholders = false } = {}) => {
  const report = { added: [], skipped: [], removed: [] };
  const byId = new Map(products.map((product) => [String(product.id), product]));
  const next = products.map((product) => ({ ...product, reviews: [...(product.reviews || [])] }));
  const nextById = new Map(next.map((product) => [String(product.id), product]));

  if (removePlaceholders) {
    for (const product of next) {
      const kept = product.reviews.filter((review) => normalizeReview(review));
      if (kept.length !== product.reviews.length) report.removed.push(`${product.id}: ${product.reviews.length - kept.length} đánh giá không có nguồn`);
      product.reviews = kept;
    }
  }

  entries.forEach((entry, index) => {
    const label = `#${index + 1}`;
    const id = String(entry.productId || '');
    const product = nextById.get(id) || nextById.get(`shopee_${id}`);
    if (!product || !byId.has(String(product.id))) { report.skipped.push(`${label}: không thấy sản phẩm "${id}"`); return; }
    const review = normalizeReview(entry);
    if (!review) { report.skipped.push(`${label}: thiếu hoặc sai tên/số sao (1-5)/nội dung/nguồn (${REVIEW_SOURCES.join(', ')})`); return; }
    if (looksLikeUnmaskedPhone(review.name)) { report.skipped.push(`${label}: tên "${review.name}" giống số điện thoại chưa che; hãy che bớt (vd 077***329)`); return; }
    if (product.reviews.some((existing) => normalizeReview(existing) && reviewKey(normalizeReview(existing)) === reviewKey(review))) {
      report.skipped.push(`${label}: đã có đánh giá này ở ${product.id}`);
      return;
    }
    product.reviews.push(review);
    report.added.push(`${product.id}: ${review.name} ${'★'.repeat(review.rating)} (${review.source})`);
  });
  return { products: next, report };
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (!args.file && !args.removePlaceholders) throw new Error('Cần đường dẫn file JSON (hoặc --remove-placeholders).');
  const entries = args.file ? JSON.parse(fs.readFileSync(args.file, 'utf8')) : [];
  if (!Array.isArray(entries)) throw new Error('File phải là một danh sách [...] các đánh giá.');
  const current = await fetch(`${args.admin}/api/products.php`).then((response) => response.json()).catch(() => null);
  if (!current?.ok) throw new Error(`Không kết nối được admin tại ${args.admin}. Hãy mở admin trước.`);

  const { products, report } = applyReviews(current.products, entries, { removePlaceholders: args.removePlaceholders });
  for (const line of report.added) console.log(`+ ${line}`);
  for (const line of report.removed) console.log(`- ${line}`);
  for (const line of report.skipped) console.log(`! ${line}`);
  if (args.dryRun) { console.log(`\nXem trước: thêm ${report.added.length}, gỡ ${report.removed.length}, bỏ qua ${report.skipped.length}. Chưa ghi gì.`); return; }
  if (!report.added.length && !report.removed.length) { console.log('Không có gì để ghi.'); return; }

  const saved = await (await fetch(`${args.admin}/api/products.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ products, revision: current.revision }),
  })).json();
  if (!saved.ok) throw new Error(saved.message || 'Admin không lưu được.');
  console.log(`\nĐã lưu: thêm ${report.added.length}, gỡ ${report.removed.length}. Mở admin và Push Git để đưa lên web.`);
};

if (require.main === module) {
  main().catch((error) => { console.error(`Lỗi: ${error.message}`); process.exit(1); });
}

module.exports = { applyReviews };
