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

test('asset versions come from file content, so unchanged assets keep their URL', () => {
  const fs = require('node:fs');
  const os = require('node:os');
  const path = require('node:path');
  const { contentVersion } = require('./build_static_site');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'phuonglam-version-'));
  const file = path.join(dir, 'a.css');
  fs.writeFileSync(file, 'body{}');
  const first = contentVersion(file);
  assert.match(first, /^[0-9a-f]{10}$/);
  assert.equal(contentVersion(file), first);
  fs.writeFileSync(file, 'body{color:red}');
  assert.notEqual(contentVersion(file), first);
  fs.rmSync(dir, { recursive: true, force: true });
});
