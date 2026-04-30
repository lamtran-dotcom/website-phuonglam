const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const siteUrl = 'https://phuonglam.com';

const paths = {
  index: path.join(root, 'index.html'),
  products: path.join(root, 'data', 'products.json'),
  settings: path.join(root, 'data', 'settings.json'),
  cssDir: path.join(root, 'assets', 'css'),
  jsDir: path.join(root, 'assets', 'js'),
  babelStandalone: path.join(root, 'tools', 'vendor', 'babel-standalone-7.29.0.min.js'),
  generatedMediaDir: path.join(root, 'assets', 'media', 'generated'),
  generatedProductDir: path.join(root, 'assets', 'products', 'generated'),
  productPagesDir: path.join(root, 'san-pham'),
  categoryPagesDir: path.join(root, 'danh-muc'),
};

const categoryFallback = {
  'nen-thom': 'Nến Xông',
  combo: 'Combo Xông Nhà',
  'thao-moc-xong': 'Thảo Mộc Xông',
  'bep-xong': 'Đèn Xông Tinh Dầu',
  'nen-tru': 'Nến Trụ',
  'nu-tram': 'Nụ Trầm',
  'phu-kien': 'Phụ Kiện Xông',
  'nen-ly': 'Nến Ly',
};

const categoryAliases = {
  'tinh-dau': 'bep-xong',
};

const normalizeCategoryId = (value) => categoryAliases[String(value || '')] || String(value || 'nen-thom');
const pl004Quantities = ['2 Vỉ 4h = 20 viên', '50 Viên 4h', 'Hộp 100 Viên 4h'];

const pl004QuantityFromName = (name) => {
  const text = String(name || '').toLowerCase();
  if (text.includes('100')) return pl004Quantities[2];
  if (text.includes('50')) return pl004Quantities[1];
  return pl004Quantities[0];
};

const normalizePl004Product = (product) => {
  if (product?.sku !== 'PL-004') return product;
  return {
    ...product,
    optionGroups: [
      { name: 'Màu', values: ['Hương lài'] },
      { name: 'Số lượng', values: pl004Quantities },
    ],
    variants: (product.variants || []).map((variant) => ({
      ...variant,
      options: {
        'Màu': 'Hương lài',
        'Số lượng': pl004QuantityFromName(variant.name),
      },
    })),
  };
};

const sp196OptionValues = [
  '2 hộp / 20V - Trơn',
  'Hộp 10V - Trơn',
  'Hộp 10V - Trắng',
  '2 hộp / 20V - Đỏ',
  '2 hộp / 20V - Vàng',
  '2 hộp / 20V - Trắng',
  'Hộp 10V - Lài',
  '2 hộp / 20V - Lài',
];

const sp196OptionByVariantId = {
  shopee_variant_181860225801: '2 hộp / 20V - Trơn',
  shopee_variant_281265692611: 'Hộp 10V - Trơn',
  shopee_variant_281265692609: 'Hộp 10V - Trắng',
  shopee_variant_240485670556: '2 hộp / 20V - Đỏ',
  shopee_variant_220387704322: '2 hộp / 20V - Vàng',
  shopee_variant_281265692610: 'Hộp 10V - Trắng',
  shopee_variant_220387704321: '2 hộp / 20V - Trắng',
  shopee_variant_291432885081: 'Hộp 10V - Lài',
  shopee_variant_272429767579: '2 hộp / 20V - Lài',
  shopee_variant_240485670557: '2 hộp / 20V - Trắng',
  shopee_variant_240485670559: '2 hộp / 20V - Vàng',
  shopee_variant_240485670558: '2 hộp / 20V - Đỏ',
};

const normalizeSp196Product = (product) => {
  if (product?.sku !== 'SP-19636361517') return product;
  return {
    ...product,
    optionGroups: [
      { name: 'Loại', values: ['4 Giờ Mai', '4 Giờ Trơn', '4 Giờ Lài', '2h Giờ'] },
      { name: 'Số lượng', values: sp196OptionValues },
    ],
    variants: (product.variants || []).map((variant) => ({
      ...variant,
      options: {
        ...(variant.options || {}),
        'Số lượng': sp196OptionByVariantId[variant.id] || variant.options?.['Số lượng'] || variant.name,
      },
    })),
  };
};

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });

const resetDir = (dir) => {
  fs.rmSync(dir, { recursive: true, force: true });
  ensureDir(dir);
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const stripHtml = (value = '') => String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const truncate = (value, max = 155) => {
  const text = stripHtml(value);
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
};

const slugify = (value) => {
  const slug = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'san-pham';
};

const formatVnd = (value) =>
  Number(value || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const jsonForHtml = (value) =>
  JSON.stringify(value, null, 2)
    .replace(/<\/script/gi, '<\\/script')
    .replace(/<!--/g, '<\\!--');

const jsonForInlineScript = (value) =>
  JSON.stringify(value)
    .replace(/<\/script/gi, '<\\/script')
    .replace(/<!--/g, '<\\!--');

const makeUniqueSlugs = (products) => {
  const seen = new Map();
  return products.map((product) => {
    const base = product.slug ? slugify(product.slug) : slugify(product.name);
    const count = seen.get(base) || 0;
    seen.set(base, count + 1);
    return { ...product, slug: count ? `${base}-${count + 1}` : base };
  });
};

const dataUrlExt = (mime) => {
  if (mime === 'jpeg' || mime === 'jpg') return 'jpg';
  if (mime === 'png') return 'png';
  if (mime === 'webp') return 'webp';
  if (mime === 'gif') return 'gif';
  return 'bin';
};

const makeDataUrlExtractor = ({ dir, publicDir, prefix }) => {
  ensureDir(dir);
  const seen = new Map();
  let counter = 1;
  return (dataUrl) => {
    if (!String(dataUrl).startsWith('data:image/')) return dataUrl;
    if (seen.has(dataUrl)) return seen.get(dataUrl);

    const match = dataUrl.match(/^data:image\/([a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/);
    if (!match) return dataUrl;

    const ext = dataUrlExt(match[1].toLowerCase());
    const filename = `${prefix}-${String(counter).padStart(3, '0')}.${ext}`;
    counter += 1;
    const filePath = path.join(dir, filename);
    const publicPath = `${publicDir}/${filename}`;
    fs.writeFileSync(filePath, Buffer.from(match[2], 'base64'));
    seen.set(dataUrl, publicPath);
    return publicPath;
  };
};

const replaceDataUrlsInText = (text, extractor) =>
  text.replace(/data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g, (match) => extractor(match));

const replaceDataUrlsInObject = (value, extractor) => {
  if (typeof value === 'string') return extractor(value);
  if (Array.isArray(value)) return value.map((item) => replaceDataUrlsInObject(item, extractor));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, replaceDataUrlsInObject(item, extractor)])
    );
  }
  return value;
};

