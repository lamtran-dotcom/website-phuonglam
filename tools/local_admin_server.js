const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const port = Number(process.env.PORT || 8000);

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jsx': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

const files = {
  products: path.join(root, 'data', 'products.json'),
  settings: path.join(root, 'data', 'settings.json'),
  uploads: path.join(root, 'assets', 'products', 'uploads'),
  build: path.join(root, 'tools', 'build_static_site.js'),
};

const categoryAliases = {
  'tinh-dau': 'bep-xong',
};

const normalizeCategoryId = (value) => categoryAliases[String(value || '')] || String(value || 'nen-thom');

const normalizeSettings = (value = {}) => {
  const rawCategoryImages = value.categoryImages && typeof value.categoryImages === 'object' && !Array.isArray(value.categoryImages)
    ? value.categoryImages
    : {};
  const categoryImages = {};
  for (const [categoryId, src] of Object.entries(rawCategoryImages)) {
    if (src) categoryImages[normalizeCategoryId(categoryId)] = src;
  }
  return {
    featuredIds: Array.isArray(value.featuredIds) ? value.featuredIds.map(String).filter(Boolean) : [],
    headerImages: Array.isArray(value.headerImages) ? value.headerImages.filter(Boolean) : [],
    categoryImages,
  };
};

const send = (res, status, body, headers = {}) => {
  res.writeHead(status, headers);
  res.end(body);
};

const sendJson = (res, data, status = 200) => {
  send(res, status, JSON.stringify(data), {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });

const safeName = (name) =>
  String(name || 'upload')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '');

const runBuild = () => {
  const result = spawnSync(process.execPath, [files.build], {
    cwd: root,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || 'Build failed');
  }
};

const runGit = (args) => {
  const result = spawnSync('git', args, {
    cwd: root,
    encoding: 'utf8',
  });
  return {
    ok: result.status === 0,
    status: result.status,
    output: [result.stdout, result.stderr].filter(Boolean).join('\n').trim(),
  };
};

const gitSummary = () => {
  const branch = runGit(['branch', '--show-current']);
  const status = runGit(['status', '--short']);
  return {
    branch: branch.ok ? branch.output : '',
    status: status.output,
    hasChanges: Boolean(status.output.trim()),
  };
};

const pushGit = () => {
  runBuild();
  const before = gitSummary();
  if (!before.hasChanges) {
    return { ...before, pushed: false, message: 'Không có thay đổi mới để push.' };
  }

  const add = runGit(['add', '-A']);
  if (!add.ok) throw new Error(add.output || 'git add failed');

  const message = `Update website ${new Date().toISOString().slice(0, 10)}`;
  const commit = runGit(['commit', '-m', message]);
  const nothingToCommit = /nothing to commit|no changes added/i.test(commit.output);
  if (!commit.ok && !nothingToCommit) throw new Error(commit.output || 'git commit failed');

  const branch = gitSummary().branch || 'main';
  const push = runGit(['push', 'origin', branch]);
  if (!push.ok) throw new Error(push.output || 'git push failed');

  return {
    ...gitSummary(),
    pushed: true,
    message: `Đã commit và push lên origin/${branch}.`,
    commit: commit.output,
    push: push.output,
  };
};

const loadSettings = () => {
  if (!fs.existsSync(files.settings)) {
    return { featuredIds: [], headerImages: [], categoryImages: {} };
  }
  return normalizeSettings(JSON.parse(fs.readFileSync(files.settings, 'utf8')));
};

const saveSettings = (settings) => {
  fs.mkdirSync(path.dirname(files.settings), { recursive: true });
  fs.writeFileSync(files.settings, JSON.stringify(normalizeSettings(settings), null, 2) + '\n');
};

