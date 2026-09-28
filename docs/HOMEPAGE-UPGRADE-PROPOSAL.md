# Nâng cấp slogan và giao diện trang chủ

Ngày: 2026-09-28. Trạng thái: đã triển khai.

- Slogan: “Thắp chút ấm áp. Ươm hương an yên.”
- Hero dùng nền kem và điểm xanh Phương Lâm, slogan hai dòng, mô tả gọn, một ảnh lấy từ ảnh đầu tiên được chọn trong cấu hình quản trị, và hai nút đi đúng tới danh mục hoặc combo. Ảnh hero hiển thị cả trên điện thoại.
- Thứ tự trang: hero → nhóm sản phẩm → danh mục → sản phẩm nổi bật → khối combo → 3 bài hướng dẫn.
- Danh mục có ảnh, giá khởi điểm và lưới 4 cột desktop/2 cột mobile; sản phẩm nổi bật dùng 4 cột desktop/2 cột mobile.
- CTA “Khám phá sản phẩm” cuộn tới khu danh mục. Các tuyên bố chung như “100% tự nhiên”, “an toàn” và “kiểm định” được gỡ khỏi trang chủ; thay bằng các nhóm sản phẩm thực tế.
- Đồng bộ React, HTML tĩnh ban đầu, stylesheet, bundle và metadata trang chủ. Trang tĩnh giữ canonical và dữ liệu tổ chức.
- Build sinh lại trang danh mục/sản phẩm do cache version; các trang đó và sitemap không nằm trong phạm vi phát hành.
