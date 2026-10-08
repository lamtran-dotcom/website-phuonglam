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

test('malformed percent-encoding returns 400 and the server keeps serving', async t => {
  const { server } = fixture(t);
  const port = await listen(server);
  assert.equal((await request(port, { path: '/%E0%A4%A' })).status, 400);
  const home = await request(port, { path: '/' });
  assert.equal(home.status, 200);
  assert.equal(home.body, 'home');
});

test('requests addressed to a non-loopback Host are refused (DNS rebinding)', async t => {
  const { server } = fixture(t);
  const port = await listen(server);
  const rebinding = await request(port, { path: '/api/settings.php', headers: { Host: `attacker.example:${port}` } });
  assert.equal(rebinding.status, 421);
  for (const host of [`127.0.0.1:${port}`, `localhost:${port}`]) {
    assert.equal((await request(port, { path: '/api/settings.php', headers: { Host: host } })).status, 200);
  }
});

test('cross-site writes are blocked while same-origin and server-to-server calls still work', async t => {
  const { root, server } = fixture(t);
  const port = await listen(server);
  const host = `127.0.0.1:${port}`;
  const settings = JSON.stringify({ featuredIds: ['x'], headerImages: [], categoryImages: {} });
  const before = fs.readFileSync(path.join(root, 'data/settings.json'), 'utf8');

  const evilOrigin = await request(port, {
    method: 'POST', path: '/api/settings.php', body: settings,
    headers: { Host: host, Origin: 'https://evil.example', 'Content-Type': 'text/plain' },
  });
  assert.equal(evilOrigin.status, 403);
  const evilFetchSite = await request(port, {
    method: 'POST', path: '/api/git.php', body: '{"action":"push"}',
    headers: { Host: host, 'Sec-Fetch-Site': 'cross-site', 'Content-Type': 'text/plain' },
  });
  assert.equal(evilFetchSite.status, 403);
  const nullOrigin = await request(port, {
    method: 'POST', path: '/api/settings.php', body: settings,
    headers: { Host: host, Origin: 'null', 'Content-Type': 'text/plain' },
  });
  assert.equal(nullOrigin.status, 403);
  const otherLocalPort = await request(port, {
    method: 'POST', path: '/api/settings.php', body: settings,
    headers: { Host: host, Origin: 'http://127.0.0.1:3999', 'Content-Type': 'text/plain' },
  });
  assert.equal(otherLocalPort.status, 403);
  assert.equal(fs.readFileSync(path.join(root, 'data/settings.json'), 'utf8'), before);

  // GET from another origin is not a write and must keep working for preview <base> URLs.
  assert.equal((await request(port, { path: '/api/settings.php', headers: { Host: host, Origin: 'http://127.0.0.1:3999' } })).status, 200);

  const sameOrigin = await request(port, {
    method: 'POST', path: '/api/git.php', body: '{"action":"noop"}',
    headers: { Host: host, Origin: `http://${host}`, 'Sec-Fetch-Site': 'same-origin', 'Content-Type': 'application/json' },
  });
  assert.notEqual(sameOrigin.status, 403);
  assert.match(sameOrigin.body, /Unsupported git action/);
  const serverToServer = await request(port, {
    method: 'POST', path: '/api/git.php', body: '{"action":"noop"}',
    headers: { Host: host, 'Content-Type': 'application/json' },
  });
  assert.notEqual(serverToServer.status, 403);
  assert.match(serverToServer.body, /Unsupported git action/);
});

test('product backups are capped to the newest 30 and pending journals are kept', t => {
  const { root, pruneProductBackups } = fixture(t);
  const dir = path.join(root, '.admin-backups');
  fs.mkdirSync(dir);
  for (let i = 0; i < 35; i += 1) fs.writeFileSync(path.join(dir, `products-2026-10-08T00-00-${String(i).padStart(2, '0')}-000Z.json`), '[]');
  fs.writeFileSync(path.join(dir, 'pending-product-changes.json'), '{}');
  pruneProductBackups(dir);
  const left = fs.readdirSync(dir).sort();
  assert.equal(left.filter(name => name.startsWith('products-')).length, 30);
  assert.ok(left.includes('products-2026-10-08T00-00-34-000Z.json'));
  assert.ok(!left.includes('products-2026-10-08T00-00-04-000Z.json'));
  assert.ok(left.includes('pending-product-changes.json'));
});

function multipartImage(filename, data) {
  const boundary = '----phuonglamtest';
  const head = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="${filename}"\r\nContent-Type: application/octet-stream\r\n\r\n`);
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
  return { body: Buffer.concat([head, data, tail]), contentType: `multipart/form-data; boundary=${boundary}` };
}

test('uploads must be real raster images; disguised HTML/SVG is refused and nothing is written', async t => {
  const { root, server, detectImageExtension } = fixture(t);
  assert.equal(detectImageExtension(Buffer.from([0xff, 0xd8, 0xff, 0xe0])), '.jpg');
  assert.equal(detectImageExtension(Buffer.from('RIFF0000WEBPVP8 ', 'latin1')), '.webp');
  assert.equal(detectImageExtension(Buffer.from('<svg onload=alert(1)>')), null);
  const port = await listen(server);
  for (const [filename, data] of [['x.html', Buffer.from('<script>alert(1)</script>')], ['logo.svg', Buffer.from('<svg/>')], ['fake.jpg', Buffer.from('<html>')]]) {
    const { body, contentType } = multipartImage(filename, data);
    const res = await request(port, { method: 'POST', path: '/api/upload.php', body, headers: { Host: `127.0.0.1:${port}`, 'Content-Type': contentType } });
    assert.equal(res.status, 500);
    assert.match(res.body, /Chỉ nhận ảnh/);
  }
  assert.equal(fs.existsSync(path.join(root, 'assets/products/uploads')), false);
});

test('oversized request bodies are rejected with 413 and the server stays up', async t => {
  const { server } = fixture(t);
  const port = await listen(server);
  const big = Buffer.alloc(61 * 1024 * 1024, 0x20);
  const res = await request(port, { method: 'POST', path: '/api/git.php', body: big, headers: { Host: `127.0.0.1:${port}`, 'Content-Type': 'application/json' } });
  assert.equal(res.status, 413);
  assert.equal((await request(port, { path: '/' })).status, 200);
});

test('static file serving cannot escape into a sibling directory sharing the root prefix', async t => {
  const { root, server } = fixture(t);
  const sibling = `${root}-secret`;
  fs.mkdirSync(sibling);
  fs.writeFileSync(path.join(sibling, 'x.txt'), 'secret');
  t.after(() => fs.rmSync(sibling, { recursive: true, force: true }));
  const port = await listen(server);
  const res = await request(port, { path: `/..%2F${path.basename(sibling)}%2Fx.txt` });
  assert.notEqual(res.body, 'secret');
});