const extractInitialData = (dataScript) => {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(dataScript, context);
  return {
    categories: context.window.CATEGORIES || [],
    blogPosts: context.window.BLOG_POSTS || [],
  };
};

const firstImage = (product) => {
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  if (images[0]) return images[0];
  const variants = Array.isArray(product.variants) ? product.variants : [];
  return variants.map((variant) => variant.image).find(Boolean) || '';
};

const normalizeProductVariants = (product) => {
  if (!product || !Array.isArray(product.variants)) return [];
  return product.variants
    .map((variant, index) => ({
      id: variant.id || `variant_${index}`,
      name: String(variant.name || '').trim(),
      sku: String(variant.sku || '').trim(),
      price: Number(variant.price) || 0,
      originalPrice: variant.originalPrice ? Number(variant.originalPrice) : null,
      weight: variant.weight ? Number(variant.weight) : null,
      image: variant.image || '',
      options: variant.options && typeof variant.options === 'object' && !Array.isArray(variant.options) ? variant.options : {},
    }))
    .filter((variant) => variant.name && variant.price > 0);
};

const getStaticPriceInfo = (product) => {
  const variants = normalizeProductVariants(product);
  if (!variants.length) {
    return {
      price: Number(product.price) || 0,
      originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
      hasVariants: false,
    };
  }
  const cheapest = variants.reduce((best, variant) => (variant.price < best.price ? variant : best), variants[0]);
  return {
    price: cheapest.price,
    originalPrice: cheapest.originalPrice,
    hasVariants: true,
  };
};

const responsiveImageAttrs = (src, sizes) => {
  if (!src || typeof src !== 'string' || src.startsWith('data:')) return '';
  const pathOnly = src.split('?')[0];
  if (!pathOnly.startsWith('/assets/products/mirrored/') && !pathOnly.startsWith('/assets/products/uploads/')) return '';
  const fileName = pathOnly.split('/').pop() || '';
  const baseName = fileName.replace(/\.[^.]+$/, '');
  if (!baseName) return '';
  const srcset = `/assets/products/responsive/${baseName}-480.webp 480w, /assets/products/responsive/${baseName}-720.webp 720w, ${src} 900w`;
  return ` srcset="${escapeHtml(srcset)}" sizes="${escapeHtml(sizes)}"`;
};

const absoluteUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//.test(url)) return url;
  if (url.startsWith('/')) return `${siteUrl}${url}`;
  return `${siteUrl}/${url.replace(/^\.\//, '')}`;
};

