const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

// worker.js is an ES module deployed as-is to Cloudflare; load a copy as .mjs.
const loadWorker = async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'order-worker-'));
  const file = path.join(dir, 'worker.mjs');
  fs.copyFileSync(path.join(__dirname, '..', 'workers', 'order-webhook', 'worker.js'), file);
  return import(file);
};

const rules = { hcmFreeWeight: 5000, otherFreeWeight: 3000, firstKgFee: 16000, extraKgFee: 4000, expressFee: 15000, defaultItemWeight: 500 };
const pricing = {
  shipping: rules,
  products: {
    herb: { price: 25000, weight: 0, hidden: false, variants: { v50: { price: 23000, weight: 111 }, v1kg: { price: 330000, weight: 1100 } } },
    plain: { price: 41000, weight: 0, hidden: false, variants: {} },
    gone: { price: 10000, weight: 100, hidden: true, variants: {} },
  },
};

test('the Worker charges current web prices, not what the browser sent', async () => {
  const { priceOrder, itemsMessage } = await loadWorker();
  const order = {
    city: 'Hà Nội', deliveryMethod: 'Giao thường', subtotal: 15000 + 33000, shipping: 0, total: 48000,
    items: [
      { id: 'herb', variantId: 'v50', name: 'Hồi - Túi 50g', qty: 1, price: 15000 },
      { id: 'plain', variantId: '', name: 'Lá dứa', qty: 1, price: 33000 },
    ],
  };
  const checked = priceOrder(order, pricing);
  assert.equal(checked.verified, true);
  assert.deepEqual(checked.items.map(item => item.unitPrice), [23000, 41000]);
  assert.equal(checked.total, 64000);
  const message = itemsMessage('PL1111-0001', checked);
  assert.match(message, /THU COD: 64\.000đ/);
  assert.match(message, /khách thấy 15\.000đ\/cái/);
  assert.match(message, /Khách thấy tổng 48\.000đ, giá web hiện tại là 64\.000đ/);
});

test('shipping is recomputed with the same rule as the checkout', async () => {
  const { priceOrder, shippingFee } = await loadWorker();
  assert.equal(shippingFee({ weight: 3000, city: 'Hà Nội', express: false }, rules), 0);
  assert.equal(shippingFee({ weight: 3001, city: 'Hà Nội', express: false }, rules), 16000);
  assert.equal(shippingFee({ weight: 5500, city: 'Hà Nội', express: false }, rules), 16000 + 2 * 4000);
  assert.equal(shippingFee({ weight: 5000, city: 'Hồ Chí Minh', express: true }, rules), 15000);
  const order = { city: 'Đà Nẵng', deliveryMethod: 'Giao thường', subtotal: 990000, shipping: 0, total: 990000,
    items: [{ id: 'herb', variantId: 'v1kg', name: 'Hồi 1kg', qty: 3, price: 330000 }] };
  const checked = priceOrder(order, pricing);
  assert.equal(checked.shipping, 16000);
  assert.equal(checked.total, 1006000);
});

test('unknown or hidden items are flagged; a missing price list keeps the order and warns', async () => {
  const { priceOrder, itemsMessage } = await loadWorker();
  const order = { city: 'Huế', deliveryMethod: 'Giao thường', subtotal: 20000, shipping: 0, total: 20000,
    items: [{ id: 'nope', variantId: '', name: 'X', qty: 1, price: 10000 }, { id: 'gone', variantId: '', name: 'Y', qty: 1, price: 10000 }] };
  const message = itemsMessage('PL1111-0002', priceOrder(order, pricing));
  assert.match(message, /sản phẩm không còn trên web/);
  assert.match(message, /sản phẩm đang ẩn/);
  const offline = itemsMessage('PL1111-0003', priceOrder(order, null));
  assert.match(offline, /THU COD: 20\.000đ/);
  assert.match(offline, /Không đọc được bảng giá web/);
});

test('the build writes the price list the Worker reads', () => {
  const { writeOrderPricing } = require('./build_static_site');
  const target = path.join(__dirname, '..', 'assets', 'js', 'order-pricing.json');
  const before = fs.existsSync(target) ? fs.readFileSync(target) : null;
  try {
    writeOrderPricing([{ id: 'a', price: 1000, weight: 0, variants: [{ id: 'v', price: 900, weight: 0 }, { price: 800, weight: 50 }] }], rules);
    const data = JSON.parse(fs.readFileSync(target, 'utf8'));
    assert.deepEqual(data.shipping, rules);
    assert.deepEqual(data.products.a.variants, { v: { price: 900, weight: 0 }, variant_1: { price: 800, weight: 50 } });
  } finally {
    if (before) fs.writeFileSync(target, before); else fs.rmSync(target, { force: true });
  }
});
