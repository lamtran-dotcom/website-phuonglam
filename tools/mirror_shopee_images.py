#!/usr/bin/env python3
import argparse
import hashlib
import json
import shutil
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime
from io import BytesIO
from pathlib import Path

from PIL import Image, UnidentifiedImageError


ROOT = Path(__file__).resolve().parents[1]
PRODUCTS_PATH = ROOT / "data" / "products.json"
MIRROR_DIR = ROOT / "assets" / "products" / "mirrored"
REPORT_DIR = ROOT / "reports"
SHOPEE_PREFIX = "https://cf.shopee.vn/file/"
MAX_SIZE = 900
WEBP_QUALITY = 82
MIN_IMAGE_BYTES = 1024


def is_shopee_url(value):
    return isinstance(value, str) and value.startswith(SHOPEE_PREFIX)


def path_to_string(path):
    out = "products"
    for part in path:
        if isinstance(part, int):
            out += f"[{part}]"
        else:
            out += f".{part}"
    return out


def scan_shopee_urls(value, path=()):
    hits = []
    if is_shopee_url(value):
        hits.append((value, path_to_string(path)))
    elif isinstance(value, list):
        for index, item in enumerate(value):
            hits.extend(scan_shopee_urls(item, path + (index,)))
    elif isinstance(value, dict):
        for key, item in value.items():
            hits.extend(scan_shopee_urls(item, path + (key,)))
    return hits


def replace_urls(value, url_map):
    if is_shopee_url(value):
        return url_map.get(value, value)
    if isinstance(value, list):
        return [replace_urls(item, url_map) for item in value]
    if isinstance(value, dict):
        return {key: replace_urls(item, url_map) for key, item in value.items()}
    return value


def image_magic(raw):
    if raw.startswith(b"\xff\xd8\xff"):
        return "jpeg"
    if raw.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if raw.startswith(b"RIFF") and raw[8:12] == b"WEBP":
        return "webp"
    if raw.startswith((b"GIF87a", b"GIF89a")):
        return "gif"
    return ""


def validate_download(raw):
    if len(raw) < MIN_IMAGE_BYTES:
        return False, f"too small ({len(raw)} bytes)"
    prefix = raw[:256].lstrip().lower()
    if prefix.startswith(b"<!doctype") or prefix.startswith(b"<html"):
        return False, "html response"
    magic = image_magic(raw)
    if not magic:
        return False, "unknown image magic"
    return True, magic


def download_url(url, timeout=30):
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
            ),
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            "Referer": "https://shopee.vn/",
        },
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.read()


def compress_to_webp(raw, out_path):
    with Image.open(BytesIO(raw)) as image:
        image.load()
        original_size = image.size
        image.thumbnail((MAX_SIZE, MAX_SIZE), Image.Resampling.LANCZOS)
        if image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info):
            background = Image.new("RGB", image.size, (255, 255, 255))
            background.paste(image.convert("RGBA"), mask=image.convert("RGBA").split()[-1])
            image = background
        else:
            image = image.convert("RGB")
        out_path.parent.mkdir(parents=True, exist_ok=True)
        image.save(out_path, "WEBP", quality=WEBP_QUALITY, method=6)
        return {
            "original_width": original_size[0],
            "original_height": original_size[1],
            "output_width": image.size[0],
            "output_height": image.size[1],
        }


def mirror_one(url, existing_ok=True):
    digest = hashlib.sha256(url.encode("utf-8")).hexdigest()[:8]
    out_path = MIRROR_DIR / f"{digest}.webp"
    public_path = f"/assets/products/mirrored/{out_path.name}"

    if existing_ok and out_path.exists() and out_path.stat().st_size >= MIN_IMAGE_BYTES:
        return {
            "ok": True,
            "url": url,
            "local_path": public_path,
            "status": "reused",
            "download_bytes": None,
            "output_bytes": out_path.stat().st_size,
        }

    raw = download_url(url)
    valid, reason = validate_download(raw)
    if not valid:
        return {"ok": False, "url": url, "error": reason, "download_bytes": len(raw)}

    try:
        dimensions = compress_to_webp(raw, out_path)
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        return {"ok": False, "url": url, "error": f"compress failed: {exc}", "download_bytes": len(raw)}

    return {
        "ok": True,
        "url": url,
        "local_path": public_path,
        "status": "downloaded",
        "download_bytes": len(raw),
        "output_bytes": out_path.stat().st_size,
        **dimensions,
    }


