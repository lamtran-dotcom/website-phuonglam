// Shopee-style variant editing for the product admin: up to two option groups
// ("Phân loại 1", "Phân loại 2"), each with its own values; the variant table shows every
// combination and each combination is either sold (a variant exists) or not.
//
// Data shape (same as data/products.json and the storefront):
//   optionGroups: [{ name, values: [] }]
//   variants: [{ id, name, sku, price, originalPrice, weight, image, options: { [group]: value } }]
//   optionImages: { [group]: { [value]: '/assets/...' } }
// Sparse data is allowed: a combination without a variant is simply not for sale.
// Functions mutate the product they are given.

export const MAX_GROUPS = 2;
export const MAX_VALUES = 50;
const SEPARATOR = '\u0001';

let idCounter = 0;
const newVariantId = (product) => `${product.id}_v${Date.now().toString(36)}${(idCounter += 1)}`;

const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();
const activeGroups = (product) => (product.optionGroups || []).filter((g) => g.values.length);
export const generatedName = (groups, options) => groups.map((g) => options[g.name]).filter(Boolean).join(' - ');
export const comboKey = (groups, options) => groups.map((g) => options?.[g.name] ?? '').join(SEPARATOR);

// Every combination of the values of the groups that have values, in display order.
export const combinations = (product) => activeGroups(product).reduce(
  (combos, group) => combos.flatMap((combo) => group.values.map((value) => ({ ...combo, [group.name]: value }))),
  [{}],
).filter((combo) => Object.keys(combo).length);

export const findVariant = (product, options) => {
  const groups = activeGroups(product);
  const key = comboKey(groups, options);
  return (product.variants || []).find((v) => comboKey(groups, v.options) === key);
};

// Products imported without option groups list their variants by name only. Before any
// structural edit they become one group "Phân loại" whose values are those names.
export const ensureGroups = (product) => {
  product.optionGroups ||= [];
  product.variants ||= [];
  product.optionImages ||= {};
  if (product.optionGroups.length || !product.variants.length) return product;
  const name = 'Phân loại';
  const values = [];
  for (const variant of product.variants) {
    let value = clean(variant.name) || 'Mặc định';
    for (let n = 2; values.includes(value); n += 1) value = `${clean(variant.name)} ${n}`;
    values.push(value);
    variant.options = { [name]: value };
    if (variant.image) (product.optionImages[name] ||= {})[value] = variant.image;
  }
  product.optionGroups = [{ name, values }];
  return product;
};

// Price/weight for a new combination: copy the closest sold variant (same value in the
// first group if possible), otherwise the product's own fields.
const template = (product, options) => {
  const groups = activeGroups(product);
  const sameFirst = groups[0] && product.variants.find((v) => v.options?.[groups[0].name] === options[groups[0].name]);
  const source = sameFirst || product.variants[0];
  return source
    ? { price: source.price, originalPrice: source.originalPrice ?? null, weight: source.weight ?? null }
    : { price: product.price || 0, originalPrice: product.originalPrice ?? null, weight: product.weight ?? null };
};

const createVariant = (product, options) => {
  const groups = activeGroups(product);
  const image = groups.map((g) => product.optionImages?.[g.name]?.[options[g.name]]).find(Boolean) || '';
  const variant = { id: newVariantId(product), name: generatedName(groups, options), sku: '', ...template(product, options), image, options: { ...options } };
  product.variants.push(variant);
  return variant;
};

// Keeps product.price / originalPrice equal to the cheapest variant on sale, which is
// what the storefront shows as "from" price.
export const syncProductPrice = (product) => {
  const onSale = (product.variants || []).filter((v) => Number(v.price) > 0);
  if (!onSale.length) return;
  const cheapest = onSale.reduce((best, v) => (v.price < best.price ? v : best));
  product.price = cheapest.price;
  product.originalPrice = cheapest.originalPrice ?? null;
};

