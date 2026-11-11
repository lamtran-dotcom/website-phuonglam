// Cloudflare Worker "phuonglam-admin": online product admin for phuonglam.com.
// The UI in ./public is served as static assets; this file is the /api/* backend.
// Design and setup: docs/ADMIN-V2.md and docs/SETUP.md.
//
// Every /api call must carry a valid Cloudflare Access JWT for ADMIN_EMAIL. Publishing
// writes data/products.json and new images to the repository in one commit; GitHub
// Actions then builds and deploys the site as for any other push.
//
// Env: GITHUB_TOKEN (secret, fine-grained, this repo only: contents read/write,
// actions read), ACCESS_TEAM_DOMAIN (e.g. "phuonglam.cloudflareaccess.com"),
// ACCESS_AUD, ADMIN_EMAIL, optional GITHUB_REPO, GITHUB_BRANCH, SITE_URL.

const GITHUB_API = 'https://api.github.com';
const PRODUCTS_PATH = 'data/products.json';
const SITE_DATA_PATH = 'assets/js/site-data.js';
const DEPLOY_WORKFLOW = 'deploy-pages.yml';
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_IMAGES_PER_PUBLISH = 60;
const IMAGE_PATH = /^assets\/products\/(?:uploads\/[a-z0-9][a-z0-9-]{0,150}\.webp|responsive\/[a-z0-9][a-z0-9-]{0,150}-(?:480|720)\.webp)$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});

const settings = (env) => ({
  repo: env.GITHUB_REPO || 'lamtran-dotcom/website-phuonglam',
  branch: env.GITHUB_BRANCH || 'main',
  siteUrl: (env.SITE_URL || 'https://phuonglam.com').replace(/\/$/, ''),
});

// ---------- base64 helpers (UTF-8 safe) ----------

const bytesToBase64 = (bytes) => {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
};
const base64ToBytes = (base64) => Uint8Array.from(atob(String(base64).replace(/\s/g, '')), (c) => c.charCodeAt(0));
const base64UrlToBytes = (value) => base64ToBytes(value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4));
const base64UrlToJson = (value) => JSON.parse(new TextDecoder().decode(base64UrlToBytes(value)));

// ---------- Cloudflare Access ----------

let certCache = { domain: '', keys: [], expires: 0 };

const accessKeys = async (domain, fetchImpl, force = false) => {
  if (!force && certCache.domain === domain && certCache.expires > Date.now()) return certCache.keys;
  const res = await fetchImpl(`https://${domain}/cdn-cgi/access/certs`);
  if (!res.ok) throw new HttpError(502, 'Không tải được khóa Cloudflare Access');
  const { keys = [] } = await res.json();
  certCache = { domain, keys, expires: Date.now() + 60 * 60 * 1000 };
  return keys;
};

export const resetAccessCache = () => { certCache = { domain: '', keys: [], expires: 0 }; };

export const verifyAccess = async (request, env, fetchImpl) => {
  const { ACCESS_TEAM_DOMAIN: domain, ACCESS_AUD: aud, ADMIN_EMAIL: email } = env;
  if (!domain || !aud || !email) throw new HttpError(500, 'Worker thiếu cấu hình ACCESS_TEAM_DOMAIN / ACCESS_AUD / ADMIN_EMAIL');
  const token = request.headers.get('Cf-Access-Jwt-Assertion') || '';
  const parts = token.split('.');
  if (parts.length !== 3) throw new HttpError(401, 'Chưa đăng nhập');

  let header;
  let payload;
  try {
    header = base64UrlToJson(parts[0]);
    payload = base64UrlToJson(parts[1]);
  } catch {
    throw new HttpError(401, 'Phiên đăng nhập không hợp lệ');
  }
  if (header.alg !== 'RS256') throw new HttpError(401, 'Phiên đăng nhập không hợp lệ');

  let jwk = (await accessKeys(domain, fetchImpl)).find((key) => key.kid === header.kid);
  if (!jwk) jwk = (await accessKeys(domain, fetchImpl, true)).find((key) => key.kid === header.kid);
  if (!jwk) throw new HttpError(401, 'Phiên đăng nhập không hợp lệ');

  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    base64UrlToBytes(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
  );
  if (!valid) throw new HttpError(401, 'Phiên đăng nhập không hợp lệ');

  const now = Math.floor(Date.now() / 1000);
  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audiences.includes(aud)) throw new HttpError(401, 'Phiên đăng nhập không dành cho trang này');
  if (payload.iss !== `https://${domain}`) throw new HttpError(401, 'Phiên đăng nhập không hợp lệ');
  if (!payload.exp || payload.exp < now) throw new HttpError(401, 'Phiên đăng nhập đã hết hạn, tải lại trang');
  if (String(payload.email || '').toLowerCase() !== String(email).toLowerCase()) throw new HttpError(403, 'Email này không có quyền quản lý');
  return payload.email;
};

