# Bộ quy tắc SEO cho bài viết blog Phương Lâm

Dùng để kiểm tra một bài viết trên `phuonglam.com/blog/...` đã đạt chuẩn SEO hay chưa. Tài liệu gồm 3 phần:

1. **Bộ quy tắc**: mỗi quy tắc có mã, mức độ và cách kiểm tra.
2. **Prompt cho AI kiểm tra**: AI đọc bài, đối chiếu bộ quy tắc, trả về danh sách lỗi dạng JSON.
3. **Prompt cho Claude Code**: nhận danh sách lỗi đó và sửa trong repo này.

Lưu ý quan trọng: Google **không có "điểm SEO" chính thức**. Có hai loại quy tắc:

- **[G]**: dựa trên tài liệu chính thức của Google (Search Essentials, hướng dẫn tiêu đề, đoạn mô tả, dữ liệu có cấu trúc, hình ảnh, liên kết).
- **[PL]**: quy ước riêng của Phương Lâm, đặt ra cho đồng bộ và dễ kiểm soát, ví dụ giới hạn số ký tự. Google không bắt buộc các ngưỡng này.

## Mức độ

| Mức | Ý nghĩa | Bài có lỗi ở mức này |
|---|---|---|
| `blocker` | Google có thể không lập chỉ mục, hoặc trang hỏng với người đọc | **Không đạt**, sửa ngay |
| `major` | Ảnh hưởng rõ tới thứ hạng, tỉ lệ bấm hoặc độ tin cậy | **Không đạt** |
| `minor` | Nên sửa khi tiện | Vẫn **đạt** |

Bài **đạt** khi không có lỗi `blocker` và không có lỗi `major`.

Cột "Cách kiểm" cho biết quy tắc đó kiểm được bằng gì:

- `auto`: đọc HTML là kiểm được.
- `site`: cần thêm dữ liệu toàn site, như `sitemap.xml`, danh sách bài, các trang khác.
- `judge`: cần AI đánh giá nội dung.

---

## 1. Bộ quy tắc

### T. Kỹ thuật và lập chỉ mục

| Mã | Mức | Quy tắc | Cách kiểm |
|---|---|---|---|
| T1 | blocker | Trang trả HTTP 200. Không có `<meta name="robots" content="noindex">`. Không bị `robots.txt` chặn. [G] | auto, site |
| T2 | blocker | Có đúng 1 thẻ `<link rel="canonical">`. Thẻ dùng URL tuyệt đối `https://phuonglam.com/blog/<danh-mục>/<slug>/` (có `/` cuối) và trỏ về chính trang này. [G] | auto |
| T3 | major | URL bài có trong `sitemap.xml`. [G] | site |
| T4 | major | Có `<html lang="vi">`, `<meta charset="utf-8">` và `<meta name="viewport" content="width=device-width, initial-scale=1">`. [G] | auto |
| T5 | major | Nội dung chính (tiêu đề, các mục, đoạn văn) có sẵn trong HTML, không phụ thuộc JavaScript mới hiện ra. [G] | auto |
| T6 | minor | Slug viết thường, không dấu, nối bằng `-`, ngắn gọn, chứa từ khoá chính. **Không đổi slug của bài đã đăng.** Nếu slug chưa chuẩn thì chỉ ghi nhận, không sửa. [PL] | auto |

### M. Tiêu đề và mô tả

| Mã | Mức | Quy tắc | Cách kiểm |
|---|---|---|---|
| M1 | major | Có đúng 1 thẻ `<title>`, không trùng với bài khác trên site. [G] | auto, site |
| M2 | major | `<title>` dài 30–60 ký tự. Từ khoá chính nằm ở nửa đầu. Kết thúc bằng ` \| Phương Lâm`. Không viết HOA toàn bộ. Không lặp từ khoá. [PL] | auto |
| M3 | major | Có `<meta name="description">` dài 120–155 ký tự, là câu hoàn chỉnh (**không kết thúc bằng "…"**), chứa từ khoá chính, mô tả đúng nội dung bài, không trùng bài khác. [G] gợi ý, ngưỡng là [PL] | auto, site |
| M4 | major | Có đúng 1 thẻ `<h1>`, nói cùng chủ đề với `<title>`, không kèm tên thương hiệu. Nội dung có thể khác `<title>` cho tự nhiên hơn. [G] | auto |
| M5 | minor | Có đủ các thẻ `og:title`, `og:description`, `og:image` (URL tuyệt đối), `og:url` (= canonical) và `og:type` (= `article`). `og:title` và `og:description` khớp `<title>` và mô tả. [PL] | auto |

### C. Nội dung

