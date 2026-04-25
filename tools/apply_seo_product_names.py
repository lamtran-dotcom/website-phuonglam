from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PRODUCTS_FILE = ROOT / "data" / "products.json"
INDEX_FILE = ROOT / "index.html"


SEO_NAMES = {
    "1": "Nến tealight 4 giờ Phương Lâm trang trí thư giãn không khói",
    "2": "Nến tealight 8 giờ vỏ nhôm xông tinh dầu không mùi",
    "3": "Thảo mộc ngải cứu xông hơi thư giãn thơm dịu tự nhiên",
    "4": "Thảo mộc sả gừng xông nhà khử mùi làm ấm tự nhiên",
    "5": "Bếp xông gốm thủ công dùng nến tỏa hương đều sang trọng",
    "6": "Combo xông nhà thư giãn cuối tuần đủ món tiện dùng Phương Lâm",
    "7": "Hột quẹt gas thắp nến đầu dài an toàn nhỏ gọn tiện lợi",
    "8": "Nắp bếp niêu xông thảo mộc đất nung giữ hương tiện thay thế",
    "new_1776824123777": "Nến ly 120h thờ cúng Phương Lâm không khói trang nghiêm",
    "new_1776857397825": "Nến tealight 4 giờ Phương Lâm xông tinh dầu không mùi",
    "new_1776857467847": "Nụ trầm tự nhiên xông nhà thư giãn thơm dịu thanh khiết",
    "new_1776858940282": "Phụ kiện bếp xông Phương Lâm dùng kèm tiện lợi bền đẹp",
    "shopee_57653126590": "Quế thanh Yên Bái nấu ăn pha trà thơm đậm tự nhiên",
    "shopee_57058955812": "Nến tealight 4 giờ trang trí tiệc ánh sáng ấm cháy ổn định",
    "shopee_56102764086": "Dĩa lót bếp xông đất nung cách nhiệt giữ sạch mặt bàn",
    "shopee_55553449576": "Bộ bếp xông thảo mộc đất nung xông nhà thư giãn đủ món",
    "shopee_54450013830": "Nến trụ trắng 72h trang trí bàn tiệc cháy êm không khói",
    "shopee_53859220256": "Lá dứa khô tự nhiên xông nhà thơm dịu thanh lọc không gian",
    "shopee_49903096228": "Tinh dầu thơm phòng khách sạn khử mùi thư giãn cao cấp",
    "shopee_48452789252": "Ly đựng nến đất nung dùng bếp xông an toàn tiện cầm",
    "shopee_41402989656": "Máy xông tinh dầu tự động thơm phòng nhanh sang trọng",
    "shopee_41330081336": "Bộ phụ kiện xông nhà đất nung dùng bếp niêu tiện lợi",
    "shopee_40170692234": "Nụ trầm hương tự nhiên xông nhà thiền định thơm dịu",
    "shopee_29861565726": "Cốc kê nến tealight dùng bếp xông tiện nâng nhiệt an toàn",
    "shopee_29011454025": "Nến tealight 4 giờ hương lài trang trí tiệc không khói",
    "shopee_28991652145": "Bộ xông nhà tẩy uế thảo mộc khử mùi thu hút may mắn",
    "shopee_28842006335": "Nụ trầm hương Phương Lâm xông nhà tẩy uế thư giãn",
    "shopee_28422178672": "Nắp bếp niêu xông thảo mộc đất nung giữ nhiệt tiện thay",
    "shopee_28251842874": "Nến tealight 8 giờ vỏ nhôm xông tinh dầu không mùi",
    "shopee_28125966432": "Thảo mộc giảm cảm xông hơi dễ chịu thanh lọc không khí",
    "shopee_26902060126": "Đèn xông tinh dầu trang trí phòng ngủ thơm nhẹ sang trọng",
    "shopee_26830705457": "Nến tealight 8 giờ vỏ nhôm xông thảo mộc không khói",
    "shopee_26007254880": "Thảo mộc xông nhà tự nhiên tẩy uế khử mùi xua côn trùng",
    "shopee_25759395070": "Vỏ quế khô Yên Bái xông thảo mộc khử mùi thơm ấm",
    "shopee_25659397266": "Lá khuynh diệp khô xông nhà giảm cảm thanh lọc không khí",
    "shopee_25314272283": "Hoa đại hồi khô xông thảo mộc thơm ấm xua côn trùng",
    "shopee_25158793608": "Cam vàng sấy khô xông nhà khử mùi thanh lọc không khí",
    "shopee_24656264608": "Lá nguyệt quế khô xông nhà thanh tẩy xua côn trùng",
    "shopee_24604156053": "Tinh dầu thơm phòng khách sạn khử mùi thư giãn cao cấp",
    "shopee_24564267189": "Nến xông thảo mộc 4 giờ màu vàng thanh lọc xua muỗi",
    "shopee_24264267967": "Nến xông thảo mộc 4 giờ dùng tinh dầu xua côn trùng",
    "shopee_23980156399": "Đèn xông tinh dầu hình hươu gốm sứ trang trí sang trọng",
    "shopee_23878486394": "Đèn xông tinh dầu chén rời gốm sứ tiện thay nước",
    "shopee_23752550828": "Đèn xông tinh dầu gốm sứ Bát Tràng trang trí sang trọng",
    "shopee_23752423694": "Đế đựng nến tealight gốm sứ dùng đèn xông tiện lợi",
    "shopee_23579313881": "Bạc hà khô xông nhà thanh lọc không khí xua côn trùng",
    "shopee_23250987135": "Nến tealight 4 giờ bông mai đốt tinh dầu không khói",
    "shopee_22755245517": "Gừng khô xông thảo mộc giảm cảm thanh lọc không khí",
    "shopee_22738192506": "Dao rọc giấy mini inox cắt gói hàng nhỏ gọn chống rỉ",
    "shopee_22454821707": "Nến thơm hoa khô 40 giờ phong cách Bắc Âu thư giãn",
    "shopee_22361508205": "Bồ kết khô gội đầu xông nhà khử mùi thơm tự nhiên",
    "shopee_22353875434": "Thảo mộc xông nhà Phương Lâm thanh tẩy xua côn trùng",
    "shopee_22278304112": "Nến tealight 4 giờ hoa mai trang trí tiệc không khói",
    "shopee_22080262041": "Đèn xông tinh dầu đốt nến trang trí phòng ngủ sang trọng",
    "shopee_21583817320": "Vỏ bưởi khô xông nhà gội đầu thơm dịu tự nhiên",
    "shopee_21493100924": "Sáp thơm wax melts dùng đèn xông thơm phòng tiện lợi",
    "shopee_20965101036": "Tinh dầu thiên nhiên Phương Lâm thơm phòng thư giãn an toàn",
    "shopee_19636361517": "Nến tealight 4 giờ đốt đèn xông trang trí không khói",
    "shopee_18592779414": "Lá sả khô xông nhà thanh lọc không khí xua côn trùng",
    "shopee_18092365763": "Combo thảo mộc xông nhà thanh lọc khử mùi tự nhiên",
    "shopee_17395821074": "Bếp xông thảo mộc bồ kết đất nung khử mùi thơm nhà",
    "shopee_16798613604": "Bếp xông thảo mộc bồ kết đất nung thanh tẩy không khí",
    "shopee_12551285956": "Nến tealight 4 giờ đốt đèn xông tinh dầu trang trí tiệc",
    "shopee_7863836931": "Nến tealight 4 giờ hộp nhỏ trang trí không khói không mùi",
    "shopee_7510227721": "Nến tealight 4-8 giờ xông tinh dầu thảo mộc sang trọng",
    "shopee_7246422347": "Nến tealight 8 giờ tiêu chuẩn Âu trang trí không khói",
    "shopee_6228169441": "Nến tealight 8 giờ trang trí không khói tạo không gian ấm",
    "shopee_6203380691": "Nến ly 72h nơ lớn thờ cúng không khói Phương Lâm",
    "shopee_5810581839": "Nến tealight 4 giờ trơn đốt đèn xông tinh dầu mini",
    "shopee_4903385000": "Nến ly 120h thờ cúng nơ đại không khói trang nghiêm",
    "shopee_4502683753": "Nến trụ Thánh Giá 72h thờ cúng không khói trang nghiêm",
}


