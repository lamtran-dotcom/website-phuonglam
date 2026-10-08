const { isDeepStrictEqual } = require('node:util');
const crypto = require('node:crypto');

const clone = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));
const has = (value, key) => Object.prototype.hasOwnProperty.call(value || {}, key);

const collectProductImagePaths = (value, paths = new Set()) => {
  if (typeof value === 'string' && value.startsWith('/assets/products/')) paths.add(value);
  else if (Array.isArray(value)) value.forEach((item) => collectProductImagePaths(item, paths));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => collectProductImagePaths(item, paths));
  return paths;
};

const recordVariantChanges = (pendingVariants, beforeVariants = [], afterVariants = []) => {
  const changes = clone(pendingVariants || {});
  const beforeById = new Map(beforeVariants.map((variant) => [String(variant.id), variant]));
  const afterById = new Map(afterVariants.map((variant) => [String(variant.id), variant]));
  for (const [id, variant] of afterById) {
    const before = beforeById.get(id);
    const existing = changes[id];
    if (!before) {
      changes[id] = { kind: 'add', variant: clone(variant) };
      continue;
    }
    if (existing?.kind === 'add') {
      existing.variant = clone(variant);
      continue;
    }
    const changedFields = [...new Set([...Object.keys(before), ...Object.keys(variant)])]
      .filter((key) => has(before, key) !== has(variant, key) || !isDeepStrictEqual(before[key], variant[key]));
    if (!changedFields.length) continue;
    const entry = existing?.kind === 'update' ? existing : { kind: 'update', fields: {} };
    for (const key of changedFields) {
      const field = entry.fields[key] || { beforePresent: has(before, key), before: clone(before[key]) };
      field.afterPresent = has(variant, key);
      field.after = clone(variant[key]);
      entry.fields[key] = field;
    }
    changes[id] = entry;
  }
  for (const [id, variant] of beforeById) {
    if (afterById.has(id)) continue;
    if (changes[id]?.kind === 'add') delete changes[id];
    else changes[id] = { kind: 'delete', variant: clone(variant) };
  }
  return changes;
};

const recordProductChanges = (pending, beforeProducts, afterProducts) => {
  const next = pending?.version === 1 && pending.products && typeof pending.products === 'object'
    ? clone(pending)
    : { version: 1, products: {} };
  const beforeById = new Map(beforeProducts.map((product) => [String(product.id), product]));
  const afterById = new Map(afterProducts.map((product) => [String(product.id), product]));

  for (const [id, product] of afterById) {
    const before = beforeById.get(id);
    const existing = next.products[id];
    if (!before) {
      next.products[id] = { kind: 'add', product: clone(product) };
      continue;
    }
    const changedFields = [...new Set([...Object.keys(before), ...Object.keys(product)])]
      .filter((key) => key !== 'variants'
        && (has(before, key) !== has(product, key) || !isDeepStrictEqual(before[key], product[key])));
    const variantChanges = recordVariantChanges(existing?.kind === 'update' ? existing.variants : null, before.variants, product.variants);
    const hasVariantChanges = Object.keys(variantChanges).length > 0;
    if (!changedFields.length && !hasVariantChanges) continue;
    if (existing?.kind === 'add') {
      existing.product = clone(product);
      continue;
    }
    const entry = existing?.kind === 'update'
      ? existing
      : { kind: 'update', beforeProduct: clone(before), fields: {} };
    for (const key of changedFields) {
      const field = entry.fields[key] || {
        beforePresent: has(before, key),
        before: clone(before[key]),
      };
      field.afterPresent = has(product, key);
      field.after = clone(product[key]);
      entry.fields[key] = field;
    }
    if (hasVariantChanges) entry.variants = variantChanges;
    next.products[id] = entry;
  }

  for (const [id, product] of beforeById) {
    if (afterById.has(id)) continue;
    if (next.products[id]?.kind === 'add') delete next.products[id];
    else next.products[id] = { kind: 'delete', product: clone(product) };
  }
  return next;
};

