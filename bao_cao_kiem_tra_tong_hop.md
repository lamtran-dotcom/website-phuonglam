# 🔍 Báo Cáo Kiểm Tra Tổng Hợp Website — phuonglam.com

**Ngày kiểm tra:** 30/04/2026  
**Phạm vi:** Toàn bộ frontend (HTML/CSS/JS), SEO, Performance, Mobile Responsive  
**Kích thước mobile test:** 375×812 (iPhone SE), 500×725  
**Trang đã test:** Homepage, Category, Product, Cart, Checkout, Blog, Footer

---

## Phần 1 — Tổng quan hoạt động

### ✅ Những gì hoạt động TỐT

| Hạng mục | Desktop | Mobile | Ghi chú |
|---|---|---|---|
| Homepage load & render | ✅ | ✅ | — |
| Hero banner slider | ✅ | ✅ | — |
| Navigation | ✅ | ✅ | Hamburger menu mở tốt |
| Search bar | ✅ | ✅ | Full width trên mobile |
| Category pages | ✅ | ✅ | 2 cột trên mobile |
| Product pages (images, variants, price) | ✅ | ✅ | Gallery slider OK |
| Cart add/remove/quantity | ✅ | ✅ | — |
| Checkout form | ✅ | ✅ | Inputs full width trên mobile |
| Blog section | ✅ | ✅ | 1 cột trên mobile |
| Static SEO pages (san-pham/, danh-muc/) | ✅ | — | Structured data OK |
| sitemap.xml & robots.txt | ✅ | — | — |
| Image lazy loading | ✅ | ✅ | — |
| Cache headers (_headers) | ✅ | — | — |
| Horizontal overflow (mobile) | — | ✅ | Không bị scroll ngang |

---

## Phần 2 — Lỗi cần sửa

### 🔴 Lỗi #1: Không có Favicon

> [!CAUTION]
> Website hoàn toàn không có file `favicon.ico` hoặc thẻ `<link rel="icon">`. Trình duyệt sẽ request 404 liên tục cho `/favicon.ico`, ảnh hưởng SEO và nhận diện thương hiệu.