const writeStaticCss = () => {
  const css = `:root {
  --seo-primary: #318223;
  --seo-text: #1f2f21;
  --seo-muted: #657265;
  --seo-border: #e4ebdf;
  --seo-bg: #f7faf5;
}
* { box-sizing: border-box; }
html { width: 100%; max-width: 100%; overflow-x: hidden; }
body { margin: 0; width: 100%; max-width: 100%; overflow-x: hidden; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: var(--seo-text); background: #fff; line-height: 1.65; }
a { color: inherit; }
.seo-header, .seo-footer { max-width: 1120px; margin: 0 auto; padding: 22px 20px; display: flex; gap: 18px; align-items: center; justify-content: space-between; }
.seo-logo { font-weight: 900; color: var(--seo-primary); text-decoration: none; font-size: 22px; }
.seo-nav { display: flex; gap: 16px; flex-wrap: wrap; font-size: 14px; color: var(--seo-muted); }
.seo-nav a { text-decoration: none; }
.seo-actions { display: flex; align-items: center; gap: 10px; }
.seo-cart { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px; border: 1px solid var(--seo-border); border-radius: 12px; color: var(--seo-text); text-decoration: none; background: #fff; }
.seo-cart-count { position: absolute; top: -7px; right: -7px; min-width: 20px; height: 20px; border-radius: 999px; background: var(--seo-primary); color: #fff; font-size: 11px; font-weight: 900; display: inline-flex; align-items: center; justify-content: center; padding: 0 5px; }
.static-toast { position: fixed; left: 50%; bottom: 22px; transform: translate(-50%, 14px); z-index: 30; background: #15331a; color: #fff; border-radius: 999px; padding: 12px 18px; box-shadow: 0 14px 34px rgba(0,0,0,.18); opacity: 0; pointer-events: none; transition: opacity .2s ease, transform .2s ease; font-weight: 800; font-size: 14px; }
.static-toast.is-visible { opacity: 1; transform: translate(-50%, 0); }
.seo-main { width: 100%; max-width: 1120px; margin: 0 auto; padding: 20px; overflow-x: hidden; }
.breadcrumb { font-size: 13px; color: var(--seo-muted); margin: 0 0 18px; overflow-wrap: anywhere; }
.breadcrumb a { color: var(--seo-muted); text-decoration: none; }
.product-layout { display: grid; grid-template-columns: minmax(280px, 480px) minmax(0, 1fr); gap: 40px; align-items: start; min-width: 0; }
.product-image { width: 100%; border-radius: 18px; border: 1px solid var(--seo-border); background: var(--seo-bg); aspect-ratio: 1 / 1; object-fit: cover; }
.product-kicker { color: var(--seo-primary); font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; margin: 0 0 8px; }
h1 { font-size: clamp(28px, 5vw, 52px); line-height: 1.08; margin: 0 0 16px; letter-spacing: 0; overflow-wrap: anywhere; }
h2 { font-size: clamp(22px, 3vw, 32px); line-height: 1.18; margin: 36px 0 12px; }
.price { color: var(--seo-primary); font-size: 30px; font-weight: 900; margin: 18px 0; }
.original-price { color: #9aa49a; text-decoration: line-through; font-size: 18px; margin-left: 10px; }
.summary, .content { color: #334833; font-size: 17px; overflow-wrap: anywhere; }
.meta-list { display: grid; gap: 10px; padding: 18px; border: 1px solid var(--seo-border); border-radius: 14px; background: var(--seo-bg); margin: 22px 0; }
.cta { display: inline-flex; align-items: center; justify-content: center; background: var(--seo-primary); color: #fff; text-decoration: none; border-radius: 10px; padding: 14px 20px; font-weight: 800; margin-top: 10px; }
.buy-box { display: grid; gap: 12px; padding: 18px; border: 1px solid var(--seo-border); border-radius: 16px; background: #fff; box-shadow: 0 12px 30px rgba(22, 63, 22, .08); margin-top: 18px; }
.buy-price { color: var(--seo-primary); font-size: 28px; font-weight: 900; line-height: 1.1; }
.buy-original { color: #9aa49a; text-decoration: line-through; font-size: 16px; font-weight: 600; margin-left: 8px; }
.buy-label { display: grid; gap: 6px; font-size: 13px; font-weight: 800; color: #334833; }
.buy-select, .buy-qty { width: 100%; border: 1px solid var(--seo-border); border-radius: 10px; padding: 12px 13px; font: inherit; background: #fff; color: var(--seo-text); }
.buy-row { display: grid; grid-template-columns: minmax(0, 120px) minmax(0, 1fr); gap: 12px; align-items: end; }
.buy-btn { border: 0; border-radius: 10px; padding: 14px 18px; background: var(--seo-primary); color: #fff; font: inherit; font-weight: 900; cursor: pointer; }
.buy-link { display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--seo-primary); border-radius: 10px; padding: 12px 16px; color: var(--seo-primary); text-decoration: none; font-weight: 800; }
.buy-status { min-height: 22px; color: var(--seo-primary); font-weight: 800; font-size: 14px; }
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 24px; }
.card { border: 1px solid var(--seo-border); border-radius: 14px; overflow: hidden; background: #fff; text-decoration: none; display: block; }
.card img { width: 100%; aspect-ratio: 1 / 1; object-fit: cover; background: var(--seo-bg); display: block; }
.card-body { padding: 14px; }
.card-title { font-weight: 800; line-height: 1.4; margin: 0 0 8px; font-size: 15px; }
.card-price { color: var(--seo-primary); font-weight: 900; }
.category-intro { max-width: 780px; color: var(--seo-muted); font-size: 17px; }
.seo-footer { border-top: 1px solid var(--seo-border); margin-top: 50px; color: var(--seo-muted); font-size: 14px; }
@media (max-width: 820px) {
  .seo-main { padding: 16px; }
  .product-layout { grid-template-columns: minmax(0, 1fr); gap: 24px; }
  h1 { font-size: 28px; line-height: 1.15; }
  .buy-row { grid-template-columns: 1fr; }
  .grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .seo-header, .seo-footer { align-items: flex-start; flex-direction: column; }
  .seo-actions { align-self: stretch; justify-content: flex-end; }
}
`;
  fs.writeFileSync(path.join(paths.cssDir, 'static-seo.css'), css);
};

const renderStaticRuntimeScript = () => `<script>
(() => {
  const countEl = document.querySelector('[data-static-cart-count]');
  const toastEl = document.querySelector('[data-static-toast]');
  let toastTimer = null;
  const readCart = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem('phuonglam-cart') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };
  const updateCartCount = () => {
    const count = readCart().reduce((total, item) => total + Number(item.qty || 0), 0);
    if (countEl) {
      countEl.textContent = String(count);
      countEl.hidden = count <= 0;
    }
    return count;
  };
  const showToast = (message) => {
    if (!toastEl) return;
    toastEl.textContent = message || 'Đã cập nhật giỏ hàng.';
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2200);
  };
  document.addEventListener('phuonglam-cart-updated', (event) => {
    updateCartCount();
    showToast(event.detail?.message || 'Đã thêm vào giỏ hàng.');
  });
  window.addEventListener('storage', (event) => {
    if (event.key === 'phuonglam-cart') updateCartCount();
  });
  window.PhuongLamStaticCart = { updateCartCount, showToast };
  updateCartCount();
})();
</script>`;

