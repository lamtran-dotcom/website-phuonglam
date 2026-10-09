const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const { getGenuineReviews, getReviewStats, starsForAverage } = require('./reviews');

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
  responsiveProductDir: path.join(root, 'assets', 'products', 'responsive'),
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

const renderStaticInlineMarkdown = (text) => escapeHtml(text).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

const renderStaticParagraphs = (text, productName = '') => {
  const lines = String(text || '').replace(/\r\n/g, '\n').trim().split('\n');
  if (!lines.length || !lines.some((line) => line.trim())) return '';
  const output = [];
  let paragraph = [];
  let bullets = [];
  let numbered = [];
  let skippedTitle = false;
  let skippedLeadTitle = false;
  const flushParagraph = () => {
    if (paragraph.length) output.push(`<p>${paragraph.map(renderStaticInlineMarkdown).join('<br>')}</p>`);
    paragraph = [];
  };
  const flushLists = () => {
    if (bullets.length) output.push(`<ul>${bullets.map((item) => `<li>${renderStaticInlineMarkdown(item)}</li>`).join('')}</ul>`);
    if (numbered.length) output.push(`<ol>${numbered.map((item) => `<li>${renderStaticInlineMarkdown(item)}</li>`).join('')}</ol>`);
    bullets = [];
    numbered = [];
  };
  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) { flushParagraph(); flushLists(); return; }
    if (/^-{3,}$/.test(line)) { flushParagraph(); flushLists(); return; }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph(); flushLists();
      if (heading[1] === '#' && !skippedTitle) { skippedTitle = true; return; }
      if (heading[2].trim().toLowerCase() === 'mô tả sản phẩm') return;
      const tag = heading[1].length === 1 ? 'h2' : 'h3';
      output.push(`<${tag}>${renderStaticInlineMarkdown(heading[2])}</${tag}>`);
      return;
    }
    const leadTitle = stripHtml(line).replace(/[:.!]+$/, '').trim().toLocaleLowerCase('vi');
    const isLegacyLeadTitle = line.length <= 120
      && line === line.toLocaleUpperCase('vi')
      && !/[.!?:]$/.test(line);
    if (!skippedLeadTitle && (leadTitle === stripHtml(productName).replace(/[:.!]+$/, '').trim().toLocaleLowerCase('vi') || leadTitle === 'mô tả sản phẩm' || isLegacyLeadTitle)) {
      skippedLeadTitle = true;
      return;
    }
    skippedLeadTitle = true;
    const labeledHeading = line.match(/^(?:✔|✅|📍|⚠️|📝|🔥|✨)\s*(.{2,70}):$/);
    if (labeledHeading) {
      flushParagraph(); flushLists();
      output.push(`<h3>${renderStaticInlineMarkdown(labeledHeading[1])}</h3>`);
      return;
    }
    if (line.startsWith('>')) {
      flushParagraph(); flushLists();
      output.push(`<blockquote>${renderStaticInlineMarkdown(line.replace(/^>\s?/, ''))}</blockquote>`);
      return;
    }
    const bullet = line.match(/^[-*•👉]\s+(.+)$/);
    const ordered = line.match(/^\d+[.)]\s+(.+)$/);
    if (bullet) { flushParagraph(); if (numbered.length) flushLists(); bullets.push(bullet[1]); return; }
    if (ordered) { flushParagraph(); if (bullets.length) flushLists(); numbered.push(ordered[1]); return; }
    if (bullets.length || numbered.length) flushLists();
    paragraph.push(line);
  });
  flushParagraph();
  flushLists();
  return output.join('\n      ');
};

const classifyProductContentHeading = (heading, sourceType) => {
  const normalized = stripHtml(heading).replace(/[📝📍⚠️✅✔️🔥✨🏺🫙🕯️🌿]/gu, '').trim().toLocaleLowerCase('vi');
  if (/lưu ý.*bảo quản|bảo quản.*lưu ý/.test(normalized)) return 'notes';
  if (/bảo quản/.test(normalized)) return 'storage';
  if (/lưu ý|an toàn|cảnh báo/.test(normalized)) return 'caution';
  if (/cách dùng|cách sử dụng|hướng dẫn|các bước|nấu nước|dùng với|xông khô/.test(normalized)) return 'usage';
  if (/thông số|thành phần|bộ gồm|bộ sản phẩm|trọn bộ|chi tiết sản phẩm|quy cách/.test(normalized)) return 'specs';
  if (/bảo hành|đổi trả|cam kết/.test(normalized)) return 'description';
  return sourceType === 'usage' ? 'usage' : 'description';
};

