const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const vm = require('vm');

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
  blogAssets: path.join(root, 'assets', 'blog'),
  siteData: path.join(root, 'assets', 'js', 'site-data.js'),
  build: path.join(root, 'tools', 'build_static_site.js'),
};

const imageExts = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);

const siteUrl = 'https://phuonglam.com';
const blogCategories = {
  'huong-dan-xong': 'Hướng dẫn',
  'kien-thuc': 'Kiến thức',
};

const blogLinkRedirects = {
  '/nen-tealight': '/san-pham/nen-tealight-4-gio-phuong-lam-trang-tri-thu-gian-khong-khoi/',
  '/bep-xong-thao-moc': '/danh-muc/bep-xong/',
  '/den-xong-tinh-dau': '/danh-muc/bep-xong/',
  '/thao-moc-xong-nha': '/danh-muc/thao-moc-xong/',
  '/phu-kien-thap-nen': '/danh-muc/phu-kien/',
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

const stripHtml = (value = '') => String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const viDate = () => {
  const now = new Date();
  return `${now.getDate()} tháng ${now.getMonth() + 1}, ${now.getFullYear()}`;
};

const vietnamIsoDateTime = (date = new Date()) => {
  const vietnamTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
  return `${vietnamTime.toISOString().slice(0, 19)}+07:00`;
};

const truncate = (value = '', max = 155) => {
  const text = stripHtml(value);
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
};

// Nén ảnh về max 900px, webp quality 82 dùng Python/Pillow
// Trả về path file sau nén (luôn là .webp)
const compressImage = (inputPath) => {
  const outputPath = inputPath.replace(/\.[^.]+$/, '') + '.webp';
  const script = `
import sys
from PIL import Image
import os

src = sys.argv[1]
dst = sys.argv[2]
MAX_DIM = 900
QUALITY = 82

with Image.open(src) as img:
    w, h = img.size
    if max(w, h) > MAX_DIM:
        ratio = MAX_DIM / max(w, h)
        img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
    if img.mode not in ('RGB', 'RGBA'):
        img = img.convert('RGBA' if img.mode == 'P' and 'transparency' in img.info else 'RGB')
    img.save(dst, 'WEBP', quality=QUALITY, method=6)
if src != dst and os.path.exists(src):
    os.remove(src)
print(os.path.getsize(dst))
`.trim();

  const result = spawnSync('python3', ['-c', script, inputPath, outputPath], {
    encoding: 'utf8',
    timeout: 30000,
  });

  if (result.status !== 0) {
    // Nén lỗi → giữ file gốc, không crash server
    console.warn('compressImage failed:', result.stderr || result.stdout);
    return inputPath;
  }
  return outputPath;
};

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

// Parse all fields from a multipart form (text fields + file fields)
const parseMultipartFields = (contentType, body) => {
  const boundaryMatch = contentType.match(/boundary=(.+)$/);
  if (!boundaryMatch) return null;
  const boundary = Buffer.from(`--${boundaryMatch[1]}`);
  const fields = {};
  let start = body.indexOf(boundary);
  while (start !== -1) {
    const next = body.indexOf(boundary, start + boundary.length);
    if (next === -1) break;
    const part = body.slice(start + boundary.length + 2, next - 2);
    const sep = part.indexOf(Buffer.from('\r\n\r\n'));
    if (sep !== -1) {
      const header = part.slice(0, sep).toString('utf8');
      const nameMatch = header.match(/name="([^"]*)"/);
      if (nameMatch) {
        const name = nameMatch[1];
        const data = part.slice(sep + 4);
        if (header.includes('filename=')) {
          fields[name] = {
            filename: header.match(/filename="([^"]*)"/)?.[1] || '',
            type: header.match(/Content-Type:\s*([^\r\n]+)/i)?.[1] || 'application/octet-stream',
            data,
          };
        } else {
          fields[name] = data.toString('utf8');
        }
      }
    }
    start = next;
  }
  return fields;
};

const walkFiles = (dir) => {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) files.push(...walkFiles(fullPath));
    else files.push(fullPath);
  }
  return files;
};

const getMetaContent = (html, selector) => {
  const attrPattern = selector.startsWith('property=') ? 'property' : 'name';
  const attrValue = selector.replace(/^(property|name)=/, '');
  const metas = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of metas) {
    if (getTagAttr(tag, attrPattern) === attrValue) return getTagAttr(tag, 'content');
  }
  return '';
};

const getHtmlTitle = (html) =>
  stripHtml(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '');