const pageShell = ({ title, description, canonical, image, schema, body, scripts = '' }) => `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  ${image ? `<meta property="og:image" content="${escapeHtml(absoluteUrl(image))}" />` : ''}
  <link rel="stylesheet" href="/assets/css/static-seo.css" />
  <script type="application/ld+json">${jsonForHtml(schema)}</script>
</head>
<body>
  <header class="seo-header">
    <a class="seo-logo" href="/">Phương Lâm</a>
    <nav class="seo-nav" aria-label="Điều hướng chính">
      <a href="/">Trang chủ</a>
      <a href="/danh-muc/nen-thom/">Nến xông</a>
      <a href="/danh-muc/thao-moc-xong/">Thảo mộc xông</a>
      <a href="/danh-muc/bep-xong/">Đèn xông tinh dầu</a>
    </nav>
    <div class="seo-actions">
      <a class="seo-cart" href="/?cart=open" aria-label="Xem giỏ hàng">
        🛍
        <span class="seo-cart-count" data-static-cart-count hidden>0</span>
      </a>
    </div>
  </header>
  ${body}
  <footer class="seo-footer">
    <div>Phương Lâm - Nến thơm, nến tealight và thảo mộc xông tự nhiên.</div>
    <div>Zalo/Hotline: 077 3829 593</div>
  </footer>
  <div class="static-toast" data-static-toast role="status" aria-live="polite"></div>
  ${renderStaticRuntimeScript()}
${scripts ? `  ${scripts}\n` : ''}</body>
</html>
`;

const breadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

const productSchema = ({ product, categoryName, url, image }) => {
  const priceInfo = getStaticPriceInfo(product);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbSchema([
        { name: 'Trang chủ', url: siteUrl },
        { name: categoryName, url: `${siteUrl}/danh-muc/${product.categoryId}/` },
        { name: product.name, url },
      ]),
      {
        '@type': 'Product',
        name: product.name,
        image: image ? [absoluteUrl(image)] : undefined,
        description: stripHtml(product.description || product.shortDesc || product.name),
        sku: product.sku || String(product.id),
        brand: { '@type': 'Brand', name: 'Phương Lâm' },
        category: categoryName,
        offers: {
          '@type': 'Offer',
          url,
          priceCurrency: 'VND',
          price: priceInfo.price,
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
        },
      },
    ],
  };
};

const categorySchema = ({ categoryName, categoryUrl }) => ({
  '@context': 'https://schema.org',
  '@graph': [
    breadcrumbSchema([
      { name: 'Trang chủ', url: siteUrl },
      { name: categoryName, url: categoryUrl },
    ]),
    {
      '@type': 'CollectionPage',
      name: categoryName,
      url: categoryUrl,
    },
  ],
});

const organizationSchema = () => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'Phương Lâm',
      url: siteUrl,
      logo: `${siteUrl}/assets/media/generated/embedded-001.png`,
      contactPoint: [{
        '@type': 'ContactPoint',
        telephone: '+84-77-382-9593',
        contactType: 'customer service',
        areaServed: 'VN',
        availableLanguage: ['vi'],
      }],
    },
    {
      '@type': 'WebSite',
      name: 'Phương Lâm',
      url: siteUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ],
});

const normalizeSettings = (value = {}) => {
  const featuredIds = [];
  for (const id of Array.isArray(value.featuredIds) ? value.featuredIds : []) {
    const normalized = String(id);
    if (normalized && !featuredIds.includes(normalized)) featuredIds.push(normalized);
  }
  const headerImages = (Array.isArray(value.headerImages) ? value.headerImages : []).filter(Boolean);
  const rawCategoryImages = value.categoryImages && typeof value.categoryImages === 'object' && !Array.isArray(value.categoryImages)
    ? value.categoryImages
    : {};
  const categoryImages = {};
  for (const [categoryId, src] of Object.entries(rawCategoryImages)) {
    if (src) categoryImages[normalizeCategoryId(categoryId)] = src;
  }
  return { featuredIds, headerImages, categoryImages };
};

const readInlineJson = (source, marker, fallback) => {
  const pattern = new RegExp(`/\\*${marker}\\*/([\\s\\S]*?)/\\*END_${marker}\\*/`);
  const match = source.match(pattern);
  if (!match) return fallback;
  try {
    return JSON.parse(match[1]);
  } catch {
    return fallback;
  }
};

const writeInlineJson = (source, marker, value) => {
  const pattern = new RegExp(`/\\*${marker}\\*/[\\s\\S]*?/\\*END_${marker}\\*/`);
  return source.replace(pattern, `/*${marker}*/${jsonForInlineScript(value)}/*END_${marker}*/`);
};

const ensureSettingsJson = () => {
  const appPath = path.join(paths.jsDir, 'app.jsx');
  let settings;
  if (fs.existsSync(paths.settings)) {
    settings = normalizeSettings(JSON.parse(fs.readFileSync(paths.settings, 'utf8')));
  } else {
    const source = fs.existsSync(appPath) ? fs.readFileSync(appPath, 'utf8') : '';
    settings = normalizeSettings({
      featuredIds: readInlineJson(source, 'BAKED_FEATURED', []),
      headerImages: readInlineJson(source, 'BAKED_HEADER_IMAGES', []),
      categoryImages: readInlineJson(source, 'BAKED_CATEGORY_IMAGES', {}),
    });
  }
  ensureDir(path.dirname(paths.settings));
  fs.writeFileSync(paths.settings, JSON.stringify(settings, null, 2) + '\n');
  return settings;
};

