#!/usr/bin/env python3
from __future__ import annotations

import json
import argparse
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PRODUCTS_PATH = ROOT / "data" / "products.json"
OUTPUT_DIR = ROOT / "assets" / "products" / "responsive"
WIDTHS = (480, 720)


def walk_images(value):
    if isinstance(value, dict):
        for child in value.values():
            yield from walk_images(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk_images(child)
    elif isinstance(value, str) and value.startswith("/assets/products/"):
        if not value.startswith("data:"):
            yield value.split("?", 1)[0]


def source_path(public_path: str) -> Path:
    return ROOT / public_path.lstrip("/")


def output_path(public_path: str, width: int) -> Path:
    stem = source_path(public_path).stem
    return OUTPUT_DIR / f"{stem}-{width}.webp"


def responsive_paths(public_path: str) -> list[Path]:
    return [output_path(public_path, width) for width in WIDTHS]


def resize_image(public_path: str, only_missing: bool = False) -> list[Path]:
    src = source_path(public_path)
    if not src.exists():
        return []

    written = []
    with Image.open(src) as image:
        image = image.convert("RGB")
        for width in WIDTHS:
            target = output_path(public_path, width)
            if only_missing and target.exists():
                continue
            ratio = width / image.width
            height = max(1, round(image.height * ratio))
            target.parent.mkdir(parents=True, exist_ok=True)
            resized = image.resize((width, height), Image.Resampling.LANCZOS)
            resized.save(target, "WEBP", quality=82, method=6)
            written.append(target)
    return written


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate responsive product images.")
    parser.add_argument("--image", action="append", dest="images", help="Public product-image path to process. May be repeated.")
    parser.add_argument("--only-missing", action="store_true", help="Create only missing responsive files.")
    parser.add_argument("--check", action="store_true", help="Report missing source or responsive files without writing.")
    args = parser.parse_args()

    if args.images:
        images = sorted(set(args.images))
    else:
        products = json.loads(PRODUCTS_PATH.read_text(encoding="utf-8"))
        images = sorted(set(walk_images(products)))

    missing_sources = [public_path for public_path in images if not source_path(public_path).exists()]
    missing_responsive = [
        str(target.relative_to(ROOT))
        for public_path in images
        if source_path(public_path).exists()
        for target in responsive_paths(public_path)
        if not target.exists()
    ]
    if args.check:
        print(json.dumps({
            "sourceImages": len(images),
            "missingSources": missing_sources,
            "missingResponsive": missing_responsive,
            "outputDir": str(OUTPUT_DIR.relative_to(ROOT)),
        }, ensure_ascii=False, indent=2))
        return 1 if missing_sources or missing_responsive else 0

    written = []
    for public_path in images:
        result = resize_image(public_path, only_missing=args.only_missing)
        if result:
            written.extend(result)

    print(json.dumps({
        "sourceImages": len(images),
        "written": len(written),
        "missingSources": missing_sources,
        "outputDir": str(OUTPUT_DIR.relative_to(ROOT)),
    }, ensure_ascii=False, indent=2))
    return 1 if missing_sources else 0


if __name__ == "__main__":
    raise SystemExit(main())