const parseMultipartImage = (contentType, body) => {
  const boundaryMatch = contentType.match(/boundary=(.+)$/);
  if (!boundaryMatch) return null;
  const boundary = Buffer.from(`--${boundaryMatch[1]}`);
  const parts = [];
  let start = body.indexOf(boundary);
  while (start !== -1) {
    const next = body.indexOf(boundary, start + boundary.length);
    if (next === -1) break;
    parts.push(body.slice(start + boundary.length + 2, next - 2));
    start = next;
  }

  for (const part of parts) {
    const sep = part.indexOf(Buffer.from('\r\n\r\n'));
    if (sep === -1) continue;
    const header = part.slice(0, sep).toString('utf8');
    if (!/name="image"/.test(header)) continue;
    const filename = header.match(/filename="([^"]*)"/)?.[1] || 'upload.jpg';
    const type = header.match(/Content-Type:\s*([^\r\n]+)/i)?.[1] || 'application/octet-stream';
    const data = part.slice(sep + 4);
    return { filename, type, data };
  }
  return null;
};

const handleApi = async (req, res, pathname) => {
  try {
    if (pathname === '/api/products.php' && req.method === 'GET') {
      sendJson(res, { ok: true, products: JSON.parse(fs.readFileSync(files.products, 'utf8')) });
      return true;
    }

    if (pathname === '/api/products.php' && req.method === 'POST') {
      const body = JSON.parse((await readBody(req)).toString('utf8'));
      if (!Array.isArray(body.products)) throw new Error('Missing products array');
      fs.writeFileSync(files.products, JSON.stringify(body.products, null, 2) + '\n');
      runBuild();
      sendJson(res, { ok: true, products: JSON.parse(fs.readFileSync(files.products, 'utf8')) });
      return true;
    }

    if (pathname === '/api/settings.php' && req.method === 'GET') {
      sendJson(res, { ok: true, settings: loadSettings() });
      return true;
    }

    if (pathname === '/api/settings.php' && req.method === 'POST') {
      const body = JSON.parse((await readBody(req)).toString('utf8'));
      saveSettings(body.settings || {});
      runBuild();
      sendJson(res, { ok: true, settings: loadSettings() });
      return true;
    }

    if (pathname === '/api/orders.php') {
      sendJson(res, { ok: true, orders: [] });
      return true;
    }

    if (pathname === '/api/git.php' && req.method === 'GET') {
      sendJson(res, { ok: true, git: gitSummary() });
      return true;
    }

    if (pathname === '/api/git.php' && req.method === 'POST') {
      const bodyText = (await readBody(req)).toString('utf8') || '{}';
      const body = JSON.parse(bodyText);
      if (body.action !== 'push') throw new Error('Unsupported git action');
      sendJson(res, { ok: true, git: pushGit() });
      return true;
    }

    if (pathname === '/api/upload.php' && req.method === 'POST') {
      const image = parseMultipartImage(req.headers['content-type'] || '', await readBody(req));
      if (!image) throw new Error('No image uploaded');
      fs.mkdirSync(files.uploads, { recursive: true });
      const ext = path.extname(image.filename) || (image.type.includes('png') ? '.png' : '.jpg');
      const base = safeName(path.basename(image.filename, path.extname(image.filename)));
      const filename = `${Date.now()}-${base}${ext.toLowerCase()}`;
      const filePath = path.join(files.uploads, filename);
      fs.writeFileSync(filePath, image.data);
      sendJson(res, { ok: true, url: `/assets/products/uploads/${filename}` });
      return true;
    }
  } catch (error) {
    sendJson(res, { ok: false, message: error.message }, 500);
    return true;
  }

  return false;
};

const serveStatic = (req, res, pathname) => {
  const requestPath = pathname === '/' ? '/index.html' : pathname;
  let filePath = path.normalize(path.join(root, decodeURIComponent(requestPath)));
  if (!filePath.startsWith(root)) {
    send(res, 403, 'Forbidden');
    return;
  }
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    send(res, 404, 'Not found');
    return;
  }
  const type = mime[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  fs.createReadStream(filePath).pipe(res);
};

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
  if (await handleApi(req, res, pathname)) return;
  serveStatic(req, res, pathname);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Website: http://127.0.0.1:${port}/`);
  console.log(`Admin:   http://127.0.0.1:${port}/admin-upload.html`);
});