**File:** [index.html](file:///Users/lamtran/Desktop/website%20phuonglam/index.html)  
**Cách sửa:** Tạo favicon từ logo Phương Lâm, thêm `<link rel="icon" href="/favicon.ico">` vào `<head>`.

---

### 🔴 Lỗi #2: Copyright sai — © 2025 → © 2026

> [!WARNING]
> Footer hiển thị "© 2025 Phương Lâm" — đã lỗi thời.

![Footer mobile — copyright 2025](/Users/lamtran/.gemini/antigravity/brain/030b1115-d8d8-4ebb-90e2-f06c7ab855d5/mobile_footer.png)

**File:** [app.jsx:620](file:///Users/lamtran/Desktop/website%20phuonglam/assets/js/app.jsx#L620)
```diff
- <span>© 2025 Phương Lâm. Bảo lưu mọi quyền.</span>
+ <span>© 2026 Phương Lâm. Bảo lưu mọi quyền.</span>
```

---

### 🔴 Lỗi #3: Social links ở Footer không có href

> [!WARNING]
> Footer có 3 nút "Facebook", "Instagram", "Zalo" nhưng chỉ là `<span>` không link, không onClick. Khách hàng click vào không có phản hồi.

**File:** [app.jsx:595-597](file:///Users/lamtran/Desktop/website%20phuonglam/assets/js/app.jsx#L595-L597)
```jsx
// Hiện tại:
{['Facebook', 'Instagram', 'Zalo'].map(s => (
  <span key={s} style={footerStyles.social}>{s}</span>
))}
// → Cần thêm link thật (href hoặc onClick mở URL)
```

---

### 🔴 Lỗi #4: Footer "Hỗ trợ" links không hoạt động

> [!NOTE]
> 4 link "Chính sách đổi trả", "Chính sách vận chuyển", "Hướng dẫn mua hàng", "Liên hệ" — chỉ là text, không có link hay trang nào tương ứng.

**File:** [app.jsx:608-610](file:///Users/lamtran/Desktop/website%20phuonglam/assets/js/app.jsx#L608-L610)

---

### 🔴 Lỗi #5: Blog title hiển thị `&amp;` thay vì `&`

> [!CAUTION]
> Blog title hiển thị HTML entity thô:  
> "Bồ Kết Xông Nhà Có Tác Dụng Gì? Cách Dùng Đúng **&amp;** An Toàn | Nến Phương Lâm"

![Blog amp bug](/Users/lamtran/.gemini/antigravity/brain/030b1115-d8d8-4ebb-90e2-f06c7ab855d5/mobile_blog_amp_bug.png)

**Nguyên nhân:** Data trong `BLOG_POSTS` chứa `&amp;` thay vì `&`.  
**Cách sửa:** Sửa title trong data hoặc thêm decode HTML entities khi render.

---

### 🔴 Lỗi #6: Variant ID trùng giữa 2 sản phẩm

> [!WARNING]
> Sản phẩm "Bộ Xông Nhà Trải Nghiệm" (`p_1777474804043_1b5kn`) và "Bếp xông Lẻ" (`shopee_17395821074`) đều dùng variant IDs:
> - `shopee_variant_194717189919`
> - `shopee_variant_194717189920`
>
> Có thể gây bug khi thêm vào giỏ hàng — cart nhầm lẫn 2 sản phẩm khác nhau.

---

## Phần 3 — Cảnh báo Code

### 🟡 #7: localStorage key cũ "herbly-page"

Code vẫn dùng tên cũ `herbly-page`, `herbly-products`, `herbly-new-products` — di sản từ tên cũ, gây nhầm lẫn khi debug.

**File:** [app.jsx](file:///Users/lamtran/Desktop/website%20phuonglam/assets/js/app.jsx) — dòng 4254, 4313, 4377, 4413  
**Cách sửa:** Rename sang `phuonglam-page`, `phuonglam-products`, v.v.

---

### 🟡 #8: Dữ liệu sản phẩm duplicate giữa 2 file

> [!IMPORTANT]
> `site-data.js` (244KB) và `products.json` (232KB) chứa gần như cùng dữ liệu. Cập nhật sản phẩm phải đồng bộ 2 nơi — dễ bị lệch.

**Files:**
- [site-data.js](file:///Users/lamtran/Desktop/website%20phuonglam/assets/js/site-data.js) — 244KB
- [products.json](file:///Users/lamtran/Desktop/website%20phuonglam/data/products.json) — 232KB

**Gợi ý:** Build script đã có logic sync, nên chạy lại sau mỗi lần update.

---

### 🟡 #9: Dead code — HERO_IMAGES hack

**File:** [app.jsx:13-14](file:///Users/lamtran/Desktop/website%20phuonglam/assets/js/app.jsx#L13-L14)
```javascript
HERO_IMAGES[4] = "quẹt gas.jpg"; // file không tồn tại
HERO_IMAGES.splice(5, 1);
```
Dòng này bị ghi đè bởi `BAKED_HEADER_IMAGES` ở dòng 15 nên không gây lỗi, nhưng nên dọn.

---

### 🟡 #10: site-data.js quá lớn (244KB)

Chứa toàn bộ product catalog inline trong JS. 41 sản phẩm hiện tại thì OK, nhưng 100+ sản phẩm sẽ ảnh hưởng tốc độ tải.

---

## Phần 4 — Giao diện Mobile chi tiết

### 📱 Kiểm tra từng section trên mobile (375px & 500px)

````carousel
### Header + Hero ✅
![Mobile Hero](/Users/lamtran/.gemini/antigravity/brain/030b1115-d8d8-4ebb-90e2-f06c7ab855d5/mobile_homepage_hero.png)

- ✅ Logo, giỏ hàng, hamburger OK
- ✅ Search bar full width
- ✅ Hero text đọc rõ, CTA full width
- ✅ Trust bar 2×2 grid cân đối
<!-- slide -->
### Danh mục sản phẩm ⚠️
![Danh mục 4 cột mobile](/Users/lamtran/.gemini/antigravity/brain/030b1115-d8d8-4ebb-90e2-f06c7ab855d5/mobile_category_grid.png)

- ⚠️ **4 cột trên 375px — text nhỏ, ảnh nhỏ**
- Tên danh mục dài phải xuống hàng
- **Đề xuất:** Đổi sang 2 cột hoặc horizontal scroll
<!-- slide -->
### Blog section ⚠️
![Blog section](/Users/lamtran/.gemini/antigravity/brain/030b1115-d8d8-4ebb-90e2-f06c7ab855d5/mobile_blog_section.png)

- ✅ Layout 1 cột, ảnh to, text rõ
- ⚠️ **Lỗi `&amp;` trong blog title**
- ✅ Filter tabs wrap đẹp
<!-- slide -->
### Footer ⚠️
![Footer mobile](/Users/lamtran/.gemini/antigravity/brain/030b1115-d8d8-4ebb-90e2-f06c7ab855d5/mobile_footer.png)

- ✅ Layout 2 cột (Danh mục + Hỗ trợ) OK
- ✅ Social buttons cùng 1 hàng
- ⚠️ Copyright "© 2025"
- ⚠️ Social & policy links không hoạt động
````

### Tổng hợp đánh giá Mobile

| Section | Trạng thái | Ghi chú |
|---|---|---|
| Header + Hero | ✅ Tốt | — |
| Search bar | ✅ Tốt | Full width, autocomplete OK |
| Sản phẩm bán chạy | ✅ Tốt | 2 cột đẹp |
| **Danh mục sản phẩm** | ⚠️ Chấp nhận | **4 cột hơi chật, text nhỏ** |
| Tại sao chọn PL | ✅ Tốt | 2 cột |
| **Blog section** | ⚠️ Lỗi nhỏ | **`&amp;` trong title** |
| Footer | ⚠️ Cần sửa | Copyright 2025, links chết |
| Hamburger Menu | ✅ Tốt | 6 mục, touch target OK |
| Category Page | ✅ Tốt | 2 cột, filter & sort OK |
| Product Page | ✅ Tốt | Variant/gallery/cart OK |
| Cart | ✅ Tốt | — |
| Checkout | ✅ Tốt | Form inputs đúng kích thước |

---

## Phần 5 — SEO & Accessibility

### 🔵 #11: Thiếu `og:image` cho trang chủ

Đã có `og:title`, `og:description`, `og:url` nhưng **thiếu** `og:image`. Share link trên Facebook/Zalo sẽ không hiện ảnh preview.

**File:** [index.html](file:///Users/lamtran/Desktop/website%20phuonglam/index.html)
```diff
  <meta property="og:url" content="https://phuonglam.com/" />
+ <meta property="og:image" content="https://phuonglam.com/assets/media/generated/embedded-002.jpg" />
```

---

### 🔵 #12: Thiếu `<meta name="theme-color">`

Thêm để thanh trình duyệt mobile hiển thị màu brand:
```html
<meta name="theme-color" content="#318223" />
```

---

### 🔵 #13: Font preload cần `font-display: swap`

Hiện dùng `<link rel="preload" ... onload>` — OK nhưng nên thêm `font-display: swap` để text không bị invisible khi font đang load.

---

### 🔵 #14: Static SEO pages thiếu nội dung phong phú

Trang tĩnh `/san-pham/` và `/danh-muc/` chỉ có HTML cơ bản. Google có thể đánh giá "thin content". Nên render thêm `usage`, `reviews` vào HTML tĩnh.

---

## Phần 6 — Performance

### ⚡ #15: Total JS payload ~610KB (chưa gzip)

| File | Size |
|---|---|
| site-data.js | 244KB |
| app.min.js | 224KB |
| React + ReactDOM | ~142KB |
| **Tổng** | **~610KB** |

Sau gzip ước tính ~180-200KB — chấp nhận được nhưng có room tối ưu.

**Gợi ý:** Tách product data ra JSON riêng, fetch async. Lazy load admin components.

---

### ⚡ #16: Ảnh sản phẩm chưa có responsive images

Tất cả ảnh dùng `<img src="..." />` — mobile download cùng kích thước với desktop. Nên thêm `srcset` và `sizes`.

---

## Phần 7 — Đề xuất nâng cấp

### 🚀 Ưu tiên cao (nên làm sớm)

| # | Nâng cấp | Lý do |
|---|---|---|
| A | **Thêm favicon** | Thiếu = mất nhận diện, 404 spam |
| B | **Sửa copyright 2025 → 2026** | Nhìn không chuyên nghiệp |
| C | **Thêm og:image** | Share link không có ảnh preview |
| D | **Link social media thật** | Khách không liên hệ được |
| E | **Fix variant ID trùng** | Bug tiềm ẩn với giỏ hàng |
| F | **Fix blog &amp;amp; bug** | Hiển thị lỗi trước mắt khách |

### 🚀 Ưu tiên trung bình

| # | Nâng cấp | Lý do |
|---|---|---|
| G | **Trang chính sách** | Đổi trả, vận chuyển — tăng trust |
| H | **Responsive images** | Tối ưu tốc độ mobile |
| I | **Danh mục 2 cột trên mobile** | Cải thiện UX điện thoại nhỏ |
| J | **Rename herbly → phuonglam** | Code hygiene |
| K | **Dọn dead code** | Code sạch hơn |

### 🚀 Ưu tiên thấp (dài hạn)

| # | Nâng cấp | Lý do |
|---|---|---|
| L | **PWA / Service Worker** | Offline-first, cài app |
| M | **Google Analytics / Meta Pixel** | Tracking conversion |
| N | **Zalo chat widget** | Tăng tương tác |
| O | **Product review system** | Social proof (hiện chỉ 3 review hardcoded) |
| P | **Search on category page** | Tiện cho khách tìm sản phẩm |

---

## Tổng kết

| Mức độ | Số lượng |
|---|---|
| 🔴 Lỗi cần sửa ngay | 6 |
| 🟡 Cảnh báo code | 4 |
| 🔵 SEO/Accessibility | 4 |
| ⚡ Performance | 2 |
| 🚀 Đề xuất nâng cấp | 11+ |

> [!TIP]
> **Tổng thể website hoạt động ổn định**, giao diện đẹp, responsive tốt trên cả desktop và mobile (375px - 500px). Các lỗi tìm được chủ yếu là **thiếu sót nhỏ** (favicon, copyright, social links, blog encoding) chứ không có lỗi critical nào gây crash hay mất dữ liệu. Giao diện mobile đạt điểm **10/12 sections tốt**, chỉ cần tối ưu grid danh mục và fix blog title.