| Mã | Mức | Quy tắc | Cách kiểm |
|---|---|---|---|
| C1 | major | Tiêu đề mục đúng thứ bậc: các mục lớn dùng `<h2>`, mục con dùng `<h3>` nằm dưới `<h2>`. Không nhảy cấp, không có heading rỗng. Có ít nhất 3 thẻ `<h2>` nội dung. [G] | auto |
| C2 | major | 100 chữ đầu trả lời thẳng câu hỏi chính mà người đọc tìm, và có từ khoá chính. [G] (nội dung hữu ích) | judge |
| C3 | minor | Phần nội dung chính có ít nhất 800 chữ. Google không quy định số chữ tối thiểu. Đây là quy ước để bài đủ sâu. [PL] | auto |
| C4 | blocker | Không có khẳng định sức khoẻ, y tế không kiểm chứng được. Ví dụ: "chữa", "diệt virus", "an toàn tuyệt đối", "an toàn cho trẻ sơ sinh". Nội dung tâm linh, phong thuỷ phải ghi rõ "theo quan niệm dân gian". [G] (YMYL, độ tin cậy) | judge |
| C5 | major | Bài không tự mâu thuẫn. Ví dụ: đoạn trên nói "an toàn cho trẻ nhỏ", đoạn dưới lại dặn "không xông khi có trẻ sơ sinh". [G] | judge |
| C6 | major | Bài về lửa, khói, nến, xông phải có mục lưu ý an toàn: thông gió, không để lửa không người trông, tránh xa trẻ em và vật dễ cháy. [PL] | judge |
| C7 | major | Không sót rác của bản nháp: comment `<!-- PROMPT ẢNH ... -->`, `TODO`, `lorem`, ký hiệu markdown (`**`, `##`), chữ giữ chỗ `[...]`. [PL] | auto |
| C8 | minor | Ngày đăng hiện rõ cho người đọc và khớp `datePublished`. Có tên tác giả hoặc tên shop. [G] | auto |
| C9 | minor | Mỗi đoạn tối đa khoảng 4 câu. Các bước làm trình bày bằng danh sách `<ol>`/`<ul>`. [PL] | auto |
| C10 | major | Không chép nguyên đoạn từ bài khác trên site. Nội dung không mỏng, không viết ra chỉ để chứa từ khoá. [G] | site, judge |

### L. Liên kết

| Mã | Mức | Quy tắc | Cách kiểm |
|---|---|---|---|
| L1 | blocker | Mọi link nội bộ trả HTTP 200. Không trỏ tới sản phẩm đã ẩn hoặc trang `noindex`. [G] | site |
| L2 | major | Trong thân bài, trước khung "Bài viết liên quan", có ít nhất 3 link nội bộ theo ngữ cảnh. Trong đó có ít nhất 1 link tới sản phẩm hoặc danh mục, và 1 link tới bài viết khác. [PL] | auto |
| L3 | major | Có khung "Bài viết liên quan" với ít nhất 3 bài **cùng chủ đề**. [PL] | auto |
| L4 | major | Có ít nhất 2 trang khác trong site (bài viết, sản phẩm, danh mục) link tới bài này. [PL] | site |
| L5 | minor | Chữ gắn link mô tả đúng trang đích, không dùng "tại đây" hay "xem ngay". Một cụm chữ link không lặp quá 2 lần trong bài. [G] | auto |
| L6 | minor | Link nội bộ dùng dạng `https://phuonglam.com/...` hoặc `/...`, có `/` cuối, không có `index.html` và không có `?utm=`. [PL] | auto |

### I. Hình ảnh

| Mã | Mức | Quy tắc | Cách kiểm |
|---|---|---|---|
| I1 | major | Có ảnh đại diện. Ảnh rộng ít nhất 1200 px, có trong `og:image` và `image` của JSON-LD. [G] | auto |
| I2 | major | Mọi `<img>` có `alt` mô tả đúng ảnh. Alt không rỗng, không phải tên file, không nhồi từ khoá, dài tối đa 125 ký tự. [G] | auto |
| I3 | minor | Ảnh định dạng WebP, nằm trong `/assets/blog/`, tên file không dấu và có nghĩa. Không có ảnh base64 trong HTML. [PL] | auto |
| I4 | minor | Ảnh đầu tiên không dùng `loading="lazy"`. Các ảnh phía dưới dùng `loading="lazy"`. Ảnh có `width`/`height` hoặc khung tỉ lệ để trang không bị nhảy. [G] (Core Web Vitals) | auto |

### S. Dữ liệu có cấu trúc (JSON-LD)

