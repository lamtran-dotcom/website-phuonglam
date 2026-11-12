// Checkout address helpers in assets/js/app.jsx: reading a whole pasted address and
// suggesting TP.HCM streets. The plain-JS part of app.jsx is evaluated in a sandbox.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'app.jsx'), 'utf8');
const slice = (startMarker, endMarker) => {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert.ok(start >= 0 && end > start, `markers not found: ${startMarker}`);
  return source.slice(start, end);
};

const load = () => {
  const code = [
    slice('const PROVINCE_OPTIONS = [', '\n];') + '\n];',
    slice('const OLD_ADDRESS_OPTIONS = {', '\n};') + '\n};',
    slice('const normalizeAddressText', '// Accepts spaces, dots, dashes and +84'),
    'this.api = { parseFullAddress, suggestHcmStreets, matchAddressOption, splitHouseNumber, normalizeAddressText };',
  ].join('\n');
  const sandbox = { fetch: () => Promise.reject(new Error('no network')) };
  vm.runInNewContext(code, sandbox);
  return sandbox.api;
};

test('a pasted full address fills province, district and ward', () => {
  const { parseFullAddress } = load();
  assert.deepEqual(
    { ...parseFullAddress('173/5/19 Khuông Việt, Phú Trung, Tân Phú, Thành phố Hồ Chí Minh') },
    { address: '173/5/19 Khuông Việt', city: 'TP.HCM', district: 'Quận Tân Phú', ward: 'Phường Phú Trung' },
  );
  assert.deepEqual(
    { ...parseFullAddress('12 le loi, p ben nghe, q1, hcm') },
    { address: '12 le loi', city: 'TP.HCM', district: 'Quận 1', ward: 'Phường Bến Nghé' },
  );
  // No province: a district that exists in one province decides it.
  assert.equal(parseFullAddress('173 Khuông Việt, Phú Trung, Tân Phú').city, 'TP.HCM');
  assert.equal(parseFullAddress('just a street'), null);
});

test('house number and street are split; street suggestions carry the district', () => {
  const { splitHouseNumber, suggestHcmStreets, normalizeAddressText } = load();
  assert.deepEqual({ ...splitHouseNumber('173/5/19 Khuông') }, { number: '173/5/19', street: 'Khuông' });
  const streets = {
    districts: ['Quận 1', 'Quận Tân Phú', 'Quận 3'],
    list: [
      { name: 'Khuông Việt', ids: [1] },
      { name: 'Lê Lợi', ids: [0, 2] },
    ].map((s) => ({ ...s, key: normalizeAddressText(s.name) })),
  };
  const [first] = suggestHcmStreets(streets, '173/5/19 khuong');
  assert.equal(first.label, '173/5/19 Khuông Việt, Quận Tân Phú, TP.HCM');
  assert.equal(first.district, 'Quận Tân Phú');
  assert.deepEqual([...suggestHcmStreets(streets, '12 Lê Lợi').map((s) => s.district)], ['Quận 1', 'Quận 3']);
  assert.equal(suggestHcmStreets(streets, '12 k').length, 0);
});

test('the street list file, when present, uses the same district names as the form', () => {
  const file = path.join(__dirname, '..', 'assets', 'js', 'hcm-streets.json');
  if (!fs.existsSync(file)) return;
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const formDistricts = Object.keys(vm.runInNewContext(`(${slice('const OLD_ADDRESS_OPTIONS = {', '\n};').replace('const OLD_ADDRESS_OPTIONS = ', '')}\n})`)['TP.HCM']);
  assert.deepEqual([...data.districts].sort(), [...formDistricts].sort());
  assert.ok(Object.keys(data.streets).length > 1000);
  assert.deepEqual(data.streets['Khuông Việt'].map((i) => data.districts[i]), ['Quận Tân Phú']);
});
