const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const test = require('node:test');
const sourceRoot = path.resolve(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(sourceRoot, 'data/products.json')));
const { recordAdminFileChanges, recordBlogPostChanges } = require('./admin_product_push');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'phuonglam-admin-test-'));
  fs.mkdirSync(path.join(root, 'tools'));
  fs.mkdirSync(path.join(root, 'data'));
  fs.copyFileSync(path.join(__dirname, 'local_admin_server.js'), path.join(root, 'tools/local_admin_server.js'));
  fs.copyFileSync(path.join(__dirname, 'admin_product_push.js'), path.join(root, 'tools/admin_product_push.js'));
  fs.writeFileSync(path.join(root, 'data/products.json'), JSON.stringify(catalog));
  fs.writeFileSync(path.join(root, 'tools/build_static_site.js'), `
    const fs = require('fs');
    const products = JSON.parse(fs.readFileSync('data/products.json'));
    fs.writeFileSync('index.html', products[0].name);
    if (products[0].name === 'FAIL_BUILD') throw new Error('Deliberate test failure');
  `);
  const api = require(path.join(root, 'tools/local_admin_server.js'));
  t.after(() => { api.server.closeAllConnections(); api.server.close(); fs.rmSync(root, { recursive: true, force: true }); });
  return { root, ...api };
}

