// Shipping fee settings (grams and VND). Kept in data/settings.json under `shipping`,
// edited in the admin and baked into app.jsx by the build.
const DEFAULT_SHIPPING = Object.freeze({
  hcmFreeWeight: 5000,
  otherFreeWeight: 3000,
  firstKgFee: 16000,
  extraKgFee: 4000,
  expressFee: 15000,
  defaultItemWeight: 500,
});

const SHIPPING_LIMITS = Object.freeze({
  hcmFreeWeight: 100000,
  otherFreeWeight: 100000,
  firstKgFee: 1000000,
  extraKgFee: 1000000,
  expressFee: 1000000,
  defaultItemWeight: 50000,
});

// Unknown keys are dropped; a missing or invalid number falls back to its default.
const normalizeShippingSettings = (value = {}) => {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const result = {};
  for (const [key, fallback] of Object.entries(DEFAULT_SHIPPING)) {
    const number = Number(source[key]);
    result[key] = Number.isFinite(number) && number >= 0 && number <= SHIPPING_LIMITS[key]
      ? Math.round(number)
      : fallback;
  }
  return result;
};

module.exports = { DEFAULT_SHIPPING, SHIPPING_LIMITS, normalizeShippingSettings };