const getDescription = (html) =>
  getMetaContent(html, 'name=description') ||
  stripHtml(html.match(/<p[^>]*class=["'][^"']*sapo[^"']*["'][^>]*>([\s\S]*?)<\/p>/i)?.[1] || '') ||
  truncate(stripHtml(html), 155);

const getTagAttr = (tag = '', attr = '') => {
  const match = tag.match(new RegExp(`\\s${escapeRegex(attr)}=["']([^"']*)["']`, 'i'));
  return match?.[1] || '';
};

const extractJsonLd = (html, type) => {
  const scripts = html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const match of scripts) {
    try {
      const data = JSON.parse(match[1]);
      const items = Array.isArray(data?.['@graph']) ? data['@graph'] : [data];
      const found = items.find((item) => {
        const itemType = item?.['@type'];
        return Array.isArray(itemType) ? itemType.includes(type) : itemType === type;
      });
      if (found) return found;
    } catch {
      // Ignore invalid JSON-LD from uploaded drafts; save flow will write clean schema.
    }
  }
  return null;
};

const setOrInsertTitle = (html, title) => {
  const tag = `<title>${escapeHtml(title)}</title>`;
  if (/<title[\s\S]*?<\/title>/i.test(html)) return html.replace(/<title[\s\S]*?<\/title>/i, tag);
  return html.replace(/<head[^>]*>/i, (match) => `${match}\n  ${tag}`);
};

const setJsonLdByType = (html, type, schema) => {
  let replaced = false;
  const nextScript = `  <script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`;
  html = html.replace(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi, (script, json) => {
    if (replaced) return script;
    try {
      const data = JSON.parse(json);
      const items = Array.isArray(data?.['@graph']) ? data['@graph'] : [data];
      const hasType = items.some((item) => {
        const itemType = item?.['@type'];
        return Array.isArray(itemType) ? itemType.includes(type) : itemType === type;
      });
      if (!hasType) return script;
      replaced = true;
      return nextScript;
    } catch {
      if (!script.includes(type)) return script;
      replaced = true;
      return nextScript;
    }
  });
  if (!replaced) html = html.replace(/<\/head>/i, `${nextScript}\n</head>`);
  return html;
};

const findMatchingDivEnd = (html, startIndex) => {
  const tagPattern = /<\/?div\b[^>]*>/gi;
  tagPattern.lastIndex = startIndex;
  let depth = 0;
  for (let match = tagPattern.exec(html); match; match = tagPattern.exec(html)) {
    if (match[0].startsWith('</')) depth -= 1;
    else depth += 1;
    if (depth === 0) return tagPattern.lastIndex;
  }
  return -1;
};

const extractImagePrompts = (html) => {
  const prompts = [];
  const classPattern = /<div\b[^>]*class=["'][^"']*\bimage-prompt\b[^"']*["'][^>]*>/gi;
  for (let match = classPattern.exec(html); match; match = classPattern.exec(html)) {
    const start = match.index;
    const end = findMatchingDivEnd(html, start);
    if (end === -1) continue;
    const block = html.slice(start, end);
    const openingTag = match[0];
    const label = stripHtml(block.match(/<div[^>]+class=["'][^"']*\bimage-prompt-label\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1] || `Prompt ảnh ${prompts.length + 1}`);
    const promptText = stripHtml(block.match(/<div[^>]+class=["'][^"']*\bimage-prompt-text\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1] || '');
    const promptAlt = stripHtml(block.match(/<div[^>]+class=["'][^"']*\bimage-prompt-alt\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1] || '');
    const filenameFromText = promptAlt.match(/(?:Tên file|File name)\s*:\s*([^·\n]+)/i)?.[1]?.trim() || '';
    const altFromText = promptAlt.match(/Alt\s*:\s*["“]([^"”]+)["”]/i)?.[1]?.trim() || '';
    prompts.push({
      index: prompts.length,
      start,
      end,
      block,
      label,
      prompt: promptText,
      filename: getTagAttr(openingTag, 'data-filename') || filenameFromText,
      alt: getTagAttr(openingTag, 'data-alt') || altFromText || label,
    });
    classPattern.lastIndex = end;
  }
  return prompts;
};

const promptImageToUrl = ({ file, prompt, slug, persist, tempDir }) => {
  if (!file?.data || !file.filename) return '';
  if (!persist) {
    const type = file.type || 'image/jpeg';
    return `data:${type};base64,${file.data.toString('base64')}`;
  }
  fs.mkdirSync(tempDir, { recursive: true });
  const originalExt = path.extname(file.filename).toLowerCase() || (file.type?.includes('png') ? '.png' : '.jpg');
  const promptBase = safeName(path.basename(prompt.filename || '', path.extname(prompt.filename || '')) || path.basename(file.filename, path.extname(file.filename)) || `anh-${prompt.index + 1}`);
  const tempPath = path.join(tempDir, `${Date.now()}-${prompt.index + 1}-${promptBase}${originalExt}`);
  fs.writeFileSync(tempPath, file.data);
  return copyBlogAsset({ sourcePath: tempPath, slug });
};

const figureForPrompt = ({ prompt, src }) => {
  const isFeatured = prompt.index === 0;
  const alt = escapeHtml(prompt.alt || `Ảnh minh họa ${prompt.index + 1}`);
  const loadingAttrs = isFeatured ? ' loading="eager" fetchpriority="high"' : ' loading="lazy"';
  const caption = prompt.alt ? `<figcaption>${escapeHtml(prompt.alt)}</figcaption>` : '';
  return `<figure class="article-figure">
      <img src="${escapeHtml(src)}" alt="${alt}"${loadingAttrs}>
      ${caption}
    </figure>`;
};

const setOrInsertHeadTag = (html, pattern, tag) => {
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
};

const convertImageToWebp = (srcPath, outPath) => {
  const candidates = [
    process.env.PHUONGLAM_PYTHON,
    '/Users/lamtran/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',
    'python3',
  ].filter(Boolean);
  const script = [
    'from PIL import Image',
    'import sys',
    'src, out = sys.argv[1], sys.argv[2]',
    'with Image.open(src) as im:',
    '    im = im.convert("RGB")',
    '    im.thumbnail((1200, 1200), Image.Resampling.LANCZOS)',
    '    im.save(out, "WEBP", quality=80, method=6)',
  ].join('\n');
  for (const python of candidates) {
    const result = spawnSync(python, ['-c', script, srcPath, outPath], { cwd: root, encoding: 'utf8' });
    if (result.status === 0 && fs.existsSync(outPath)) return true;
  }
  return false;
};

const copyBlogAsset = ({ sourcePath, slug }) => {
  const ext = path.extname(sourcePath).toLowerCase();
  const base = safeName(path.basename(sourcePath, ext));
  fs.mkdirSync(files.blogAssets, { recursive: true });
  if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
    const outName = safeName(`${slug}-${base}`).replace(/\.+/g, '-') + '.webp';
    const outPath = path.join(files.blogAssets, outName);
    if (ext === '.webp') fs.copyFileSync(sourcePath, outPath);
    else if (!convertImageToWebp(sourcePath, outPath)) {
      const fallbackName = safeName(`${slug}-${base}${ext}`);
      const fallbackPath = path.join(files.blogAssets, fallbackName);
      fs.copyFileSync(sourcePath, fallbackPath);
      return `/assets/blog/${fallbackName}`;
    }
    return `/assets/blog/${outName}`;
  }
  const outName = safeName(`${slug}-${base}${ext}`);
  fs.copyFileSync(sourcePath, path.join(files.blogAssets, outName));
  return `/assets/blog/${outName}`;
};

const normalizeBlogHtml = ({ html, htmlPath = '', category, slug, imageOverrides = new Map(), tempDir = os.tmpdir() }) => {
  const dir = htmlPath ? path.dirname(htmlPath) : root;
  const publicUrl = `/blog/${category}/${slug}/`;
  const canonical = `${siteUrl}${publicUrl}`;
  const copied = new Map();
  const copiedOverrides = new Map();
  const rewriteBlogHref = (href) => {
    const suffix = href.match(/[?#].*$/)?.[0] || '';
    const clean = href.split(/[?#]/)[0].replace(/\/+$/, '');
    const siteRoot = siteUrl.replace(/\/+$/, '');
    const pathOnly = clean.startsWith(siteRoot) ? clean.slice(siteRoot.length) : clean.startsWith('/') ? clean : '';
    const target = blogLinkRedirects[pathOnly];
    return target ? `${siteRoot}${target}${suffix}` : href;
  };
  const resolveAsset = (assetUrl) => {
    if (!assetUrl || /^(https?:)?\/\//i.test(assetUrl) || assetUrl.startsWith('/') || assetUrl.startsWith('data:')) return assetUrl;
    const cleanUrl = assetUrl.split('#')[0].split('?')[0];
    const overrideKey = normalizeAssetKey(cleanUrl);
    const override = imageOverrides.get(overrideKey);
    if (override?.data) {
      if (copiedOverrides.has(overrideKey)) return copiedOverrides.get(overrideKey);
      const ext = path.extname(override.filename) || (override.type?.includes('png') ? '.png' : '.jpg');
      const tempName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName(override.filename || `blog-image${ext}`)}`;
      const tempPath = path.join(tempDir, tempName);
      fs.writeFileSync(tempPath, override.data);
      const nextUrl = copyBlogAsset({ sourcePath: tempPath, slug });
      copiedOverrides.set(overrideKey, nextUrl);
      return nextUrl;
    }
    const sourcePath = path.normalize(path.join(dir, decodeURIComponent(cleanUrl)));
    if (!sourcePath.startsWith(path.dirname(dir)) && !sourcePath.startsWith(dir)) return assetUrl;
    if (!fs.existsSync(sourcePath) || fs.statSync(sourcePath).isDirectory()) return assetUrl;
    if (!copied.has(sourcePath)) copied.set(sourcePath, copyBlogAsset({ sourcePath, slug }));
    return copied.get(sourcePath);
  };

  html = html.replace(/\b(src|href)=["']([^"']+\.(?:png|jpe?g|webp|gif|svg))["']/gi, (match, attr, assetUrl) => {
    const nextUrl = resolveAsset(assetUrl);
    return `${attr}="${nextUrl}"`;
  });

  html = html.replace(/\bhref=["']([^"']+)["']/gi, (match, href) => `href="${rewriteBlogHref(href)}"`);

  const title = getHtmlTitle(html) || slug.replace(/-/g, ' ');
  const description = truncate(getDescription(html), 155);
  const image = html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] || '';
  const absoluteImage = image ? (image.startsWith('/') ? `${siteUrl}${image}` : image) : '';
  const existingSchema = extractJsonLd(html, 'BlogPosting') || {};
  const publishedAt = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(String(existingSchema.datePublished || ''))
    ? existingSchema.datePublished
    : vietnamIsoDateTime();

  html = setOrInsertTitle(html, title);
  html = setOrInsertHeadTag(html, /<link[^>]+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonical}">`);
  html = setOrInsertHeadTag(html, /<meta[^>]+name=["']description["'][^>]*>/i, `<meta name="description" content="${escapeHtml(description)}">`);
  html = setOrInsertHeadTag(html, /<meta[^>]+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${escapeHtml(title)}">`);
  html = setOrInsertHeadTag(html, /<meta[^>]+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${escapeHtml(description)}">`);
  html = setOrInsertHeadTag(html, /<meta[^>]+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canonical}">`);
  html = setOrInsertHeadTag(html, /<meta[^>]+property=["']og:type["'][^>]*>/i, '<meta property="og:type" content="article">');
  if (absoluteImage) {
    html = setOrInsertHeadTag(html, /<meta[^>]+property=["']og:image["'][^>]*>/i, `<meta property="og:image" content="${absoluteImage}">`);
  }
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image: absoluteImage ? [absoluteImage] : undefined,
    url: canonical,
    datePublished: publishedAt,
    dateModified: vietnamIsoDateTime(),
    author: { '@type': 'Organization', name: 'Phương Lâm' },
    publisher: { '@type': 'Organization', name: 'Phương Lâm' },
    mainEntityOfPage: canonical,
  };
  html = setJsonLdByType(html, 'BlogPosting', schema);

  return { html, meta: { title, description, image, url: publicUrl, tag: blogCategories[category] || 'Kiến thức' } };
};

const getUploadedBlogHtml = (fields) => {
  const htmlField = fields.html || fields.file;
  if (!htmlField) throw new Error('Thiếu file HTML bài viết');
  if (typeof htmlField === 'string') return { html: htmlField, filename: 'blog.html' };
  if (!htmlField.data) throw new Error('File HTML bài viết không hợp lệ');
  if (!/\.html?$/i.test(htmlField.filename || '')) throw new Error('Vui lòng upload file .html, không dùng ZIP');
  const html = htmlField.data.toString('utf8');
  if (!html.includes('<html') && !html.includes('<!DOCTYPE')) throw new Error('File HTML không hợp lệ');
  return { html, filename: htmlField.filename || 'blog.html' };
};

const getPromptImageFiles = (fields) => {
  const files = [];
  for (const [key, value] of Object.entries(fields)) {
    const match = key.match(/^blogImage(\d+)$/);
    if (!match || !value?.data || !value.filename) continue;
    files[Number(match[1])] = value;
  }
  return files;
};

const replaceImagePromptsWithFigures = ({ html, prompts, imageFiles, slug, persist, tempDir }) => {
  let nextHtml = html;
  for (const prompt of [...prompts].reverse()) {
    const file = imageFiles[prompt.index];
    if (!file?.data || !file.filename) throw new Error(`Thiếu ảnh cho prompt ${prompt.index + 1}`);
    const src = promptImageToUrl({ file, prompt, slug, persist, tempDir });
    nextHtml = nextHtml.slice(0, prompt.start) + figureForPrompt({ prompt, src }) + nextHtml.slice(prompt.end);
  }
  return nextHtml;
};

const seoStatus = (ok, label, message, level = 'warn') => ({
  level: ok ? 'ok' : level,
  label,
  message,
});

const auditBlogSeo = ({ html, prompts = [] }) => {
  const title = stripHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '');
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const description = getMetaContent(html, 'name=description') || getDescription(html);
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] || '';
  const imageTags = [...html.matchAll(/<img\b[^>]*>/gi)].map(match => match[0]);
  const missingAlt = imageTags.filter(tag => !/\salt=["'][^"']+["']/i.test(tag)).length;
  const schema = extractJsonLd(html, 'BlogPosting');
  const hasPromptBlocks = /class=["'][^"']*\bimage-prompt\b/i.test(html);
  const hasLocalUrl = /(?:localhost|127\.0\.0\.1|file:\/\/)/i.test(html);
  return [
    seoStatus(title.length >= 35 && title.length <= 70, 'Title SEO', title ? `${title.length} ký tự` : 'Thiếu thẻ title', title ? 'warn' : 'error'),
    seoStatus(description.length >= 80 && description.length <= 160, 'Meta description', description ? `${description.length} ký tự` : 'Thiếu meta description', description ? 'warn' : 'error'),
    seoStatus(h1Count === 1, 'H1', h1Count === 1 ? 'Có đúng 1 H1' : `Đang có ${h1Count} H1`, h1Count ? 'warn' : 'error'),
    seoStatus(Boolean(canonical), 'Canonical', canonical || 'Thiếu canonical', 'warn'),
    seoStatus(!hasLocalUrl, 'URL public', hasLocalUrl ? 'Có link localhost/file:// cần bỏ trước khi lưu' : 'Không có URL local', 'error'),
    seoStatus(!missingAlt, 'Alt ảnh', missingAlt ? `${missingAlt} ảnh thiếu alt` : 'Ảnh có alt đầy đủ', 'warn'),
    seoStatus(Boolean(schema), 'Schema BlogPosting', schema ? 'Có schema bài viết' : 'Khi lưu admin sẽ tự tạo schema BlogPosting', 'warn'),
    seoStatus(prompts.length > 0 || imageTags.length > 0, 'Ảnh theo ngữ cảnh', prompts.length ? `${prompts.length} prompt ảnh cần upload` : `${imageTags.length} ảnh trong bài`, 'warn'),
    seoStatus(!hasPromptBlocks, 'Prompt nội bộ', hasPromptBlocks ? 'Prompt sẽ được thay bằng ảnh khi lưu' : 'Không còn prompt trong HTML', 'warn'),
  ];
};

const buildBlogHtmlUpload = ({ fields, persist }) => {
  const category = safeName(String(fields.category || ''));
  if (!blogCategories[category]) throw new Error('Danh mục bài viết chỉ được chọn Hướng dẫn hoặc Kiến thức');
  const { html: rawHtml, filename } = getUploadedBlogHtml(fields);
  const canonicalPath = rawHtml.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] || '';
  const canonicalSlug = canonicalPath.split('?')[0].replace(/\/$/, '').split('/').pop();
  const slug = safeName(fields.slug || canonicalSlug || path.basename(filename, path.extname(filename)));
  if (!slug) throw new Error('Không xác định được slug bài viết');
  const prompts = extractImagePrompts(rawHtml);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'phuonglam-blog-html-'));
  try {
    const imageFiles = getPromptImageFiles(fields);
    const htmlWithImages = prompts.length
      ? replaceImagePromptsWithFigures({ html: rawHtml, prompts, imageFiles, slug, persist, tempDir })
      : rawHtml;
    const normalized = normalizeBlogHtml({ html: htmlWithImages, category, slug, tempDir });
    return { category, slug, prompts, normalized };
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
};

const readBlogPostsFromSiteData = () => {
  if (!fs.existsSync(files.siteData)) return [];
  const source = fs.readFileSync(files.siteData, 'utf8');
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(source, context);
  return Array.isArray(context.window.BLOG_POSTS) ? context.window.BLOG_POSTS : [];
};

const replaceBlogPostsInSiteData = (posts) => {
  if (!fs.existsSync(files.siteData)) return;
  let source = fs.readFileSync(files.siteData, 'utf8');
  const startMarker = 'const BLOG_POSTS = [';
  const startIdx = source.indexOf(startMarker);
  if (startIdx === -1) return;
  let depth = 0;
  let endIdx = -1;
  for (let i = startIdx + startMarker.length - 1; i < source.length; i += 1) {
    if (source[i] === '[') depth += 1;
    else if (source[i] === ']') {
      depth -= 1;
      if (depth === 0) {
        endIdx = i + 1;
        if (source[endIdx] === ';') endIdx += 1;
        break;
      }
    }
  }
  if (endIdx === -1) return;
  const block = `const BLOG_POSTS = ${JSON.stringify(posts, null, 2)};`;
  source = source.slice(0, startIdx) + block + source.slice(endIdx);
  fs.writeFileSync(files.siteData, source);
};

const upsertBlogPost = ({ category, slug, meta }) => {
  const posts = readBlogPostsFromSiteData();
  const existing = posts.find((post) => String(post.slug) === slug);
  const ids = posts.map((post) => Number(post.id) || 0);
  const nextPost = {
    id: existing?.id || Math.max(0, ...ids) + 1,
    title: meta.title,
    excerpt: meta.description,
    date: existing?.date || viDate(),
    readTime: `${Math.max(3, Math.ceil(stripHtml(meta.description + ' ' + meta.title).split(/\s+/).length / 180))} phút đọc`,
    slug,
    tag: blogCategories[category] || 'Kiến thức',
    url: `/blog/${category}/${slug}/`,
    image: meta.image || existing?.image || '',
  };
  const nextPosts = [nextPost, ...posts.filter((post) => String(post.slug) !== slug)];
  replaceBlogPostsInSiteData(nextPosts);
};

const removeBlogPostFromSiteData = (slug) => {
  const posts = readBlogPostsFromSiteData();
  replaceBlogPostsInSiteData(posts.filter((post) => String(post.slug) !== slug));
};

const findHtmlFile = (dir) => {
  const htmlFiles = walkFiles(dir).filter((file) => /\.html?$/i.test(file));
  return htmlFiles.find((file) => path.basename(file).toLowerCase() === 'index.html') || htmlFiles[0] || '';
};

const assertSafeZipEntries = (entries) => {
  if (entries.some((entry) => path.isAbsolute(entry) || entry.split(/[\\/]+/).includes('..'))) {
    throw new Error('File ZIP có đường dẫn không an toàn');
  }
};

const extractZipToTemp = (zipField) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'phuonglam-blog-'));
  try {
    const zipPath = path.join(tempDir, safeName(zipField.filename || 'blog.zip'));
    const extractDir = path.join(tempDir, 'extract');
    fs.writeFileSync(zipPath, zipField.data);
    fs.mkdirSync(extractDir, { recursive: true });
    const list = spawnSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' });
    if (list.status !== 0) throw new Error(list.stderr || 'Không đọc được file ZIP');
    const entries = list.stdout.split('\n').filter(Boolean);
    assertSafeZipEntries(entries);
    const unzip = spawnSync('unzip', ['-q', zipPath, '-d', extractDir], { encoding: 'utf8' });
    if (unzip.status !== 0) throw new Error(unzip.stderr || 'Không giải nén được file ZIP');
    return { tempDir, extractDir };
  } catch (error) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    throw error;
  }
};

const normalizeAssetKey = (assetUrl = '') =>
  decodeURIComponent(String(assetUrl).split('#')[0].split('?')[0]).replace(/^\.\//, '');

const getLocalImageRefs = ({ html, htmlPath }) => {
  const dir = path.dirname(htmlPath);
  const seen = new Set();
  const refs = [];
  const pushRef = (assetUrl) => {
    if (!assetUrl || /^(https?:)?\/\//i.test(assetUrl) || assetUrl.startsWith('/') || assetUrl.startsWith('data:')) return;
    const cleanUrl = assetUrl.split('#')[0].split('?')[0];
    const ext = path.extname(cleanUrl).toLowerCase();
    if (!imageExts.has(ext)) return;
    const sourcePath = path.normalize(path.join(dir, decodeURIComponent(cleanUrl)));
    if (!sourcePath.startsWith(path.dirname(dir)) && !sourcePath.startsWith(dir)) return;
    if (!fs.existsSync(sourcePath) || fs.statSync(sourcePath).isDirectory()) return;
    const key = normalizeAssetKey(assetUrl);
    if (seen.has(key)) return;
    seen.add(key);
    refs.push({ assetUrl: cleanUrl, sourcePath });
  };
  html.replace(/\b(?:src|href)=["']([^"']+\.(?:png|jpe?g|webp|gif|svg)(?:[?#][^"']*)?)["']/gi, (match, assetUrl) => {
    pushRef(assetUrl);
    return match;
  });
  return refs;
};

const collectBlogPreviewImages = (zipField) => {
  const { tempDir, extractDir } = extractZipToTemp(zipField);
  try {
    const htmlPath = findHtmlFile(extractDir);
    if (!htmlPath) throw new Error('ZIP phải có ít nhất 1 file HTML');
    const rawHtml = fs.readFileSync(htmlPath, 'utf8');
    if (!rawHtml.includes('<html') && !rawHtml.includes('<!DOCTYPE')) throw new Error('File HTML trong ZIP không hợp lệ');
    const refs = getLocalImageRefs({ html: rawHtml, htmlPath });
    const seenPaths = new Set(refs.map(ref => ref.sourcePath));
    const extraRefs = walkFiles(extractDir)
      .filter((file) => imageExts.has(path.extname(file).toLowerCase()) && !seenPaths.has(file))
      .map((sourcePath) => ({ assetUrl: path.relative(path.dirname(htmlPath), sourcePath), sourcePath }));
    return [...refs, ...extraRefs].slice(0, 5).map((ref, index) => {
      const ext = path.extname(ref.sourcePath).toLowerCase();
      const type = mime[ext] || 'application/octet-stream';
      return {
        index,
        assetUrl: ref.assetUrl,
        label: path.basename(ref.assetUrl),
        dataUrl: `data:${type};base64,${fs.readFileSync(ref.sourcePath).toString('base64')}`,
      };
    });
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
};

const extractBlogImageOverrides = (fields) => {
  let targets = [];
  try {
    targets = JSON.parse(fields.blogImageTargets || '[]');
  } catch {
    targets = [];
  }
  const overrides = new Map();
  targets.forEach((target, index) => {
    const file = fields[`blogImage${index}`];
    if (!file?.data || !file.filename) return;
    overrides.set(normalizeAssetKey(target), file);
  });
  return overrides;
};

const unpackBlogZip = ({ zipField, category, requestedSlug, imageOverrides = new Map() }) => {
  const { tempDir, extractDir } = extractZipToTemp(zipField);
  try {
    const htmlPath = findHtmlFile(extractDir);
    if (!htmlPath) throw new Error('ZIP phải có ít nhất 1 file HTML');
    const rawHtml = fs.readFileSync(htmlPath, 'utf8');
    if (!rawHtml.includes('<html') && !rawHtml.includes('<!DOCTYPE')) throw new Error('File HTML trong ZIP không hợp lệ');
    const canonicalPath = rawHtml.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] || '';
    const canonicalSlug = canonicalPath.split('?')[0].replace(/\/$/, '').split('/').pop();
    const slug = safeName(requestedSlug || canonicalSlug || path.basename(htmlPath, path.extname(htmlPath)));
    if (!slug) throw new Error('Không xác định được slug bài viết');
    const normalized = normalizeBlogHtml({ html: rawHtml, htmlPath, category, slug, imageOverrides, tempDir });
    const outDir = path.join(root, 'blog', category, slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), normalized.html);
    upsertBlogPost({ category, slug, meta: normalized.meta });
    return { slug, url: `/blog/${category}/${slug}/` };
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
};

const normalizeBlogPostForAdmin = (post) => {
  const url = String(post.url || '');
  const match = url.match(/^\/?blog\/([^/]+)\/([^/]+)\/?/);
  const category = safeName(String(post.category || match?.[1] || ''));
  const slug = safeName(String(post.slug || match?.[2] || ''));
  if (!blogCategories[category] || !slug) return null;
  return {
    ...post,
    category,
    categoryLabel: blogCategories[category],
    slug,
    title: post.title || slug,
    url: `/blog/${category}/${slug}/`,
  };
};

// Return blog posts newest-first from BLOG_POSTS, then append any files not in site-data.
const listBlogPosts = () => {
  const blogDir = path.join(root, 'blog');
  const posts = [];
  if (!fs.existsSync(blogDir)) return posts;
  const seen = new Set();
  for (const post of readBlogPostsFromSiteData().map(normalizeBlogPostForAdmin).filter(Boolean)) {
    const htmlPath = path.join(blogDir, post.category, post.slug, 'index.html');
    if (!fs.existsSync(htmlPath)) continue;
    seen.add(`${post.category}/${post.slug}`);
    posts.push(post);
  }
  const scanned = [];
  for (const cat of fs.readdirSync(blogDir)) {
    if (!blogCategories[cat]) continue;
    const catPath = path.join(blogDir, cat);
    if (!fs.statSync(catPath).isDirectory()) continue;
    for (const slug of fs.readdirSync(catPath)) {
      if (seen.has(`${cat}/${slug}`)) continue;
      const htmlPath = path.join(catPath, slug, 'index.html');
      if (fs.existsSync(htmlPath)) {
        const html = fs.readFileSync(htmlPath, 'utf8');
        scanned.push({
          category: cat,
          categoryLabel: blogCategories[cat],
          slug,
          title: getHtmlTitle(html),
          url: `/blog/${cat}/${slug}/`,
          mtimeMs: fs.statSync(htmlPath).mtimeMs,
        });
      }
    }
  }
  scanned.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return posts.concat(scanned.map(({ mtimeMs, ...post }) => post));
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
      const origExt = path.extname(image.filename).toLowerCase() || '.jpg';
      const base = safeName(path.basename(image.filename, path.extname(image.filename)));
      // Luôn lưu tạm với tên gốc, sau đó nén → đổi thành .webp
      const tempFilename = `${Date.now()}-${base}${origExt}`;
      const tempPath = path.join(files.uploads, tempFilename);
      fs.writeFileSync(tempPath, image.data);
      // Nén + resize về max 900px, output .webp
      const finalPath = compressImage(tempPath);
      const finalFilename = path.basename(finalPath);
      sendJson(res, { ok: true, url: `/assets/products/uploads/${finalFilename}` });
      return true;
    }

    if (pathname === '/api/blog.php' && req.method === 'GET') {
      sendJson(res, { ok: true, posts: listBlogPosts() });
      return true;
    }

    if (pathname === '/api/blog-preview.php' && req.method === 'POST') {
      const fields = parseMultipartFields(req.headers['content-type'] || '', await readBody(req));
      if (!fields) throw new Error('Không đọc được dữ liệu form');
      if (fields.render === '1') {
        const result = buildBlogHtmlUpload({ fields, persist: false });
        sendJson(res, {
          ok: true,
          slug: result.slug,
          title: result.normalized.meta.title,
          prompts: result.prompts.map(({ block, start, end, ...prompt }) => prompt),
          seo: auditBlogSeo({ html: result.normalized.html, prompts: [] }),
          previewHtml: result.normalized.html,
        });
        return true;
      }
      const { html, filename } = getUploadedBlogHtml(fields);
      const prompts = extractImagePrompts(html);
      const canonicalPath = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] || '';
      const canonicalSlug = canonicalPath.split('?')[0].replace(/\/$/, '').split('/').pop();
      const slug = safeName(fields.slug || canonicalSlug || path.basename(filename, path.extname(filename)));
      sendJson(res, {
        ok: true,
        slug,
        title: getHtmlTitle(html),
        prompts: prompts.map(({ block, start, end, ...prompt }) => prompt),
        seo: auditBlogSeo({ html, prompts }),
      });
      return true;
    }

    if (pathname === '/api/blog.php' && req.method === 'POST') {
      const fields = parseMultipartFields(req.headers['content-type'] || '', await readBody(req));
      if (!fields) throw new Error('Không đọc được dữ liệu form');
      const result = buildBlogHtmlUpload({ fields, persist: true });
      const outDir = path.join(root, 'blog', result.category, result.slug);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'index.html'), result.normalized.html);
      upsertBlogPost({ category: result.category, slug: result.slug, meta: result.normalized.meta });
      runBuild();
      sendJson(res, { ok: true, url: `/blog/${result.category}/${result.slug}/`, slug: result.slug, posts: listBlogPosts() });
      return true;
    }

    if (pathname === '/api/blog.php' && req.method === 'DELETE') {
      const body = JSON.parse((await readBody(req)).toString('utf8'));
      const category = safeName(String(body.category || ''));
      const slug = safeName(String(body.slug || ''));
      if (!category || !slug) throw new Error('Thiếu category hoặc slug');
      const dir = path.join(root, 'blog', category, slug);
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
      removeBlogPostFromSiteData(slug);
      runBuild();
      sendJson(res, { ok: true, posts: listBlogPosts() });
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