async function client(server) {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/api/products.php`;
  return async body => {
    const res = await fetch(url, body === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return { status: res.status, ...await res.json() };
  };
}

test('API keeps URLs, backs up exact bytes, rejects stale writes and restores after a failed build', async t => {
  const { root, server } = fixture(t);
  const request = await client(server);
  const before = fs.readFileSync(path.join(root, 'data/products.json'));
  const initial = await request();
  const edited = structuredClone(initial.products);
  edited[0].name += ' test';
  delete edited[0].slug;
  const saved = await request({ products: edited, revision: initial.revision });
  assert.equal(saved.status, 200);
  assert.equal(saved.products[0].slug, initial.products[0].slug);
  const backup = fs.readdirSync(path.join(root, '.admin-backups')).find(name => name.startsWith('products-'));
  assert.deepEqual(fs.readFileSync(path.join(root, '.admin-backups', backup)), before);
  const pending = JSON.parse(fs.readFileSync(path.join(root, '.admin-backups', 'pending-product-changes.json'), 'utf8'));
  assert.equal(pending.products[String(initial.products[0].id)].fields.name.after, edited[0].name);
  assert.equal((await request({ products: edited, revision: initial.revision })).status, 409);
  const savedBytes = fs.readFileSync(path.join(root, 'data/products.json'));
  saved.products[0].name = 'FAIL_BUILD';
  const failed = await request({ products: saved.products, revision: saved.revision });
  assert.equal(failed.status, 500);
  assert.match(failed.message, /Đã khôi phục/);
  assert.deepEqual(fs.readFileSync(path.join(root, 'data/products.json')), savedBytes);
  assert.equal(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), edited[0].name);
});

test('malformed products/variants and new duplicate SKUs return 400 without changing catalog', async t => {
  const { root, server } = fixture(t);
  const request = await client(server);
  const initial = await request();
  const before = fs.readFileSync(path.join(root, 'data/products.json'));
  for (const product of [null, { ...catalog[0], variants: {} }, { ...catalog[0], variants: [null] }, { ...catalog[0], price: -1 }, { ...catalog[0], price: 0, hidden: false }, { ...catalog[0], price: null }]) {
    assert.equal((await request({ products: [product], revision: initial.revision })).status, 400);
  }
  const duplicate = structuredClone(catalog);
  const [firstSkuIndex, secondSkuIndex] = duplicate.map((product, index) => product.sku ? index : -1).filter(index => index >= 0).slice(0, 2);
  assert.notEqual(secondSkuIndex, undefined, 'fixture needs two products with SKUs');
  duplicate[secondSkuIndex].sku = duplicate[firstSkuIndex].sku;
  assert.equal((await request({ products: duplicate, revision: initial.revision })).status, 400);
  assert.deepEqual(fs.readFileSync(path.join(root, 'data/products.json')), before);
});

function browser() {
  const html = fs.readFileSync(path.join(sourceRoot, 'admin-upload.html'), 'utf8');
  const script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n');
  const storage = new Map();
  const app = { innerHTML: '', setAttribute() {} };
  const context = vm.createContext({ console, setTimeout, clearTimeout, URL, alert() {}, confirm: () => true,
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
    document: { getElementById: id => id === 'app' ? app : null }, window: { addEventListener() {} },
  });
  vm.runInContext(script, context);
  context.catalog = structuredClone(catalog);
  vm.runInContext(`products = catalog.map(normalizeProduct); selectedId = products[0].id; productRevision = 'r1'; originalProductSnapshots = Object.fromEntries(products.map(p => [String(p.id), JSON.stringify(p)]));`, context);
  return { context, storage, run: code => vm.runInContext(code, context) };
}

test('frontend preserves slugs, duplicates as hidden with fresh IDs and restores browser drafts', () => {
  const { run, storage } = browser();
  assert.equal(run('productSaveErrors().length'), 0);
  const slug = run('products[0].slug');
  run("updateField('name', 'Tên mới')");
  assert.equal(run('products[0].slug'), slug);
  run('writeProductDraft()');
  assert.ok(storage.has('phuonglam_admin_product_draft_v1'));
  assert.equal(run("restoreProductDraft([], 'r1')[0].name"), 'Tên mới');
  run('duplicateProduct()');
  assert.equal(run('selectedProduct().hidden'), true);
  assert.equal(run('selectedProduct().slug'), '');
  assert.equal(run('selectedProduct().sku'), '');
  assert.equal(run('new Set(products.map(p => p.id)).size === products.length'), true);
  run('clearTimeout(productDraftTimer)');
});

test('category image cards render clickable upload controls when an image is already set', () => {
  const { run } = browser();
  run("settings.categoryImages = { 'tui-thom': '/assets/products/uploads/category.webp' }");
  const html = run('categoryImagesHtml()');
  assert.match(html, /onclick="pickCategoryImage\('tui-thom'\)"/);
  assert.match(html, /category\.webp/);
  assert.doesNotMatch(html, /Ảnh bìa/);
});

test('frontend retains edits arriving during save and prevents publishing the older snapshot', async () => {
  const { context, run, storage } = browser();
  let resolveFetch;
  context.fetch = () => new Promise(resolve => { resolveFetch = resolve; });
  const save = run('saveProducts()');
  run("updateField('name', 'New edit while saving')");
  resolveFetch({ text: async () => JSON.stringify({ ok: true, revision: 'r2', products: catalog }) });
  await assert.rejects(save, /Có chỉnh sửa mới/);
  assert.equal(run('products[0].name'), 'New edit while saving');
  assert.equal(run('productRevision'), 'r2');
  assert.equal(JSON.parse(storage.get('phuonglam_admin_product_draft_v1')).products[0].name, 'New edit while saving');
  run('clearTimeout(productDraftTimer)');
});

test('uploads remain attached to original product/variant after switching and reordering', async () => {
  const { context, run } = browser();
  let resolveUpload;
  context.fakeUpload = () => new Promise(resolve => { resolveUpload = resolve; });
  run('uploadFile = fakeUpload; getDroppedImage = () => ({})');
  const firstId = run('products[0].id');
  const originalVariant = run('products[0].variants[0].id');
  const upload = run('dropVariantImage({}, 0)');
  run('products[0].variants.reverse(); selectedId = products[1].id');
  resolveUpload('/test-upload.webp');
  await upload;
  context.firstId = firstId;
  context.originalVariant = originalVariant;
  assert.equal(run('products.find(p => p.id === firstId).variants.find(v => v.id === originalVariant).image'), '/test-upload.webp');
  run('clearTimeout(productDraftTimer)');
});

test('Push Git supports missing optional directories and blocks unrelated edits without staging them', t => {
  const { root, pushGit } = fixture(t);
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  git('init', '-q'); git('config', 'user.email', 'test@example.invalid'); git('config', 'user.name', 'Test');
  fs.writeFileSync(path.join(root, 'index.html'), catalog[0].name);
  git('add', '.'); git('commit', '-qm', 'fixture');
  assert.equal(pushGit().pushed, false);
  fs.appendFileSync(path.join(root, 'tools/build_static_site.js'), '\n// unrelated edit\n');
  assert.throws(pushGit, /ngoài phạm vi admin/);
  assert.equal(git('diff', '--cached', '--name-only'), '');
});


test('Push Git publishes product and blog changes to a local test remote only', t => {
  const { root, pushGit } = fixture(t);
  const remote = fs.mkdtempSync(path.join(os.tmpdir(), 'phuonglam-test-remote-'));
  t.after(() => fs.rmSync(remote, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  execFileSync('git', ['init', '--bare', '-q', remote]);
  git('init', '-q'); git('config', 'user.email', 'test@example.invalid'); git('config', 'user.name', 'Test');
  fs.writeFileSync(path.join(root, 'index.html'), catalog[0].name);
  git('add', '.'); git('commit', '-qm', 'fixture');
  const branch = git('branch', '--show-current');
  git('remote', 'add', 'origin', remote); git('push', '-u', 'origin', branch);
  fs.mkdirSync(path.join(root, 'blog', 'kien-thuc', 'test'), { recursive: true });
  fs.writeFileSync(path.join(root, 'blog', 'kien-thuc', 'test', 'index.html'), 'Test article');
  const edited = structuredClone(catalog); edited[0].name += ' local test';
  fs.writeFileSync(path.join(root, 'data', 'products.json'), JSON.stringify(edited));
  assert.equal(pushGit().pushed, true);
  assert.equal(git('rev-parse', 'HEAD'), git('rev-parse', `origin/${branch}`));
  assert.equal(git('show', `origin/${branch}:blog/kien-thuc/test/index.html`), 'Test article');
  assert.equal(git('status', '--porcelain'), '');
  fs.appendFileSync(path.join(root, 'index.html'), 'staged'); git('add', 'index.html');
  assert.throws(pushGit, /stage sẵn/);
});

test('Push Git publishes only saved product changes from a clean remote worktree', async t => {
  const { root, server, pushGit } = fixture(t);
  const remote = fs.mkdtempSync(path.join(os.tmpdir(), 'phuonglam-product-remote-'));
  t.after(() => fs.rmSync(remote, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const remoteGit = (...args) => execFileSync('git', ['--git-dir', remote, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  execFileSync('git', ['init', '--bare', '-q', remote]);
  git('init', '-q'); git('config', 'user.email', 'test@example.invalid'); git('config', 'user.name', 'Test');
  fs.writeFileSync(path.join(root, 'index.html'), catalog[0].name);
  git('add', '.'); git('commit', '-qm', 'fixture');
  const branch = git('branch', '--show-current');
  git('remote', 'add', 'origin', remote); git('push', '-u', 'origin', branch);
  execFileSync('git', ['--git-dir', remote, 'symbolic-ref', 'HEAD', `refs/heads/${branch}`]);
  const newerCheckout = fs.mkdtempSync(path.join(os.tmpdir(), 'phuonglam-newer-checkout-'));
  t.after(() => fs.rmSync(newerCheckout, { recursive: true, force: true }));
  fs.rmdirSync(newerCheckout);
  execFileSync('git', ['clone', '-q', remote, newerCheckout]);
  execFileSync('git', ['config', 'user.email', 'test@example.invalid'], { cwd: newerCheckout });
  execFileSync('git', ['config', 'user.name', 'Test'], { cwd: newerCheckout });
  const newerProductsPath = path.join(newerCheckout, 'data', 'products.json');
  const newerProducts = JSON.parse(fs.readFileSync(newerProductsPath, 'utf8'));
  newerProducts[0].seoTitle = 'Remote edit after local checkout';
  fs.writeFileSync(newerProductsPath, JSON.stringify(newerProducts, null, 2));
  execFileSync('git', ['add', 'data/products.json'], { cwd: newerCheckout });
  execFileSync('git', ['commit', '-qm', 'Remote catalog edit'], { cwd: newerCheckout });
  execFileSync('git', ['push', 'origin', branch], { cwd: newerCheckout });

  const request = await client(server);
  const initial = await request();
  const edited = structuredClone(initial.products);
  edited[0].images = ['/assets/products/uploads/new-product-image.webp'];
  const imagesDir = path.join(root, 'assets', 'products', 'uploads');
  fs.mkdirSync(imagesDir, { recursive: true });
  fs.writeFileSync(path.join(imagesDir, 'new-product-image.webp'), 'test image bytes');
  const saved = await request({ products: edited, revision: initial.revision });
  assert.equal(saved.status, 200);

  fs.appendFileSync(path.join(root, 'tools', 'build_static_site.js'), '\n// preserve unrelated local edit\n');
  const localHeadBeforePush = git('rev-parse', 'HEAD');
  const result = pushGit();

  assert.equal(result.pushed, true);
  assert.equal(git('rev-parse', 'HEAD'), localHeadBeforePush);
  const remoteProduct = JSON.parse(remoteGit('show', `refs/heads/${branch}:data/products.json`))
    .find(product => String(product.id) === String(edited[0].id));
  assert.deepEqual(remoteProduct.images, ['/assets/products/uploads/new-product-image.webp']);
  assert.equal(remoteProduct.seoTitle, 'Remote edit after local checkout');
  assert.equal(remoteGit('show', `refs/heads/${branch}:assets/products/uploads/new-product-image.webp`), 'test image bytes');
  assert.doesNotMatch(remoteGit('show', `refs/heads/${branch}:tools/build_static_site.js`), /preserve unrelated local edit/);
  assert.match(fs.readFileSync(path.join(root, 'tools', 'build_static_site.js'), 'utf8'), /preserve unrelated local edit/);
});

test('Push Git publishes saved admin settings and category images without pushing unrelated local edits', async t => {
  const { root, server, pushGit } = fixture(t);
  const remote = fs.mkdtempSync(path.join(os.tmpdir(), 'phuonglam-settings-remote-'));
  t.after(() => fs.rmSync(remote, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const remoteGit = (...args) => execFileSync('git', ['--git-dir', remote, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  execFileSync('git', ['init', '--bare', '-q', remote]);
  git('init', '-q'); git('config', 'user.email', 'test@example.invalid'); git('config', 'user.name', 'Test');
  fs.writeFileSync(path.join(root, 'index.html'), catalog[0].name);
  const settingsPath = path.join(root, 'data/settings.json');
  const originalSettings = { featuredIds: ['old'], headerImages: ['/assets/products/uploads/old.webp'], categoryImages: { 'tui-thom': '/assets/products/uploads/old-category.webp' } };
  fs.writeFileSync(settingsPath, JSON.stringify(originalSettings, null, 2));
  fs.mkdirSync(path.join(root, 'assets/products/uploads'), { recursive: true });
  fs.writeFileSync(path.join(root, 'assets/products/uploads/old.webp'), 'old header');
  fs.writeFileSync(path.join(root, 'assets/products/uploads/old-category.webp'), 'old category');
  const oldBlogPosts = [{ slug: 'admin-post', title: 'Bài cũ', url: '/blog/kien-thuc/admin-post/' }];
  fs.mkdirSync(path.join(root, 'assets/js'), { recursive: true });
  fs.writeFileSync(path.join(root, 'assets/js/site-data.js'), `const BLOG_POSTS = ${JSON.stringify(oldBlogPosts)}; window.BLOG_POSTS = BLOG_POSTS;`);
  const blogPagePath = path.join(root, 'blog/kien-thuc/admin-post/index.html');
  fs.mkdirSync(path.dirname(blogPagePath), { recursive: true });
  fs.writeFileSync(blogPagePath, 'old article');
  git('add', '.'); git('commit', '-qm', 'fixture');
  const branch = git('branch', '--show-current');
  git('remote', 'add', 'origin', remote); git('push', '-u', 'origin', branch);
  execFileSync('git', ['--git-dir', remote, 'symbolic-ref', 'HEAD', `refs/heads/${branch}`]);

  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const nextSettings = {
    featuredIds: ['new'],
    headerImages: ['/assets/products/uploads/new-header.webp'],
    categoryImages: { 'tui-thom': '/assets/products/uploads/new-category.webp' },
  };
  fs.writeFileSync(path.join(root, 'assets/products/uploads/new-header.webp'), 'new header');
  fs.writeFileSync(path.join(root, 'assets/products/uploads/new-category.webp'), 'new category');
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/settings.php`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settings: nextSettings }),
  });
  assert.equal(response.status, 200);
  assert.equal(fs.existsSync(path.join(root, '.admin-backups/pending-admin-settings.json')), true);
  const nextBlogPosts = [{ ...oldBlogPosts[0], title: 'Bài đã cập nhật' }];
  fs.writeFileSync(blogPagePath, 'updated article');
  fs.writeFileSync(path.join(root, 'assets/js/site-data.js'), `const BLOG_POSTS = ${JSON.stringify(nextBlogPosts)}; window.BLOG_POSTS = BLOG_POSTS;`);
  let pendingContent = recordBlogPostChanges(null, oldBlogPosts, nextBlogPosts);
  pendingContent = recordAdminFileChanges(pendingContent, [{ path: 'blog/kien-thuc/admin-post/index.html', before: Buffer.from('old article'), after: Buffer.from('updated article') }]);
  fs.writeFileSync(path.join(root, '.admin-backups/pending-admin-content.json'), JSON.stringify(pendingContent));
  fs.appendFileSync(path.join(root, 'tools/build_static_site.js'), '\n// unrelated local edit\n');

  const result = pushGit();
  const publishedSettings = JSON.parse(remoteGit('show', `refs/heads/${branch}:data/settings.json`));
  assert.equal(result.pushed, true);
  assert.deepEqual(publishedSettings, nextSettings);
  assert.equal(remoteGit('show', `refs/heads/${branch}:assets/products/uploads/new-header.webp`), 'new header');
  assert.equal(remoteGit('show', `refs/heads/${branch}:assets/products/uploads/new-category.webp`), 'new category');
  assert.equal(remoteGit('show', `refs/heads/${branch}:blog/kien-thuc/admin-post/index.html`), 'updated article');
  assert.match(remoteGit('show', `refs/heads/${branch}:assets/js/site-data.js`), /Bài đã cập nhật/);
  assert.doesNotMatch(remoteGit('show', `refs/heads/${branch}:tools/build_static_site.js`), /unrelated local edit/);
});

