const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const read = (file) => fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', file), 'utf8');

test('public storefront bundle ships no admin password and gates the in-app admin to localhost', () => {
  for (const file of ['app.jsx', 'app.min.js']) {
    const source = read(file);
    assert.doesNotMatch(source, /ADMIN_PASSWORD/, `${file} still references ADMIN_PASSWORD`);
    assert.doesNotMatch(source, /pwInput\s*===\s*['"]/, `${file} compares the admin input with a literal`);
    assert.match(source, /IS_LOCAL_HOST/, `${file} lacks the localhost gate`);
  }
});

test('storefront cart items are built from a field allow-list', () => {
  const source = read('app.jsx');
  const start = source.indexOf('const buildCartItem');
  const body = source.slice(start, source.indexOf('\n};', start));
  assert.match(body, /cartProductFields\(product\)/);
  assert.doesNotMatch(body, /\.\.\.product\b/);
});
