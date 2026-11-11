// Tests for workers/product-admin/worker.js (online product admin API) with a fake
// GitHub and the owner password session.
const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const workerUrl = pathToFileURL(path.join(__dirname, '..', 'workers', 'product-admin', 'worker.js')).href;
const loadWorker = () => import(workerUrl);

const PASSWORD = 'mat-khau-du-dai-123';
const sha = (char) => char.repeat(40);

const product = (id, extra = {}) => ({
  id, name: `SP ${id}`, slug: `sp-${id}`, categoryId: 'combo', price: 100000, originalPrice: 150000,
  images: [], variants: [], ...extra,
});

// Minimal in-memory GitHub covering the endpoints the Worker calls.
const fakeGitHub = async ({ productsText = JSON.stringify([product('a')], null, 2) + '\n' } = {}) => {
  const state = {
    head: sha('1'),
    productsSha: sha('b'),
    productsAtHead: sha('b'),
    calls: [],
    blobs: [],
    refUpdate: null,
    rejectRefUpdate: false,
  };
  const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  const fetchImpl = async (input, init = {}) => {
    const url = new URL(String(input));
    const method = init.method || 'GET';
    const body = init.body ? JSON.parse(init.body) : null;
    state.calls.push(`${method} ${url.pathname}`);
    if (url.host === 'phuonglam.com') return reply({ commit: sha('9') });
    const p = url.pathname.replace('/repos/lamtran-dotcom/website-phuonglam', '');
    if (method === 'GET' && p === '/git/ref/heads/main') return reply({ object: { sha: state.head } });
    if (method === 'GET' && p === '/contents/data/products.json') {
      const atHead = url.searchParams.get('ref') === state.head;
      return reply({ sha: atHead ? state.productsAtHead : state.productsSha, content: Buffer.from(productsText).toString('base64') });
    }
    if (method === 'GET' && p === '/contents/assets/js/site-data.js') {
      return reply({ sha: sha('c'), content: Buffer.from("const CATEGORIES = [\n  { id: 'combo', name: 'Combo Xông Nhà', icon: 'x' },\n];").toString('base64') });
    }
    if (method === 'POST' && p === '/git/blobs') {
      state.blobs.push(body);
      return reply({ sha: sha(String(state.blobs.length % 10)) }, 201);
    }
    if (method === 'GET' && p.startsWith('/git/commits/')) return reply({ tree: { sha: sha('t') } });
    if (method === 'POST' && p === '/git/trees') {
      state.tree = body;
      return reply({ sha: sha('e') }, 201);
    }
    if (method === 'POST' && p === '/git/commits') {
      state.commit = body;
      return reply({ sha: sha('f') }, 201);
    }
    if (method === 'PATCH' && p === '/git/refs/heads/main') {
      if (state.rejectRefUpdate) return reply({ message: 'not fast forward' }, 422);
      state.refUpdate = body;
      return reply({ object: { sha: body.sha } });
    }
    if (method === 'GET' && p === '/actions/workflows/deploy-pages.yml/runs') {
      return reply({ workflow_runs: [{ status: 'completed', conclusion: 'success', html_url: 'https://github.com/run/1' }] });
    }
    return reply({ message: 'not found' }, 404);
  };
  return { state, fetchImpl };
};

const env = { ADMIN_PASSWORD: PASSWORD, GITHUB_TOKEN: 'token', ASSETS: { fetch: () => new Response('asset') } };
const signToken = async (overrides = {}) => (await loadWorker()).createSession({ ...env, ...overrides });