const bakeSettingsIntoApp = (settings) => {
  const appPath = path.join(paths.jsDir, 'app.jsx');
  let source = fs.readFileSync(appPath, 'utf8');
  source = writeInlineJson(source, 'BAKED_FEATURED', settings.featuredIds);
  source = writeInlineJson(source, 'BAKED_HEADER_IMAGES', settings.headerImages);
  source = writeInlineJson(source, 'BAKED_CATEGORY_IMAGES', settings.categoryImages);
  fs.writeFileSync(appPath, source);
};

const bakeProductsIntoApp = (products) => {
  const appPath = path.join(paths.jsDir, 'app.jsx');
  let source = fs.readFileSync(appPath, 'utf8');
  // Product data already lives in site-data.js. Keep the baked slot empty to
  // avoid shipping and parsing the same catalog twice on the storefront.
  source = writeInlineJson(source, 'BAKED_PRODUCTS', []);
  fs.writeFileSync(appPath, source);
};

const renderStaticBuyBox = (product) => {
  const variants = normalizeProductVariants(product);
  const cheapestVariant = variants.length
    ? variants.reduce((best, variant) => (variant.price < best.price ? variant : best), variants[0])
    : null;
  const price = cheapestVariant ? cheapestVariant.price : Number(product.price || 0);
  const originalPrice = cheapestVariant ? cheapestVariant.originalPrice : product.originalPrice;
  const options = variants.map((variant) =>
    `<option value="${escapeHtml(variant.id)}">${escapeHtml(variant.name)} - ${formatVnd(variant.price)}</option>`
  ).join('');
  const variantField = variants.length ? `<label class="buy-label">Phân loại
      <select class="buy-select" data-variant-select>${options}</select>
    </label>
    ` : '';

  return `<form class="buy-box" data-buy-box>
    <div class="buy-price" data-buy-price>${formatVnd(price)}${originalPrice ? `<span class="buy-original" data-buy-original>${formatVnd(originalPrice)}</span>` : '<span class="buy-original" data-buy-original hidden></span>'}</div>
    ${variantField}<div class="buy-row">
      <label class="buy-label">Số lượng
        <input class="buy-qty" data-buy-qty type="number" min="1" step="1" value="1" inputmode="numeric" />
      </label>
      <button class="buy-btn" type="submit">+ Thêm vào giỏ</button>
    </div>
    <a class="buy-link" href="/?cart=open">Xem giỏ hàng</a>
    <div class="buy-status" data-buy-status aria-live="polite"></div>
  </form>`;
};

const renderStaticBuyScript = (product) => {
  const variants = normalizeProductVariants(product);
  const payload = {
    ...product,
    variants,
  };
  return `<script>
(() => {
  const product = ${jsonForInlineScript(payload)};
  const variants = ${jsonForInlineScript(variants)};
  const form = document.querySelector('[data-buy-box]');
  if (!form) return;
  const select = form.querySelector('[data-variant-select]');
  const qtyInput = form.querySelector('[data-buy-qty]');
  const priceEl = form.querySelector('[data-buy-price]');
  const originalEl = form.querySelector('[data-buy-original]');
  const statusEl = form.querySelector('[data-buy-status]');
  const money = (value) => Number(value || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  const getVariant = () => variants.find((variant) => variant.id === select?.value) || variants[0] || null;
  const keyOf = (item) => item.cartKey || (item.selectedVariant?.id ? item.id + '__' + item.selectedVariant.id : String(item.id));
  const buildItem = (variant) => {
    if (!variant) return { ...product, cartKey: String(product.id) };
    return {
      ...product,
      sku: variant.sku || product.sku,
      price: Number(variant.price) || Number(product.price) || 0,
      originalPrice: variant.originalPrice || product.originalPrice || null,
      weight: variant.weight || product.weight || null,
      selectedVariant: {
        id: variant.id,
        name: variant.name,
        image: variant.image || '',
      },
      cartKey: product.id + '__' + variant.id,
    };
  };
  const readCart = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem('phuonglam-cart') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };
  const writeCart = (cart) => localStorage.setItem('phuonglam-cart', JSON.stringify(cart));
  const updatePrice = () => {
    const variant = getVariant();
    const price = variant ? variant.price : product.price;
    const original = variant ? variant.originalPrice : product.originalPrice;
    if (priceEl) priceEl.firstChild.textContent = money(price);
    if (originalEl) {
      originalEl.textContent = original ? money(original) : '';
      originalEl.hidden = !original;
    }
  };
  select?.addEventListener('change', updatePrice);
  updatePrice();
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const qty = Math.max(1, parseInt(qtyInput?.value || '1', 10) || 1);
    const item = buildItem(getVariant());
    const key = keyOf(item);
    const cart = readCart();
    const existing = cart.find((cartItem) => keyOf(cartItem) === key);
    if (existing) {
      existing.qty = Number(existing.qty || 0) + qty;
    } else {
      cart.push({ ...item, qty });
    }
    writeCart(cart);
    if (statusEl) statusEl.textContent = 'Đã thêm vào giỏ hàng.';
    document.dispatchEvent(new CustomEvent('phuonglam-cart-updated', {
      detail: { message: 'Đã thêm vào giỏ hàng.' },
    }));
  });
})();
</script>`;
};

