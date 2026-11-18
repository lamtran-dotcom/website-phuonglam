# Shopee → website: danh sách sản phẩm

Đối chiếu 2026-11-18. Shop Shopee có 65 tin đăng, gắn ID S01–S65. Sản phẩm trên web dùng id `shopee_<mã Shopee>` nên đối chiếu được chính xác.
Chủ shop gọi theo ID, ví dụ "đăng S44".

Lưu ý: bảng đầy đủ 65 tin (ID → tên → mã Shopee) chưa được lưu vào repo. Khi đăng món nào, tìm lại tin đó trên shop Shopee theo tên bên dưới, rồi bổ sung mã Shopee vào bảng này.

## Chỉ có trên Shopee — đăng lên web được (14 món)

| ID | Sản phẩm | Mã Shopee | Đã đăng web |
|---|---|---|---|
| S16 | Cây bạc hà khô xông nhà | | |
| S17 | Đèn xông tinh dầu gốm Bát Tràng | | |
| S24 | Gừng khô | | |
| S26 | Vỏ bưởi khô lát mỏng | | |
| S32 | Vỏ quế khô 200g Yên Bái | | |
| S34 | Thảo mộc xông giảm cảm kết hợp 4 loại | | |
| S39 | Lá sả khô xông nhà | | |
| S44 | Bộ xông nhà thảo mộc 10cm (mini) | | |
| S46 | Khay đốt gỗ Palo Santo bằng gốm | | |
| S47 | Đế đựng nến nhôm có tay cầm | | |
| S48 | Nến xông thảo mộc cháy 4 giờ màu vàng | | |
| S59 | Đèn xông tinh dầu gốm trắng trái tim, trụ tim | | |
| S63 | Đèn xông tinh dầu con hươu chân sắt | | |
| S65 | Cốc kê cao nến tealight | | |

## Các nhóm còn lại

- Đã có trên web (33): S01, S04–S11, S13, S15, S22, S23, S25, S27, S29–S31, S33, S35–S38, S40–S43, S51–S55, S58. (S58 nến vỏ trong suốt = "Nến tealight 8 giờ vỏ mica" trên web.)
- Tin đăng khác của món đã có trên web (14): S02, S03, S12, S14, S18–S21, S28, S45, S49, S50, S56, S57. Phần lớn là tin nến tealight theo số viên hoặc màu.
- Ngừng bán (3): S60 sáp thơm, S61 nến Thánh Giá, S64 máy xông. Nên ẩn trên Shopee.
- Hàng phụ, không đăng (1): S62 dao rọc giấy.

## Quy trình đăng một món

1. Lấy ảnh sạch từ tin Shopee (hỏi chủ shop trước khi tải ảnh).
2. Viết lại mô tả chuẩn SEO, không copy nguyên văn Shopee.
3. Hỏi giá bán trên web.
4. Cho chủ shop xem trước, rồi mới đẩy lên (admin web: lưu sản phẩm + tải ảnh; hoặc `data/products.json` như lần import `shopee_54367578815`).
5. Điền mã Shopee và đánh dấu "Đã đăng web" trong bảng trên.
