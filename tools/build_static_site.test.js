const assert = require('node:assert/strict');
const test = require('node:test');
const { isHiddenProduct, productSitemapUrls, renderProductPage } = require('./build_static_site');

const product = (overrides = {}) => ({
  id: 'p1', slug: 'san-pham-a', name: 'Sản phẩm A', categoryId: 'nen-thom', price: 10000,
  images: ['/assets/products/uploads/a.webp'], variants: [], ...overrides,
});

test('hidden products keep a page but are noindex and left out of the sitemap', () => {
  const visible = product();
  const hiddenBool = product({ id: 'p2', slug: 'an-bool', hidden: true });
  const hiddenString = product({ id: 'p3', slug: 'an-string', hidden: 'true' });
  assert.equal(isHiddenProduct(visible), false);
  assert.equal(isHiddenProduct(hiddenBool), true);
  assert.equal(isHiddenProduct(hiddenString), true);

  assert.deepEqual(productSitemapUrls([visible, hiddenBool, hiddenString]), ['https://phuonglam.com/san-pham/san-pham-a/']);

  const hiddenHtml = renderProductPage({ product: hiddenBool, categoryName: 'Nến thơm' });
  assert.match(hiddenHtml, /<meta name="robots" content="noindex, follow" \/>/);
  assert.match(hiddenHtml, /<link rel="canonical" href="https:\/\/phuonglam\.com\/san-pham\/an-bool\/" \/>/);
  assert.doesNotMatch(renderProductPage({ product: visible, categoryName: 'Nến thơm' }), /name="robots"/);
});