const renderProductPage = ({ product, categoryName }) => {
  const image = firstImage(product);
  const productUrl = `${siteUrl}/san-pham/${product.slug}/`;
  const description = truncate(product.shortDesc || product.description || product.name);
  const priceInfo = getStaticPriceInfo(product);
  const body = `<main class="seo-main">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="/">Trang chủ</a> / <a href="/danh-muc/${escapeHtml(product.categoryId)}/">${escapeHtml(categoryName)}</a> / ${escapeHtml(product.name)}
    </nav>
    <article class="product-layout">
      <div>
        ${image ? `<img class="product-image" src="${escapeHtml(image)}"${responsiveImageAttrs(image, '(max-width: 767px) 100vw, 480px')} alt="${escapeHtml(product.name)}" fetchpriority="high" />` : `<div class="product-image" role="img" aria-label="${escapeHtml(product.name)}"></div>`}
      </div>
      <div>
        <p class="product-kicker">${escapeHtml(categoryName)}</p>
        <h1>${escapeHtml(product.name)}</h1>
        <p class="summary">${escapeHtml(product.shortDesc || '')}</p>
        <div class="price">${priceInfo.hasVariants ? 'Từ ' : ''}${formatVnd(priceInfo.price)}${priceInfo.originalPrice ? `<span class="original-price">${formatVnd(priceInfo.originalPrice)}</span>` : ''}</div>
        <div class="meta-list">
          <div><strong>Thương hiệu:</strong> Phương Lâm</div>
          <div><strong>Mã sản phẩm:</strong> ${escapeHtml(product.sku || String(product.id))}</div>
          <div><strong>Tình trạng:</strong> Còn hàng</div>
        </div>
        ${renderStaticBuyBox(product)}
      </div>
    </article>
    <section class="content">
      <h2>Mô tả sản phẩm</h2>
      <p>${escapeHtml(product.description || product.shortDesc || product.name)}</p>
      ${product.usage ? `<h2>Cách dùng và lưu ý</h2><p>${escapeHtml(product.usage)}</p>` : ''}
    </section>
  </main>`;

  return pageShell({
    title: `${product.name} | Phương Lâm`,
    description,
    canonical: productUrl,
    image,
    schema: productSchema({ product, categoryName, url: productUrl, image }),
    body,
    scripts: renderStaticBuyScript(product),
  });
};

const renderCategoryPage = ({ categoryId, categoryName, products }) => {
  const categoryUrl = `${siteUrl}/danh-muc/${categoryId}/`;
  const description = `${categoryName} Phương Lâm: sản phẩm chọn lọc, phù hợp cho thư giãn, xông hương và chăm sóc không gian sống tự nhiên.`;
  const cards = products.map((product, index) => {
    const image = firstImage(product);
    const priceInfo = getStaticPriceInfo(product);
    const imagePriority = index < 6
      ? ' loading="eager" fetchpriority="high"'
      : ' loading="lazy"';
    return `<a class="card" href="/san-pham/${escapeHtml(product.slug)}/">
      ${image ? `<img src="${escapeHtml(image)}"${responsiveImageAttrs(image, '(max-width: 767px) 50vw, 260px')} alt="${escapeHtml(product.name)}"${imagePriority} />` : ''}
      <div class="card-body">
        <p class="card-title">${escapeHtml(product.name)}</p>
        <div class="card-price">${priceInfo.hasVariants ? 'Từ ' : ''}${formatVnd(priceInfo.price)}</div>
      </div>
    </a>`;
  }).join('\n');

  const body = `<main class="seo-main">
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Trang chủ</a> / ${escapeHtml(categoryName)}</nav>
    <h1>${escapeHtml(categoryName)} Phương Lâm</h1>
    <p class="category-intro">${escapeHtml(description)}</p>
    <section class="grid" aria-label="Danh sách sản phẩm">${cards}</section>
  </main>`;

  return pageShell({
    title: `${categoryName} Phương Lâm | Sản phẩm tự nhiên`,
    description,
    canonical: categoryUrl,
    image: firstImage(products[0] || {}),
    schema: categorySchema({ categoryName, categoryUrl }),
    body,
  });
};

const writeSeoPages = ({ products, categories }) => {
  resetDir(paths.productPagesDir);
  resetDir(paths.categoryPagesDir);
  writeStaticCss();
  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));
  for (const [id, name] of Object.entries(categoryFallback)) {
    if (!categoryNameById.has(id)) categoryNameById.set(id, name);
  }

  for (const product of products) {
    const dir = path.join(paths.productPagesDir, product.slug);
    ensureDir(dir);
    fs.writeFileSync(
      path.join(dir, 'index.html'),
      renderProductPage({
        product,
        categoryName: categoryNameById.get(product.categoryId) || product.categoryId,
      })
    );
  }

  const byCategory = new Map();
  for (const product of products) {
    if (product.hidden) continue;
    const list = byCategory.get(product.categoryId) || [];
    list.push(product);
    byCategory.set(product.categoryId, list);
  }

  for (const [categoryId, list] of byCategory.entries()) {
    const dir = path.join(paths.categoryPagesDir, categoryId);
    ensureDir(dir);
    fs.writeFileSync(
      path.join(dir, 'index.html'),
      renderCategoryPage({
        categoryId,
        categoryName: categoryNameById.get(categoryId) || categoryId,
        products: list,
      })
    );
  }
};