const call = async (fetchImpl, pathname, { method = 'GET', token, body, headers = {} } = {}) => {
  const { handle } = await loadWorker();
  const request = new Request(`https://admin.example.workers.dev${pathname}`, {
    method,
    headers: {
      ...(token ? { Cookie: `pl_admin=${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const res = await handle(request, env, fetchImpl);
  return { status: res.status, body: await res.json().catch(() => null) };
};

const webp = () => {
  const bytes = Buffer.alloc(32);
  bytes.write('RIFF', 0);
  bytes.write('WEBP', 8);
  return bytes.toString('base64');
};

test('api rejects requests without a valid session', async () => {
  const { fetchImpl } = await fakeGitHub();
  const good = await signToken();
  const [expires, signature] = good.split('.');
  assert.equal((await call(fetchImpl, '/api/catalog')).status, 401);
  assert.equal((await call(fetchImpl, '/api/catalog', { token: 'abc' })).status, 401);
  assert.equal((await call(fetchImpl, '/api/catalog', { token: `${Number(expires) + 1}.${signature}` })).status, 401);
  assert.equal((await call(fetchImpl, '/api/catalog', { token: `${expires}.${'0'.repeat(64)}` })).status, 401);
  const { createSession } = await loadWorker();
  const expired = await createSession(env, Date.now() - 31 * 86400 * 1000);
  assert.equal((await call(fetchImpl, '/api/catalog', { token: expired })).status, 401);
  const oldPassword = await signToken({ ADMIN_PASSWORD: 'mat-khau-cu-da-doi-roi' });
  assert.equal((await call(fetchImpl, '/api/catalog', { token: oldPassword })).status, 401);
  assert.equal((await call(fetchImpl, '/api/catalog', { token: good })).status, 200);
});

test('login checks the password and sets a strict HttpOnly session cookie', async () => {
  const { fetchImpl } = await fakeGitHub();
  const { handle } = await loadWorker();
  const login = (password, extraEnv = {}) => handle(new Request('https://admin.example.workers.dev/api/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
  }), { ...env, ...extraEnv }, fetchImpl);

  assert.equal((await login('sai')).status, 401);
  const ok = await login(PASSWORD);
  assert.equal(ok.status, 200);
  const cookie = ok.headers.get('Set-Cookie');
  assert.match(cookie, /^pl_admin=\d+\.[0-9a-f]{64}; Path=\/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000$/);
  const token = cookie.split(';')[0].slice('pl_admin='.length);
  assert.equal((await call(fetchImpl, '/api/me', { token })).status, 200);

  const limited = await login(PASSWORD, { LOGIN_LIMITER: { limit: async () => ({ success: false }) } });
  assert.equal(limited.status, 429);
  assert.equal((await login(PASSWORD, { ADMIN_PASSWORD: 'ngan' })).status, 500);
});

test('logout clears the session cookie', async () => {
  const { handle } = await loadWorker();
  const res = await handle(new Request('https://admin.example.workers.dev/api/logout', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
  }), env);
  assert.match(res.headers.get('Set-Cookie'), /^pl_admin=; .*Max-Age=0$/);
});

test('catalog returns products, categories and base versions', async () => {
  const { fetchImpl } = await fakeGitHub();
  const { status, body } = await call(fetchImpl, '/api/catalog', { token: await signToken() });
  assert.equal(status, 200);
  assert.equal(body.baseSha, sha('1'));
  assert.equal(body.productsSha, sha('b'));
  assert.equal(body.products[0].id, 'a');
  assert.deepEqual(body.categories, [{ id: 'combo', name: 'Combo Xông Nhà' }]);
});

test('publish writes products and images in one fast-forward commit', async () => {
  const { state, fetchImpl } = await fakeGitHub();
  const products = [product('a', { price: 120000, images: ['/assets/products/uploads/new-1.webp'] })];
  const { status, body } = await call(fetchImpl, '/api/publish', {
    method: 'POST',
    token: await signToken(),
    body: {
      baseSha: sha('1'),
      productsSha: sha('b'),
      products,
      message: 'Giá SP a',
      images: [
        { path: 'assets/products/uploads/new-1.webp', data: webp() },
        { path: 'assets/products/responsive/new-1-480.webp', data: webp() },
      ],
    },
  });
  assert.equal(status, 200, JSON.stringify(body));
  assert.equal(body.commitSha, sha('f'));
  assert.equal(state.blobs[0].content, `${JSON.stringify(products, null, 2)}\n`);
  assert.deepEqual(state.tree.tree.map((entry) => entry.path), [
    'data/products.json', 'assets/products/uploads/new-1.webp', 'assets/products/responsive/new-1-480.webp',
  ]);
  assert.equal(state.tree.base_tree, sha('t'));
  assert.deepEqual(state.commit.parents, [sha('1')]);
  assert.match(state.commit.message, /^Admin: Giá SP a/);
  assert.deepEqual(state.refUpdate, { sha: sha('f'), force: false });
});

test('publish is allowed when other files changed but refused when products.json changed', async () => {
  const token = await signToken();
  const body = { baseSha: sha('0'), productsSha: sha('b'), products: [product('a')] };

  const otherFiles = await fakeGitHub();
  assert.equal((await call(otherFiles.fetchImpl, '/api/publish', { method: 'POST', token, body })).status, 200);
  assert.deepEqual(otherFiles.state.commit.parents, [sha('1')]);

  const productsChanged = await fakeGitHub();
  productsChanged.state.productsAtHead = sha('d');
  const res = await call(productsChanged.fetchImpl, '/api/publish', { method: 'POST', token, body });
  assert.equal(res.status, 409);
  assert.equal(productsChanged.state.blobs.length, 0);
});

test('publish reports a race on the branch as a conflict', async () => {
  const { state, fetchImpl } = await fakeGitHub();
  state.rejectRefUpdate = true;
  const res = await call(fetchImpl, '/api/publish', {
    method: 'POST', token: await signToken(), body: { baseSha: sha('1'), productsSha: sha('b'), products: [product('a')] },
  });
  assert.equal(res.status, 409);
});

test('publish validates products and image paths before touching GitHub', async () => {
  const { state, fetchImpl } = await fakeGitHub();
  const token = await signToken();
  const base = { baseSha: sha('1'), productsSha: sha('b') };
  const bad = await call(fetchImpl, '/api/publish', {
    method: 'POST',
    token,
    body: {
      ...base,
      products: [product('a', { price: 10.5 }), product('a', { slug: 'Có Dấu' })],
      images: [
        { path: '../data/products.json', data: webp() },
        { path: 'assets/products/uploads/x.webp', data: Buffer.from('not an image at all').toString('base64') },
      ],
    },
  });
  assert.equal(bad.status, 422);
  const text = bad.body.details.join('\n');
  assert.match(text, /giá bán/);
  assert.match(text, /trùng id/);
  assert.match(text, /slug/);
  assert.match(text, /Đường dẫn ảnh không hợp lệ/);
  assert.match(text, /không phải WebP/);
  assert.equal(state.calls.filter((c) => c.includes('/git/')).length, 0);
});

test('post requests need JSON from the same origin', async () => {
  const { fetchImpl } = await fakeGitHub();
  const token = await signToken();
  const crossSite = await call(fetchImpl, '/api/publish', {
    method: 'POST', token, body: { a: 1 }, headers: { Origin: 'https://evil.example' },
  });
  assert.equal(crossSite.status, 403);
  const { handle } = await loadWorker();
  const form = await handle(new Request('https://admin.example.workers.dev/api/publish', {
    method: 'POST', headers: { Cookie: `pl_admin=${token}`, 'Content-Type': 'text/plain' }, body: '{}',
  }), env, fetchImpl);
  assert.equal(form.status, 415);
});

test('status maps the deploy run to building/live/failed', async () => {
  const { fetchImpl } = await fakeGitHub();
  const { status, body } = await call(fetchImpl, `/api/status?sha=${sha('f')}`, { token: await signToken() });
  assert.equal(status, 200);
  assert.equal(body.state, 'live');
  assert.equal(body.liveSha, sha('9'));
});

test('non-api paths are served from static assets without auth', async () => {
  const { handle } = await loadWorker();
  const res = await handle(new Request('https://admin.example.workers.dev/'), env, () => { throw new Error('no fetch'); });
  assert.equal(await res.text(), 'asset');
});