test('Push Git recovers existing image edits when no pending journal exists', t => {
  const { root, pushGit } = fixture(t);
  const remote = fs.mkdtempSync(path.join(os.tmpdir(), 'phuonglam-image-remote-'));
  t.after(() => fs.rmSync(remote, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const remoteGit = (...args) => execFileSync('git', ['--git-dir', remote, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  execFileSync('git', ['init', '--bare', '-q', remote]);
  git('init', '-q'); git('config', 'user.email', 'test@example.invalid'); git('config', 'user.name', 'Test');
  fs.writeFileSync(path.join(root, 'index.html'), catalog[0].name);
  git('add', '.'); git('commit', '-qm', 'fixture');
  const branch = git('branch', '--show-current');
  git('remote', 'add', 'origin', remote); git('push', '-u', 'origin', branch);

  const edited = structuredClone(catalog);
  const publishedPrice = edited[0].price;
  edited[0].price = Number(publishedPrice) + 1000;
  edited[0].images = ['/assets/products/uploads/edited-cover.webp'];
  edited[0].variants[0].price = Number(edited[0].variants[0].price) + 1000;
  edited[0].variants[0].image = '/assets/products/uploads/edited-variant.webp';
  fs.writeFileSync(path.join(root, 'data', 'products.json'), JSON.stringify(edited, null, 2));
  const imagesDir = path.join(root, 'assets', 'products', 'uploads');
  fs.mkdirSync(imagesDir, { recursive: true });
  fs.writeFileSync(path.join(imagesDir, 'edited-cover.webp'), 'cover bytes');
  fs.writeFileSync(path.join(imagesDir, 'edited-variant.webp'), 'variant bytes');
  fs.appendFileSync(path.join(root, 'tools', 'build_static_site.js'), '\n// unrelated edit\n');

  const result = pushGit();
  const published = JSON.parse(remoteGit('show', `refs/heads/${branch}:data/products.json`))[0];

  assert.equal(result.pushed, true);
  assert.equal(published.price, publishedPrice);
  assert.equal(published.variants[0].price, catalog[0].variants[0].price);
  assert.deepEqual(published.images, ['/assets/products/uploads/edited-cover.webp']);
  assert.equal(published.variants[0].image, '/assets/products/uploads/edited-variant.webp');
  assert.equal(remoteGit('show', `refs/heads/${branch}:assets/products/uploads/edited-cover.webp`), 'cover bytes');
  assert.doesNotMatch(remoteGit('show', `refs/heads/${branch}:tools/build_static_site.js`), /unrelated edit/);
});

test('sales editor generates missing combinations without replacing existing variants and applies only supplied bulk fields', () => {
  const { context, run } = browser();
  run(`renderKeepScroll = () => {}; products = [{id:'sales-test', name:'Test', price:100, variants:[{id:'keep',name:'Tên riêng',price:75,sku:'KEEP',image:'keep.jpg',options:{Màu:'Đỏ',Cỡ:'S'}}], optionGroups:[{name:'Màu',values:['Đỏ','Xanh']},{name:'Cỡ',values:['S','M']}]}]; selectedId='sales-test';`);
  run('generateMissingVariants(); generateMissingVariants()');
  assert.equal(run('selectedProduct().variants.length'), 4);
  assert.equal(run('selectedProduct().variants[0].price'), 75);
  assert.equal(run('selectedProduct().variants[0].image'), 'keep.jpg');
  assert.equal(run('new Set(selectedProduct().variants.map(v => v.id)).size'), 4);
  context.document.getElementById = key => key.startsWith('bulk') ? ({ value: {bulkPrice:'25.000',bulkOriginalPrice:'',bulkWeight:'0'}[key] || '' }) : null;
  run('applyVariantBulk()');
  assert.equal(run('selectedProduct().variants.every(v => v.price === 25000 && v.weight === 0)'), true);
  assert.equal(run('selectedProduct().variants[0].sku'), 'KEEP');
  context.document.getElementById = key => key.startsWith('bulk') ? ({value:'-3'}) : null;
  run('applyVariantBulk()');
  assert.equal(run('selectedProduct().variants[0].price'), 25000);
  run(`selectedProduct().optionGroups[0].values.push(''); generateMissingVariants()`);
  assert.equal(run('selectedProduct().variants.length'), 4);
  run('clearTimeout(productDraftTimer)');
});
