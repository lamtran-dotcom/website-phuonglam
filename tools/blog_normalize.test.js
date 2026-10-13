const assert = require('assert/strict');
const test = require('node:test');
const { normalizeBlogHtml } = require('./local_admin_server');

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