// ---------- GitHub ----------

const github = (env, fetchImpl) => async (method, path, body) => {
  const res = await fetchImpl(`${GITHUB_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'phuonglam-admin',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const error = new HttpError(res.status === 404 ? 502 : res.status, `GitHub ${method} ${path.split('?')[0]} lỗi ${res.status}`);
    error.githubStatus = res.status;
    throw error;
  }
  return res.status === 204 ? null : res.json();
};

const headSha = async (gh, { repo, branch }) => (await gh('GET', `/repos/${repo}/git/ref/heads/${branch}`)).object.sha;

// Returns { sha, text } for a file at a commit. The contents API omits the body above 1 MB,
// so fall back to the blob API.
const readFile = async (gh, repo, path, ref) => {
  const file = await gh('GET', `/repos/${repo}/contents/${path}?ref=${ref}`);
  const base64 = file.content || (await gh('GET', `/repos/${repo}/git/blobs/${file.sha}`)).content;
  return { sha: file.sha, text: new TextDecoder().decode(base64ToBytes(base64)) };
};

const fileSha = async (gh, repo, path, ref) => (await gh('GET', `/repos/${repo}/contents/${path}?ref=${ref}`)).sha;

// CATEGORIES in site-data.js is the category list the storefront uses.
export const parseCategories = (siteDataJs) => {
  const block = String(siteDataJs).match(/const CATEGORIES = \[([\s\S]*?)\];/);
  if (!block) return [];
  return [...block[1].matchAll(/\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)'/g)].map(([, id, name]) => ({ id, name }));
};

// ---------- validation ----------

const isPrice = (value) => Number.isInteger(value) && value >= 0 && value <= 100_000_000;

export const validateProducts = (products) => {
  if (!Array.isArray(products) || !products.length || products.length > 1000) return ['Danh sách sản phẩm không hợp lệ'];
  const errors = [];
  const ids = new Set();
  const slugs = new Set();
  products.forEach((product, index) => {
    const label = product?.name ? `"${product.name}"` : `#${index + 1}`;
    if (!product || typeof product !== 'object' || Array.isArray(product)) {
      errors.push(`Sản phẩm #${index + 1} không hợp lệ`);
      return;
    }
    // Older products use numeric ids; the storefront compares them as strings.
    const id = typeof product.id === 'number' || typeof product.id === 'string' ? String(product.id).trim() : '';
    if (!id) errors.push(`${label}: thiếu id`);
    else if (ids.has(id)) errors.push(`${label}: trùng id ${id}`);
    ids.add(id);
    if (!String(product.name || '').trim()) errors.push(`Sản phẩm #${index + 1}: thiếu tên`);
    if (!SLUG.test(product.slug || '')) errors.push(`${label}: đường dẫn (slug) chỉ dùng a-z, 0-9 và dấu gạch`);
    else if (slugs.has(product.slug)) errors.push(`${label}: trùng đường dẫn ${product.slug}`);
    slugs.add(product.slug);
    if (!String(product.categoryId || '').trim()) errors.push(`${label}: chưa chọn danh mục`);
    if (!isPrice(product.price)) errors.push(`${label}: giá bán phải là số nguyên ≥ 0`);
    if (product.originalPrice != null && !isPrice(product.originalPrice)) errors.push(`${label}: giá gạch phải là số nguyên ≥ 0`);
    if (!Array.isArray(product.images)) errors.push(`${label}: danh sách ảnh không hợp lệ`);
    if (!Array.isArray(product.variants)) errors.push(`${label}: danh sách phân loại không hợp lệ`);
    else product.variants.forEach((variant, vIndex) => {
      if (!variant || !isPrice(variant.price)) errors.push(`${label}: phân loại #${vIndex + 1} có giá không hợp lệ`);
    });
  });
  return errors;
};