const mergePendingProductChanges = (remoteProducts, pending) => {
  if (pending?.version !== 1 || !pending.products || typeof pending.products !== 'object') {
    throw new Error('Danh sách thay đổi sản phẩm đang chờ không hợp lệ.');
  }
  const products = clone(remoteProducts);
  const byId = new Map(products.map((product, index) => [String(product.id), index]));
  const changedProductIds = [];
  const newImagePaths = new Set();
  const conflicts = [];

  for (const [id, change] of Object.entries(pending.products)) {
    const index = byId.get(id);
    if (change.kind === 'add') {
      if (index !== undefined) {
        if (!isDeepStrictEqual(products[index], change.product)) conflicts.push(`${id} (sản phẩm đã tồn tại trên web)`);
        continue;
      }
      products.push(clone(change.product));
      byId.set(id, products.length - 1);
      collectProductImagePaths(change.product, newImagePaths);
      changedProductIds.push(id);
      continue;
    }

    if (change.kind === 'delete') {
      if (index === undefined) continue;
      if (!isDeepStrictEqual(products[index], change.product)) {
        conflicts.push(`${id} (sản phẩm đã được thay đổi trên web)`);
        continue;
      }
      products.splice(index, 1);
      byId.clear();
      products.forEach((product, productIndex) => byId.set(String(product.id), productIndex));
      changedProductIds.push(id);
      continue;
    }

    if (change.kind !== 'update' || !change.fields || typeof change.fields !== 'object') {
      conflicts.push(`${id} (bản cập nhật không hợp lệ)`);
      continue;
    }
    if (index === undefined) {
      conflicts.push(`${id} (không còn trên web)`);
      continue;
    }
    const current = products[index];
    const updated = clone(current);
    let changed = false;
    for (const [key, field] of Object.entries(change.fields)) {
      const currentPresent = has(current, key);
      const alreadyApplied = currentPresent === field.afterPresent
        && (!currentPresent || isDeepStrictEqual(current[key], field.after));
      if (alreadyApplied) continue;
      const matchesBefore = currentPresent === field.beforePresent
        && (!currentPresent || isDeepStrictEqual(current[key], field.before));
      if (!matchesBefore) {
        conflicts.push(`${id}.${key} (đã được thay đổi trên web)`);
        continue;
      }
      if (field.afterPresent) updated[key] = clone(field.after);
      else delete updated[key];
      changed = true;
      if (/(?:image|variant|optionGroup)/i.test(key)) {
        const beforeImages = collectProductImagePaths(field.before);
        for (const imagePath of collectProductImagePaths(field.after)) {
          if (!beforeImages.has(imagePath)) newImagePaths.add(imagePath);
        }
      }
    }
    if (change.variants && typeof change.variants === 'object') {
      const variants = Array.isArray(updated.variants) ? clone(updated.variants) : [];
      for (const [variantId, variantChange] of Object.entries(change.variants)) {
        const variantIndex = variants.findIndex((variant) => String(variant.id) === variantId);
        if (variantChange.kind === 'add') {
          if (variantIndex !== -1) {
            if (!isDeepStrictEqual(variants[variantIndex], variantChange.variant)) conflicts.push(`${id}.variants.${variantId} (đã tồn tại trên web)`);
            continue;
          }
          variants.push(clone(variantChange.variant));
          collectProductImagePaths(variantChange.variant, newImagePaths);
          changed = true;
          continue;
        }
        if (variantChange.kind === 'delete') {
          if (variantIndex === -1) continue;
          if (!isDeepStrictEqual(variants[variantIndex], variantChange.variant)) {
            conflicts.push(`${id}.variants.${variantId} (đã được thay đổi trên web)`);
            continue;
          }
          variants.splice(variantIndex, 1);
          changed = true;
          continue;
        }
        if (variantChange.kind !== 'update' || !variantChange.fields || typeof variantChange.fields !== 'object') {
          conflicts.push(`${id}.variants.${variantId} (bản cập nhật không hợp lệ)`);
          continue;
        }
        if (variantIndex === -1) {
          conflicts.push(`${id}.variants.${variantId} (không còn trên web)`);
          continue;
        }
        const currentVariant = variants[variantIndex];
        const updatedVariant = clone(currentVariant);
        let variantChanged = false;
        for (const [variantField, field] of Object.entries(variantChange.fields)) {
          const currentPresent = has(currentVariant, variantField);
          const alreadyApplied = currentPresent === field.afterPresent
            && (!currentPresent || isDeepStrictEqual(currentVariant[variantField], field.after));
          if (alreadyApplied) continue;
          const matchesBefore = currentPresent === field.beforePresent
            && (!currentPresent || isDeepStrictEqual(currentVariant[variantField], field.before));
          if (!matchesBefore) {
            conflicts.push(`${id}.variants.${variantId}.${variantField} (đã được thay đổi trên web)`);
            continue;
          }
          if (field.afterPresent) updatedVariant[variantField] = clone(field.after);
          else delete updatedVariant[variantField];
          variantChanged = true;
          if (/image/i.test(variantField)) {
            const beforeImages = collectProductImagePaths(field.before);
            for (const imagePath of collectProductImagePaths(field.after)) {
              if (!beforeImages.has(imagePath)) newImagePaths.add(imagePath);
            }
          }
        }
        if (variantChanged) {
          variants[variantIndex] = updatedVariant;
          changed = true;
        }
      }
      if (changed) updated.variants = variants;
    }
    if (changed) {
      products[index] = updated;
      changedProductIds.push(id);
    }
  }

  if (conflicts.length) {
    throw new Error(`Không thể gộp an toàn sản phẩm đã sửa: ${conflicts.slice(0, 8).join(', ')}. Tải lại dữ liệu sản phẩm rồi lưu lại.`);
  }
  return { products, changedProductIds, newImagePaths: [...newImagePaths] };
};