const normalizeStaticUsageSteps = (text) => {
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n');
  const output = [];
  let step = null;
  let stepNumber = 0;
  const flushStep = () => {
    if (!step) return;
    stepNumber += 1;
    const detail = step.detail.join(' ').replace(/\s+/g, ' ').trim();
    output.push(`${stepNumber}. **${step.title}**${detail ? ` — ${detail}` : ''}`);
    step = null;
  };
  for (const line of lines) {
    const match = line.trim().match(/^\*\*Bước\s*\d+\s*[—–:-]\s*(.+?)\*\*\s*$/iu);
    if (match) {
      flushStep();
      step = { title: match[1].trim(), detail: [] };
      continue;
    }
    if (step && (/^\s*(?:#{1,6}\s|>|(?:✔|✅|📍|⚠️|📝|🔥|✨)\s*[^\n]*:)/u.test(line))) flushStep();
    if (step) step.detail.push(line.trim());
    else output.push(line);
  }
  flushStep();
  return output.join('\n');
};

const splitProductContent = (text, sourceType = 'description', productName = '') => {
  const lines = String(text || '').replace(/\r\n/g, '\n').trim().split('\n');
  const blocks = [];
  let heading = '';
  let content = [];
  let skippedTitle = false;
  let skippedLeadTitle = false;
  const flush = () => {
    const body = content.join('\n').trim();
    const normalizedHeading = stripHtml(heading).replace(/[:.!]+$/, '').trim().toLocaleLowerCase('vi');
    const normalizedProductName = stripHtml(productName).replace(/[:.!]+$/, '').trim().toLocaleLowerCase('vi');
    if (body && normalizedHeading !== 'mô tả sản phẩm' && normalizedHeading !== normalizedProductName) {
      blocks.push({ heading, body, type: heading ? classifyProductContentHeading(heading, sourceType) : sourceType });
    }
    content = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const inlineCaution = line.match(/^(?:>\s*)?(?:⚠️\s*)?\*\*((?:Lưu ý|Cảnh báo|An toàn)[^*]{0,70})\*\*[:：]?\s*(.*)$/iu);
    if (inlineCaution) {
      flush();
      heading = inlineCaution[1].trim();
      content = [inlineCaution[2].trim()];
      continue;
    }
    const markdownHeading = line.match(/^(#{1,6})\s+(.+)$/);
    const labelHeading = line.match(/^(?:✔|✅|📍|⚠️|📝|🔥|✨)?\s*(.{2,70}):$/u);
    const nextHeading = markdownHeading?.[2] || labelHeading?.[1];
    if (nextHeading) {
      flush();
      if (markdownHeading?.[1] === '#' && !skippedTitle) {
        skippedTitle = true;
        heading = '';
        continue;
      }
      const normalized = stripHtml(nextHeading).replace(/[:.!]+$/, '').trim().toLocaleLowerCase('vi');
      const normalizedProductName = stripHtml(productName).replace(/[:.!]+$/, '').trim().toLocaleLowerCase('vi');
      if (normalized === 'mô tả sản phẩm' || normalized === normalizedProductName) {
        heading = '';
        skippedLeadTitle = true;
        continue;
      }
      heading = nextHeading.trim();
      continue;
    }
    const legacyTitle = line.length <= 120
      && line === line.toLocaleUpperCase('vi')
      && !/[.!?:]$/.test(line);
    if (!skippedLeadTitle && (legacyTitle || line.toLocaleLowerCase('vi') === 'mô tả sản phẩm')) {
      skippedLeadTitle = true;
      continue;
    }
    skippedLeadTitle = true;
    content.push(rawLine);
  }
  flush();
  return blocks;
};

const renderProductContentBlock = (block, productName, allowSpecTable = false) => {
  const sourceBody = block.type === 'usage' ? normalizeStaticUsageSteps(block.body) : block.body;
  const lines = sourceBody.split('\n');
  const rows = [];
  const remaining = [];
  if (allowSpecTable) {
    for (const line of lines) {
      const match = line.trim().match(/^(?:[-*•]\s*)?\*\*([^*]{2,80})\*\*\s*(?:[—–-]\s*|\s+)(.+)$/u);
      if (match && !match[1].trim().endsWith(':')) rows.push(`<tr><th scope="row">${renderStaticInlineMarkdown(match[1].trim())}</th><td>${renderStaticInlineMarkdown(match[2].trim())}</td></tr>`);
      else remaining.push(line);
    }
  }
  const heading = block.heading ? `<h3>${renderStaticInlineMarkdown(block.heading)}</h3>` : '';
  const table = rows.length >= 2
    ? `<div class="product-spec-table-wrap"><table class="product-spec-table" aria-label="Thông tin chi tiết sản phẩm"><tbody>${rows.join('')}</tbody></table></div>`
    : '';
  const body = renderStaticParagraphs(rows.length >= 2 ? remaining.join('\n') : sourceBody, productName);
  return `${heading}${body}${table}`;
};

const renderProductContentSection = ({ id, title, blocks, productName, className = '' }) => {
  if (!blocks.length) return '';
  const normalizedTitle = stripHtml(title).trim().toLocaleLowerCase('vi');
  const content = blocks.map((block) => {
    const normalizedHeading = stripHtml(block.heading).replace(/[:.!]+$/, '').trim().toLocaleLowerCase('vi');
    const visibleBlock = normalizedHeading === normalizedTitle ? { ...block, heading: '' } : block;
    return renderProductContentBlock(visibleBlock, productName, block.type === 'specs');
  }).join('\n');
  if (!content.trim()) return '';
  if (className === 'product-caution-section') {
    return `<aside class="content product-content-section product-callout product-callout-warning" id="${id}" aria-labelledby="${id}-title"><h2 id="${id}-title">${title}</h2>${content}</aside>`;
  }
  if (className === 'product-notes-section') {
    return `<aside class="content product-content-section product-callout product-callout-note" id="${id}" aria-labelledby="${id}-title"><h2 id="${id}-title">${title}</h2>${content}</aside>`;
  }
  return `<section class="content product-content-section ${className}" id="${id}"><h2>${title}</h2>${content}</section>`;
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
  return `<button class="variant-pill" type="button" aria-pressed="false" data-option-value="${escapeHtml(value)}"${attrs}>${thumb}
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
  const candidates = [480, 720]
    .filter((width) => fs.existsSync(path.join(paths.responsiveProductDir, `${baseName}-${width}.webp`)))
    .map((width) => `/assets/products/responsive/${baseName}-${width}.webp ${width}w`);
  if (!candidates.length) return '';
  const srcset = [...candidates, `${src} 900w`].join(', ');
  return ` srcset="${escapeHtml(srcset)}" sizes="${escapeHtml(sizes)}"`;
};

const collectResponsiveProductImages = (value, images = new Set()) => {
  if (Array.isArray(value)) {
    value.forEach((item) => collectResponsiveProductImages(item, images));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectResponsiveProductImages(item, images));
  } else if (typeof value === 'string') {
    const publicPath = value.split('?', 1)[0];
    if (publicPath.startsWith('/assets/products/mirrored/') || publicPath.startsWith('/assets/products/uploads/')) {
      images.add(publicPath);
    }
  }
  return images;
};

const verifyResponsiveProductImages = (products) => {
  const missing = [];
  for (const publicPath of collectResponsiveProductImages(products)) {
    const fileName = publicPath.split('/').pop() || '';
    const baseName = fileName.replace(/\.[^.]+$/, '');
    const original = path.join(root, publicPath.slice(1));
    if (!fs.existsSync(original)) {
      missing.push(publicPath);
      continue;
    }
    for (const width of [480, 720]) {
      const responsive = path.join(paths.responsiveProductDir, `${baseName}-${width}.webp`);
      if (!fs.existsSync(responsive)) missing.push(`/assets/products/responsive/${baseName}-${width}.webp`);
    }
  }
  if (missing.length) {
    throw new Error(`Missing responsive product images:\n${missing.join('\n')}`);
  }
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
.category-main { max-width: 1320px; }
.breadcrumb { font-size: 13px; color: var(--seo-muted); margin: 0 0 18px; overflow-wrap: anywhere; }
.breadcrumb a { color: var(--seo-muted); text-decoration: none; }
.category-layout { display: grid; grid-template-columns: 210px minmax(0, 1fr); gap: 28px; align-items: start; margin-top: 26px; }
.category-sidebar { position: sticky; top: 148px; display: grid; gap: 8px; padding: 14px; border: 1px solid var(--seo-border); border-radius: 14px; background: #fff; box-shadow: 0 12px 30px rgba(22, 63, 22, .06); }
.category-sidebar-title { margin: 0 0 4px; color: var(--seo-text); font-size: 14px; font-weight: 900; text-transform: uppercase; }
.category-side-link { display: block; padding: 10px 12px; border-radius: 9px; color: #4d5d4d; text-decoration: none; font-size: 14px; font-weight: 800; transition: background .16s ease, color .16s ease, transform .16s ease; }
.category-side-link:hover { background: #f0f8ed; color: var(--seo-primary); transform: translateX(2px); }
.category-side-link.is-active { background: #eaf5e7; color: var(--seo-primary); }
.category-content { min-width: 0; }
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
.summary-box { line-height: 1.6; }
.content p { margin: 0 0 14px; }
.content h2, .content h3 { color: var(--seo-text); line-height: 1.35; margin: 24px 0 10px; }
.content h2 { font-size: 22px; }
.content h3 { font-size: 18px; }
.content ul, .content ol { margin: 0 0 18px; padding-left: 24px; }
.content li { margin: 0 0 8px; padding-left: 3px; }
.content blockquote { margin: 12px 0 18px; padding: 12px 16px; border-left: 3px solid #8ab77e; border-radius: 0 8px 8px 0; background: var(--seo-bg); color: #4c6248; }
.meta-list { display: grid; gap: 10px; padding: 18px; border: 1px solid var(--seo-border); border-radius: 14px; background: var(--seo-bg); margin: 22px 0; }
.cta { display: inline-flex; align-items: center; justify-content: center; background: var(--seo-primary); color: #fff; text-decoration: none; border-radius: 10px; padding: 14px 20px; font-weight: 800; margin-top: 10px; }
.buy-box { display: grid; gap: 12px; padding: 18px; border: 1px solid var(--seo-border); border-radius: 16px; background: #fff; box-shadow: 0 12px 30px rgba(22, 63, 22, .08); margin-top: 18px; }
.buy-options { display: grid; gap: 24px; }
.buy-label { display: grid; gap: 6px; font-size: 13px; font-weight: 800; color: #334833; }
.buy-select, .buy-qty { width: 100%; border: 1px solid var(--seo-border); border-radius: 10px; padding: 12px 13px; font: inherit; background: #fff; color: var(--seo-text); }
.variant-group { display: grid; grid-template-columns: minmax(0, 1fr); gap: 9px; align-items: start; }
.variant-group-stacked { grid-template-columns: minmax(0, 1fr); gap: 9px; }
.variant-label { color: #657265; font-size: 13px; font-weight: 800; padding-top: 0; }
.variant-options { display: flex; flex-wrap: wrap; gap: 9px; min-width: 0; }
.variant-group-stacked .variant-options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: stretch; }
.variant-pill { position: relative; display: inline-flex; align-items: center; gap: 8px; min-height: 42px; max-width: 100%; padding: 7px 12px; border: 1.5px solid #d8e0d3; border-radius: 5px; background: #fff; color: var(--seo-text); font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; transition: border-color .15s ease, background .15s ease, color .15s ease, opacity .15s ease; }
.variant-group-stacked .variant-pill { width: 100%; }
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
.buy-btn, .buy-now-btn { transition: transform .18s ease, box-shadow .18s ease; }
.buy-btn:hover, .buy-now-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(22, 63, 22, .18); }
.buy-btn:active, .buy-now-btn:active { transform: translateY(0); box-shadow: 0 3px 8px rgba(22, 63, 22, .14); }
.buy-btn:focus-visible, .buy-now-btn:focus-visible { outline: 3px solid rgba(49, 130, 35, .35); outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) {
  .buy-btn, .buy-now-btn { transition: none; }
  .buy-btn:hover, .buy-now-btn:hover { transform: none; }
}
.buy-link { display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--seo-primary); border-radius: 10px; padding: 12px 16px; color: var(--seo-primary); text-decoration: none; font-weight: 800; }
.buy-status { min-height: 22px; color: var(--seo-primary); font-weight: 800; font-size: 14px; }
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 24px; }
.card { border: 1px solid var(--seo-border); border-radius: 14px; overflow: hidden; background: #fff; text-decoration: none; display: block; }
.category-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 18px; margin-top: 0; }
.category-grid .card { transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; will-change: transform; }
.category-grid .card:hover { transform: translateY(-7px); border-color: rgba(49, 130, 35, .32); box-shadow: 0 18px 34px rgba(22, 63, 22, .16); }
.category-grid .card-body { padding: 12px; }
.category-grid .card-title { font-size: 13px; line-height: 1.35; }
.category-grid .card-price { font-size: 15px; }
.card img { width: 100%; aspect-ratio: 1 / 1; object-fit: cover; background: var(--seo-bg); display: block; }
.card-body { padding: 14px; }
.card-title { font-weight: 800; line-height: 1.4; margin: 0 0 8px; font-size: 15px; }
.card-price { color: var(--seo-primary); font-weight: 900; }
.category-intro { max-width: 780px; color: var(--seo-muted); font-size: 17px; }
.category-empty { grid-column: 1 / -1; color: var(--seo-muted); padding: 20px 0; }
.info-page { max-width: 820px; margin: 0 auto; padding: 8px 0 20px; }
.info-page h1 { font-size: clamp(26px, 4vw, 36px); line-height: 1.15; margin: 0 0 12px; color: var(--seo-text); }
.info-page .info-lead { font-size: 17px; line-height: 1.7; color: var(--seo-muted); margin: 0 0 26px; }
.info-page h2 { font-size: 21px; margin: 28px 0 10px; color: var(--seo-text); }
.info-page p, .info-page li { font-size: 16px; line-height: 1.75; color: var(--seo-text); }
.info-page ul { padding-left: 22px; margin: 8px 0 14px; }
.info-page a { color: var(--seo-primary); font-weight: 600; }
.info-page .info-box { background: var(--seo-bg); border: 1px solid var(--seo-border); border-radius: 14px; padding: 16px 18px; margin: 16px 0; }
.seo-footer-links { display: flex; flex-wrap: wrap; gap: 6px 18px; }
.seo-footer-links a { color: var(--seo-muted); text-decoration: none; }
.seo-footer-links a:hover { color: var(--seo-primary); text-decoration: underline; }
.blog-hero { border-radius: 24px; padding: 42px 34px; background: linear-gradient(135deg,#2e7d32,#43a047); color: #fff; text-align: center; margin-bottom: 28px; }
.blog-hero h1 { color: #fff; font-size: clamp(28px, 4vw, 42px); line-height: 1.12; margin-bottom: 12px; }
.blog-hero p { max-width: 680px; margin: 0 auto; opacity: .9; font-size: 16px; line-height: 1.65; }
.blog-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; }
.blog-card { display: block; overflow: hidden; border: 1px solid var(--seo-border); border-radius: 16px; background: #fff; color: inherit; text-decoration: none; box-shadow: 0 2px 12px rgba(22, 63, 22, .06); transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
.blog-card:hover { transform: translateY(-6px); border-color: rgba(49, 130, 35, .32); box-shadow: 0 18px 34px rgba(22, 63, 22, .14); }
.blog-card img { display: block; width: 100%; aspect-ratio: 1 / 1; object-fit: cover; background: var(--seo-bg); }
.blog-card-body { padding: 18px 18px 20px; }
.blog-tag { display: inline-flex; margin-bottom: 10px; padding: 4px 10px; border-radius: 999px; background: #eaf5e7; color: var(--seo-primary); font-size: 11px; font-weight: 900; text-transform: uppercase; }
.blog-card-title { margin: 0 0 10px; font-size: 16px; line-height: 1.45; font-weight: 900; }
.blog-excerpt { margin: 0 0 14px; color: var(--seo-muted); font-size: 13px; line-height: 1.65; }
.blog-meta { display: flex; justify-content: space-between; gap: 12px; color: #8a968a; font-size: 12px; font-weight: 700; }
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
  .category-layout { grid-template-columns: minmax(0, 1fr); gap: 18px; }
  .category-sidebar { position: static; display: flex; gap: 8px; overflow-x: auto; padding: 10px; scrollbar-width: none; }
  .category-sidebar::-webkit-scrollbar { display: none; }
  .category-sidebar-title { flex: 0 0 auto; align-self: center; margin: 0 4px 0 0; white-space: nowrap; }
  .category-side-link { flex: 0 0 auto; white-space: nowrap; }
  .product-layout { grid-template-columns: minmax(0, 1fr); gap: 24px; }
  .product-thumbs-wrap { padding: 0 22px; }
  .product-thumbs { gap: 8px; }
  .product-thumb { flex-basis: calc((100% - 32px) / 5); width: calc((100% - 32px) / 5); }
  .thumb-arrow { width: 26px; height: 38px; font-size: 24px; }
  h1 { font-size: 28px; line-height: 1.15; }
  .product-layout h1 { font-size: 18px; line-height: 1.36; }
  .variant-group { grid-template-columns: minmax(0, 1fr); gap: 8px; }
  .variant-group-stacked .variant-options { grid-template-columns: minmax(0, 1fr); }
  .variant-label { padding-top: 0; }
  .variant-pill { min-height: 40px; padding: 6px 11px; font-size: 13px; }
  .variant-pill-thumb { width: 24px; height: 24px; }
  .buy-options, .buy-row, .qty-row { grid-template-columns: 1fr; }
  .qty-stepper { grid-template-columns: 40px 56px 40px; height: 40px; }
  .grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .category-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .blog-hero { padding: 30px 18px; border-radius: 18px; }
  .blog-grid { grid-template-columns: minmax(0, 1fr); gap: 16px; }
  .seo-footer { align-items: flex-start; flex-direction: column; margin-top: 34px; }
}
.product-content-shell { width: 100%; max-width: 840px; margin: 36px auto 0; }
.product-reading-column { min-width: 0; max-width: 780px; margin: 0 auto; }
.product-content-nav { display: flex; gap: 8px; overflow-x: auto; margin: 0 0 28px; padding: 0 0 12px; border-bottom: 1px solid #e5ece2; scrollbar-width: thin; -webkit-overflow-scrolling: touch; }
.product-content-nav a { flex: 0 0 auto; color: #2f7f25; font-size: 14px; font-weight: 700; text-decoration: none; padding: 9px 13px; border: 1px solid #dce8d8; border-radius: 999px; white-space: nowrap; }
.product-content-nav a:hover, .product-content-nav a:focus-visible { background: #f2f7ef; text-decoration: underline; outline-color: #318223; }
.product-content-section { margin: 0 0 34px; scroll-margin-top: 140px; }
.product-content-section h2 { margin: 0 0 16px; padding-bottom: 10px; border-bottom: 1px solid #edf1ea; font-size: 26px; line-height: 1.3; }
.product-content-section h3 { margin: 24px 0 10px; font-size: 19px; line-height: 1.4; }
.product-content-section p, .product-content-section li { font-size: 17px; line-height: 1.72; }
.product-content-section p { margin-bottom: 14px; }
.product-content-section ul, .product-content-section ol { margin: 0 0 18px; padding-left: 24px; }
.product-spec-table-wrap { max-width: 100%; margin: 14px 0 22px; overflow-x: auto; border: 1px solid #e4ebdf; border-radius: 12px; }
.product-spec-table { width: 100%; border-collapse: collapse; font-size: 16px; line-height: 1.6; }
.product-spec-table th, .product-spec-table td { padding: 12px 14px; border-bottom: 1px solid #e9eee6; text-align: left; vertical-align: top; }
.product-spec-table tr:last-child th, .product-spec-table tr:last-child td { border-bottom: 0; }
.product-spec-table th { width: 31%; background: #f7faf5; color: #344934; font-weight: 750; }
.product-usage-section ol { list-style: none; counter-reset: product-step; padding: 0; }
.product-usage-section ol li { position: relative; min-height: 40px; margin: 0 0 12px; padding: 9px 12px 9px 48px; border: 1px solid #e6eee2; border-radius: 10px; background: #fbfcfa; counter-increment: product-step; }
.product-usage-section ol li::before { position: absolute; top: 7px; left: 10px; display: grid; width: 26px; height: 26px; place-items: center; border-radius: 50%; background: #eaf5e7; color: #2f7f25; content: counter(product-step); font-size: 14px; font-weight: 800; }
.product-callout-warning { padding: 18px 20px; border: 1px solid #f0dfbd; border-left: 4px solid #d4a34e; border-radius: 12px; background: #fffaf0; }
.product-callout-warning h2 { border-bottom-color: #f4e8d1; }
.product-callout-note { padding: 18px 20px; border: 1px solid #e2ecdc; border-left: 4px solid #8ab77e; border-radius: 12px; background: #f7faf5; }
.product-callout-note h2 { border-bottom-color: #e7eee3; }
.product-storage-section { padding: 18px 20px; border: 1px solid #e2ecdc; border-radius: 12px; background: #f7faf5; }
.product-storage-section h2 { border-bottom-color: #e7eee3; }
.product-reviews { padding-top: 10px; border-top: 1px solid #edf1ea; }
.review-summary { display: flex; align-items: center; gap: 10px; margin: 6px 0 14px; color: var(--seo-text); }
.review-summary strong { font-size: 26px; line-height: 1; }
.review-stars { color: #f5a623; letter-spacing: 1px; white-space: nowrap; }
.review-item { border: 1px solid var(--seo-border); border-radius: 14px; padding: 14px 16px; margin: 10px 0; background: #fff; }
.review-head { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 12px; margin-bottom: 6px; }
.review-name { font-weight: 700; }
.review-meta { color: var(--seo-muted); font-size: 13px; }
.review-comment { margin: 0; line-height: 1.7; }
.related-products { padding-top: 10px; border-top: 1px solid #edf1ea; }
.related-products ul { padding-left: 22px; }
.related-products li { margin: 8px 0; }
.price-prefix { font-size: .56em; font-weight: 650; vertical-align: .18em; }
@media (max-width: 767px) {
  .product-content-shell { max-width: 100%; margin-top: 28px; }
  .product-content-nav { gap: 7px; margin-bottom: 22px; }
  .product-content-nav a { padding: 8px 11px; font-size: 14px; }
  .product-content-section { margin-bottom: 28px; scroll-margin-top: 116px; }
  .product-content-section h2 { margin-bottom: 13px; font-size: 23px; }
  .product-content-section h3 { margin-top: 21px; font-size: 18px; }
  .product-content-section p, .product-content-section li { font-size: 16px; line-height: 1.7; }
  .product-spec-table { font-size: 15px; }
  .product-spec-table th, .product-spec-table td { padding: 10px 11px; }
  .product-spec-table th { width: 36%; }
  .product-callout-warning, .product-storage-section { padding: 15px 14px; }
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

// Hidden products keep their page so existing links and indexed URLs do not 404, but they
// should drop out of search results and the sitemap.
const isHiddenProduct = (product) => product.hidden === true || product.hidden === 'true';

const productSitemapUrls = (products) => products
  .filter((product) => !isHiddenProduct(product))
  .map((product) => `${siteUrl}/san-pham/${product.slug}/`);

// Cache-bust by content so an unchanged asset keeps the same URL and rebuilding does not
// rewrite every page.
const contentVersion = (filePath) => (fs.existsSync(filePath)
  ? crypto.createHash('sha1').update(fs.readFileSync(filePath)).digest('hex').slice(0, 10)
  : '0');

const staticCssVersion = () => contentVersion(path.join(paths.cssDir, 'static-seo.css'));

const pageShell = ({ title, description, canonical, image, schema, body, scripts = '', robots = '' }) => `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />${robots ? `
  <meta name="robots" content="${escapeHtml(robots)}" />` : ''}
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  ${image ? `<meta property="og:image" content="${escapeHtml(absoluteUrl(image))}" />` : ''}
  <link rel="stylesheet" href="/assets/css/static-seo.css?v=${staticCssVersion()}" />
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
      <a href="/blog/">Hướng Dẫn</a>
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
    <nav class="seo-footer-links" aria-label="Hỗ trợ khách hàng">
      <a href="/chinh-sach-doi-tra/">Chính sách đổi trả</a>
      <a href="/chinh-sach-van-chuyen/">Chính sách vận chuyển</a>
      <a href="/lien-he/">Liên hệ</a>
    </nav>
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
  const reviews = getGenuineReviews(product);
  const stats = getReviewStats(reviews);
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
        ...(reviews.length ? {
          aggregateRating: { '@type': 'AggregateRating', ratingValue: stats.average, reviewCount: stats.count, bestRating: 5, worstRating: 1 },
          review: reviews.slice(0, 10).map((review) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: review.name },
            reviewRating: { '@type': 'Rating', ratingValue: review.rating, bestRating: 5, worstRating: 1 },
            reviewBody: review.comment,
            ...(review.date ? { datePublished: review.date } : {}),
          })),
        } : {}),
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

const blogIndexSchema = () => ({
  '@context': 'https://schema.org',
  '@graph': [
    breadcrumbSchema([
      { name: 'Trang chủ', url: siteUrl },
      { name: 'Hướng Dẫn & Kiến Thức', url: `${siteUrl}/blog/` },
    ]),
    {
      '@type': 'CollectionPage',
      name: 'Hướng Dẫn & Kiến Thức',
      url: `${siteUrl}/blog/`,
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
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Phường Tân Phú',
        addressRegion: 'TP. Hồ Chí Minh',
        addressCountry: 'VN',
      },
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
      ${optionGroups.map((group, index) => `<div class="variant-group${index > 0 ? ' variant-group-stacked' : ''}">
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
      <div class="meta-list">
        <div><strong>Zalo:</strong> 0773829593</div>
        <div><strong>Tình trạng:</strong> Còn hàng</div>
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
  // Reviews are rendered as HTML/schema only; keep them (and template placeholders) out of the script.
  const { reviews: _reviews, ...productWithoutReviews } = product;
  const payload = {
    ...productWithoutReviews,
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
  const currentPriceEl = document.querySelector('.price-current');
  const pricePrefixEl = document.querySelector('.price-prefix');
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
      const active = button.dataset.optionValue === value;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
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
  // Keep cart entries small: only the fields the cart, shipping rules and checkout read.
  const cartBase = {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    categoryId: product.categoryId,
    price: product.price,
    originalPrice: product.originalPrice,
    weight: product.weight,
    images: Array.isArray(product.images) ? product.images.slice(0, 1) : [],
  };
  const buildItem = (variant) => {
    if (!variant) return { ...cartBase, cartKey: String(product.id) };
    return {
      ...cartBase,
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
    const selectionComplete = isSelectionComplete();
    const price = variant ? variant.price : (defaultVariant?.price ?? product.price);
    const original = variant ? variant.originalPrice : (defaultVariant?.originalPrice ?? product.originalPrice);
    if (currentPriceEl) currentPriceEl.textContent = money(price);
    if (pricePrefixEl) pricePrefixEl.textContent = selectionComplete ? '' : 'Giá từ ';
    if (originalEl) {
      originalEl.textContent = original ? money(original) : '';
      originalEl.hidden = !original;
    }
    if (variant) updateMainImage(variant);
    if (purchasePanel) purchasePanel.hidden = !selectionComplete;
    if (statusEl) {
      const nextGroup = optionGroups.find((group, index) => !getActiveValue(optionPillGroups[index]));
      statusEl.textContent = selectionComplete
        ? ''
        : nextGroup
          ? 'Chọn ' + nextGroup.name + ' để xem giá và tiếp tục.'
          : 'Vui lòng chọn phân loại để xem giá và tiếp tục.';
    }
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
    if (addSelectedToCart()) window.location.href = '/?checkout=open';
  });
})();
</script>`;
};

const renderStars = (rating) => `<span class="review-stars" role="img" aria-label="${rating} trên 5 sao">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</span>`;

const formatReviewDate = (date) => (date ? date.split('-').reverse().join('/') : '');

const renderReviewsSection = (reviews) => {
  if (!reviews.length) return '';
  const { count, average } = getReviewStats(reviews);
  const items = reviews.map((review) => `<article class="review-item">
          <div class="review-head"><span class="review-name">${escapeHtml(review.name)}</span>${renderStars(review.rating)}<span class="review-meta">${escapeHtml([formatReviewDate(review.date), `Nguồn: ${review.source}`].filter(Boolean).join(' · '))}</span></div>
          <p class="review-comment">${escapeHtml(review.comment)}</p>
        </article>`).join('\n        ');
  return `<section class="content product-reviews" id="product-reviews" aria-labelledby="product-reviews-title"><h2 id="product-reviews-title">Đánh giá từ khách hàng</h2>
        <div class="review-summary"><strong>${String(average).replace('.', ',')}</strong>${renderStars(starsForAverage(average))}<span>${count} đánh giá</span></div>
        ${items}</section>`;
};

const renderProductPage = ({ product, categoryName, relatedProducts = [] }) => {
  const image = firstImage(product);
  const galleryImages = getProductGalleryImages(product);
  const productUrl = `${siteUrl}/san-pham/${product.slug}/`;
  const metaSource = product.seoDescription || product.shortDesc || product.description || product.name;
  const description = truncate(stripHtml(metaSource).replace(/\s+/g, ' '));
  const priceInfo = getStaticPriceInfo(product);
  const cleanTitle = String(product.name || '').replace(/\s*(?:[|–—-]\s*Phương Lâm|\s+(?:I\s+)?Phương Lâm)\s*$/i, '').trim();
  const pageTitle = product.seoTitle || `${truncate(cleanTitle || product.name, 55)} | Phương Lâm`;
  const summary = stripHtml(product.shortDesc || '').replace(/\s+/g, ' ');
  const related = relatedProducts.filter((item) => item.id !== product.id).slice(0, 3);
  const contentBlocks = [
    ...splitProductContent(product.description || product.shortDesc || product.name, 'description', product.name),
    ...splitProductContent(product.usage, 'usage', product.name),
  ];
  const contentGroups = {
    description: contentBlocks.filter((block) => block.type === 'description'),
    specs: contentBlocks.filter((block) => block.type === 'specs'),
    usage: contentBlocks.filter((block) => block.type === 'usage'),
    caution: contentBlocks.filter((block) => block.type === 'caution'),
    notes: contentBlocks.filter((block) => block.type === 'notes'),
    storage: contentBlocks.filter((block) => block.type === 'storage'),
  };
  const productContent = [
    renderProductContentSection({ id: 'product-description', title: 'Thông tin sản phẩm', blocks: contentGroups.description, productName: product.name, className: 'product-info-section' }),
    renderProductContentSection({ id: 'product-specifications', title: 'Thông tin chi tiết', blocks: contentGroups.specs, productName: product.name, className: 'product-specs-section' }),
    renderProductContentSection({ id: 'product-usage', title: 'Cách dùng', blocks: contentGroups.usage, productName: product.name, className: 'product-usage-section' }),
    renderProductContentSection({ id: 'product-cautions', title: 'Lưu ý an toàn', blocks: contentGroups.caution, productName: product.name, className: 'product-caution-section' }),
    renderProductContentSection({ id: 'product-notes', title: 'Lưu ý và bảo quản', blocks: contentGroups.notes, productName: product.name, className: 'product-notes-section' }),
    renderProductContentSection({ id: 'product-storage', title: 'Bảo quản', blocks: contentGroups.storage, productName: product.name, className: 'product-storage-section' }),
  ].filter(Boolean);
  const reviews = getGenuineReviews(product);
  const contentNavItems = [
    ['product-description', 'Giới thiệu', contentGroups.description.length > 0],
    ['product-specifications', 'Thông tin chi tiết', contentGroups.specs.length > 0],
    ['product-usage', 'Cách dùng', contentGroups.usage.length > 0],
    ['product-cautions', 'Lưu ý an toàn', contentGroups.caution.length > 0],
    ['product-notes', 'Lưu ý & bảo quản', contentGroups.notes.length > 0],
    ['product-storage', 'Bảo quản', contentGroups.storage.length > 0],
    ['product-reviews', 'Đánh giá', reviews.length > 0],
  ].filter(([, , visible]) => visible);
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
        <div class="price" data-buy-price>${priceInfo.hasVariants ? '<span class="price-prefix">Giá từ </span>' : ''}<span class="price-current">${formatVnd(priceInfo.price)}</span>${priceInfo.originalPrice ? `<span class="original-price" data-buy-original>${formatVnd(priceInfo.originalPrice)}</span>` : '<span class="original-price" data-buy-original hidden></span>'}</div>
        ${summary ? `<p class="meta-list summary-box">${escapeHtml(summary)}</p>` : ''}
        ${renderStaticBuyBox(product)}
      </div>
    </article>
    <div class="product-content-shell">
      <nav class="product-content-nav" aria-label="Nội dung sản phẩm">
        ${contentNavItems.map(([id, label]) => `<a href="#${id}">${label}</a>`).join('\n        ')}
      </nav>
      <div class="product-reading-column">
        ${productContent.join('\n        ')}
        ${renderReviewsSection(reviews)}
        ${related.length ? `<section class="content related-products" aria-labelledby="related-products-title"><h2 id="related-products-title">Sản phẩm cùng danh mục</h2><ul>${related.map((item) => `<li><a href="/san-pham/${escapeHtml(item.slug)}/">${escapeHtml(item.name)}</a></li>`).join('')}</ul></section>` : ''}
      </div>
    </div>
  </main>`;

  return pageShell({
    robots: isHiddenProduct(product) ? 'noindex, follow' : '',
    title: pageTitle,
    description,
    canonical: productUrl,
    image,
    schema: productSchema({ product, categoryName, url: productUrl, image }),
    body,
    scripts: renderStaticBuyScript(product),
  }).replace(/^[ \t]+$/gm, '');
};

// Keep existing category URLs; tailor content to the products and search intent.
const categorySeoContent = {
  'nen-thom': {
    title: 'Nến tealight 2h, 4h, 8h dùng xông & trang trí | Phương Lâm',
    heading: 'Nến tealight dùng xông tinh dầu, thảo mộc và trang trí',
    description: 'Chọn nến tealight 2h, 4h, 8h tại Phương Lâm: loại không mùi hoặc hương lài, nhiều quy cách đóng gói. Xem giá từng phân loại và cách chọn nến xông.',
    sections: [
      ['Chọn nến xông theo nhu cầu', 'Khi dùng đèn xông tinh dầu hoặc bếp xông thảo mộc, bạn có thể chọn nến không mùi để tránh trộn thêm hương nến. Nếu muốn có hương từ nến, hãy xem phân loại hương lài. Kiểm tra kích thước nến và hướng dẫn của dụng cụ xông trước khi chọn.'],
      ['Nến tealight 2h, 4h hay 8h?', 'Danh mục có các loại nến mang quy cách 2 giờ, 4 giờ và 8 giờ. Chọn theo thời gian sử dụng dự kiến, số viên và loại vỏ ghi trên trang sản phẩm. Thời gian cháy thực tế còn phụ thuộc điều kiện sử dụng; không cần đốt hết một viên trong một lần.'],
      ['Kiểm tra phân loại trước khi đặt', 'Giá và số viên thay đổi theo phân loại. Mở sản phẩm, chọn loại nến và quy cách đóng gói để xem giá tương ứng. Đặt nến trên bề mặt chịu nhiệt, tránh vật dễ cháy và không để nến đang cháy mà không có người trông coi.'],
    ],
    links: [
      ['/blog/kien-thuc/phan-biet-nen-tealight-2h-4h-8h/', 'Phân biệt nến tealight 2h, 4h và 8h'],
      ['/blog/huong-dan-xong/cach-dung-nen-tealight-an-toan/', 'Cách dùng nến tealight an toàn'],
      ['/danh-muc/bep-xong/', 'Chọn đèn xông tinh dầu dùng nến'],
    ],
  },
  'bep-xong': {
    title: 'Bếp xông, đèn xông tinh dầu dùng nến | Phương Lâm',
    heading: 'Bếp xông và đèn xông tinh dầu dùng nến',
    description: 'Tìm bếp xông, đèn xông tinh dầu dùng nến tại Phương Lâm. Xem mẫu, giá và hướng dẫn chọn dụng cụ phù hợp với tinh dầu hoặc thảo mộc xông nhà.',
    sections: [
      ['Chọn dụng cụ theo nguyên liệu xông', 'Đèn xông tinh dầu và bếp xông thảo mộc có cách dùng khác nhau. Hãy xem mô tả từng sản phẩm để xác định dụng cụ phù hợp với tinh dầu hay thảo mộc khô. Không cho nguyên liệu vào bếp chỉ dựa trên hình dáng bên ngoài.'],
      ['Mua đèn riêng hay bộ xông nhà?', 'Nếu đã có nến và nguyên liệu, bạn có thể chọn dụng cụ riêng phù hợp. Nếu mới bắt đầu, xem danh mục combo xông nhà và kiểm tra danh sách món đi kèm của từng phân loại trước khi mua. Nến, thảo mộc và phụ kiện không mặc nhiên đi kèm mọi mẫu đèn.'],
      ['Xem hướng dẫn trước khi sử dụng', 'Tham khảo hướng dẫn dùng bếp xông và hướng dẫn riêng của sản phẩm. Đặt dụng cụ chắc chắn trên bề mặt chịu nhiệt, giữ khoảng cách với vật dễ cháy và đợi bếp nguội trước khi di chuyển hoặc vệ sinh.'],
    ],
    links: [
      ['/blog/huong-dan-xong/huong-dan-dung-bep-xong-thao-moc/', 'Hướng dẫn dùng bếp xông thảo mộc'],
      ['/danh-muc/combo/', 'Xem bộ và combo xông nhà'],
      ['/danh-muc/nen-thom/', 'Chọn nến tealight cho dụng cụ xông'],
      ['/danh-muc/thao-moc-xong/', 'Xem thảo mộc xông nhà'],
    ],
  },
};

const renderCategoryPage = ({ categoryId, categoryName, products, categories }) => {
  const categoryUrl = `${siteUrl}/danh-muc/${categoryId}/`;
  const seo = categorySeoContent[categoryId];
  const description = seo?.description || `${categoryName} Phương Lâm: sản phẩm chọn lọc, phù hợp cho thư giãn, xông hương và chăm sóc không gian sống tự nhiên.`;
  const guide = seo ? `<section class="content" aria-label="Hướng dẫn chọn sản phẩm">${seo.sections.map(([heading, text]) => `<h2>${escapeHtml(heading)}</h2><p>${escapeHtml(text)}</p>`).join('')}<h2>Tham khảo thêm</h2><ul>${seo.links.map(([url, label]) => `<li><a href="${escapeHtml(url)}">${escapeHtml(label)}</a></li>`).join('')}</ul></section>` : '';
  const categoryLinks = categories.map((category) => `<a class="category-side-link${category.id === categoryId ? ' is-active' : ''}" href="/danh-muc/${escapeHtml(category.id)}/">${escapeHtml(category.name)}</a>`).join('\n        ');
  const cards = products.map((product, index) => {
    const image = firstImage(product);
    const priceInfo = getStaticPriceInfo(product);
    const imagePriority = index < 6
      ? ' loading="eager" fetchpriority="high"'
      : ' loading="lazy"';
    return `<a class="card" href="/san-pham/${escapeHtml(product.slug)}/">
      ${image ? `<img src="${escapeHtml(image)}"${responsiveImageAttrs(image, '(max-width: 767px) 50vw, 210px')} alt="${escapeHtml(product.name)}"${imagePriority} />` : ''}
      <div class="card-body">
        <p class="card-title">${escapeHtml(product.name)}</p>
        <div class="card-price">${priceInfo.hasVariants ? 'Từ ' : ''}${formatVnd(priceInfo.price)}</div>
      </div>
    </a>`;
  }).join('\n');

  const body = `<main class="seo-main category-main">
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Trang chủ</a> / ${escapeHtml(categoryName)}</nav>
    <h1>${escapeHtml(seo?.heading || `${categoryName} Phương Lâm`)}</h1>
    <p class="category-intro">${escapeHtml(description)}</p>
    <div class="category-layout">
      <aside class="category-sidebar" aria-label="Danh mục sản phẩm">
        <p class="category-sidebar-title">Danh mục</p>
        ${categoryLinks}
      </aside>
      <section class="category-content">
        <div class="grid category-grid" aria-label="Danh sách sản phẩm">${cards || '<p class="category-empty">Sản phẩm trong danh mục này đang được cập nhật.</p>'}</div>
      </section>
    </div>
${guide}
  </main>`;

  return pageShell({
    title: seo?.title || `${categoryName} Phương Lâm | Sản phẩm tự nhiên`,
    description,
    canonical: categoryUrl,
    image: firstImage(products[0] || {}),
    schema: categorySchema({ categoryName, categoryUrl }),
    body,
  });
};

const renderBlogIndexPage = ({ blogPosts = [] }) => {
  const description = 'Hướng dẫn và kiến thức từ Phương Lâm về nến tealight, bếp xông, thảo mộc xông nhà và cách chăm sóc không gian sống tự nhiên.';
  const posts = blogPosts.filter((post) => post.url).slice(0, 24);
  const cards = posts.map((post, index) => {
    const image = post.image || '';
    const imagePriority = index < 3 ? ' loading="eager" fetchpriority="high"' : ' loading="lazy"';
    return `<a class="blog-card" href="${escapeHtml(post.url)}">
      ${image ? `<img src="${escapeHtml(image)}"${responsiveImageAttrs(image, '(max-width: 767px) 100vw, 360px')} alt="${escapeHtml(post.title)}"${imagePriority} />` : ''}
      <div class="blog-card-body">
        <span class="blog-tag">${escapeHtml(post.tag || 'Bài viết')}</span>
        <h2 class="blog-card-title">${escapeHtml(post.title)}</h2>
        <p class="blog-excerpt">${escapeHtml(post.excerpt || '')}</p>
        <div class="blog-meta">
          <span>${escapeHtml(post.date || '')}</span>
          <span>${escapeHtml(post.readTime || '')}</span>
        </div>
      </div>
    </a>`;
  }).join('\n');

  const body = `<main class="seo-main">
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Trang chủ</a> / Hướng Dẫn</nav>
    <section class="blog-hero">
      <h1>Hướng Dẫn &amp; Kiến Thức</h1>
      <p>${escapeHtml(description)}</p>
    </section>
    <section class="blog-grid" aria-label="Danh sách bài viết">${cards}</section>
  </main>`;

  return pageShell({
    title: 'Hướng Dẫn & Kiến Thức | Phương Lâm',
    description,
    canonical: `${siteUrl}/blog/`,
    image: posts[0]?.image || '/assets/media/generated/embedded-001.png',
    schema: blogIndexSchema(),
    body,
  });
};

const ZALO_PHONE = '077 3829 593';
const ZALO_URL = 'https://zalo.me/0773829593';

// Plain policy/contact pages. Content states only what the owner confirmed; anything not
// confirmed (conditions, fees) is deferred to customer service instead of being invented.
const INFO_PAGES = [
  {
    path: 'chinh-sach-doi-tra',
    title: 'Chính sách đổi trả 7 ngày | Phương Lâm',
    breadcrumb: 'Chính sách đổi trả',
    description: 'Đổi trả trong 7 ngày kể từ khi nhận hàng: miễn phí đổi trả khi đổi ý (sản phẩm chưa sử dụng, còn nguyên bao bì); hàng hư hỏng, bể vỡ đổi mới nhanh chóng.',
    h1: 'Chính sách đổi trả',
    lead: 'Phương Lâm hỗ trợ đổi trả trong vòng 7 ngày kể từ khi bạn nhận hàng.',
    sections: [
      { h2: 'Thời gian đổi trả', html: '<p>Trong vòng <strong>7 ngày</strong> kể từ ngày bạn nhận được hàng.</p>' },
      { h2: 'Miễn phí đổi trả khi đổi ý', html: '<p>Phương Lâm <strong>miễn phí đổi trả</strong> trong 7 ngày nếu bạn không còn nhu cầu sử dụng hoặc muốn đổi ý, với điều kiện:</p><ul><li>Sản phẩm <strong>chưa sử dụng</strong>.</li><li>Sản phẩm <strong>còn nguyên bao bì</strong>.</li></ul>' },
      { h2: 'Hàng hư hỏng, bể vỡ', html: '<p>Nếu sản phẩm bị hư hỏng hoặc bể vỡ, Phương Lâm sẽ <strong>đổi sản phẩm mới nhanh chóng</strong>. Bạn nhắn CSKH trong vòng 7 ngày kể từ khi nhận hàng.</p>' },
      { h2: 'Cách yêu cầu đổi trả', html: `<p>Nhắn Zalo chăm sóc khách hàng <a href="${ZALO_URL}" rel="noopener">${ZALO_PHONE}</a>. Bộ phận CSKH trả lời và tiếp nhận thông tin nhanh chóng, đồng thời hướng dẫn cụ thể cho từng trường hợp.</p>` },
    ],
  },
  {
    path: 'chinh-sach-van-chuyen',
    title: 'Chính sách vận chuyển | Phương Lâm',
    breadcrumb: 'Chính sách vận chuyển',
    description: 'Phương Lâm giao hỏa tốc trong 1 giờ tại nội thành TP.HCM, giao 1–3 ngày với ngoại thành và các tỉnh khác tùy khu vực. Phí vận chuyển hiển thị khi thanh toán.',
    h1: 'Chính sách vận chuyển',
    lead: 'Phương Lâm giao hàng nhanh tại TP.HCM và hỗ trợ giao hàng toàn quốc.',
    sections: [
      { h2: 'Giao hàng tại TP.HCM', html: '<ul><li><strong>Nội thành TP.HCM:</strong> giao hỏa tốc trong 1 giờ.</li><li><strong>Ngoại thành TP.HCM:</strong> giao từ 1–3 ngày.</li></ul>' },
      { h2: 'Các tỉnh thành khác', html: `<p>Phương Lâm giao hàng toàn quốc. Giao thường mất <strong>1–3 ngày tùy khu vực</strong>. Bạn có thể hỏi nhanh qua Zalo <a href="${ZALO_URL}" rel="noopener">${ZALO_PHONE}</a>.</p>` },
      { h2: 'Phí vận chuyển', html: '<p>Phí vận chuyển được tính và hiển thị ở bước thanh toán. Các ưu đãi vận chuyển đang áp dụng được thông báo trên website.</p>' },
      { h2: 'Hàng bể vỡ khi vận chuyển', html: '<p>Nếu sản phẩm bị hư hỏng hoặc bể vỡ trong quá trình giao, Phương Lâm đổi sản phẩm mới theo <a href="/chinh-sach-doi-tra/">chính sách đổi trả</a>.</p>' },
    ],
  },
  {
    path: 'lien-he',
    title: 'Liên hệ Phương Lâm | Zalo CSKH 077 3829 593',
    breadcrumb: 'Liên hệ',
    description: 'Liên hệ Phương Lâm qua Zalo CSKH 077 3829 593 để được tư vấn và tiếp nhận thông tin nhanh chóng. Cửa hàng tại phường Tân Phú, TP.HCM.',
    h1: 'Liên hệ Phương Lâm',
    lead: 'Cần tư vấn chọn sản phẩm hoặc hỗ trợ đơn hàng? Nhắn Zalo để được trả lời nhanh.',
    schemaType: 'ContactPage',
    sections: [
      { h2: 'Chăm sóc khách hàng', html: `<div class="info-box"><p><strong>Zalo CSKH:</strong> <a href="${ZALO_URL}" rel="noopener">${ZALO_PHONE}</a><br><strong>Điện thoại:</strong> <a href="tel:+84773829593">${ZALO_PHONE}</a></p><p>Zalo CSKH trả lời và tiếp nhận thông tin nhanh chóng.</p></div>` },
      { h2: 'Cửa hàng', html: '<p>Phường Tân Phú, TP. Hồ Chí Minh<br>Giờ làm việc: 8:00 – 20:00 mỗi ngày</p>' },
      { h2: 'Mạng xã hội', html: '<ul><li><a href="https://www.facebook.com/nenphuonglam" rel="noopener">Facebook</a></li><li><a href="https://www.instagram.com/nen.phuonglam/" rel="noopener">Instagram</a></li></ul>' },
      { h2: 'Xem thêm', html: '<p><a href="/chinh-sach-doi-tra/">Chính sách đổi trả</a> · <a href="/chinh-sach-van-chuyen/">Chính sách vận chuyển</a></p>' },
    ],
  },
];

const infoPageUrls = () => INFO_PAGES.map((page) => `${siteUrl}/${page.path}/`);

const renderInfoPage = (page) => {
  const url = `${siteUrl}/${page.path}/`;
  const body = `<main class="seo-main">
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Trang chủ</a> / ${escapeHtml(page.breadcrumb)}</nav>
    <article class="info-page">
      <h1>${escapeHtml(page.h1)}</h1>
      <p class="info-lead">${escapeHtml(page.lead)}</p>
      ${page.sections.map((section) => `<section><h2>${escapeHtml(section.h2)}</h2>${section.html}</section>`).join('\n      ')}
    </article>
  </main>`;
  return pageShell({
    title: page.title,
    description: page.description,
    canonical: url,
    image: '/assets/media/generated/embedded-001.png',
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        breadcrumbSchema([{ name: 'Trang chủ', url: siteUrl }, { name: page.breadcrumb, url }]),
        { '@type': page.schemaType || 'WebPage', name: page.h1, url, inLanguage: 'vi' },
      ],
    },
    body,
  });
};

const writeInfoPages = () => {
  for (const page of INFO_PAGES) {
    const dir = path.join(root, page.path);
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, 'index.html'), renderInfoPage(page));
  }
};

const writeSeoPages = ({ products, categories, blogPosts = [] }) => {
  resetDir(paths.productPagesDir);
  resetDir(paths.categoryPagesDir);
  writeStaticCss();
  ensureDir(path.join(root, 'blog'));
  fs.writeFileSync(path.join(root, 'blog', 'index.html'), renderBlogIndexPage({ blogPosts }));
  writeInfoPages();
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
        relatedProducts: products.filter((item) => !isHiddenProduct(item) && item.categoryId === product.categoryId),
      })
    );
  }

  const byCategory = new Map();
  for (const product of products) {
    if (isHiddenProduct(product)) continue;
    const list = byCategory.get(product.categoryId) || [];
    list.push(product);
    byCategory.set(product.categoryId, list);
  }

  const visibleCategories = [...categoryNameById.entries()]
    .map(([id, name]) => ({ id, name }));

  for (const { id: categoryId, name: categoryName } of visibleCategories) {
    const list = byCategory.get(categoryId) || [];
    const dir = path.join(paths.categoryPagesDir, categoryId);
    ensureDir(dir);
    fs.writeFileSync(
      path.join(dir, 'index.html'),
      renderCategoryPage({
        categoryId,
        categoryName,
        products: list,
        categories: visibleCategories,
      })
    );
  }
};

const writeSitemapAndRobots = ({ products, categories = [], blogPosts = [] }) => {
  const urls = new Set([`${siteUrl}/`, `${siteUrl}/blog/`, ...infoPageUrls()]);
  const categoryIds = new Set();
  for (const url of productSitemapUrls(products)) urls.add(url);
  for (const product of products) {
    if (product.categoryId) categoryIds.add(product.categoryId);
  }
  for (const category of categories) {
    if (category.id) categoryIds.add(category.id);
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

const homeTitle = 'Phương Lâm | Nến tealight, nến ly & thảo mộc xông nhà';
const homeDescription = 'Khám phá nến tealight, nến ly, thảo mộc xông nhà và bộ xông tại Phương Lâm. Tìm hiểu phân loại sản phẩm và hướng dẫn sử dụng.';
const homeHeroDescription = 'Từ ánh nến dịu ấm đến hương thảo mộc mộc mạc — cùng Phương Lâm chăm chút từng góc nhà. Khám phá nến tealight, nến ly, thảo mộc và bộ xông phù hợp với bạn.';

// Visible initial content is replaced by React when the storefront mounts.
// Generate from the same catalog/settings so admin rebuilds keep links current.
const writeHomeContent = ({ products, categories, blogPosts, settings }) => {
  const visible = products.filter(product => product.hidden !== true && product.hidden !== 'true');
  const featured = settings.featuredIds.length
    ? settings.featuredIds.map(id => visible.find(product => String(product.id) === String(id))).filter(Boolean).slice(0, 6)
    : visible.filter(product => product.tag === 'Bán chạy' || product.tag === 'Nổi bật').slice(0, 6);
  const heroImage = settings.headerImages?.[0] || '/assets/media/generated/embedded-002.jpg';
  const comboImage = settings.categoryImages?.combo || firstImage(visible.find(product => product.categoryId === 'combo') || {});
  const categoryLinks = categories.map(category => {
    const image = settings.categoryImages?.[category.id] || '';
    return `<a href="/danh-muc/${escapeHtml(category.id)}/">
      ${image ? `<img src="${escapeHtml(image)}"${responsiveImageAttrs(image, '(max-width: 767px) 45vw, 280px')} alt="${escapeHtml(category.name)}" loading="lazy" />` : ''}
      <span>${escapeHtml(category.name)}</span>
      ${category.from ? `<small>${escapeHtml(category.from)}</small>` : ''}
    </a>`;
  }).join('\n');
  const cards = featured.map(product => `<a class="home-static-card" href="/san-pham/${escapeHtml(product.slug)}/">
    <img src="${escapeHtml(firstImage(product))}"${responsiveImageAttrs(firstImage(product), '(max-width: 767px) 45vw, 300px')} alt="${escapeHtml(product.name)}" width="300" height="300" loading="lazy" />
    <h3>${escapeHtml(product.name)}</h3>
  </a>`).join('\n');
  const posts = blogPosts.filter(post => post.url).slice(0, 3).map(post => `<a class="home-static-guide" href="${escapeHtml(post.url)}">
    <h3>${escapeHtml(post.title)}</h3>
    <p>${escapeHtml(post.excerpt || '')}</p>
    <span>Đọc hướng dẫn →</span>
  </a>`).join('\n');
  const content = `<div id="root"><!-- HOME_STATIC_START -->
  <div class="home-static">
    <header><a href="/" aria-label="Phương Lâm - Trang chủ">Phương Lâm</a><a href="/blog/">Hướng dẫn &amp; kiến thức</a></header>
    <main>
      <section class="home-static-hero">
        <div class="home-static-hero-copy">
          <p class="home-static-kicker">Nến &amp; thảo mộc Phương Lâm</p>
          <h1>Thắp chút ấm áp.<br /><span>Ươm hương an yên.</span></h1>
          <p class="home-static-hero-description">${escapeHtml(homeHeroDescription)}</p>
          <nav aria-label="Khám phá sản phẩm"><a class="home-static-primary" href="#danh-muc-san-pham">Khám phá sản phẩm</a><a class="home-static-secondary" href="/danh-muc/combo/">Xem bộ xông</a></nav>
        </div>
        <img class="home-static-hero-image" src="${escapeHtml(heroImage)}"${responsiveImageAttrs(heroImage, '(max-width: 767px) 100vw, 560px')} alt="Nến, bếp xông và thảo mộc Phương Lâm" width="900" height="900" loading="eager" fetchpriority="high" />
      </section>
      <div class="home-static-trust" aria-label="Khám phá cửa hàng"><span>🕯️ Nến &amp; thảo mộc</span><span>🔥 Bếp xông &amp; phụ kiện</span><span>🎁 Combo nhiều lựa chọn</span><span>📖 Bài viết hướng dẫn</span></div>
      <section class="home-static-section" id="danh-muc-san-pham"><div class="home-static-section-head"><h2>Danh mục sản phẩm</h2><p>Nến, bếp xông, thảo mộc và phụ kiện theo nhu cầu</p></div><nav class="home-static-categories" aria-label="Danh mục sản phẩm">${categoryLinks}</nav></section>
      <section class="home-static-section"><div class="home-static-section-head"><h2>Sản phẩm nổi bật</h2><p>Những lựa chọn được giới thiệu từ danh mục Phương Lâm</p></div><div class="home-static-grid">${cards}</div><p class="home-static-more"><a href="#danh-muc-san-pham">Xem các danh mục →</a></p></section>
      <section class="home-static-combo">
        <img src="${escapeHtml(comboImage)}"${responsiveImageAttrs(comboImage, '(max-width: 767px) 100vw, 520px')} alt="Bộ xông nhà Phương Lâm" width="720" height="540" loading="lazy" />
        <div><p class="home-static-kicker">Bộ xông nhà</p><h2>Bắt đầu với một bộ xông</h2><p>Khám phá các bộ xông và lựa chọn phân loại trên từng sản phẩm. Bạn có thể xem thông tin và giá hiện hành trước khi chọn.</p><a class="home-static-primary" href="/danh-muc/combo/">Khám phá các bộ xông</a></div>
      </section>
      <section class="home-static-section"><div class="home-static-section-head"><h2>Hướng dẫn chọn và sử dụng</h2><p>Thông tin về nến và thảo mộc xông nhà</p></div><div class="home-static-guides">${posts}</div><p class="home-static-more"><a href="/blog/">Xem tất cả hướng dẫn →</a></p></section>
    </main>
  </div>
  <!-- HOME_STATIC_END --></div>`;
  let html = fs.readFileSync(paths.index, 'utf8');
  const rootPattern = /<div id="root">(?:<!-- HOME_STATIC_START -->[\s\S]*?<!-- HOME_STATIC_END -->)?<\/div>/;
  if (!rootPattern.test(html)) throw new Error('Homepage root marker missing; refusing to overwrite unexpected markup.');
  html = html.replace(rootPattern, () => content);
  fs.writeFileSync(paths.index, html);
};

const updateIndexHead = (html) => {
  html = html
    .replace(/(href="\/assets\/css\/site\.css)(?:\?v=[^"]*)?"/, `$1?v=${contentVersion(path.join(paths.cssDir, 'site.css'))}"`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(homeTitle)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${escapeHtml(homeDescription)}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${escapeHtml(homeTitle)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${escapeHtml(homeDescription)}" />`);

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
  const organizationMarkup = `<script type="application/ld+json">${jsonForHtml(organizationSchema())}</script>`;
  const organizationScript = /<script type="application\/ld\+json">[\s\S]*?<\/script>/;
  if (organizationScript.test(html)) {
    html = html.replace(organizationScript, organizationMarkup);
  } else {
    html = html.replace('</head>', `  ${organizationMarkup}\n</head>`);
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
  // Runs after site-data.js, app.min.js and site.css are final for this build.
  html = html
    .replace(
      /(<script\b[^>]*\bsrc="\/assets\/js\/(site-data|app\.min)\.js)(?:\?v=[^"]*)?("[^>]*><\/script>)/g,
      (match, prefix, name, suffix) => `${prefix}?v=${contentVersion(path.join(paths.jsDir, `${name}.js`))}${suffix}`
    )
    .replace(/(href="\/assets\/css\/site\.css)(?:\?v=[^"]*)?"/, `$1?v=${contentVersion(path.join(paths.cssDir, 'site.css'))}"`);
  fs.writeFileSync(indexPath, html);
};

const optimizeIndexRuntime = (settings = {}) => {
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
  ];
  // Preload only the first header slide, which is the LCP image; earlier builds hard-coded
  // images that later stopped appearing above the fold.
  const heroImage = settings.headerImages?.[0] || '/assets/media/generated/embedded-002.jpg';
  html = html.replace(/\n?[ \t]*<link rel="preload" as="image"[^>]*>/g, '');
  html = html.replace('</head>', `  <link rel="preload" as="image" href="${escapeHtml(heroImage)}" fetchpriority="high" />\n</head>`);
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
  verifyResponsiveProductImages(products);
  replaceSiteDataProducts(products);
  bakeProductsIntoApp(products);
  const settings = ensureSettingsJson();
  bakeSettingsIntoApp(settings);
  writeHomeContent({ products, categories: initialData.categories, blogPosts: initialData.blogPosts, settings });
  compileAppJs();
  optimizeIndexRuntime(settings);
  bustIndexCache();
  writeSeoPages({ products, categories: initialData.categories, blogPosts: initialData.blogPosts });
  writeSitemapAndRobots({ products, categories: initialData.categories, blogPosts: initialData.blogPosts });
  console.log(`Optimized index, extracted assets, and generated ${products.length} product pages.`);
};

const buildProductPagesOnly = () => {
  const products = JSON.parse(fs.readFileSync(paths.products, 'utf8'));
  writeStaticCss();
  replaceSiteDataProducts(products);
  bakeProductsIntoApp(products);
  compileAppJs();
  const siteDataPath = path.join(paths.jsDir, 'site-data.js');
  const categories = fs.existsSync(siteDataPath)
    ? extractInitialData(fs.readFileSync(siteDataPath, 'utf8')).categories
    : [];
  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));
  for (const [id, name] of Object.entries(categoryFallback)) {
    if (!categoryNameById.has(id)) categoryNameById.set(id, name);
  }
  const visibleProducts = products.filter((product) => !isHiddenProduct(product));
  for (const product of products) {
    const dir = path.join(paths.productPagesDir, product.slug);
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, 'index.html'), renderProductPage({
      product,
      categoryName: categoryNameById.get(product.categoryId) || product.categoryId,
      relatedProducts: visibleProducts.filter((item) => item.categoryId === product.categoryId),
    }));
  }
  console.log(`Generated ${products.length} product detail pages (${products.length - visibleProducts.length} hidden, noindex).`);
};

if (require.main === module) {
  if (process.argv.includes('--product-pages-only')) buildProductPagesOnly();
  else main();
}

module.exports = { contentVersion, isHiddenProduct, productSitemapUrls, renderProductPage, INFO_PAGES, infoPageUrls, renderInfoPage };
