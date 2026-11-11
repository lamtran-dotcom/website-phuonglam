// Local preview of the online product admin (workers/product-admin) without Cloudflare.
// Serves the UI and a fake API backed by data/products.json. "Xuất bản" here only
// validates and logs; it never writes files, commits or pushes.
// Run: node tools/product_admin_dev_server.js  →  http://localhost:8788 (password: dev-password-123)
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'workers', 'product-admin', 'public');
const port = Number(process.env.PORT || 8788);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp' };
const fakeSha = (n) => String(n).padStart(40, '0');
const DEV_PASSWORD = 'dev-password-123';

const send = (res, status, body, type = 'application/json; charset=utf-8') => {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
};

const readBody = (req) => new Promise((resolve) => {
  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
});

const main = async () => {
  const { parseCategories, validateProducts, validateImages } = await import(pathToFileURL(path.join(root, 'workers', 'product-admin', 'worker.js')).href);
  let publishes = 0;

  http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);
    // Fake login for the preview only; the real Worker signs and checks a session cookie.
    if (url.pathname === '/api/login' && req.method === 'POST') {
      const { password } = JSON.parse(await readBody(req) || '{}');
      if (password !== DEV_PASSWORD) return send(res, 401, { ok: false, error: 'Sai mật khẩu' });
      res.setHeader('Set-Cookie', 'pl_admin=dev; Path=/; HttpOnly; SameSite=Strict');
      return send(res, 200, { ok: true });
    }
    if (url.pathname === '/api/logout') {
      res.setHeader('Set-Cookie', 'pl_admin=; Path=/; Max-Age=0');
      return send(res, 200, { ok: true });
    }
    if (url.pathname.startsWith('/api/') && !/(?:^|;\s*)pl_admin=dev(?:;|$)/.test(req.headers.cookie || '')) {
      return send(res, 401, { ok: false, error: 'Chưa đăng nhập' });
    }
    if (url.pathname === '/api/catalog') {
      return send(res, 200, {
        ok: true,
        baseSha: fakeSha(publishes),
        productsSha: fakeSha(publishes + 1000),
        products: JSON.parse(fs.readFileSync(path.join(root, 'data', 'products.json'), 'utf8')),
        categories: parseCategories(fs.readFileSync(path.join(root, 'assets', 'js', 'site-data.js'), 'utf8')),
        siteUrl: 'https://phuonglam.com',
      });
    }
    if (url.pathname === '/api/publish' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req));
      const { errors: imageErrors, files } = validateImages(body.images);
      const errors = [...validateProducts(body.products), ...imageErrors];
      if (errors.length) return send(res, 422, { ok: false, error: 'Dữ liệu chưa hợp lệ', details: errors });
      publishes += 1;
      console.log(`[dev] publish #${publishes}: "${body.message}" · ${body.products.length} products · ${files.length} images (not written)`);
      return send(res, 200, { ok: true, commitSha: fakeSha(publishes), productsSha: fakeSha(publishes + 1000) });
    }
    if (url.pathname === '/api/status') return send(res, 200, { ok: true, state: 'live', runUrl: '', liveSha: '' });

    const file = path.join(publicDir, url.pathname === '/' ? 'index.html' : url.pathname);
    if (!file.startsWith(publicDir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(res, 404, 'Not found', 'text/plain');
    return send(res, 200, fs.readFileSync(file), types[path.extname(file)] || 'application/octet-stream');
  }).listen(port, () => console.log(`Product admin preview: http://localhost:${port}`));
};

main();