const writeSitemapAndRobots = ({ products, blogPosts = [] }) => {
  const urls = new Set([`${siteUrl}/`]);
  const categoryIds = new Set();
  for (const product of products) {
    urls.add(`${siteUrl}/san-pham/${product.slug}/`);
    if (product.categoryId) categoryIds.add(product.categoryId);
  }
  for (const id of categoryIds) urls.add(`${siteUrl}/danh-muc/${id}/`);
  // BLOG_POSTS with explicit url field
  for (const post of blogPosts) {
    if (post.url) urls.add(absoluteUrl(post.url));
  }
  // Scan blog/ directory — picks up ALL blog posts regardless of BLOG_POSTS list
  const blogDir = path.join(root, 'blog');
  if (fs.existsSync(blogDir)) {
    for (const cat of fs.readdirSync(blogDir)) {
      const catPath = path.join(blogDir, cat);
      if (!fs.statSync(catPath).isDirectory()) continue;
      for (const slug of fs.readdirSync(catPath)) {
        if (fs.existsSync(path.join(catPath, slug, 'index.html'))) {
          urls.add(`${siteUrl}/blog/${cat}/${slug}/`);
        }
      }
    }
  }
  for (const file of ['bep-xong-thao-moc-phuong-lam_3.html', 'phan-biet-nen-tealight-nen-2h-4h-8h-phuong-lam_7.html']) {
    if (fs.existsSync(path.join(root, file))) urls.add(`${siteUrl}/${file}`);
  }

  const today = new Date().toISOString().slice(0, 10);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...urls].sort().map((loc) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
  </url>`).join('\n')}
</urlset>
`;
  fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap);
  fs.writeFileSync(path.join(root, 'robots.txt'), `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`);
};

const updateIndexHead = (html) => {
  if (!html.includes('rel="canonical"')) {
    html = html.replace('</title>', `</title>\n  <link rel="canonical" href="${siteUrl}/" />`);
  }
  if (!html.includes('property="og:title"')) {
    const og = `  <meta property="og:type" content="website" />
  <meta property="og:title" content="Phương Lâm - Nến thơm & Thảo mộc tự nhiên" />
  <meta property="og:description" content="Cửa hàng nến thơm, nến tealight và thảo mộc xông tự nhiên. Giao hàng toàn quốc, kiểm tra trước khi nhận." />
  <meta property="og:url" content="${siteUrl}/" />
`;
    html = html.replace('</head>', `${og}</head>`);
  }
  if (!html.includes('application/ld+json')) {
    html = html.replace('</head>', `  <script type="application/ld+json">${jsonForHtml(organizationSchema())}</script>\n</head>`);
  }
  return html;
};

const compileAppJs = () => {
  if (!fs.existsSync(paths.babelStandalone)) {
    throw new Error(`Missing local Babel compiler: ${path.relative(root, paths.babelStandalone)}`);
  }
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(paths.babelStandalone, 'utf8'), sandbox);
  const appJsx = fs.readFileSync(path.join(paths.jsDir, 'app.jsx'), 'utf8');
  const result = sandbox.Babel.transform(appJsx, {
    presets: ['react'],
    comments: false,
    compact: true,
    minified: true,
    sourceType: 'script',
  });
  fs.writeFileSync(path.join(paths.jsDir, 'app.min.js'), `${result.code}\n`);
};

const externalizeIndex = () => {
  let html = fs.readFileSync(paths.index, 'utf8');
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
  if (styleMatch) {
    ensureDir(paths.cssDir);
    fs.writeFileSync(path.join(paths.cssDir, 'site.css'), styleMatch[1].trim() + '\n');
    html = html.replace(styleMatch[0], '<link rel="stylesheet" href="/assets/css/site.css" />');
  }

  const scripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)];
  const dataScript = scripts.find((match) => match[1].trim() === '' && match[2].includes('const CATEGORIES'));
  const appScript = scripts.find((match) => match[1].includes('text/babel') && match[2].includes('const App'));
  ensureDir(paths.jsDir);

  let dataSource = '';
  if (dataScript) {
    dataSource = dataScript[2];
    fs.writeFileSync(path.join(paths.jsDir, 'site-data.js'), dataSource.trim() + '\n');
    html = html.replace(dataScript[0], '<script src="/assets/js/site-data.js"></script>');
  } else {
    dataSource = fs.readFileSync(path.join(paths.jsDir, 'site-data.js'), 'utf8');
  }

  const initialData = extractInitialData(dataSource);

  const appExtractor = makeDataUrlExtractor({
    dir: paths.generatedMediaDir,
    publicDir: '/assets/media/generated',
    prefix: 'embedded',
  });

  if (appScript) {
    const appJsx = replaceDataUrlsInText(appScript[2], appExtractor);
    fs.writeFileSync(path.join(paths.jsDir, 'app.jsx'), appJsx.trim() + '\n');
    html = html.replace(appScript[0], '<script src="/assets/js/app.min.js"></script>');
  } else {
    const appPath = path.join(paths.jsDir, 'app.jsx');
    const appJsx = replaceDataUrlsInText(fs.readFileSync(appPath, 'utf8'), appExtractor);
    fs.writeFileSync(appPath, appJsx.trim() + '\n');
  }

  html = html
    .replace(/\n?\s*<script\s+src="https:\/\/unpkg\.com\/@babel\/standalone@[^"]+"><\/script>/, '')
    .replace(/\n?\s*<script\s+type="text\/babel"\s+src="\/assets\/js\/app\.jsx"><\/script>/, '\n<script src="/assets/js/app.min.js"></script>');

  html = updateIndexHead(html);
  fs.writeFileSync(paths.index, html);
  return initialData;
};

