#!/usr/bin/env python3
"""
Mirror Shopee images to local.
Steps: scan → dedupe → download → validate → compress WebP → replace products.json → report
"""
import json, hashlib, os, time, urllib.request
from pathlib import Path

ROOT    = Path(__file__).parent.parent
DATA    = ROOT / 'data' / 'products.json'
OUT_DIR = ROOT / 'assets' / 'products' / 'mirrored'
REPORT  = ROOT / 'tools' / 'mirror_report.json'

MAX_DIM = 900
QUALITY = 82
DELAY   = 0.12
TIMEOUT = 15

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    'Referer': 'https://shopee.vn/',
    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
}

MAGIC = {
    b'\xff\xd8\xff': 'jpeg',
    b'RIFF':         'webp',
    b'\x89PNG':      'png',
    b'GIF8':         'gif',
}

def is_shopee(url):
    return isinstance(url, str) and ('cf.shopee.vn' in url or 'down.jpg' in url)

def url_hash(url):
    return hashlib.md5(url.encode()).hexdigest()[:12]

def detect_format(data):
    for magic, fmt in MAGIC.items():
        if data[:len(magic)] == magic:
            return fmt
    return None

def compress_to_webp(raw_bytes, dst_path):
    from PIL import Image
    import io
    img = Image.open(io.BytesIO(raw_bytes)).convert('RGB')
    w, h = img.size
    if w > MAX_DIM or h > MAX_DIM:
        ratio = MAX_DIM / max(w, h)
        img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
    img.save(str(dst_path), 'WEBP', quality=QUALITY, method=6)

def download_and_save(url, dst_path):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        raw = r.read()
    if len(raw) < 2048:
        raise ValueError(f'Too small: {len(raw)} bytes')
    fmt = detect_format(raw)
    if fmt is None:
        raise ValueError(f'Not an image. Start: {raw[:80]}')
    compress_to_webp(raw, dst_path)
    size = dst_path.stat().st_size
    if size < 1024:
        dst_path.unlink()
        raise ValueError(f'Compressed file too small: {size} bytes')
    return fmt, len(raw), size

# ── 1. Load products ──────────────────────────────────────────────────────────
with open(DATA) as f:
    products = json.load(f)

# ── 2. Scan all Shopee URLs → {url: [locations]} ─────────────────────────────
url_locations = {}

for pi, p in enumerate(products):
    for ii, img in enumerate(p.get('images', [])):
        if is_shopee(img):
            url_locations.setdefault(img, []).append((pi, 'images', ii))
    for vi, v in enumerate(p.get('variants', [])):
        img = v.get('image', '')
        if is_shopee(img):
            url_locations.setdefault(img, []).append((pi, 'variants', vi))
    for og_i, og in enumerate(p.get('optionGroups', [])):
        for opt_key, img in og.get('optionImages', {}).items():
            if is_shopee(img):
                url_locations.setdefault(img, []).append((pi, 'optionImages', (og_i, opt_key)))

unique_urls = list(url_locations.keys())
print(f'Unique Shopee URLs : {len(unique_urls)}')
print(f'Total locations    : {sum(len(v) for v in url_locations.values())}')
print()

# ── 3. Download + compress each unique URL ────────────────────────────────────
OUT_DIR.mkdir(parents=True, exist_ok=True)

url_to_local = {}
report = {'success': [], 'fail': [], 'skipped': []}

for i, url in enumerate(unique_urls):
    h = url_hash(url)
    dst = OUT_DIR / f'{h}.webp'
    web_path = f'/assets/products/mirrored/{h}.webp'

    if dst.exists() and dst.stat().st_size > 1024:
        url_to_local[url] = web_path
        report['skipped'].append({'url': url, 'local': web_path})
        print(f'[{i+1}/{len(unique_urls)}] SKIP  {url[-36:]}')
        continue

    try:
        fmt, raw_size, webp_size = download_and_save(url, dst)
        url_to_local[url] = web_path
        report['success'].append({
            'url': url, 'local': web_path,
            'raw_kb': raw_size // 1024, 'webp_kb': webp_size // 1024
        })
        print(f'[{i+1}/{len(unique_urls)}] OK    {raw_size//1024}KB→{webp_size//1024}KB  {url[-36:]}')
    except Exception as e:
        report['fail'].append({'url': url, 'error': str(e)})
        print(f'[{i+1}/{len(unique_urls)}] FAIL  {url[-36:]}  — {e}')

    time.sleep(DELAY)

# ── 4. Replace URLs — only successful downloads ───────────────────────────────
replaced = 0
for url, locs in url_locations.items():
    local = url_to_local.get(url)
    if not local:
        continue
    for (pi, field, key) in locs:
        if field == 'images':
            products[pi]['images'][key] = local
            replaced += 1
        elif field == 'variants':
            products[pi]['variants'][key]['image'] = local
            replaced += 1
        elif field == 'optionImages':
            og_i, opt_key = key
            products[pi]['optionGroups'][og_i]['optionImages'][opt_key] = local
            replaced += 1

print(f'\nReplaced {replaced} locations in products.json')

# ── 5. Write updated products.json ───────────────────────────────────────────
with open(DATA, 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)
print('Saved products.json')

# ── 6. Write report ───────────────────────────────────────────────────────────
report['summary'] = {
    'total_unique': len(unique_urls),
    'success': len(report['success']),
    'skipped': len(report['skipped']),
    'fail': len(report['fail']),
    'replaced_locations': replaced,
}
with open(REPORT, 'w') as f:
    json.dump(report, f, indent=2)

print(f'\n=== REPORT ===')
print(f"Success : {report['summary']['success']}")
print(f"Skipped : {report['summary']['skipped']}")
print(f"Failed  : {report['summary']['fail']}")
print(f"Replaced: {replaced} locations")
if report['fail']:
    print(f"\nFailed URLs (giữ nguyên Shopee URL):")
    for item in report['fail']:
        print(f"  {item['url'][-50:]}  — {item['error'][:80]}")
print(f'\nReport: {REPORT}')