const createImageOnlyChanges = (remoteProducts, localProducts) => {
  const localById = new Map(localProducts.map((product) => [String(product.id), product]));
  const imageOnlyProducts = remoteProducts.map((remote) => {
    const local = localById.get(String(remote.id));
    if (!local) return remote;
    const next = clone(remote);
    if (Array.isArray(local.images) && !isDeepStrictEqual(local.images, remote.images)) next.images = clone(local.images);
    if (Array.isArray(remote.variants) && Array.isArray(local.variants)) {
      const localVariants = new Map(local.variants.map((variant) => [String(variant.id), variant]));
      next.variants = remote.variants.map((variant) => {
        const localVariant = localVariants.get(String(variant.id));
        return localVariant && !isDeepStrictEqual(localVariant.image, variant.image)
          ? { ...variant, image: clone(localVariant.image) }
          : variant;
      });
    }
    if (local.optionImages && remote.optionImages && !isDeepStrictEqual(local.optionImages, remote.optionImages)) {
      const nextOptionImages = clone(remote.optionImages);
      for (const [group, images] of Object.entries(local.optionImages)) {
        if (!remote.optionImages[group]) nextOptionImages[group] = clone(images);
        else {
          for (const [value, image] of Object.entries(images || {})) {
            if (!isDeepStrictEqual(remote.optionImages[group][value], image)) {
              nextOptionImages[group][value] = clone(image);
            }
          }
        }
      }
      next.optionImages = nextOptionImages;
    }
    return next;
  });
  return recordProductChanges(null, remoteProducts, imageOnlyProducts);
};

const recordAdminSettingsChanges = (pending, beforeSettings, afterSettings) => {
  const next = pending?.version === 1 && pending.fields && typeof pending.fields === 'object'
    ? clone(pending)
    : { version: 1, fields: {} };
  for (const key of ['featuredIds', 'headerImages', 'categoryImages']) {
    if (isDeepStrictEqual(beforeSettings?.[key], afterSettings?.[key])) continue;
    const field = next.fields[key] || { beforePresent: has(beforeSettings, key), before: clone(beforeSettings?.[key]) };
    field.afterPresent = has(afterSettings, key);
    field.after = clone(afterSettings?.[key]);
    if (field.beforePresent === field.afterPresent
      && (!field.beforePresent || isDeepStrictEqual(field.before, field.after))) delete next.fields[key];
    else next.fields[key] = field;
  }
  return next;
};