| Mã | Mức | Quy tắc | Cách kiểm |
|---|---|---|---|
| S1 | major | Có `BlogPosting` (hoặc `Article`) là JSON hợp lệ, đủ các trường: `headline` (khớp H1), `description`, `image` (URL tuyệt đối), `datePublished` và `dateModified` (ISO 8601 có múi giờ, ví dụ `2026-11-09T10:00:00+07:00`), `author` (có `name`), `publisher` (có `name` và `logo`), `mainEntityOfPage` (= canonical). [G] | auto |
| S2 | minor | Có `BreadcrumbList` khớp breadcrumb hiển thị: Trang chủ › Hướng Dẫn › tên bài. [G] | auto |
| S3 | minor | Nếu có `FAQPage`, mỗi câu hỏi và câu trả lời phải xuất hiện y nguyên trên trang. Từ 2023, Google chỉ hiện kết quả FAQ cho một số trang chính phủ và y tế, nên không trông vào kết quả FAQ. [G] | auto |

### P. Trải nghiệm trên điện thoại

| Mã | Mức | Quy tắc | Cách kiểm |
|---|---|---|---|
| P1 | major | Ở khổ 375 px, trang không bị cuộn ngang. Chữ thân bài cỡ 15 px trở lên. Nút và link đủ lớn để bấm. [G] | judge (cần trình duyệt) |
| P2 | major | Không có popup che nội dung ngay khi mở bài trên điện thoại. [G] | judge (cần trình duyệt) |

### R. Đồng bộ trong repo (riêng Phương Lâm)

| Mã | Mức | Quy tắc | Cách kiểm |
|---|---|---|---|
| R1 | major | Bài có mục trong `BLOG_POSTS` (`assets/js/site-data.js`) với cùng `url`. Trong đó `title` = `<title>`, `excerpt` = meta description, `image`/`coverImage` = ảnh đại diện. | site |
| R2 | major | Bài có trong trang `/blog/`. | site |
| R3 | major | Nếu bài đang có bản cập nhật hẹn giờ trong `scheduled-posts/<danh-mục>/<slug>/`, bản đó cũng phải được sửa giống hệt. `article.json` có `meta.title` và `meta.description` khớp, để lúc tự đăng không ghi đè bản đã sửa. | site |

---

## 2. Prompt cho AI kiểm tra bài

Tool của bạn gửi prompt này cho AI, kèm các dữ liệu sau:

- `{{URL}}`: link bài.
- `{{HTML}}`: toàn bộ HTML của bài.
- `{{SITE_DATA}}`: danh sách mọi bài trên site gồm `url`, `title`, `description`; danh sách URL trong `sitemap.xml`; số trang link tới bài này; kết quả mã HTTP của các link nội bộ. Phần này **không bắt buộc**. Thiếu thì AI ghi các quy tắc cần dữ liệu đó là `unverified`.

```text
Bạn là người kiểm tra SEO cho bài blog của phuonglam.com (tiếng Việt).

Nhiệm vụ: đối chiếu bài dưới đây với BỘ QUY TẮC (dán nguyên phần "1. Bộ quy tắc" của docs/SEO-BLOG-CHECKLIST.md) và trả về DUY NHẤT một khối JSON theo đúng mẫu ở cuối. Không viết gì ngoài JSON.

Cách làm:
- Kiểm từng mã quy tắc, theo đúng thứ tự trong bộ quy tắc.
- Chỉ báo lỗi khi có bằng chứng trong HTML hoặc trong SITE_DATA. Trích đúng đoạn tìm thấy vào "found" (tối đa 200 ký tự).
- Quy tắc cần dữ liệu không có (ví dụ L1, L4, R1, P1, P2 khi thiếu SITE_DATA hoặc trình duyệt): ghi vào "unverified", không đoán.
- Đếm ký tự theo ký tự Unicode (chữ có dấu tính là 1 ký tự), không theo byte.
- Với quy tắc "judge" (C2, C4, C5, C6, C10): chỉ báo lỗi khi chỉ ra được câu cụ thể. Trích câu đó vào "found".
- "fix" là gợi ý sửa cụ thể, viết bằng tiếng Việt. Với M2, M3, M4 thì đưa luôn câu đề xuất mới đã đúng giới hạn ký tự. Không bịa thông tin sản phẩm, không thêm khẳng định sức khoẻ.
- "pass" = true khi và chỉ khi không có lỗi nào mức "blocker" hoặc "major".

URL: {{URL}}
SITE_DATA: {{SITE_DATA}}
HTML:
{{HTML}}

Mẫu JSON trả về:
{
  "url": "https://phuonglam.com/blog/<danh-mục>/<slug>/",
  "pass": false,
  "counts": { "blocker": 0, "major": 0, "minor": 0 },
  "issues": [
    {
      "rule": "M3",
      "severity": "major",
      "element": "meta[name=description]",
      "found": "Bồ kết xông nhà giúp ... đúng cách, an toàn…",
      "expected": "120–155 ký tự, câu hoàn chỉnh, không kết thúc bằng \"…\"",
      "fix": "Đổi thành: \"Bồ kết xông nhà dùng thế nào cho đúng? ...\" (142 ký tự)"
    }
  ],
  "unverified": ["L4", "P1"]
}
```

