const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { DEFAULT_SHIPPING, normalizeShippingSettings } = require('./shipping_settings');
const { mergePendingAdminSettings, recordAdminSettingsChanges } = require('./admin_product_push');

test('shipping settings fall back per field and drop unknown keys', () => {
  assert.deepEqual(normalizeShippingSettings(), { ...DEFAULT_SHIPPING });
  assert.deepEqual(
    normalizeShippingSettings({ firstKgFee: '20000', extraKgFee: -1, expressFee: 'x', hcmFreeWeight: 4999.6, junk: 1 }),
    { ...DEFAULT_SHIPPING, firstKgFee: 20000, hcmFreeWeight: 5000 },
  );
});

test('admin shipping edits travel through the Push Git settings journal', () => {
  const before = { featuredIds: [], shipping: { ...DEFAULT_SHIPPING } };
  const after = { featuredIds: [], shipping: { ...DEFAULT_SHIPPING, extraKgFee: 5000 } };
  const pending = recordAdminSettingsChanges(null, before, after);
  assert.deepEqual(Object.keys(pending.fields), ['shipping']);
  const merged = mergePendingAdminSettings(before, pending);
  assert.equal(merged.settings.shipping.extraKgFee, 5000);
});

test('app.jsx carries the shipping bake marker and no hard-coded rule names', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'app.jsx'), 'utf8');
  assert.match(source, /\/\*BAKED_SHIPPING\*\/[\s\S]*?\/\*END_BAKED_SHIPPING\*\//);
  assert.doesNotMatch(source, /overweightFee|urgentFee|freeWeightLimit\[/);
  assert.doesNotMatch(source, /1–4 giờ|4 tiếng/);
});
