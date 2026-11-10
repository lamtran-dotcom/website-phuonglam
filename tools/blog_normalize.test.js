const assert = require('assert/strict');
const test = require('node:test');
const { normalizeBlogHtml, buildBlogHtmlUpload, auditBlogSeo } = require('./local_admin_server');

const draft = (title) => `<!doctype html><html lang="vi"><head><title>${title} | Nến Phương Lâm</title><meta name="description" content="Mô tả bài."></head><body><main class="article-wrap"><article><h1>${title}</h1><p class="sapo">Mở bài ngắn.</p><h2>1. Một</h2><p>Nội dung.</p></article></main></body></html>`;
const normalize = (html) => normalizeBlogHtml({ html, category: 'huong-dan-xong', slug: 'bai-thu' });
const visibleText = (html) => html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const titleTag = (html) => html.match(/<title>([\s\S]*?)<\/title>/)?.[1];

test('a new draft gets the site shell and its title comes from the H1', () => {
  const { html, meta } = normalize(draft('Cách dùng bếp xông'));
  assert.match(html, /class="seo-header"/);
  assert.match(html, /class="article-link-panel"/);
  assert.equal(titleTag(html), 'Cách dùng bếp xông');
  assert.equal(meta.title, 'Cách dùng bếp xông');
});

test('an ampersand in the H1 is escaped exactly once in title, og:title and the page', () => {
  const { html, meta } = normalize(draft('Đèn xông &amp; nến').replace('Đèn xông &amp; nến | Nến', 'Đèn xông & nến | Nến'));
  assert.equal(meta.title, 'Đèn xông & nến');
  assert.equal(titleTag(html), 'Đèn xông &amp; nến');
  assert.match(html, /<meta property="og:title" content="Đèn xông &amp; nến">/);
  assert.doesNotMatch(html, /&amp;amp;/);
});

test('saving an already published page again keeps its title tag, breadcrumb and related block', () => {
  const first = normalize(draft('Cách dùng bếp xông')).html;
  const customised = first
    .replace(/<title>[\s\S]*?<\/title>/, '<title>Tiêu đề SEO riêng | Nến Phương Lâm</title>')
    .replace(/(<nav\b[^>]*class="[^"]*\barticle-breadcrumb\b[^"]*"[^>]*>)[\s\S]*?(<\/nav>)/, '$1<span>BREADCRUMB-CU</span>$2')
    .replace(/(<section\b[^>]*class="article-link-panel"[^>]*>)[\s\S]*?(<\/section>)/, '$1<h2>Khối bài liên quan cũ</h2>$2');
  const second = normalize(customised);
  assert.equal(titleTag(second.html), 'Tiêu đề SEO riêng | Nến Phương Lâm');
  assert.equal(second.meta.title, 'Tiêu đề SEO riêng | Nến Phương Lâm');
  assert.match(second.html, /BREADCRUMB-CU/);
  assert.match(second.html, /Khối bài liên quan cũ/);
  assert.match(second.html, /"dateModified"/);
});

test('saving a normalized page again does not change what readers see', () => {
  const first = normalize(draft('Cách dùng bếp xông')).html;
  const second = normalize(first).html;
  assert.equal(visibleText(second), visibleText(first));
});

test('a published page whose H1 already carries &amp; survives a second save', () => {
  const published = normalize(draft('Đèn xông &amp; nến')).html;
  assert.match(published, /<h1[^>]*>Đèn xông &amp; nến<\/h1>/);
  const again = normalize(published);
  assert.equal(titleTag(again.html), 'Đèn xông &amp; nến');
  assert.doesNotMatch(again.html, /&amp;amp;/);
});

