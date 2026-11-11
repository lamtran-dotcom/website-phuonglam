// Tests for workers/product-admin/worker.js (online product admin API) with a fake
// GitHub and a locally signed Cloudflare Access token.
const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const workerUrl = pathToFileURL(path.join(__dirname, '..', 'workers', 'product-admin', 'worker.js')).href;
const loadWorker = () => import(workerUrl);

const TEAM = 'shop.cloudflareaccess.com';
const AUD = 'aud-123';
const EMAIL = 'owner@example.com';
const sha = (char) => char.repeat(40);

const b64url = (data) => Buffer.from(data).toString('base64url');

let keyPair;
const keys = async () => {
  keyPair ||= await crypto.subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['sign', 'verify'],
  );
  return keyPair;
};

const signToken = async (overrides = {}) => {
  const { privateKey } = await keys();
  const header = b64url(JSON.stringify({ alg: 'RS256', kid: 'k1' }));
  const payload = b64url(JSON.stringify({
    aud: [AUD], iss: `https://${TEAM}`, email: EMAIL, exp: Math.floor(Date.now() / 1000) + 600, ...overrides,
  }));
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', privateKey, Buffer.from(`${header}.${payload}`));
  return `${header}.${payload}.${b64url(new Uint8Array(signature))}`;
};

const product = (id, extra = {}) => ({
  id, name: `SP ${id}`, slug: `sp-${id}`, categoryId: 'combo', price: 100000, originalPrice: 150000,
  images: [], variants: [], ...extra,
});

// Minimal in-memory GitHub covering the endpoints the Worker calls.
const fakeGitHub = async ({ productsText = JSON.stringify([product('a')], null, 2) + '\n' } = {}) => {
  const { publicKey } = await keys();
  const jwk = { ...(await crypto.subtle.exportKey('jwk', publicKey)), kid: 'k1' };
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
    if (url.host === TEAM) return reply({ keys: [jwk] });
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

const env = { ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD, ADMIN_EMAIL: EMAIL, GITHUB_TOKEN: 'token', ASSETS: { fetch: () => new Response('asset') } };

const call = async (fetchImpl, pathname, { method = 'GET', token, body, headers = {} } = {}) => {
  const { handle, resetAccessCache } = await loadWorker();
  resetAccessCache();
  const request = new Request(`https://admin.example.workers.dev${pathname}`, {
    method,
    headers: {
      ...(token ? { 'Cf-Access-Jwt-Assertion': token } : {}),
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

test('api rejects requests without a valid Access token', async () => {
  const { fetchImpl } = await fakeGitHub();
  assert.equal((await call(fetchImpl, '/api/catalog')).status, 401);
  assert.equal((await call(fetchImpl, '/api/catalog', { token: 'a.b.c' })).status, 401);
  assert.equal((await call(fetchImpl, '/api/catalog', { token: await signToken({ email: 'other@example.com' }) })).status, 403);
  assert.equal((await call(fetchImpl, '/api/catalog', { token: await signToken({ aud: ['other'] }) })).status, 401);
  assert.equal((await call(fetchImpl, '/api/catalog', { token: await signToken({ exp: 1 }) })).status, 401);
  const forged = (await signToken()).replace(/\.[^.]+$/, `.${b64url('nope')}`);
  assert.equal((await call(fetchImpl, '/api/catalog', { token: forged })).status, 401);
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
    method: 'POST', headers: { 'Cf-Access-Jwt-Assertion': token, 'Content-Type': 'text/plain' }, body: '{}',
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