Nếu kiểm nhiều bài một lượt, tool gộp kết quả thành một mảng JSON `[ {...}, {...} ]`. Chỉ giữ những bài có `"pass": false` để đưa sang bước sửa.

---

## 3. Prompt cho Claude Code sửa lỗi

Mở Claude Code ở thư mục repo `website phuonglam`, dán prompt dưới đây. Thay `{{REPORT_JSON}}` bằng mảng kết quả của các bài **không đạt**.

```text
Sửa các lỗi SEO của bài blog theo báo cáo dưới đây. Bộ quy tắc nằm ở docs/SEO-BLOG-CHECKLIST.md.

Trước khi sửa:
1. Đọc AGENTS.md và CONTEXT.md, làm theo các quy tắc trong đó.
2. Chạy `git fetch origin` và `git status`. Nếu máy đang chậm hơn GitHub thì cập nhật trước. Không ghi đè thay đổi chưa commit của người khác.
3. Với mỗi lỗi trong báo cáo, mở file và kiểm tra lỗi còn đúng không (báo cáo có thể cũ hoặc sai). Lỗi không còn thì đánh dấu "bỏ qua" kèm lý do.

Vị trí file:
- Bài đang chạy: blog/<danh-mục>/<slug>/index.html
- Bản cập nhật hẹn giờ (nếu có): scheduled-posts/<danh-mục>/<slug>/index.html và article.json trong cùng thư mục
- Danh sách bài: BLOG_POSTS trong assets/js/site-data.js
- Trang /blog/, trang sản phẩm, trang danh mục và sitemap được sinh lại bằng: node tools/build_static_site.js

Quy tắc khi sửa:
- KHÔNG đổi URL, slug, đường dẫn canonical hay ngày đăng (datePublished) của bài đã đăng.
- Khi đổi tiêu đề, sửa đồng bộ: <title>, og:title, twitter:title (nếu có), BLOG_POSTS.title. Khi đổi H1: sửa <h1>, breadcrumb hiển thị, JSON-LD headline, tên cuối của BreadcrumbList.
- Khi đổi mô tả, sửa đồng bộ: meta description, og:description, twitter:description (nếu có), JSON-LD description, BLOG_POSTS.excerpt.
- Nếu bài có bản trong scheduled-posts/, sửa giống hệt ở bản đó và cập nhật article.json (title, meta.title, meta.description).
- Link nội bộ chỉ trỏ tới trang có thật trong repo (san-pham/<slug>/, danh-muc/<id>/, blog/<danh-mục>/<slug>/). Không trỏ tới sản phẩm hidden. Không link tới bài còn trong scheduled-posts.
- Không bịa thông số, giá hay công dụng. Không thêm khẳng định sức khoẻ, y tế. Nội dung tâm linh, phong thuỷ ghi rõ "theo quan niệm dân gian". Lỗi C4 hoặc C5 cần đổi ý nội dung thì đề xuất câu thay thế và HỎI tôi trước khi sửa.
- Giữ nguyên văn phong tiếng Việt và cấu trúc, CSS, script sẵn có của bài. Sửa ít nhất có thể.
- Không đụng file ngoài danh sách trên, trừ khi cần sửa lỗi gốc lặp lại ở nhiều bài. Trường hợp đó giải thích trước khi sửa.

Sau khi sửa:
1. Chạy `node tools/build_static_site.js`, rồi `for f in tools/*.test.js; do node --test "$f"; done`. Tất cả phải qua.
2. Kiểm tra lại các bài vừa sửa: mọi link nội bộ có file đích; title 30–60 ký tự; mô tả 120–155 ký tự; JSON-LD parse được.
3. Cập nhật CONTEXT.md (ngắn gọn), docs/CHANGELOG.md và docs/TASKS.md nếu còn việc.
4. KHÔNG commit, KHÔNG push cho tới khi tôi đồng ý. Báo lại bảng: bài | mã lỗi | đã sửa / bỏ qua / cần tôi quyết | ghi chú.

Báo cáo:
{{REPORT_JSON}}
```

---

## Ghi chú cho người vận hành

- Các quy tắc `auto` và `site` có thể kiểm bằng script cho chắc chắn và rẻ hơn AI. AI chỉ thật sự cần cho các quy tắc `judge`.
- Sau khi sửa và đăng, vào Search Console, dán link bài vào ô kiểm tra URL, bấm **Yêu cầu lập chỉ mục** cho các bài đã đổi tiêu đề hoặc nội dung.
- Đọc thứ hạng theo khung 28 ngày. Bài có dưới khoảng 50 lượt hiển thị thì "vị trí trung bình" chưa đáng tin.