def main():
    parser = argparse.ArgumentParser(description="Mirror Shopee product images into local compressed WebP assets.")
    parser.add_argument("--limit", type=int, default=0, help="Only process the first N unique URLs.")
    parser.add_argument("--dry-run", action="store_true", help="Scan and report without downloading or editing products.json.")
    parser.add_argument("--force", action="store_true", help="Re-download even if mirrored file already exists.")
    args = parser.parse_args()

    products = json.loads(PRODUCTS_PATH.read_text(encoding="utf-8"))
    hits = scan_shopee_urls(products)
    locations_by_url = {}
    for url, location in hits:
        locations_by_url.setdefault(url, []).append(location)

    unique_urls = sorted(locations_by_url.keys())
    selected_urls = unique_urls[: args.limit] if args.limit else unique_urls
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    report = {
        "timestamp": timestamp,
        "products_path": str(PRODUCTS_PATH.relative_to(ROOT)),
        "total_occurrences": len(hits),
        "unique_urls": len(unique_urls),
        "processed_urls": len(selected_urls),
        "dry_run": args.dry_run,
        "success": [],
        "failed": [],
        "skipped_unprocessed": unique_urls[len(selected_urls) :] if args.limit else [],
    }

    print(f"Found {len(hits)} Shopee image occurrences across {len(unique_urls)} unique URLs.")
    if args.dry_run:
        REPORT_DIR.mkdir(parents=True, exist_ok=True)
        report_path = REPORT_DIR / f"shopee-image-mirror-dry-run-{timestamp}.json"
        report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"Dry run report: {report_path.relative_to(ROOT)}")
        return 0

    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    MIRROR_DIR.mkdir(parents=True, exist_ok=True)
    backup_path = PRODUCTS_PATH.with_name(f"products.json.backup-{timestamp}")
    shutil.copy2(PRODUCTS_PATH, backup_path)

    url_map = {}
    download_total = 0
    output_total = 0
    for index, url in enumerate(selected_urls, start=1):
        try:
            result = mirror_one(url, existing_ok=not args.force)
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            result = {"ok": False, "url": url, "error": str(exc)}

        result["locations"] = locations_by_url[url]
        if result["ok"]:
            url_map[url] = result["local_path"]
            if isinstance(result.get("download_bytes"), int):
                download_total += result["download_bytes"]
            if isinstance(result.get("output_bytes"), int):
                output_total += result["output_bytes"]
            report["success"].append(result)
            print(f"[{index}/{len(selected_urls)}] OK {result['local_path']} ({result.get('output_bytes', 0)} bytes)")
        else:
            report["failed"].append(result)
            print(f"[{index}/{len(selected_urls)}] FAIL {url} :: {result.get('error')}")

        time.sleep(0.05)

    updated_products = replace_urls(products, url_map)
    PRODUCTS_PATH.write_text(json.dumps(updated_products, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    report["backup_path"] = str(backup_path.relative_to(ROOT))
    report["replaced_unique_urls"] = len(url_map)
    report["replaced_occurrences"] = sum(len(locations_by_url[url]) for url in url_map)
    report["download_bytes_total"] = download_total
    report["output_bytes_total"] = output_total
    report["compression_ratio"] = round(output_total / download_total, 4) if download_total else None

    report_path = REPORT_DIR / f"shopee-image-mirror-{timestamp}.json"
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print("")
    print(f"Backup: {backup_path.relative_to(ROOT)}")
    print(f"Report: {report_path.relative_to(ROOT)}")
    print(f"Replaced {report['replaced_occurrences']} occurrences from {report['replaced_unique_urls']} unique URLs.")
    print(f"Failed unique URLs: {len(report['failed'])}")
    if download_total:
        print(f"Compressed {download_total / 1024 / 1024:.2f} MB -> {output_total / 1024 / 1024:.2f} MB")
    return 0 if not report["failed"] else 2


if __name__ == "__main__":
    sys.exit(main())
