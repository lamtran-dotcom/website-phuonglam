const assert = require('node:assert/strict');
const test = require('node:test');
const {
  createImageOnlyChanges,
  mergePendingAdminSettings,
  mergePendingBlogPosts,
  mergePendingProductChanges,
  recordAdminSettingsChanges,
  recordProductChanges,
} = require('./admin_product_push');

test('records admin product field changes and merges them without replacing newer remote fields', () => {
  const before = [{
    id: 'p-1',
    name: 'Sản phẩm',
    seoTitle: 'Tiêu đề cũ',
    images: ['/assets/products/uploads/old.webp'],
    variants: [{ id: 'v-1', image: '/assets/products/uploads/old-variant.webp' }],
  }];
  const after = [{
    ...before[0],
    images: ['/assets/products/uploads/new.webp'],
    variants: [{ id: 'v-1', image: '/assets/products/uploads/new-variant.webp' }],
  }];
  const pending = recordProductChanges(null, before, after);
  const remote = [{
    ...before[0],
    seoTitle: 'Tiêu đề mới trên web',
  }];

  const result = mergePendingProductChanges(remote, pending);

  assert.equal(result.products[0].seoTitle, 'Tiêu đề mới trên web');
  assert.deepEqual(result.products[0].images, ['/assets/products/uploads/new.webp']);
  assert.deepEqual(result.changedProductIds, ['p-1']);
  assert.deepEqual(result.newImagePaths, ['/assets/products/uploads/new.webp', '/assets/products/uploads/new-variant.webp']);
});

test('combines repeated edits while preserving the original value for conflict checks', () => {
  const before = [{ id: 'p-1', images: ['/assets/products/uploads/old.webp'] }];
  const first = [{ id: 'p-1', images: ['/assets/products/uploads/first.webp'] }];
  const second = [{ id: 'p-1', images: ['/assets/products/uploads/final.webp'] }];
  const pending = recordProductChanges(recordProductChanges(null, before, first), first, second);

  assert.equal(pending.products['p-1'].fields.images.before[0], '/assets/products/uploads/old.webp');
  assert.equal(pending.products['p-1'].fields.images.after[0], '/assets/products/uploads/final.webp');
});

test('refuses to overwrite a product field changed remotely after the admin loaded it', () => {
  const before = [{ id: 'p-1', images: ['/assets/products/uploads/old.webp'] }];
  const after = [{ id: 'p-1', images: ['/assets/products/uploads/new.webp'] }];
  const pending = recordProductChanges(null, before, after);
  const remote = [{ id: 'p-1', images: ['/assets/products/uploads/remote.webp'] }];

  assert.throws(() => mergePendingProductChanges(remote, pending), /đã được thay đổi trên web/);
});

test('derives image-only changes from an older local catalog and ignores stale prices', () => {
  const remote = [{
    id: 'p-1',
    price: 200,
    images: ['/assets/products/uploads/old.webp'],
    variants: [{ id: 'v-1', price: 250, image: '/assets/products/uploads/old-variant.webp' }],
  }];
  const local = [{
    id: 'p-1',
    price: 100,
    images: ['/assets/products/uploads/new.webp'],
    variants: [{ id: 'v-1', price: 150, image: '/assets/products/uploads/new-variant.webp' }],
  }];
  const pending = createImageOnlyChanges(remote, local);
  const merged = mergePendingProductChanges(remote, pending);

  assert.equal(merged.products[0].price, 200);
  assert.equal(merged.products[0].variants[0].price, 250);
  assert.deepEqual(merged.products[0].images, ['/assets/products/uploads/new.webp']);
  assert.equal(merged.products[0].variants[0].image, '/assets/products/uploads/new-variant.webp');
  assert.deepEqual(merged.newImagePaths, ['/assets/products/uploads/new.webp', '/assets/products/uploads/new-variant.webp']);
});

test('records new products and cancels an unsent product that was removed', () => {
  const product = { id: 'p-2', name: 'Mới', images: ['/assets/products/uploads/new.webp'] };
  const pending = recordProductChanges(null, [], [product]);
  assert.equal(pending.products['p-2'].kind, 'add');
  assert.deepEqual(mergePendingProductChanges([], pending).products, [product]);
  assert.deepEqual(recordProductChanges(pending, [product], []).products, {});
});

test('merges saved header, category and featured settings without replacing unrelated remote settings', () => {
  const before = { featuredIds: ['a'], headerImages: ['/assets/products/uploads/old.webp'], categoryImages: { 'tui-thom': '/assets/products/uploads/old-cat.webp' } };
  const after = { featuredIds: ['b'], headerImages: ['/assets/products/uploads/new.webp'], categoryImages: { 'tui-thom': '/assets/products/uploads/new-cat.webp' } };
  const pending = recordAdminSettingsChanges(null, before, after);
  const remote = { ...before, unrelated: 'keep me' };
  const merged = mergePendingAdminSettings(remote, pending);

  assert.deepEqual(merged.settings, { ...after, unrelated: 'keep me' });
  assert.deepEqual(merged.newImagePaths, ['/assets/products/uploads/new.webp', '/assets/products/uploads/new-cat.webp']);
  assert.equal(merged.changed, true);
  assert.throws(() => mergePendingAdminSettings({ ...remote, headerImages: ['/remote.webp'] }, pending), /headerImages/);
});

test('merges blog post changes by slug and detects edits to the same remote post', () => {
  const before = [{ slug: 'one', title: 'Old' }, { slug: 'two', title: 'Keep' }];
  const after = [{ slug: 'one', title: 'New' }, { slug: 'two', title: 'Keep' }];
  const pending = require('./admin_product_push').recordBlogPostChanges(null, before, after);
  const merged = mergePendingBlogPosts([{ slug: 'one', title: 'Old' }, { slug: 'two', title: 'Remote unrelated edit' }], pending);

  assert.deepEqual(merged.posts, [{ slug: 'one', title: 'New' }, { slug: 'two', title: 'Remote unrelated edit' }]);
  assert.deepEqual(merged.changedSlugs, ['one']);
  assert.throws(() => mergePendingBlogPosts([{ slug: 'one', title: 'Remote edit' }], pending), /one/);
});
