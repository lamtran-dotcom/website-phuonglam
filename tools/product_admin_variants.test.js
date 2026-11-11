// Tests for workers/product-admin/public/variants.js (Shopee-style variant editing).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const load = () => import(pathToFileURL(path.join(__dirname, '..', 'workers', 'product-admin', 'public', 'variants.js')).href);

const plain = (extra = {}) => ({
  id: 'p1', name: 'Nến', price: 50000, originalPrice: 70000, weight: 300,
  optionGroups: [], optionImages: {}, variants: [], ...extra,
});
const sold = (p) => p.variants.map((v) => `${v.name}|${v.price}`).sort();

test('adding groups and values to a plain product builds the full table', async () => {
  const V = await load();
  const p = plain();
  V.addGroup(p);
  V.renameGroup(p, 0, 'Màu');
  V.addValue(p, 0, 'Trắng');
  V.addValue(p, 0, 'Vàng');
  assert.deepEqual(sold(p), ['Trắng|50000', 'Vàng|50000']);
  assert.equal(p.variants[0].weight, 300);

  V.addGroup(p);
  V.renameGroup(p, 1, 'Số lượng');
  V.addValue(p, 1, '20 viên');
  // First value of a new group is given to the existing rows (their data is kept).
  assert.deepEqual(sold(p), ['Trắng - 20 viên|50000', 'Vàng - 20 viên|50000']);
  p.variants[0].price = 60000;
  V.addValue(p, 1, '50 viên');
  assert.equal(p.variants.length, 4);
  assert.deepEqual(V.combinations(p).map((c) => `${c['Màu']}/${c['Số lượng']}`), ['Trắng/20 viên', 'Trắng/50 viên', 'Vàng/20 viên', 'Vàng/50 viên']);
  // New combinations copy the row with the same first-group value.
  assert.equal(V.findVariant(p, { Màu: 'Trắng', 'Số lượng': '50 viên' }).price, 60000);
  assert.equal(p.price, 50000);
  assert.throws(() => V.addGroup(p), /Tối đa 2/);
});

test('renaming keeps variant data, options, names and option images in step', async () => {
  const V = await load();
  const p = plain();
  V.addGroup(p);
  V.addValue(p, 0, 'Lài');
  V.addValue(p, 0, 'Sả');
  V.setValueImage(p, 0, 'Lài', '/assets/products/uploads/lai.webp');
  const lai = V.findVariant(p, { 'Phân loại': 'Lài' });
  lai.price = 99000;
  assert.equal(lai.image, '/assets/products/uploads/lai.webp');

  V.renameValue(p, 0, 0, 'Hoa lài');
  V.renameGroup(p, 0, 'Mùi hương');
  const renamed = V.findVariant(p, { 'Mùi hương': 'Hoa lài' });
  assert.equal(renamed, lai);
  assert.equal(renamed.price, 99000);
  assert.equal(renamed.name, 'Hoa lài');
  assert.deepEqual(p.optionImages, { 'Mùi hương': { 'Hoa lài': '/assets/products/uploads/lai.webp' } });
  assert.throws(() => V.renameValue(p, 0, 1, 'Hoa lài'), /đã có/);
  assert.throws(() => V.renameGroup(p, 0, '  '), /không được để trống/);
});

test('removing values and groups collapses the table; removing the last group makes a plain product', async () => {
  const V = await load();
  const p = plain();
  V.addGroup(p);
  V.renameGroup(p, 0, 'Size');
  ['S', 'M'].forEach((v) => V.addValue(p, 0, v));
  V.addGroup(p);
  V.renameGroup(p, 1, 'Màu');
  ['Đỏ', 'Xanh'].forEach((v) => V.addValue(p, 1, v));
  V.findVariant(p, { Size: 'S', Màu: 'Đỏ' }).price = 40000;
  V.findVariant(p, { Size: 'M', Màu: 'Đỏ' }).weight = 900;
  assert.equal(p.variants.length, 4);

  V.removeValue(p, 1, 1); // drop Xanh
  assert.equal(p.variants.length, 2);
  V.removeGroup(p, 1); // drop Màu
  assert.deepEqual(p.variants.map((v) => v.options), [{ Size: 'S' }, { Size: 'M' }]);
  assert.equal(p.variants[0].name, 'S');
  assert.equal(p.price, 40000);

  V.removeGroup(p, 0);
  assert.deepEqual([p.variants, p.optionGroups, p.price], [[], [], 40000]);
});

test('combinations can be switched off and on without touching the others', async () => {
  const V = await load();
  const p = plain();
  V.addGroup(p);
  ['A', 'B'].forEach((v) => V.addValue(p, 0, v));
  V.setComboOnSale(p, { 'Phân loại': 'A' }, false);
  assert.deepEqual(p.variants.map((v) => v.name), ['B']);
  V.setComboOnSale(p, { 'Phân loại': 'A' }, true);
  assert.deepEqual(p.variants.map((v) => v.name).sort(), ['A', 'B']);
});

test('imported products without groups become one "Phân loại" group on first edit', async () => {
  const V = await load();
  const p = plain({
    variants: [
      { id: 'v1', name: '100g', price: 30000, weight: 120, image: '/assets/a.webp', options: {} },
      { id: 'v2', name: '200g', price: 55000, weight: 230, image: '', options: {} },
    ],
  });
  V.addValue(V.ensureGroups(p), 0, '500g');
  assert.deepEqual(p.optionGroups, [{ name: 'Phân loại', values: ['100g', '200g', '500g'] }]);
  assert.deepEqual(p.variants.map((v) => [v.id.startsWith('p1_v') ? 'new' : v.id, v.options['Phân loại'], v.price]), [
    ['v1', '100g', 30000], ['v2', '200g', 55000], ['new', '500g', 30000],
  ]);
  assert.deepEqual(p.optionImages, { 'Phân loại': { '100g': '/assets/a.webp' } });
});

test('variants outside the value list are kept and reported, never deleted silently', async () => {
  const V = await load();
  const p = plain({
    optionGroups: [{ name: 'Màu', values: ['Trắng'] }],
    variants: [
      { id: 'v1', name: 'Trắng', price: 1000, options: { Màu: 'Trắng' } },
      { id: 'v2', name: 'Vàng', price: 1000, options: { Màu: 'Vàng' } },
    ],
  });
  V.addValue(p, 0, 'Đỏ');
  assert.deepEqual(p.variants.map((v) => v.id).slice(0, 2), ['v1', 'v2']);
  assert.deepEqual(V.orphanVariants(p).map((v) => v.id), ['v2']);
});

test('every real product survives a no-op structural edit unchanged', async () => {
  const V = await load();
  const products = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'products.json'), 'utf8'));
  for (const original of products.filter((p) => p.optionGroups?.length)) {
    const p = JSON.parse(JSON.stringify(original));
    V.addValue(p, 0, 'Lựa chọn tạm');
    V.removeValue(p, 0, p.optionGroups[0].values.length - 1);
    assert.deepEqual(p.variants.map((v) => v.id), original.variants.map((v) => v.id), original.name);
    assert.deepEqual(p.optionGroups, original.optionGroups, original.name);
  }
});
