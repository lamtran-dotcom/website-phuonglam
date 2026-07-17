const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const blogCategories = {
  'huong-dan-xong': 'Hướng dẫn',
  'kien-thuc': 'Kiến thức',
};

const stripHtml = (value = '') => String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const viDate = (date = new Date()) => `${date.getDate()} tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;

const readBlogPosts = (siteDataPath) => {
  if (!fs.existsSync(siteDataPath)) return [];
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(siteDataPath, 'utf8'), context);
  return Array.isArray(context.window.BLOG_POSTS) ? context.window.BLOG_POSTS : [];
};

const replaceBlogPosts = (siteDataPath, posts) => {
  let source = fs.readFileSync(siteDataPath, 'utf8');
  const marker = 'const BLOG_POSTS = [';
  const start = source.indexOf(marker);
  if (start === -1) throw new Error('Không tìm thấy BLOG_POSTS trong site-data.js');
  let depth = 0;
  let end = -1;
  for (let index = start + marker.length - 1; index < source.length; index += 1) {
    if (source[index] === '[') depth += 1;
    if (source[index] === ']') {
      depth -= 1;
      if (depth === 0) {
        end = index + 1;
        if (source[end] === ';') end += 1;
        break;
      }
    }
  }
  if (end === -1) throw new Error('Không xác định được hết mảng BLOG_POSTS');
  const replacement = `const BLOG_POSTS = ${JSON.stringify(posts, null, 2)};`;
  fs.writeFileSync(siteDataPath, source.slice(0, start) + replacement + source.slice(end));
};

const upsertBlogPost = ({ siteDataPath, manifest, now }) => {
  const posts = readBlogPosts(siteDataPath);
  const existing = posts.find((post) => String(post.slug) === manifest.slug);
  const ids = posts.map((post) => Number(post.id) || 0);
  const meta = manifest.meta || {};
  const nextPost = {
    id: existing?.id || Math.max(0, ...ids) + 1,
    title: meta.title || manifest.title || manifest.slug,
    excerpt: meta.description || '',
    date: existing?.date || viDate(now),
    readTime: `${Math.max(3, Math.ceil(stripHtml(`${meta.description || ''} ${meta.title || ''}`).split(/\s+/).length / 180))} phút đọc`,
    slug: manifest.slug,
    tag: blogCategories[manifest.category] || 'Kiến thức',
    url: `/blog/${manifest.category}/${manifest.slug}/`,
    image: meta.image || existing?.image || existing?.coverImage || '',
    coverImage: meta.image || existing?.coverImage || existing?.image || '',
  };
  replaceBlogPosts(siteDataPath, [nextPost, ...posts.filter((post) => String(post.slug) !== manifest.slug)]);
};

const isScheduledManifest = (manifest) => (
  manifest
  && manifest.version === 1
  && blogCategories[manifest.category]
  && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(manifest.slug || ''))
  && !Number.isNaN(new Date(manifest.publishAt).getTime())
);

const runScheduledPublish = ({ siteRoot = root, now = new Date(), build = true } = {}) => {
  const scheduledRoot = path.join(siteRoot, 'scheduled-posts');
  const siteDataPath = path.join(siteRoot, 'assets', 'js', 'site-data.js');
  const promoted = [];
  const errors = [];
  if (!fs.existsSync(scheduledRoot)) return { promoted, errors };

  for (const category of fs.readdirSync(scheduledRoot)) {
    if (!blogCategories[category]) continue;
    const categoryDir = path.join(scheduledRoot, category);
    if (!fs.statSync(categoryDir).isDirectory()) continue;
    for (const slug of fs.readdirSync(categoryDir)) {
      const sourceDir = path.join(categoryDir, slug);
      const manifestPath = path.join(sourceDir, 'article.json');
      const articlePath = path.join(sourceDir, 'index.html');
      if (!fs.existsSync(manifestPath) || !fs.existsSync(articlePath)) continue;
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        if (!isScheduledManifest(manifest) || manifest.category !== category || manifest.slug !== slug) {
          throw new Error('Manifest bài hẹn không hợp lệ');
        }
        if (new Date(manifest.publishAt).getTime() > now.getTime()) continue;
        const publicDir = path.join(siteRoot, 'blog', category, slug);
        fs.mkdirSync(publicDir, { recursive: true });
        fs.copyFileSync(articlePath, path.join(publicDir, 'index.html'));
        upsertBlogPost({ siteDataPath, manifest, now });
        fs.rmSync(sourceDir, { recursive: true, force: true });
        promoted.push({ category, slug, url: `/blog/${category}/${slug}/` });
      } catch (error) {
        errors.push({ category, slug, message: error.message });
      }
    }
  }

  if (promoted.length && build) {
    const result = spawnSync(process.execPath, [path.join(siteRoot, 'tools', 'build_static_site.js')], {
      cwd: siteRoot,
      encoding: 'utf8',
    });
    if (result.status !== 0) throw new Error(result.stderr || result.stdout || 'Build website thất bại');
  }
  return { promoted, errors };
};

if (require.main === module) {
  const result = runScheduledPublish();
  result.promoted.forEach((post) => console.log(`Published ${post.url}`));
  result.errors.forEach((item) => console.error(`Skipped ${item.category}/${item.slug}: ${item.message}`));
  console.log(result.promoted.length ? `Published ${result.promoted.length} scheduled post(s).` : 'No scheduled posts due.');
  if (result.errors.length) process.exitCode = 1;
}

module.exports = {
  readBlogPosts,
  replaceBlogPosts,
  runScheduledPublish,
  upsertBlogPost,
};