const isWebp = (bytes) => bytes.length > 12
  && String.fromCharCode(...bytes.subarray(0, 4)) === 'RIFF'
  && String.fromCharCode(...bytes.subarray(8, 12)) === 'WEBP';

export const validateImages = (images) => {
  if (images == null) return { errors: [], files: [] };
  if (!Array.isArray(images) || images.length > MAX_IMAGES_PER_PUBLISH) return { errors: ['Quá nhiều ảnh trong một lần xuất bản'], files: [] };
  const errors = [];
  const files = [];
  const seen = new Set();
  for (const image of images) {
    const path = String(image?.path || '');
    if (!IMAGE_PATH.test(path) || seen.has(path)) {
      errors.push(`Đường dẫn ảnh không hợp lệ: ${path || '(trống)'}`);
      continue;
    }
    seen.add(path);
    let bytes;
    try {
      bytes = base64ToBytes(image.data || '');
    } catch {
      errors.push(`Ảnh hỏng: ${path}`);
      continue;
    }
    if (!isWebp(bytes)) errors.push(`Ảnh không phải WebP: ${path}`);
    else if (bytes.length > MAX_IMAGE_BYTES) errors.push(`Ảnh quá lớn: ${path}`);
    else files.push({ path, base64: bytesToBase64(bytes) });
  }
  return { errors, files };
};

// ---------- handlers ----------

const getCatalog = async (gh, cfg) => {
  const sha = await headSha(gh, cfg);
  const [products, siteData] = await Promise.all([
    readFile(gh, cfg.repo, PRODUCTS_PATH, sha),
    readFile(gh, cfg.repo, SITE_DATA_PATH, sha).catch(() => ({ text: '' })),
  ]);
  return {
    ok: true,
    baseSha: sha,
    productsSha: products.sha,
    products: JSON.parse(products.text),
    categories: parseCategories(siteData.text),
    siteUrl: cfg.siteUrl,
  };
};

