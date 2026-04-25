const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const root = path.resolve(__dirname, '..');
const importFile = path.join(root, 'file sản phẩm từ shopee', 'shopee-products-import.json');
const requestedProductId = process.env.PRODUCT_ID || '';

const loadPreviewData = () => {
  const products = JSON.parse(fs.readFileSync(importFile, 'utf8'));
  const product = products.find(item => item.id === requestedProductId)
    || products.find(item => item.name.includes('Quế Thanh'))
    || products[0];
  return {
    product,
    settings: {
      featuredIds: [product.id],
      headerImages: product.images || [],
      categoryImages: {
        [product.categoryId]: product.images?.[0] || '',
      },
    },
  };
};

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

const sendJson = (res, data) => {
  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(data));
};

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  const pathname = decodeURIComponent(parsed.pathname || '/');
  const { product: queProduct, settings } = loadPreviewData();

  if (pathname === '/api/products.php') {
    sendJson(res, { ok: true, products: [queProduct] });
    return;
  }

  if (pathname === '/api/settings.php') {
    sendJson(res, { ok: true, settings });
    return;
  }

  if (pathname === '/api/orders.php') {
    sendJson(res, { ok: true, orders: [] });
    return;
  }

  if (pathname === '/preview-que.html') {
    let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    const boot = `<script>
      localStorage.setItem('herbly-page', JSON.stringify({ name: 'product', id: '${queProduct.id}' }));
      localStorage.removeItem('herbly-images');
    </script>`;
    html = html.replace('</head>', `${boot}\n</head>`);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(html);
    return;
  }

  const requested = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.normalize(path.join(root, requested));
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  res.writeHead(200, { 'Content-Type': mime[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

const port = Number(process.env.PORT || 5179);
server.listen(port, '127.0.0.1', () => {
  const { product: queProduct } = loadPreviewData();
  console.log(`Preview: http://127.0.0.1:${port}/preview-que.html`);
  console.log(`Product: ${queProduct.name}`);
});