test('a draft written as <article> without <main> still gets the related posts panel', () => {
  const articleOnly = `<!doctype html><html lang="vi"><head><title>Bài mới</title><meta name="description" content="Mô tả bài."></head><body><article class="article-wrap"><h1>Bài mới</h1><h2>1. Một</h2><p>Nội dung.</p></article></body></html>`;
  const { html } = normalize(articleOnly);
  assert.match(html, /class="article-link-panel"[\s\S]*<\/article>/);
  assert.equal((html.match(/class="article-link-panel"/g) || []).length, 1);
});

test('a new post gets a visible breadcrumb even when written as <article> without <main>', () => {
  const articleOnly = `<!doctype html><html lang="vi"><head><title>Bài mới</title><meta name="description" content="Mô tả bài."></head><body><article class="article-wrap"><h1>Bài mới</h1><h2>1. Một</h2><p>Nội dung.</p></article></body></html>`;
  const { html } = normalize(articleOnly);
  assert.equal((html.match(/<nav class="article-breadcrumb"/g) || []).length, 1);
  assert.match(html, /<nav class="article-breadcrumb"[\s\S]*<a href="\/blog\/">Hướng Dẫn<\/a>[\s\S]*<span>Bài mới<\/span>/);
});

test('BlogPosting publisher carries an absolute logo URL', () => {
  const { html } = normalize(draft('Cách dùng bếp xông'));
  const json = JSON.parse(html.match(/<script type="application\/ld\+json">(\{[^<]*"@type":"BlogPosting"[^<]*\})<\/script>/)[1]);
  assert.equal(json.publisher.name, 'Phương Lâm');
  assert.equal(json.publisher.logo.url, 'https://phuonglam.com/assets/media/generated/embedded-001.png');
});

test('draft image comments are dropped when a post is normalized', () => {
  const withComments = draft('Bài có nháp').replace('<p class="sapo">', '<!-- PROMPT ẢNH 1 — Featured 1200×675 --><!-- ẢNH 2 — Body 800x600 --><p class="sapo">');
  const { html } = normalize(withComments);
  assert.doesNotMatch(html, /PROMPT ẢNH|ẢNH 2/);
});

test('images made from prompts get a descriptive alt, not a draft label like "Ảnh 1 · Ảnh bìa"', () => {
  const prompt = (label, extra = '') => `<div class="image-prompt"${extra}><div class="image-prompt-label">${label}</div><div class="image-prompt-text">mô tả</div></div>`;
  const rawHtml = `<!doctype html><html lang="vi"><head><title>Bài ảnh</title><meta name="description" content="Mô tả bài."></head><body><article class="article-wrap"><h1>Cách xông nhà</h1>${prompt('Ảnh 1 · Ảnh bìa')}<h2>Chọn vị trí đặt bếp</h2>${prompt('Prompt ảnh 2')}${prompt('Ảnh 3', ' data-alt="Bếp xông đặt trên bàn gỗ gần cửa sổ"')}</article></body></html>`;
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  const fields = { category: 'huong-dan-xong', slug: 'bai-anh', html: rawHtml };
  [0, 1, 2].forEach((i) => { fields[`blogImage${i}`] = { filename: `a${i}.png`, type: 'image/png', data: png }; });
  const { normalized } = buildBlogHtmlUpload({ fields, persist: false });
  const alts = [...normalized.html.matchAll(/<img src="data:[^"]*" alt="([^"]*)"/g)].map((m) => m[1]);
  assert.deepEqual(alts, ['Cách xông nhà', 'Chọn vị trí đặt bếp', 'Bếp xông đặt trên bàn gỗ gần cửa sổ']);
});

test('the SEO audit flags alt text that is only a draft label', () => {
  const html = '<html><head><title>Bài</title></head><body><img src="/a.webp" alt="Ảnh 1 · Ảnh bìa"><img src="/b.webp" alt="Bếp xông đặt trên bàn gỗ"></body></html>';
  const alt = auditBlogSeo({ html }).find((item) => item.label === 'Alt ảnh');
  assert.equal(alt.level, 'warn');
  assert.match(alt.message, /^1 ảnh/);
});