// Drops options for groups that no longer exist or have no values, then removes variants
// that collapse onto the same combination (first one wins). Variants whose value is not in
// the group list are kept: the storefront already hides them and only the owner should
// delete them (see orphanVariants).
const normalize = (product) => {
  const groups = activeGroups(product);
  const seen = new Set();
  product.variants = product.variants.filter((variant) => {
    const options = {};
    for (const group of groups) {
      if (variant.options?.[group.name] !== undefined) options[group.name] = variant.options[group.name];
    }
    variant.options = options;
    const key = comboKey(groups, options);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  for (const name of Object.keys(product.optionImages || {})) {
    if (!groups.some((g) => g.name === name)) delete product.optionImages[name];
  }
  if (!groups.length) product.variants = [];
  syncProductPrice(product);
};

export const addGroup = (product) => {
  ensureGroups(product);
  if (product.optionGroups.length >= MAX_GROUPS) throw new Error(`Tối đa ${MAX_GROUPS} nhóm phân loại`);
  let name = product.optionGroups.length ? 'Phân loại 2' : 'Phân loại';
  for (let n = 2; product.optionGroups.some((g) => g.name === name); n += 1) name = `Phân loại ${n}`;
  product.optionGroups.push({ name, values: [] });
  return product;
};

export const removeGroup = (product, groupIndex) => {
  ensureGroups(product);
  const [group] = product.optionGroups.splice(groupIndex, 1);
  if (!group) return product;
  const remaining = activeGroups(product);
  if (!remaining.length) {
    // Back to a product without variants: keep the cheapest price and the first weight.
    syncProductPrice(product);
    const weight = product.variants.find((v) => v.weight)?.weight;
    if (!product.weight && weight) product.weight = weight;
    product.variants = [];
    product.optionGroups = [];
    product.optionImages = {};
    return product;
  }
  for (const variant of product.variants) {
    delete variant.options[group.name];
    variant.name = generatedName(remaining, variant.options) || variant.name;
  }
  normalize(product);
  return product;
};

export const renameGroup = (product, groupIndex, newName) => {
  ensureGroups(product);
  const group = product.optionGroups[groupIndex];
  const name = clean(newName);
  if (!name) throw new Error('Tên nhóm phân loại không được để trống');
  if (product.optionGroups.some((g, i) => i !== groupIndex && g.name === name)) throw new Error('Hai nhóm phân loại không được trùng tên');
  if (name === group.name) return product;
  for (const variant of product.variants) {
    if (variant.options && group.name in variant.options) {
      variant.options[name] = variant.options[group.name];
      delete variant.options[group.name];
    }
  }
  if (product.optionImages?.[group.name]) {
    product.optionImages[name] = product.optionImages[group.name];
    delete product.optionImages[group.name];
  }
  group.name = name;
  return product;
};

export const addValue = (product, groupIndex, rawValue) => {
  ensureGroups(product);
  const group = product.optionGroups[groupIndex];
  const value = clean(rawValue);
  if (!value) return product;
  if (group.values.includes(value)) throw new Error(`"${value}" đã có trong nhóm ${group.name}`);
  if (group.values.length >= MAX_VALUES) throw new Error(`Tối đa ${MAX_VALUES} lựa chọn mỗi nhóm`);
  const wasEmpty = group.values.length === 0;
  group.values.push(value);
  const groups = activeGroups(product);

  if (wasEmpty && product.variants.length) {
    // First value of a new group: existing variants take that value and keep their data.
    for (const variant of product.variants) {
      variant.options = { ...variant.options, [group.name]: value };
      variant.name = generatedName(groups, variant.options);
    }
  } else {
    // Sell every new combination that includes this value.
    for (const combo of combinations(product)) {
      if (combo[group.name] === value && !findVariant(product, combo)) createVariant(product, combo);
    }
  }
  normalize(product);
  return product;
};

export const renameValue = (product, groupIndex, valueIndex, rawValue) => {
  ensureGroups(product);
  const group = product.optionGroups[groupIndex];
  const oldValue = group.values[valueIndex];
  const value = clean(rawValue);
  if (!value) throw new Error('Tên lựa chọn không được để trống (bấm ✕ để xoá)');
  if (value === oldValue) return product;
  if (group.values.includes(value)) throw new Error(`"${value}" đã có trong nhóm ${group.name}`);
  const groups = activeGroups(product);
  for (const variant of product.variants) {
    if (variant.options?.[group.name] !== oldValue) continue;
    const oldName = generatedName(groups, variant.options);
    variant.options[group.name] = value;
    if (variant.name === oldName || variant.name === oldValue) variant.name = generatedName(groups, variant.options);
  }
  group.values[valueIndex] = value;
  const images = product.optionImages?.[group.name];
  if (images && oldValue in images) {
    images[value] = images[oldValue];
    delete images[oldValue];
  }
  return product;
};

export const removeValue = (product, groupIndex, valueIndex) => {
  ensureGroups(product);
  const group = product.optionGroups[groupIndex];
  const [value] = group.values.splice(valueIndex, 1);
  product.variants = product.variants.filter((v) => v.options?.[group.name] !== value);
  if (product.optionImages?.[group.name]) delete product.optionImages[group.name][value];
  if (!group.values.length) {
    // An empty group no longer splits the variants.
    for (const variant of product.variants) delete variant.options[group.name];
  }
  normalize(product);
  return product;
};

export const moveValue = (product, groupIndex, valueIndex, step) => {
  ensureGroups(product);
  const values = product.optionGroups[groupIndex].values;
  const target = valueIndex + step;
  if (target < 0 || target >= values.length) return product;
  [values[valueIndex], values[target]] = [values[target], values[valueIndex]];
  return product;
};

export const setValueImage = (product, groupIndex, value, image) => {
  ensureGroups(product);
  const group = product.optionGroups[groupIndex];
  const images = (product.optionImages[group.name] ||= {});
  const previous = images[value] || '';
  if (image) images[value] = image;
  else delete images[value];
  for (const variant of product.variants) {
    if (variant.options?.[group.name] === value && (!variant.image || variant.image === previous)) variant.image = image || '';
  }
  return product;
};

// Variants that match no combination of the current values (hidden on the storefront).
export const orphanVariants = (product) => {
  const groups = activeGroups(product);
  if (!groups.length) return [];
  return (product.variants || []).filter((v) => !groups.every((g) => g.values.includes(v.options?.[g.name])));
};

// Turn one combination on (create a variant) or off (remove it).
export const setComboOnSale = (product, options, onSale) => {
  ensureGroups(product);
  const existing = findVariant(product, options);
  if (onSale && !existing) createVariant(product, options);
  if (!onSale && existing) product.variants = product.variants.filter((v) => v !== existing);
  syncProductPrice(product);
  return product;
};