const replaceSiteDataProducts = (products) => {
  const siteDataPath = path.join(paths.jsDir, 'site-data.js');
  if (!fs.existsSync(siteDataPath)) return;

  let source = fs.readFileSync(siteDataPath, 'utf8');
  const startMarker = 'const PRODUCTS = [';
  const startIdx = source.indexOf(startMarker);
  if (startIdx === -1) return;

  // Find matching ]; by counting bracket depth
  let depth = 0;
  let endIdx = -1;
  for (let i = startIdx + startMarker.length - 1; i < source.length; i++) {
    if (source[i] === '[') depth++;
    else if (source[i] === ']') {
      depth--;
      if (depth === 0) {
        endIdx = i + 1;
        if (source[endIdx] === ';') endIdx++;
        break;
      }
    }
  }
  if (endIdx === -1) return;

  // Keep slugs in the React catalog so product cards can link to static pages.
  const appProducts = products;
  const newBlock = `const PRODUCTS = ${JSON.stringify(appProducts, null, 2)};`;
  source = source.slice(0, startIdx) + newBlock + source.slice(endIdx);
  fs.writeFileSync(siteDataPath, source);
};

const updateProductsJson = () => {
  const extractor = makeDataUrlExtractor({
    dir: paths.generatedProductDir,
    publicDir: '/assets/products/generated',
    prefix: 'product',
  });
  const original = JSON.parse(fs.readFileSync(paths.products, 'utf8'));
  const products = makeUniqueSlugs(replaceDataUrlsInObject(original, extractor).map((product) => normalizeSp196Product(normalizePl004Product({
    ...product,
    categoryId: normalizeCategoryId(product.categoryId),
  }))));
  fs.writeFileSync(paths.products, JSON.stringify(products, null, 2) + '\n');
  return products;
};

const bustIndexCache = () => {
  const indexPath = paths.index;
  let html = fs.readFileSync(indexPath, 'utf8');
  const v = Date.now();
  // Update ?v= on site-data.js and app.min.js for cache-busting
  html = html.replace(
    /(<script\b[^>]*\bsrc="\/assets\/js\/(?:site-data|app\.min)\.js)(?:\?v=\d+)?("[^>]*><\/script>)/g,
    `$1?v=${v}$2`
  );
  fs.writeFileSync(indexPath, html);
};

const optimizeIndexRuntime = () => {
  const indexPath = paths.index;
  let html = fs.readFileSync(indexPath, 'utf8');

  const runtimeTags = `  <script defer src="/assets/vendor/react.production.min.js"></script>
  <script defer src="/assets/vendor/react-dom.production.min.js"></script>`;
  html = html
    .replace(/\n?\s*<script\s+[^>]*src="https:\/\/unpkg\.com\/react@[^"]+"[^>]*><\/script>/g, '')
    .replace(/\n?\s*<script\s+[^>]*src="https:\/\/unpkg\.com\/react-dom@[^"]+"[^>]*><\/script>/g, '')
    .replace(/\n?\s*<script\s+[^>]*src="\/assets\/vendor\/react\.production\.min\.js[^"]*"[^>]*><\/script>/g, '')
    .replace(/\n?\s*<script\s+[^>]*src="\/assets\/vendor\/react-dom\.production\.min\.js[^"]*"[^>]*><\/script>/g, '')
    .replace(/\n?\s*<link\s+rel="preconnect"\s+href="https:\/\/cf\.shopee\.vn"[^>]*>/g, '')
    .replace(/\n?\s*<link\s+rel="icon"\s+href="\/favicon\.ico"[^>]*>/g, '')
    .replace(/\n?\s*<link\s+rel="apple-touch-icon"\s+href="\/apple-touch-icon\.png"[^>]*>/g, '')
    .replace(/\n?\s*<meta\s+name="theme-color"\s+content="#318223"\s*\/?>/g, '')
    .replace(/\n?\s*<meta\s+property="og:image"\s+content="https:\/\/phuonglam\.com\/assets\/media\/generated\/embedded-002\.jpg"\s*\/?>/g, '');
  html = html.replace('</head>', `${runtimeTags}\n</head>`);

  html = html
    .replace(/<script\s+src="\/assets\/js\/site-data\.js([^"]*)"[^>]*><\/script>/g, '<script defer src="/assets/js/site-data.js$1"></script>')
    .replace(/<script\s+src="\/assets\/js\/app\.min\.js([^"]*)"[^>]*><\/script>/g, '<script defer src="/assets/js/app.min.js$1"></script>');

  const preloadLinks = [
    '<link rel="icon" href="/favicon.ico" sizes="any" />',
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png" />',
    '<meta name="theme-color" content="#318223" />',
    '<meta property="og:image" content="https://phuonglam.com/assets/media/generated/embedded-002.jpg" />',
    '<link rel="preload" as="image" href="/assets/media/generated/embedded-002.jpg" fetchpriority="high" />',
    '<link rel="preload" as="image" href="/assets/products/uploads/1777435799447-chatgpt-image-14-52-27-22-thg-4-2026.webp" fetchpriority="high" />',
  ];
  for (const link of preloadLinks) {
    const marker = link.match(/(?:href|property|name)="([^"]+)"/)?.[1];
    if (marker && !html.includes(marker)) {
      html = html.replace('</head>', `  ${link}\n</head>`);
    }
  }

  fs.writeFileSync(indexPath, html);
};

const main = () => {
  ensureDir(paths.cssDir);
  ensureDir(paths.jsDir);
  const initialData = externalizeIndex();
  const products = updateProductsJson();
  replaceSiteDataProducts(products);
  bakeProductsIntoApp(products);
  const settings = ensureSettingsJson();
  bakeSettingsIntoApp(settings);
  compileAppJs();
  optimizeIndexRuntime();
  bustIndexCache();
  writeSeoPages({ products, categories: initialData.categories });
  writeSitemapAndRobots({ products, blogPosts: initialData.blogPosts });
  console.log(`Optimized index, extracted assets, and generated ${products.length} product pages.`);
};

main();
