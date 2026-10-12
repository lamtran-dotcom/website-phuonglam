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

test('static product pages store a slim cart item instead of the whole product', () => {
  const html = renderProductPage({ product: product({ description: 'x'.repeat(5000) }), categoryName: 'Nến thơm' });
  const script = html.slice(html.indexOf('const cartBase'));
  assert.ok(script.length > 0, 'cart script missing');
  assert.doesNotMatch(script.slice(0, script.indexOf('const readCart')), /\.\.\.product\b/);
});

test('policy and contact pages carry only confirmed facts and are listed for the sitemap', () => {
  const { INFO_PAGES, infoPageUrls, renderInfoPage } = require('./build_static_site');
  assert.deepEqual(infoPageUrls(), [
    'https://phuonglam.com/chinh-sach-doi-tra/',
    'https://phuonglam.com/chinh-sach-van-chuyen/',
    'https://phuonglam.com/lien-he/',
  ]);
  const html = Object.fromEntries(INFO_PAGES.map(page => [page.path, renderInfoPage(page)]));
  assert.match(html['chinh-sach-doi-tra'], /7 ngày/);
  assert.match(html['chinh-sach-doi-tra'], /miễn phí đổi trả/i);
  assert.match(html['chinh-sach-doi-tra'], /chưa sử dụng/);
  assert.match(html['chinh-sach-doi-tra'], /còn nguyên bao bì/);
  assert.match(html['chinh-sach-van-chuyen'], /hỏa tốc trong 1 giờ/);
  assert.match(html['chinh-sach-van-chuyen'], /1–3 ngày/);
  assert.match(html['lien-he'], /https:\/\/zalo\.me\/0773829593/);
  for (const [dir, page] of Object.entries(html)) {
    assert.match(page, new RegExp(`<link rel="canonical" href="https://phuonglam\\.com/${dir}/" />`));
    assert.doesNotMatch(page, /name="robots"/);
  }
});

test('category order is fixed by the owner and shared by the site data, admin list and fallback names', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const expected = ['nen-thom', 'combo', 'thao-moc-xong', 'go-thom', 'phu-kien', 'tui-thom', 'bep-xong', 'nu-tram', 'nen-tru', 'nen-ly'];
  const root = path.join(__dirname, '..');
  const siteData = fs.readFileSync(path.join(root, 'assets/js/site-data.js'), 'utf8').match(/const CATEGORIES = \[([\s\S]*?)\n\];/)[1];
  assert.deepEqual([...siteData.matchAll(/id: '([^']+)'/g)].map(m => m[1]), expected);
  const admin = fs.readFileSync(path.join(root, 'admin-upload.html'), 'utf8').match(/const CATEGORIES = \[([\s\S]*?)\n    \];/)[1];
  assert.deepEqual([...admin.matchAll(/\['([^']+)'/g)].map(m => m[1]), expected);
});

test('structured content renders a fixed outline whose navigation labels equal the section titles', () => {
  const { composeDescription, normalizeProductContent } = require('./product_content');
  const content = {
    intro: 'Nến viên nhỏ, cháy khoảng 4 giờ.',
    highlights: ['Không khói', '- Không mùi'],
    specs: ['Thời gian cháy: khoảng 4 giờ', { label: 'Vỏ', value: 'nhôm' }, 'dòng sai'],
    steps: ['1. Đặt nến', 'Châm lửa'],
    care: 'Không để gần vật dễ cháy\n\nBảo quản nơi khô ráo',
  };
  const normalized = normalizeProductContent(content);
  assert.deepEqual(normalized.highlights, ['Không khói', 'Không mùi']);
  assert.deepEqual(normalized.specs, [{ label: 'Thời gian cháy', value: 'khoảng 4 giờ' }, { label: 'Vỏ', value: 'nhôm' }]);
  assert.deepEqual(normalized.steps, ['Đặt nến', 'Châm lửa']);
  assert.equal(normalizeProductContent({ intro: '  ' }), null);
  assert.match(composeDescription(content), /^Nến viên nhỏ[\s\S]*Thông số:\n- Thời gian cháy: khoảng 4 giờ[\s\S]*Cách dùng:\n1\. Đặt nến/);

  const html = renderProductPage({ product: product({ content, description: 'MÔ TẢ CŨ KHÔNG ĐƯỢC HIỆN' }), categoryName: 'Nến' });
  const nav = [...html.match(/<nav class="product-content-nav"[\s\S]*?<\/nav>/)[0].matchAll(/>([^<]+)<\/a>/g)].map(m => m[1]);
  assert.deepEqual(nav, ['Giới thiệu', 'Thông số', 'Cách dùng', 'Lưu ý &amp; bảo quản']);
  for (const title of ['Giới thiệu', 'Thông số', 'Cách dùng', 'Lưu ý &amp; bảo quản']) assert.match(html, new RegExp(`<h2[^>]*>${title}</h2>`));
  assert.match(html, /<th scope="row">Thời gian cháy<\/th><td>khoảng 4 giờ<\/td>/);
  const readingColumn = html.slice(html.indexOf('product-reading-column'), html.indexOf('</main>'));
  assert.doesNotMatch(readingColumn, /MÔ TẢ CŨ KHÔNG ĐƯỢC HIỆN/);
  assert.doesNotMatch(html.slice(html.indexOf('const product = ')), /MÔ TẢ CŨ|"content"/, 'buy script must not carry long text');

  const legacy = renderProductPage({ product: product({ description: 'Mô tả tự do cũ.' }), categoryName: 'Nến' });
  assert.match(legacy, /Mô tả tự do cũ\./);
});
