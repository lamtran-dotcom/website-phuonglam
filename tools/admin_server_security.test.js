const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'phuonglam-admin-security-'));
  fs.mkdirSync(path.join(root, 'tools'));
  fs.mkdirSync(path.join(root, 'data'));
  fs.copyFileSync(path.join(__dirname, 'local_admin_server.js'), path.join(root, 'tools/local_admin_server.js'));
  fs.copyFileSync(path.join(__dirname, 'admin_product_push.js'), path.join(root, 'tools/admin_product_push.js'));
  fs.writeFileSync(path.join(root, 'data/products.json'), '[]');
  fs.writeFileSync(path.join(root, 'data/settings.json'), JSON.stringify({ featuredIds: [], headerImages: [], categoryImages: {} }));
  fs.writeFileSync(path.join(root, 'index.html'), 'home');
  const api = require(path.join(root, 'tools/local_admin_server.js'));
  t.after(() => { api.server.closeAllConnections(); api.server.close(); fs.rmSync(root, { recursive: true, force: true }); });
  return { root, ...api };
}

async function listen(server) {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return server.address().port;
}

// fetch() forbids overriding Host and Sec-Fetch-*, so use raw http requests.
function request(port, { method = 'GET', path: urlPath = '/', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, method, path: urlPath, headers }, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

test('isolated Push Git publishes app.jsx so baked settings never lag the bundle', t => {
  const { ISOLATED_PUBLISH_PATHS } = fixture(t);
  assert.ok(ISOLATED_PUBLISH_PATHS.includes('assets/js/app.jsx'));
  assert.ok(ISOLATED_PUBLISH_PATHS.includes('assets/js/app.min.js'));
  const source = fs.readFileSync(path.join(__dirname, 'local_admin_server.js'), 'utf8');
  const legacyList = source.slice(source.indexOf("'.gitignore', 'admin-upload.html'"), source.indexOf("const changes = runGit(['diff', '--name-only', '-z'])"));
  assert.match(legacyList, /'assets\/js\/app\.jsx'/);
});
