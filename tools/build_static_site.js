const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const siteUrl = 'https://phuonglam.com';
const assetVersion = Date.now();

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

const uniqueTruthy = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    if (!item || seen.has(item)) return false;
    seen.add(item);
    return true;
  });
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

const getStaticOptionGroups = (product, variants = normalizeProductVariants(product)) => {
  if (!Array.isArray(product.optionGroups)) return [];
  return product.optionGroups
    .filter((group) => group?.name && Array.isArray(group.values) && group.values.length)
    .map((group) => ({
      name: group.name,
      values: group.values.filter((value) =>
        variants.some((variant) => variant.options?.[group.name] === value)
      ),
    }))
    .filter((group) => group.values.length);
};

const getProductGalleryImages = (product) => {
  const variants = normalizeProductVariants(product);
  return uniqueTruthy([
    firstImage(product),
    ...(Array.isArray(product.images) ? product.images : []),
    ...variants.map((variant) => variant.image),
  ]);
};

const renderStaticParagraphs = (text) => {
  const normalized = String(text || '').replace(/\r\n/g, '\n').trim();
  if (!normalized) return '';
  return normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph.split('\n').map((line) => escapeHtml(line)).join('<br>')}</p>`)
    .join('\n      ');
};

const getStaticOptionImage = (product, variants, groupName, value) => {
  const optionImages = product.optionImages && typeof product.optionImages === 'object' ? product.optionImages : {};
  if (typeof optionImages[`${groupName}:${value}`] === 'string') return optionImages[`${groupName}:${value}`];
  if (typeof optionImages[value] === 'string') return optionImages[value];
  if (optionImages[groupName] && typeof optionImages[groupName][value] === 'string') return optionImages[groupName][value];
  return variants.find((variant) => variant.options?.[groupName] === value && variant.image)?.image || '';
};

const renderStaticVariantPill = ({ value, image = '', attrs = '' }) => {
  const thumb = image
    ? `\n          <img class="variant-pill-thumb" src="${escapeHtml(image)}"${responsiveImageAttrs(image, '(max-width: 767px) 24px, 28px')} alt="" loading="lazy" />`
    : '';
  return `<button class="variant-pill" type="button" data-option-value="${escapeHtml(value)}"${attrs}>${thumb}
          <span class="variant-pill-text">${escapeHtml(value)}</span>
        </button>`;
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
.seo-header { position: sticky; top: 0; z-index: 20; background: #fff; border-bottom: 1px solid #f0f0f0; }
.seo-header-inner { max-width: 1320px; margin: 0 auto; padding: 0 28px; min-height: 128px; display: flex; gap: 22px; align-items: center; justify-content: space-between; }
.seo-logo { display: flex; align-items: center; flex-shrink: 0; text-decoration: none; }
.seo-logo img { height: 120px; width: auto; display: block; transform: translateY(-10px); }
.seo-menu-toggle { position: absolute; opacity: 0; pointer-events: none; }
.seo-menu-btn { display: none; width: 42px; height: 42px; border: 0; background: transparent; border-radius: 10px; align-items: center; justify-content: center; cursor: pointer; }
.seo-menu-icon, .seo-menu-icon::before, .seo-menu-icon::after { display: block; width: 22px; height: 2px; border-radius: 2px; background: #333; content: ""; transition: transform .2s ease, opacity .2s ease; }
.seo-menu-icon { position: relative; }
.seo-menu-icon::before { position: absolute; top: -7px; left: 0; }
.seo-menu-icon::after { position: absolute; top: 7px; left: 0; }
.seo-menu-toggle:checked ~ .seo-actions .seo-menu-icon { background: transparent; }
.seo-menu-toggle:checked ~ .seo-actions .seo-menu-icon::before { transform: translateY(7px) rotate(45deg); }
.seo-menu-toggle:checked ~ .seo-actions .seo-menu-icon::after { transform: translateY(-7px) rotate(-45deg); }
.seo-nav { display: flex; gap: 16px; flex: 1; justify-content: center; align-items: center; flex-wrap: nowrap; font-size: 14.5px; color: #2d2d2d; font-weight: 700; }
.seo-nav a { text-decoration: none; white-space: nowrap; transition: color .2s ease; }
.seo-nav a:hover { color: var(--seo-primary); }
.seo-actions { display: flex; align-items: center; gap: 10px; }
.seo-icon-link, .seo-cart { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px; border: 0; border-radius: 10px; color: #444; text-decoration: none; background: transparent; }
.seo-cart-count { position: absolute; top: -7px; right: -7px; min-width: 20px; height: 20px; border-radius: 999px; background: var(--seo-primary); color: #fff; font-size: 11px; font-weight: 900; display: inline-flex; align-items: center; justify-content: center; padding: 0 5px; }
.seo-footer { max-width: 1120px; margin: 50px auto 0; padding: 22px 20px; display: flex; gap: 18px; align-items: center; justify-content: space-between; border-top: 1px solid var(--seo-border); color: var(--seo-muted); font-size: 14px; }
.static-toast { position: fixed; left: 50%; bottom: 22px; transform: translate(-50%, 14px); z-index: 30; background: #15331a; color: #fff; border-radius: 999px; padding: 12px 18px; box-shadow: 0 14px 34px rgba(0,0,0,.18); opacity: 0; pointer-events: none; transition: opacity .2s ease, transform .2s ease; font-weight: 800; font-size: 14px; }
.static-toast.is-visible { opacity: 1; transform: translate(-50%, 0); }
.seo-main { width: 100%; max-width: 1120px; margin: 0 auto; padding: 20px; overflow-x: hidden; }
.breadcrumb { font-size: 13px; color: var(--seo-muted); margin: 0 0 18px; overflow-wrap: anywhere; }
.breadcrumb a { color: var(--seo-muted); text-decoration: none; }
.product-layout { display: grid; grid-template-columns: minmax(280px, 480px) minmax(0, 1fr); gap: 40px; align-items: start; min-width: 0; }
.product-gallery { display: grid; gap: 12px; min-width: 0; }
.product-image { width: 100%; border-radius: 18px; border: 1px solid var(--seo-border); background: var(--seo-bg); aspect-ratio: 1 / 1; object-fit: cover; }
.product-thumbs-wrap { position: relative; min-width: 0; padding: 0 26px; }
.product-thumbs { display: flex; gap: 10px; overflow-x: auto; overflow-y: hidden; padding-bottom: 4px; scroll-snap-type: x proximity; scrollbar-width: none; }
.product-thumbs::-webkit-scrollbar { display: none; }
.product-thumb { flex: 0 0 calc((100% - 40px) / 5); width: calc((100% - 40px) / 5); padding: 0; border: 1.5px solid var(--seo-border); border-radius: 10px; background: #fff; cursor: pointer; overflow: hidden; transition: border-color .15s ease, box-shadow .15s ease; scroll-snap-align: start; }
.product-thumb img { width: 100%; aspect-ratio: 1 / 1; object-fit: cover; display: block; background: var(--seo-bg); }
.product-thumb.is-active { border-color: var(--seo-primary); box-shadow: 0 0 0 2px rgba(49, 130, 35, .12); }
.thumb-arrow { position: absolute; top: 50%; transform: translateY(-50%); z-index: 2; width: 30px; height: 42px; border: 0; border-radius: 8px; background: rgba(255,255,255,.95); color: var(--seo-primary); box-shadow: 0 6px 18px rgba(22,63,22,.16); cursor: pointer; font-size: 28px; line-height: 1; display: inline-flex; align-items: center; justify-content: center; }
.thumb-arrow:hover { background: #f2f8f0; }
.thumb-arrow.prev { left: 0; }
.thumb-arrow.next { right: 0; }
.product-kicker { color: var(--seo-primary); font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; margin: 0 0 8px; }
h1 { font-size: clamp(28px, 5vw, 52px); line-height: 1.08; margin: 0 0 16px; letter-spacing: 0; overflow-wrap: anywhere; }
.product-layout h1 { font-size: clamp(16px, 1.8vw, 20px); line-height: 1.35; font-weight: 800; }
h2 { font-size: clamp(22px, 3vw, 32px); line-height: 1.18; margin: 36px 0 12px; }
.price { color: var(--seo-primary); font-size: 30px; font-weight: 900; margin: 18px 0; }
.original-price { color: #9aa49a; text-decoration: line-through; font-size: 18px; margin-left: 10px; }
.summary, .content { color: #334833; font-size: 17px; overflow-wrap: anywhere; }
.content p { margin: 0 0 14px; }
.meta-list { display: grid; gap: 10px; padding: 18px; border: 1px solid var(--seo-border); border-radius: 14px; background: var(--seo-bg); margin: 22px 0; }
.cta { display: inline-flex; align-items: center; justify-content: center; background: var(--seo-primary); color: #fff; text-decoration: none; border-radius: 10px; padding: 14px 20px; font-weight: 800; margin-top: 10px; }
.buy-box { display: grid; gap: 12px; padding: 18px; border: 1px solid var(--seo-border); border-radius: 16px; background: #fff; box-shadow: 0 12px 30px rgba(22, 63, 22, .08); margin-top: 18px; }
.buy-options { display: grid; gap: 24px; }
.buy-label { display: grid; gap: 6px; font-size: 13px; font-weight: 800; color: #334833; }
.buy-select, .buy-qty { width: 100%; border: 1px solid var(--seo-border); border-radius: 10px; padding: 12px 13px; font: inherit; background: #fff; color: var(--seo-text); }
.variant-group { display: grid; grid-template-columns: 104px minmax(0, 1fr); gap: 14px; align-items: start; }
.variant-label { color: #657265; font-size: 13px; font-weight: 800; padding-top: 12px; }
.variant-options { display: flex; flex-wrap: wrap; gap: 9px; min-width: 0; }
.variant-pill { position: relative; display: inline-flex; align-items: center; gap: 8px; min-height: 42px; max-width: 100%; padding: 7px 12px; border: 1.5px solid #d8e0d3; border-radius: 5px; background: #fff; color: var(--seo-text); font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; transition: border-color .15s ease, background .15s ease, color .15s ease, opacity .15s ease; }
.variant-pill:hover { border-color: var(--seo-primary); color: var(--seo-primary); }
.variant-pill.is-active { border-color: var(--seo-primary); background: #f0f8ed; color: var(--seo-primary); font-weight: 900; }
.variant-pill.is-active::after { content: ""; position: absolute; right: 0; bottom: 0; width: 0; height: 0; border-style: solid; border-width: 0 0 14px 14px; border-color: transparent transparent var(--seo-primary) transparent; }
.variant-pill.is-hidden { display: none; }
.variant-pill-thumb { width: 28px; height: 28px; object-fit: cover; border-radius: 3px; flex-shrink: 0; background: var(--seo-bg); }
.variant-pill-text { min-width: 0; overflow-wrap: anywhere; line-height: 1.3; }
.buy-purchase { display: grid; gap: 18px; margin-top: 8px; }
.qty-row { display: grid; grid-template-columns: 104px minmax(0, 1fr); gap: 14px; align-items: center; }
.qty-label { color: #657265; font-size: 13px; font-weight: 800; }
.qty-line { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.qty-stepper { display: inline-grid; grid-template-columns: 42px 58px 42px; height: 42px; border: 1px solid var(--seo-border); border-radius: 6px; overflow: hidden; background: #fff; }
.qty-stepper button { border: 0; border-right: 1px solid var(--seo-border); background: #fff; color: #657265; font-size: 22px; cursor: pointer; }
.qty-stepper button:last-child { border-right: 0; border-left: 1px solid var(--seo-border); }
.buy-qty { width: 100%; border: 0; border-radius: 0; padding: 0; text-align: center; font: inherit; font-weight: 800; color: var(--seo-text); background: #fff; }
.stock-note { color: #657265; font-size: 14px; font-weight: 700; }
.buy-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px; align-items: stretch; }
.buy-btn { border: 1.5px solid var(--seo-primary); border-radius: 4px; padding: 14px 18px; min-height: 54px; background: #f0f8ed; color: var(--seo-primary); font: inherit; font-weight: 900; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 10px; }
.buy-icon { width: 24px; height: 24px; flex: 0 0 auto; stroke: currentColor; }
.buy-now-btn { border: 1.5px solid var(--seo-primary); border-radius: 4px; padding: 14px 18px; min-height: 54px; background: var(--seo-primary); color: #fff; font: inherit; font-weight: 900; cursor: pointer; }
.buy-link { display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--seo-primary); border-radius: 10px; padding: 12px 16px; color: var(--seo-primary); text-decoration: none; font-weight: 800; }
.buy-status { min-height: 22px; color: var(--seo-primary); font-weight: 800; font-size: 14px; }
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 24px; }
.card { border: 1px solid var(--seo-border); border-radius: 14px; overflow: hidden; background: #fff; text-decoration: none; display: block; }
.card img { width: 100%; aspect-ratio: 1 / 1; object-fit: cover; background: var(--seo-bg); display: block; }
.card-body { padding: 14px; }
.card-title { font-weight: 800; line-height: 1.4; margin: 0 0 8px; font-size: 15px; }
.card-price { color: var(--seo-primary); font-weight: 900; }
.category-intro { max-width: 780px; color: var(--seo-muted); font-size: 17px; }
@media (max-width: 820px) {
  .seo-header-inner { min-height: 104px; padding: 0 18px; gap: 12px; }
  .seo-logo img { height: 96px; transform: translateY(-8px); }
  .seo-menu-btn { display: inline-flex; }
  .seo-nav { position: absolute; top: 100%; left: 0; right: 0; display: none; flex-direction: column; align-items: stretch; gap: 0; background: #fff; border-top: 1px solid #f0f0f0; box-shadow: 0 18px 34px rgba(28, 43, 28, .08); padding: 8px 22px 14px; font-size: 15px; }
  .seo-menu-toggle:checked ~ .seo-nav { display: flex; }
  .seo-nav a { padding: 11px 0; border-bottom: 1px solid #f5f5f5; }
  .seo-actions { gap: 4px; }
  .seo-icon-link, .seo-cart, .seo-menu-btn { width: 38px; height: 38px; }
  .seo-main { padding: 16px; }
  .product-layout { grid-template-columns: minmax(0, 1fr); gap: 24px; }
  .product-thumbs-wrap { padding: 0 22px; }
  .product-thumbs { gap: 8px; }
  .product-thumb { flex-basis: calc((100% - 32px) / 5); width: calc((100% - 32px) / 5); }
  .thumb-arrow { width: 26px; height: 38px; font-size: 24px; }
  h1 { font-size: 28px; line-height: 1.15; }
  .product-layout h1 { font-size: 18px; line-height: 1.36; }
  .variant-group { grid-template-columns: minmax(0, 1fr); gap: 8px; }
  .variant-label { padding-top: 0; }
  .variant-pill { min-height: 40px; padding: 6px 11px; font-size: 13px; }
  .variant-pill-thumb { width: 24px; height: 24px; }
  .buy-options, .buy-row, .qty-row { grid-template-columns: 1fr; }
  .qty-stepper { grid-template-columns: 40px 56px 40px; height: 40px; }
  .grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .seo-footer { align-items: flex-start; flex-direction: column; margin-top: 34px; }
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
  <link rel="stylesheet" href="/assets/css/static-seo.css?v=${assetVersion}" />
  <script type="application/ld+json">${jsonForHtml(schema)}</script>
</head>
<body>
  <header class="seo-header">
    <div class="seo-header-inner">
    <a class="seo-logo" href="/" aria-label="Phương Lâm">
      <img src="/assets/media/generated/embedded-001.png" alt="Phương Lâm" />
    </a>
    <input class="seo-menu-toggle" type="checkbox" id="seo-menu-toggle" aria-label="Mở menu" />
    <nav class="seo-nav" aria-label="Điều hướng chính">
      <a href="/danh-muc/nen-thom/">Nến Tealight Xông</a>
      <a href="/danh-muc/combo/">Combo Xông Nhà</a>
      <a href="/danh-muc/thao-moc-xong/">Thảo Mộc Xông</a>
      <a href="/danh-muc/bep-xong/">Đèn Xông Tinh Dầu</a>
      <a href="/danh-muc/phu-kien/">Phụ Kiện Xông</a>
      <a href="/blog/huong-dan-xong/huong-dan-dung-bep-xong-thao-moc/">Hướng Dẫn</a>
    </nav>
    <div class="seo-actions">
      <a class="seo-icon-link" href="/?search=open" aria-label="Tìm kiếm">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </a>
      <a class="seo-cart" href="/?cart=open" aria-label="Xem giỏ hàng">
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 01-8 0"></path>
        </svg>
        <span class="seo-cart-count" data-static-cart-count hidden>0</span>
      </a>
      <label class="seo-menu-btn" for="seo-menu-toggle" aria-label="Mở menu"><span class="seo-menu-icon"></span></label>
    </div>
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
  const optionGroups = getStaticOptionGroups(product, variants);
  const optionFields = optionGroups.length ? `<div class="buy-options">
      ${optionGroups.map((group, index) => `<div class="variant-group">
        <div class="variant-label">${escapeHtml(group.name)}</div>
        <div class="variant-options" data-option-pills data-option-index="${index}" data-option-name="${escapeHtml(group.name)}">
          ${group.values.map((value) => renderStaticVariantPill({
            value,
            image: index === 0 ? '' : getStaticOptionImage(product, variants, group.name, value),
          })).join('\n          ')}
        </div>
      </div>`).join('\n      ')}
    </div>
    ` : '';
  const variantField = !optionGroups.length && variants.length ? `<div class="variant-group">
      <div class="variant-label">Phân loại</div>
      <div class="variant-options" data-variant-pills>
        ${variants.map((variant) => renderStaticVariantPill({
          value: variant.name,
          image: variant.image,
          attrs: ` data-variant-id="${escapeHtml(variant.id)}"`,
        })).join('\n        ')}
      </div>
    </div>
    ` : '';

  return `<form class="buy-box" data-buy-box>
    ${optionFields}${variantField}<div class="buy-purchase" data-purchase-panel hidden>
      <div class="qty-row">
        <div class="qty-label">Số lượng</div>
        <div class="qty-line">
          <div class="qty-stepper">
            <button type="button" data-qty-step="-1" aria-label="Giảm số lượng">−</button>
            <input class="buy-qty" data-buy-qty type="number" min="1" step="1" value="1" inputmode="numeric" aria-label="Số lượng" />
            <button type="button" data-qty-step="1" aria-label="Tăng số lượng">+</button>
          </div>
          <span class="stock-note">Còn hàng</span>
        </div>
      </div>
      <div class="buy-row">
        <button class="buy-btn" type="submit">
          <svg class="buy-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.5"></circle><circle cx="18" cy="20" r="1.5"></circle><path d="M2.5 3h3l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H7"></path><path d="M9 11h6"></path><path d="M12 8v6"></path></svg>
          <span>Thêm Vào Giỏ Hàng</span>
        </button>
        <button class="buy-now-btn" type="button" data-buy-now>Mua Ngay</button>
      </div>
    </div>
    <div class="buy-status" data-buy-status aria-live="polite"></div>
  </form>`;
};

const renderStaticBuyScript = (product) => {
  const variants = normalizeProductVariants(product);
  const optionGroups = getStaticOptionGroups(product, variants);
  const cheapestVariant = variants.length
    ? variants.reduce((best, variant) => (variant.price < best.price ? variant : best), variants[0])
    : null;
  const originalImage = firstImage(product);
  const payload = {
    ...product,
    variants,
  };
  return `<script>
