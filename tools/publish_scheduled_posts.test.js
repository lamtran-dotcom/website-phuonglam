const assert = require('assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('node:test');
const { runScheduledPublish } = require('./publish_scheduled_posts');

const createFixture = () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'phuonglam-schedule-test-'));
  fs.mkdirSync(path.join(root, 'assets', 'js'), { recursive: true });
  fs.writeFileSync(path.join(root, 'assets', 'js', 'site-data.js'), 'const BLOG_POSTS = [];\nwindow.BLOG_POSTS = BLOG_POSTS;\n');
  const scheduledDir = path.join(root, 'scheduled-posts', 'kien-thuc', 'bai-hen');
  fs.mkdirSync(scheduledDir, { recursive: true });
  fs.writeFileSync(path.join(scheduledDir, 'index.html'), '<!doctype html><title>Bài hẹn</title>');
  fs.writeFileSync(path.join(scheduledDir, 'article.json'), JSON.stringify({
    version: 1,
    category: 'kien-thuc',
    slug: 'bai-hen',
    publishAt: '2026-07-17T01:05:00.000Z',
    title: 'Bài hẹn',
    meta: { title: 'Bài hẹn', description: 'Mô tả bài hẹn', image: '/assets/blog/bai-hen.webp' },
  }));
  return root;
};

test('only promotes a scheduled article after its publish time', () => {
  const root = createFixture();
  try {
    assert.equal(runScheduledPublish({ siteRoot: root, now: new Date('2026-07-17T01:00:00.000Z'), build: false }).promoted.length, 0);
    const result = runScheduledPublish({ siteRoot: root, now: new Date('2026-07-17T01:06:00.000Z'), build: false });
    assert.deepEqual(result.promoted, [{ category: 'kien-thuc', slug: 'bai-hen', url: '/blog/kien-thuc/bai-hen/' }]);
    assert.ok(fs.existsSync(path.join(root, 'blog', 'kien-thuc', 'bai-hen', 'index.html')));
    assert.ok(!fs.existsSync(path.join(root, 'scheduled-posts', 'kien-thuc', 'bai-hen')));
    const history = JSON.parse(fs.readFileSync(path.join(root, 'data', 'scheduled-blog-history.json'), 'utf8'));
    assert.deepEqual(history, [{
      id: 'kien-thuc/bai-hen',
      category: 'kien-thuc',
      slug: 'bai-hen',
      title: 'Bài hẹn',
      url: '/blog/kien-thuc/bai-hen/',
      publishAt: '2026-07-17T01:05:00.000Z',
      createdAt: '',
      publishedAt: '2026-07-17T01:06:00.000Z',
      status: 'published',
    }]);
    const source = fs.readFileSync(path.join(root, 'assets', 'js', 'site-data.js'), 'utf8');
    assert.match(source, /Bài hẹn/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
