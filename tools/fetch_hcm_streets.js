// Builds assets/js/hcm-streets.json: street names of Ho Chi Minh City mapped to the
// pre-2025 districts they run through, for the checkout address suggestions.
//
// Data: OpenStreetMap (ODbL) via the Overpass API, two downloads:
//   1. the old district outlines (kept in OSM as boundary=historic relations),
//   2. every named road in the old city area, with its centre point.
// Each road piece is placed in the district that contains its centre (OSM splits long
// roads into many pieces, so a road crossing several districts gets all of them).
// Re-run now and then: node tools/fetch_hcm_streets.js
const fs = require('node:fs');
const path = require('node:path');

const OUT = path.join(__dirname, '..', 'assets', 'js', 'hcm-streets.json');
const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
const BBOX = '10.35,106.35,11.17,107.03'; // south,west,north,east of the pre-2025 city

// Same names as the TP.HCM districts in OLD_ADDRESS_OPTIONS (assets/js/app.jsx).
const DISTRICTS = [
  'Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 10', 'Quận 11', 'Quận 12',
  'Quận Bình Tân', 'Quận Bình Thạnh', 'Quận Gò Vấp', 'Quận Phú Nhuận', 'Quận Tân Bình', 'Quận Tân Phú',
  'Thành phố Thủ Đức', 'Huyện Bình Chánh', 'Huyện Cần Giờ', 'Huyện Củ Chi', 'Huyện Hóc Môn', 'Huyện Nhà Bè',
];

// Alleys, bridges, junctions and ramps are not what people type as their street.
const SKIP = /^(hẻm|hem|kiệt|ngõ|ngách|cầu|hầm|nút giao|vòng xoay|bùng binh|đường dẫn|lối|ramp)(\s|$)/i;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const overpass = async (query, label) => {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const url = OVERPASS[attempt % OVERPASS.length];
    const started = Date.now();
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'phuonglam-site-build' },
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(240000),
      });
      if (res.ok) {
        const data = await res.json();
        console.log(`${label}: ${data.elements.length} elements in ${Math.round((Date.now() - started) / 1000)}s`);
        return data;
      }
      console.log(`${label}: HTTP ${res.status} from ${url}, retrying`);
    } catch (error) {
      console.log(`${label}: ${error.message} from ${url}, retrying`);
    }
    await sleep(10000 * (attempt + 1));
  }
  throw new Error(`Overpass did not answer (${label})`);
};

const clean = (name) => name.normalize('NFC').trim().replace(/^(Đường|đường|Phố)\s+/, '').replace(/\s+/g, ' ');

// Even-odd ray casting over every member way of the relation: no ring assembly needed.
const segmentsOf = (relation) => relation.members
  .filter((m) => m.type === 'way' && m.geometry)
  .flatMap((m) => m.geometry.slice(1).map((p, i) => [m.geometry[i], p]));

const contains = (segments, lat, lon) => {
  let inside = false;
  for (const [a, b] of segments) {
    if ((a.lat > lat) !== (b.lat > lat) && lon < ((b.lon - a.lon) * (lat - a.lat)) / (b.lat - a.lat) + a.lon) inside = !inside;
  }
  return inside;
};

const main = async () => {
  const outlines = await overpass(`[out:json][timeout:180];
rel["boundary"="historic"]["end_date"]["name"~"^(Quận|Huyện|Thành phố Thủ Đức)"](${BBOX});
out geom;`, 'district outlines');
  const districts = DISTRICTS.map((name) => {
    const relation = outlines.elements.find((e) => e.tags.name === name);
    if (!relation) throw new Error(`No outline for ${name}`);
    const segments = segmentsOf(relation);
    const lats = segments.flatMap(([a, b]) => [a.lat, b.lat]);
    const lons = segments.flatMap(([a, b]) => [a.lon, b.lon]);
    return { segments, box: [Math.min(...lats), Math.max(...lats), Math.min(...lons), Math.max(...lons)] };
  });

  const roads = await overpass(`[out:json][timeout:230];
way["highway"]["name"](${BBOX});
out tags center;`, 'named roads');

  const streets = new Map();
  for (const way of roads.elements) {
    const name = clean(way.tags.name || '');
    if (!name || name.length > 60 || SKIP.test(name) || !way.center) continue;
    const { lat, lon } = way.center;
    const index = districts.findIndex(({ segments, box }) => lat >= box[0] && lat <= box[1] && lon >= box[2] && lon <= box[3] && contains(segments, lat, lon));
    if (index < 0) continue;
    if (!streets.has(name)) streets.set(name, new Set());
    streets.get(name).add(index);
  }

  const sorted = [...streets.entries()].sort(([a], [b]) => a.localeCompare(b, 'vi'));
  const payload = {
    source: 'OpenStreetMap contributors (ODbL), boundary=historic districts',
    districts: DISTRICTS,
    streets: Object.fromEntries(sorted.map(([name, ids]) => [name, [...ids].sort((a, b) => a - b)])),
  };
  fs.writeFileSync(OUT, `${JSON.stringify(payload)}\n`);
  console.log(`wrote ${OUT}: ${sorted.length} streets, ${fs.statSync(OUT).size} bytes`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