def replace_name_references(text: str, old_name: str, new_name: str) -> str:
    if not isinstance(text, str) or not old_name:
        return text
    replacements = {
        old_name: new_name,
        old_name.upper(): new_name.upper(),
        old_name.title(): new_name,
    }
    for source, target in replacements.items():
        text = text.replace(source, target)
    return text


def apply_names(products: list[dict]) -> list[dict]:
    missing = []
    for product in products:
        product_id = str(product.get("id"))
        new_name = SEO_NAMES.get(product_id)
        if not new_name:
            missing.append(product_id)
            continue
        old_name = product.get("name", "")
        product["name"] = new_name
        for field in ("description", "usage"):
            product[field] = replace_name_references(product.get(field, ""), old_name, new_name)
    if missing:
        raise SystemExit(f"Missing SEO names for: {', '.join(missing)}")
    return products


def update_products_json() -> list[dict]:
    products = json.loads(PRODUCTS_FILE.read_text(encoding="utf-8"))
    apply_names(products)
    PRODUCTS_FILE.write_text(
        json.dumps(products, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return products


def update_baked_products(products: list[dict]) -> None:
    html = INDEX_FILE.read_text(encoding="utf-8")
    baked = json.dumps(products, ensure_ascii=False, separators=(",", ":"))
    html = re.sub(
        r"const BAKED_PRODUCTS = /\*BAKED_PRODUCTS\*/.*?/\*END_BAKED_PRODUCTS\*/;",
        lambda _: f"const BAKED_PRODUCTS = /*BAKED_PRODUCTS*/{baked}/*END_BAKED_PRODUCTS*/;",
        html,
        flags=re.S,
    )

    # Keep the small fallback list near the top aligned for older browsers/local fallback.
    for product in products[:8]:
        product_id = str(product.get("id"))
        new_name = SEO_NAMES[product_id]
        pattern = rf"(id:\s*{re.escape(product_id)},[\s\S]*?name:\s*)'[^']*'"
        html = re.sub(pattern, rf"\1'{new_name}'", html, count=1)

    INDEX_FILE.write_text(html, encoding="utf-8")


def main() -> None:
    products = update_products_json()
    update_baked_products(products)
    print(f"Updated {len(products)} product names")


if __name__ == "__main__":
    main()