(() => {
  const product = ${jsonForInlineScript(payload)};
  const variants = ${jsonForInlineScript(variants)};
  const optionGroups = ${jsonForInlineScript(optionGroups)};
  const defaultVariant = ${jsonForInlineScript(cheapestVariant)};
  const originalImage = ${jsonForInlineScript(originalImage)};
  const form = document.querySelector('[data-buy-box]');
  if (!form) return;
  const variantPills = form.querySelector('[data-variant-pills]');
  const optionPillGroups = [...form.querySelectorAll('[data-option-pills]')];
  const qtyInput = form.querySelector('[data-buy-qty]');
  const purchasePanel = form.querySelector('[data-purchase-panel]');
  const addCartButton = form.querySelector('.buy-btn');
  const buyNowButton = form.querySelector('[data-buy-now]');
  const priceEl = document.querySelector('[data-buy-price]');
  const originalEl = document.querySelector('[data-buy-original]');
  const statusEl = form.querySelector('[data-buy-status]');
  const mainImage = document.querySelector('.product-image');
  const thumbButtons = [...document.querySelectorAll('[data-thumb-src]')];
  const money = (value) => Number(value || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  const responsiveAttrs = (src) => {
    if (!src || typeof src !== 'string' || src.startsWith('data:')) return null;
    const pathOnly = src.split('?')[0];
    if (!pathOnly.startsWith('/assets/products/mirrored/') && !pathOnly.startsWith('/assets/products/uploads/')) return null;
    const fileName = pathOnly.split('/').pop() || '';
    const baseName = fileName.replace(/\\.[^.]+$/, '');
    if (!baseName) return null;
    return {
      srcset: '/assets/products/responsive/' + baseName + '-480.webp 480w, /assets/products/responsive/' + baseName + '-720.webp 720w, ' + src + ' 900w',
      sizes: '(max-width: 767px) 100vw, 480px',
    };
  };
  const getActiveValue = (container) => container?.querySelector('.variant-pill.is-active')?.dataset.optionValue || '';
  const setActiveValue = (container, value) => {
    [...(container?.querySelectorAll('.variant-pill') || [])].forEach((button) => {
      button.classList.toggle('is-active', button.dataset.optionValue === value);
    });
  };
  const getSelectedOptions = () => Object.fromEntries(optionPillGroups.map((item) => [item.dataset.optionName, getActiveValue(item)]).filter(([, value]) => value));
  const getVariantByOptions = () => {
    const selected = getSelectedOptions();
    return variants.find((variant) => optionGroups.every((group) => variant.options?.[group.name] === selected[group.name])) || null;
  };
  const getVariant = () => optionGroups.length
    ? getVariantByOptions()
    : (variants.find((variant) => variant.id === variantPills?.querySelector('.variant-pill.is-active')?.dataset.variantId) || null);
  const isSelectionComplete = () => optionGroups.length
    ? optionGroups.every((group, index) => getActiveValue(optionPillGroups[index]))
    : (!variants.length || !!variantPills?.querySelector('.variant-pill.is-active'));
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
  const updateActiveThumb = (src) => {
    thumbButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.thumbSrc === src);
    });
  };
  const scrollThumbs = (direction) => {
    const track = document.querySelector('[data-thumbs-track]');
    if (!track) return;
    const firstThumb = track.querySelector('[data-thumb-src]');
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || '0') || 0;
    const step = firstThumb ? (firstThumb.getBoundingClientRect().width + gap) * 5 : track.clientWidth;
    track.scrollBy({ left: direction * step, behavior: 'smooth' });
  };
  document.querySelectorAll('[data-thumb-scroll]').forEach((button) => {
    button.addEventListener('click', () => scrollThumbs(Number(button.dataset.thumbScroll || 1)));
  });
  thumbButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextSrc = button.dataset.thumbSrc;
      if (!mainImage || !nextSrc) return;
      mainImage.src = nextSrc;
      const attrs = responsiveAttrs(nextSrc);
      if (attrs) {
        mainImage.setAttribute('srcset', attrs.srcset);
        mainImage.setAttribute('sizes', attrs.sizes);
      } else {
        mainImage.removeAttribute('srcset');
        mainImage.removeAttribute('sizes');
      }
      updateActiveThumb(nextSrc);
    });
  });
  const initVariantPills = () => {
    if (!variantPills || optionGroups.length) return;
    [...variantPills.querySelectorAll('.variant-pill')].forEach((button) => {
      button.addEventListener('click', () => {
        setActiveValue(variantPills, '');
        button.classList.add('is-active');
        updatePrice();
      });
    });
  };
  const rebuildPillStates = () => {
    if (!optionGroups.length) return;
    optionGroups.forEach((group, index) => {
      const container = optionPillGroups[index];
      if (!container) return;
      const hasPriorSelection = optionGroups.slice(0, index).every((priorGroup, priorIndex) => getActiveValue(optionPillGroups[priorIndex]));
      container.closest('.variant-group')?.toggleAttribute('hidden', index > 0 && !hasPriorSelection);
      const priorGroups = optionGroups.slice(0, index);
      const pills = [...container.querySelectorAll('.variant-pill')];
      pills.forEach((pill) => {
        const value = pill.dataset.optionValue;
        const isValid = variants.some((variant) =>
        variant.options?.[group.name] === value &&
        priorGroups.every((priorGroup, priorIndex) => {
          const selectedValue = getActiveValue(optionPillGroups[priorIndex]);
          return !selectedValue || variant.options?.[priorGroup.name] === selectedValue;
        })
        );
        pill.hidden = !isValid;
        pill.classList.toggle('is-hidden', !isValid);
        if (!isValid) pill.classList.remove('is-active');
      });
    });
  };
  const updateMainImage = (variant) => {
    if (!mainImage || !('src' in mainImage)) return;
    const nextSrc = variant?.image || originalImage;
    if (!nextSrc) return;
    mainImage.src = nextSrc;
    const attrs = responsiveAttrs(nextSrc);
    if (attrs) {
      mainImage.setAttribute('srcset', attrs.srcset);
      mainImage.setAttribute('sizes', attrs.sizes);
    } else {
      mainImage.removeAttribute('srcset');
      mainImage.removeAttribute('sizes');
    }
    updateActiveThumb(nextSrc);
  };
  const updatePrice = () => {
    const variant = getVariant();
    const price = variant ? variant.price : product.price;
    const original = variant ? variant.originalPrice : product.originalPrice;
    if (priceEl) priceEl.firstChild.textContent = money(price);
    if (originalEl) {
      originalEl.textContent = original ? money(original) : '';
      originalEl.hidden = !original;
    }
    if (variant) updateMainImage(variant);
    if (purchasePanel) purchasePanel.hidden = !isSelectionComplete();
  };
  form.querySelectorAll('[data-qty-step]').forEach((button) => {
    button.addEventListener('click', () => {
      const delta = Number(button.dataset.qtyStep || 0);
      const nextValue = Math.max(1, (parseInt(qtyInput?.value || '1', 10) || 1) + delta);
      if (qtyInput) qtyInput.value = String(nextValue);
    });
  });
  optionPillGroups.forEach((container, index) => {
    container.querySelectorAll('.variant-pill').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.hidden || button.classList.contains('is-hidden')) return;
        setActiveValue(container, button.dataset.optionValue);
        optionPillGroups.slice(index + 1).forEach((nextContainer) => setActiveValue(nextContainer, ''));
        rebuildPillStates();
        updatePrice();
      });
    });
  });
  initVariantPills();
  rebuildPillStates();
  updatePrice();
  const addSelectedToCart = () => {
    const variant = getVariant();
    if ((variants.length || optionGroups.length) && !variant) {
      if (statusEl) statusEl.textContent = 'Vui lòng chọn đủ phân loại.';
      return false;
    }
    const qty = Math.max(1, parseInt(qtyInput?.value || '1', 10) || 1);
    const item = buildItem(variant);
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
    return true;
  };
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    addSelectedToCart();
  });
  addCartButton?.addEventListener('click', (event) => {
    event.preventDefault();
    addSelectedToCart();
  });
  buyNowButton?.addEventListener('click', () => {
    if (addSelectedToCart()) window.location.href = '/?cart=open';
  });
})();
</script>`;
};

const renderProductPage = ({ product, categoryName }) => {
  const image = firstImage(product);
  const galleryImages = getProductGalleryImages(product);
  const productUrl = `${siteUrl}/san-pham/${product.slug}/`;
  const description = truncate(product.shortDesc || product.description || product.name);
  const priceInfo = getStaticPriceInfo(product);
  const thumbs = galleryImages.length > 1 ? `<div class="product-thumbs-wrap">
            <button class="thumb-arrow prev" type="button" data-thumb-scroll="-1" aria-label="Xem ảnh trước">‹</button>
            <div class="product-thumbs" data-thumbs-track aria-label="Ảnh sản phẩm">
            ${galleryImages.map((src, index) => `<button class="product-thumb${index === 0 ? ' is-active' : ''}" type="button" data-thumb-src="${escapeHtml(src)}" aria-label="Xem ảnh ${index + 1}">
              <img src="${escapeHtml(src)}"${responsiveImageAttrs(src, '(max-width: 767px) 68px, 88px')} alt="" loading="${index < 5 ? 'eager' : 'lazy'}" />
            </button>`).join('\n            ')}
            </div>
            <button class="thumb-arrow next" type="button" data-thumb-scroll="1" aria-label="Xem ảnh tiếp theo">›</button>
          </div>` : '';
  const gallery = galleryImages.length ? `<div class="product-gallery">
          <img class="product-image" src="${escapeHtml(galleryImages[0])}"${responsiveImageAttrs(galleryImages[0], '(max-width: 767px) 100vw, 480px')} alt="${escapeHtml(product.name)}" fetchpriority="high" />${thumbs ? `\n          ${thumbs}` : ''}
        </div>` : `<div class="product-image" role="img" aria-label="${escapeHtml(product.name)}"></div>`;
  const body = `<main class="seo-main">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="/">Trang chủ</a> / <a href="/danh-muc/${escapeHtml(product.categoryId)}/">${escapeHtml(categoryName)}</a> / ${escapeHtml(product.name)}
    </nav>
    <article class="product-layout">
      <div>
        ${gallery}
      </div>
      <div>
        <p class="product-kicker">${escapeHtml(categoryName)}</p>
        <h1>${escapeHtml(product.name)}</h1>
        <p class="summary">${escapeHtml(product.shortDesc || '')}</p>
        <div class="price" data-buy-price>${formatVnd(priceInfo.price)}${priceInfo.originalPrice ? `<span class="original-price" data-buy-original>${formatVnd(priceInfo.originalPrice)}</span>` : '<span class="original-price" data-buy-original hidden></span>'}</div>
        <div class="meta-list">
          <div><strong>Zalo:</strong> 0773829593</div>
          <div><strong>Tình trạng:</strong> Còn hàng</div>
        </div>
        ${renderStaticBuyBox(product)}
      </div>
    </article>
    <section class="content">
      <h2>Mô tả sản phẩm</h2>
      ${renderStaticParagraphs(product.description || product.shortDesc || product.name)}
      ${product.usage ? `<h2>Cách dùng và lưu ý</h2>${renderStaticParagraphs(product.usage)}` : ''}
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
        <div class="card-price">${formatVnd(priceInfo.price)}</div>
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

  // Keep storefront data lean; full descriptions stay in static product pages
  // and are loaded through /api/products.php inside the local admin editor.
  const appProducts = products.map(({ description: _description, usage: _usage, ...rest }) => rest);
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
