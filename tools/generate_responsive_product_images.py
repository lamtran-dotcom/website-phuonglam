#!/usr/bin/env python3
from __future__ import annotations

import json
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


def resize_image(public_path: str) -> list[Path]:
    src = source_path(public_path)
    if not src.exists():
      return []

    written = []
    with Image.open(src) as image:
        image = image.convert("RGB")
        for width in WIDTHS:
            target = output_path(public_path, width)
            ratio = width / image.width
            height = max(1, round(image.height * ratio))
            target.parent.mkdir(parents=True, exist_ok=True)
            resized = image.resize((width, height), Image.Resampling.LANCZOS)
            resized.save(target, "WEBP", quality=82, method=6)
            written.append(target)
    return written


def main() -> int:
    products = json.loads(PRODUCTS_PATH.read_text(encoding="utf-8"))
    images = sorted(set(walk_images(products)))
    written = []
    missing = []
    for public_path in images:
        result = resize_image(public_path)
        if result:
            written.extend(result)
        else:
            missing.append(public_path)

    print(json.dumps({
        "sourceImages": len(images),
        "written": len(written),
        "missing": missing,
        "outputDir": str(OUTPUT_DIR.relative_to(ROOT)),
    }, ensure_ascii=False, indent=2))
    return 1 if missing else 0


if __name__ == "__main__":
    raise SystemExit(main())