const mergePendingAdminSettings = (remoteSettings, pending) => {
  if (pending?.version !== 1 || !pending.fields || typeof pending.fields !== 'object') {
    throw new Error('Cài đặt admin đang chờ không hợp lệ.');
  }
  const settings = clone(remoteSettings || {});
  const imagePaths = new Set();
  const conflicts = [];
  let changed = false;
  for (const [key, field] of Object.entries(pending.fields)) {
    if (!['featuredIds', 'headerImages', 'categoryImages'].includes(key)) {
      conflicts.push(`${key} (cài đặt không được hỗ trợ)`);
      continue;
    }
    const currentPresent = has(settings, key);
    const alreadyApplied = currentPresent === field.afterPresent
      && (!currentPresent || isDeepStrictEqual(settings[key], field.after));
    if (alreadyApplied) continue;
    const matchesBefore = currentPresent === field.beforePresent
      && (!currentPresent || isDeepStrictEqual(settings[key], field.before));
    if (!matchesBefore) {
      conflicts.push(`${key} (đã được thay đổi trên web)`);
      continue;
    }
    if (field.afterPresent) settings[key] = clone(field.after);
    else delete settings[key];
    changed = true;
    const beforeImages = collectProductImagePaths(field.before);
    for (const imagePath of collectProductImagePaths(field.after)) {
      if (!beforeImages.has(imagePath)) imagePaths.add(imagePath);
    }
  }
  if (conflicts.length) throw new Error(`Không thể gộp cài đặt admin an toàn: ${conflicts.join(', ')}.`);
  return { settings, newImagePaths: [...imagePaths], changed };
};

const recordBlogPostChanges = (pending, beforePosts = [], afterPosts = []) => {
  const next = pending?.version === 1 ? clone(pending) : { version: 1 };
  if (!next.posts || typeof next.posts !== 'object') next.posts = {};
  const beforeBySlug = new Map(beforePosts.map((post) => [String(post.slug), post]));
  const afterBySlug = new Map(afterPosts.map((post) => [String(post.slug), post]));
  for (const slug of new Set([...beforeBySlug.keys(), ...afterBySlug.keys()])) {
    const before = beforeBySlug.get(slug);
    const after = afterBySlug.get(slug);
    if (isDeepStrictEqual(before, after)) continue;
    const existing = next.posts[slug];
    const originalBefore = existing ? (existing.beforePresent ? existing.before : undefined) : before;
    const change = {
      beforePresent: originalBefore !== undefined,
      before: clone(originalBefore),
      afterPresent: after !== undefined,
      after: clone(after),
    };
    if (change.beforePresent === change.afterPresent
      && (!change.beforePresent || isDeepStrictEqual(change.before, change.after))) delete next.posts[slug];
    else next.posts[slug] = change;
  }
  return next;
};

const mergePendingBlogPosts = (remotePosts, pending) => {
  if (pending?.version !== 1 || !pending.posts || typeof pending.posts !== 'object') {
    throw new Error('Bài viết admin đang chờ không hợp lệ.');
  }
  const posts = clone(remotePosts || []);
  const conflicts = [];
  const changedSlugs = [];
  for (const [slug, change] of Object.entries(pending.posts)) {
    const index = posts.findIndex((post) => String(post.slug) === slug);
    const current = index === -1 ? undefined : posts[index];
    const currentPresent = index !== -1;
    if (currentPresent === change.afterPresent && (!currentPresent || isDeepStrictEqual(current, change.after))) continue;
    if (currentPresent !== change.beforePresent || (currentPresent && !isDeepStrictEqual(current, change.before))) {
      conflicts.push(slug);
      continue;
    }
    if (!change.afterPresent) posts.splice(index, 1);
    else if (index === -1) posts.unshift(clone(change.after));
    else posts[index] = clone(change.after);
    changedSlugs.push(slug);
  }
  if (conflicts.length) throw new Error(`Bài viết đã thay đổi trên web: ${conflicts.join(', ')}.`);
  return { posts, changedSlugs };
};

const sha256 = (bytes) => (bytes == null ? null : crypto.createHash('sha256').update(bytes).digest('hex'));

const recordAdminFileChanges = (pending, changes = []) => {
  const next = pending?.version === 1 ? clone(pending) : { version: 1 };
  if (!next.files || typeof next.files !== 'object') next.files = {};
  for (const item of changes) {
    const existing = next.files[item.path];
    const beforeHash = existing ? existing.beforeHash : sha256(item.before);
    const afterHash = sha256(item.after);
    if (beforeHash === afterHash) delete next.files[item.path];
    else next.files[item.path] = { beforeHash, afterHash };
  }
  return next;
};

module.exports = {
  collectProductImagePaths,
  createImageOnlyChanges,
  mergePendingAdminSettings,
  mergePendingBlogPosts,
  mergePendingProductChanges,
  recordAdminFileChanges,
  recordAdminSettingsChanges,
  recordBlogPostChanges,
  recordProductChanges,
};
