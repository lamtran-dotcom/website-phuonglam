const assert = require('node:assert/strict');
const test = require('node:test');
const { normalizeReview, getGenuineReviews, getReviewStats } = require('./reviews');
const { applyReviews } = require('./add_reviews');
const { renderProductPage } = require('./build_static_site');

const placeholder = { name: 'Nguyễn Thị Mai', rating: 5, comment: 'Mùi rất dễ chịu, đốt cả buổi tối không bị ngột. Sẽ mua lại!' };
const real = { name: '077***329', rating: 5, comment: 'Sản phẩm tốt, giao hàng nhanh', source: 'Shopee', date: '2026-10-01' };
const product = (reviews) => ({ id: 'p1', slug: 'p1', name: 'Nến thử', categoryId: 'nen-thom', price: 10000, images: [], variants: [], reviews });

test('reviews without a stated source or with invalid fields are never shown', () => {
  assert.equal(normalizeReview(placeholder), null);
  assert.equal(normalizeReview({ ...real, source: 'Hàng xóm' }), null);
  assert.equal(normalizeReview({ ...real, rating: 6 }), null);
  assert.equal(normalizeReview({ ...real, rating: 4.5 }), null);
  assert.equal(normalizeReview({ ...real, comment: 'ok' }), null);
  assert.deepEqual(normalizeReview({ ...real, source: 'shopee' }), { name: '077***329', rating: 5, comment: 'Sản phẩm tốt, giao hàng nhanh', source: 'Shopee', date: '2026-10-01' });
  assert.equal(getGenuineReviews(product([placeholder, real])).length, 1);
  assert.deepEqual(getReviewStats([{ rating: 5 }, { rating: 4 }]), { count: 2, average: 4.5 });
});

test('product page shows the reviews section and Google rating data only for genuine reviews', () => {
  const none = renderProductPage({ product: product([placeholder]), categoryName: 'Nến' });
  assert.doesNotMatch(none, /product-reviews|aggregateRating|"@type": "Review"/);
  const withReview = renderProductPage({ product: product([placeholder, real]), categoryName: 'Nến' });
  assert.match(withReview, /Đánh giá từ khách hàng/);
  assert.match(withReview, /Nguồn: Shopee/);
  assert.match(withReview, /01\/10\/2026/);
  assert.match(withReview, /"aggregateRating"/);
  assert.match(withReview, /"reviewCount": 1/);
  assert.doesNotMatch(withReview, /Nguyễn Thị Mai/);
});

test('add_reviews adds valid reviews, skips duplicates, bad entries and unmasked phone numbers', () => {
  const products = [product([placeholder]), { ...product([]), id: 'shopee_9' }];
  const entries = [
    { productId: 'p1', ...real },
    { productId: 'p1', ...real },
    { productId: '9', ...real, name: '0773829593' },
    { productId: '9', ...real, source: undefined },
    { productId: 'nope', ...real },
    { productId: '9', ...real, name: 'Chị Lan' },
  ];
  const { products: next, report } = applyReviews(products, entries);
  assert.equal(report.added.length, 2);
  assert.equal(report.skipped.length, 4);
  assert.equal(next[0].reviews.length, 2);
  assert.equal(products[0].reviews.length, 1, 'input must not be mutated');
  const cleaned = applyReviews(products, [], { removePlaceholders: true });
  assert.equal(cleaned.products[0].reviews.length, 0);
  assert.match(cleaned.report.removed[0], /p1: 1 đánh giá không có nguồn/);
});
