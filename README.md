# phuonglam.com

Website tinh cho Phuong Lam, deploy bang GitHub Pages.

Muc tieu hien tai:
- Trang chinh load nhanh: `index.html` khong chua anh base64.
- Google doc duoc san pham: moi san pham co trang HTML rieng trong `san-pham/`.
- De sua san pham tren may: chay admin local, save, preview, commit va push len GitHub.

## Cach sua san pham tren may

1. Mo Terminal tai thu muc website.
2. Chay server local:

```bash
node tools/local_admin_server.js
```

3. Mo admin:

```text
http://127.0.0.1:8000/admin-upload.html
```

4. Sua/them san pham, upload anh, bam save.
5. Preview website:

```text
http://127.0.0.1:8000/
```

6. Khi da on, day len website chinh:

```bash
git status
git add .
git commit -m "Update products"
git push origin main
```

GitHub Pages se tu deploy sau vai phut.

## Build lai SEO pages

Admin local tu dong build lai sau khi save. Neu can chay tay:

```bash
node tools/build_static_site.js
```

Lenh nay se:
- Toi uu `index.html`.
- Tach CSS/JS ra `assets/`.
- Build `assets/js/app.jsx` thanh `assets/js/app.min.js` de website that khong can tai Babel.
- Tao trang san pham trong `san-pham/`.
- Tao trang danh muc trong `danh-muc/`.
- Update `sitemap.xml` va `robots.txt`.

## File can quan tam hang ngay

| Duong dan | Dung de lam gi |
| --- | --- |
| `admin-upload.html` | Man hinh admin sua san pham tren browser |
| `data/products.json` | Du lieu san pham chinh |
| `data/settings.json` | Cau hinh trang chu: san pham ban chay, anh header, anh danh muc |
| `assets/products/` | Anh san pham dang duoc website dung |
| `assets/products/uploads/` | Anh upload moi tu admin local |
| `assets/js/app.jsx` | Code goc de sua app chinh |
| `assets/js/app.min.js` | File JS da build cho website that chay nhanh hon |
| `san-pham/` | Trang SEO rieng tung san pham, generate tu products.json |
| `danh-muc/` | Trang SEO danh muc, generate tu products.json |
| `sitemap.xml` | File cho Google biet cac URL can index |
| `robots.txt` | File cho Google biet sitemap nam o dau |
| `tools/build_static_site.js` | Script build/tach file/tao SEO pages |
| `tools/local_admin_server.js` | Server local cho admin sua du lieu |
| `tools/vendor/babel-standalone-7.29.0.min.js` | Compiler local dung luc build, khong duoc website that tai ve |

## Nhom file it dung hoac legacy

| Duong dan | Ghi chu |
| --- | --- |
| `api/` | API PHP cu, khong dung khi chay GitHub Pages |
| `deploy/` | Thu muc deploy/thu nghiem cu, da ignore Git |
| `anh-bai-viet/` | Anh bai viet blog |
| `ảnh website/` | Anh goc/tham khao |
| `file sản phẩm từ shopee/` | File import tu Shopee, chi dung khi can doi chieu |
| `rule vs skill/` | Quy tac lam viec noi bo, khong deploy |
| `*.html` o thu muc goc ngoai `index.html` | Bai viet/trang legacy dang giu lai de tranh mat URL cu |

## Nguyen tac SEO bat buoc

- Moi san pham can co URL rieng: `/san-pham/[slug]/`.
- Moi trang san pham can co title, description, canonical va schema Product.
- Anh khong nhung base64 trong HTML/JSON; dung file anh that trong `assets/`.
- Cau hinh trang chu trong admin phai dong bo vao `data/settings.json` va duoc build vao `app.min.js` de GitHub Pages van chay du.
- Sau khi them/sua san pham phai update sitemap bang build script.
- Khong sua workflow theo cach lam Google kho doc noi dung san pham.