const publish = async (gh, cfg, body, email) => {
  const { baseSha, productsSha, products, images, message } = body || {};
  if (!/^[0-9a-f]{40}$/.test(baseSha || '') || !/^[0-9a-f]{40}$/.test(productsSha || '')) throw new HttpError(400, 'Thiếu phiên bản gốc, tải lại trang');
  const productErrors = validateProducts(products);
  const { errors: imageErrors, files } = validateImages(images);
  const errors = [...productErrors, ...imageErrors];
  if (errors.length) return json({ ok: false, error: 'Dữ liệu chưa hợp lệ', details: errors.slice(0, 30) }, 422);

  const head = await headSha(gh, cfg);
  if (head !== baseSha && (await fileSha(gh, cfg.repo, PRODUCTS_PATH, head)) !== productsSha) {
    throw new HttpError(409, 'Sản phẩm vừa được sửa ở nơi khác. Tải lại dữ liệu mới rồi làm lại thay đổi.');
  }

  const text = `${JSON.stringify(products, null, 2)}\n`;
  const productsBlob = await gh('POST', `/repos/${cfg.repo}/git/blobs`, { content: text, encoding: 'utf-8' });
  const tree = [{ path: PRODUCTS_PATH, mode: '100644', type: 'blob', sha: productsBlob.sha }];
  for (const file of files) {
    const blob = await gh('POST', `/repos/${cfg.repo}/git/blobs`, { content: file.base64, encoding: 'base64' });
    tree.push({ path: file.path, mode: '100644', type: 'blob', sha: blob.sha });
  }

  const headCommit = await gh('GET', `/repos/${cfg.repo}/git/commits/${head}`);
  const newTree = await gh('POST', `/repos/${cfg.repo}/git/trees`, { base_tree: headCommit.tree.sha, tree });
  if (newTree.sha === headCommit.tree.sha) return json({ ok: true, unchanged: true, commitSha: head, productsSha: productsBlob.sha });

  const summary = String(message || '').replace(/\s+/g, ' ').trim().slice(0, 200) || 'Cập nhật sản phẩm';
  const commit = await gh('POST', `/repos/${cfg.repo}/git/commits`, {
    message: `Admin: ${summary}\n\nPublished from the online product admin by ${email}.`,
    tree: newTree.sha,
    parents: [head],
  });
  try {
    await gh('PATCH', `/repos/${cfg.repo}/git/refs/heads/${cfg.branch}`, { sha: commit.sha, force: false });
  } catch (error) {
    if (error.githubStatus === 422) throw new HttpError(409, 'Có thay đổi khác vừa được đẩy lên. Bấm Xuất bản lại.');
    throw error;
  }
  return json({ ok: true, commitSha: commit.sha, productsSha: productsBlob.sha, commitUrl: `https://github.com/${cfg.repo}/commit/${commit.sha}` });
};

const getStatus = async (gh, cfg, sha, fetchImpl) => {
  if (!/^[0-9a-f]{40}$/.test(sha || '')) throw new HttpError(400, 'Thiếu mã commit');
  const runs = await gh('GET', `/repos/${cfg.repo}/actions/workflows/${DEPLOY_WORKFLOW}/runs?head_sha=${sha}&per_page=1`);
  const run = runs.workflow_runs?.[0];
  let liveSha = '';
  try {
    const res = await fetchImpl(`${cfg.siteUrl}/build-info.json?t=${Date.now()}`, { cf: { cacheTtl: 0 } });
    if (res.ok) liveSha = (await res.json()).commit || '';
  } catch {
    // The live check is a bonus; the workflow run is the main signal.
  }
  return {
    ok: true,
    state: !run ? 'queued' : run.status !== 'completed' ? 'building' : run.conclusion === 'success' ? 'live' : 'failed',
    runUrl: run?.html_url || '',
    liveSha,
  };
};

export const handle = async (request, env, fetchImpl = globalThis.fetch.bind(globalThis)) => {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);

  try {
    if (request.method === 'POST') {
      const origin = request.headers.get('Origin');
      if (origin && origin !== url.origin) throw new HttpError(403, 'Sai nguồn yêu cầu');
      if (!String(request.headers.get('Content-Type') || '').startsWith('application/json')) throw new HttpError(415, 'Cần JSON');
    }
    const email = await verifyAccess(request, env, fetchImpl);
    if (!env.GITHUB_TOKEN) throw new HttpError(500, 'Worker thiếu GITHUB_TOKEN');
    const cfg = settings(env);
    const gh = github(env, fetchImpl);

    if (url.pathname === '/api/me' && request.method === 'GET') return json({ ok: true, email });
    if (url.pathname === '/api/catalog' && request.method === 'GET') return json(await getCatalog(gh, cfg));
    if (url.pathname === '/api/publish' && request.method === 'POST') {
      let body;
      try {
        body = await request.json();
      } catch {
        throw new HttpError(400, 'JSON không hợp lệ');
      }
      return await publish(gh, cfg, body, email);
    }
    if (url.pathname === '/api/status' && request.method === 'GET') return json(await getStatus(gh, cfg, url.searchParams.get('sha'), fetchImpl));
    throw new HttpError(404, 'Không có API này');
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    if (status === 500) console.error(error);
    return json({ ok: false, error: error instanceof HttpError ? error.message : 'Lỗi máy chủ' }, status);
  }
};

export default {
  fetch: (request, env) => handle(request, env),
};
