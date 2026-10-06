# ParkPass: Câu hỏi bàn giao design

> Em điền file này sau khi đọc `DESIGN-SPEC.md` và 16 ảnh trong `exports/`, gửi anh trước buổi chốt 15 phút. Mỗi câu hỏi ghi rõ: màn / component nào, em thấy gì trong ảnh, spec nói gì, em đề xuất gì. Câu trả lời sẽ được ghi ngược vào `DESIGN-SPEC.md`.

Người hỏi: [TÊN EM] · Ngày: [dd/MM/yyyy] · Trạng thái: Nháp / Đã chốt

---

## 1. Lệch giữa ảnh và spec

| #   | Màn / component        | Ảnh thể hiện        | Spec ghi                  | Em đề xuất | Trả lời của anh |
| --- | ---------------------- | ------------------- | ------------------------- | ---------- | --------------- |
| 1   | Danh sách: vị trí sort | Radio trong sidebar | Mục 5.1: select ở toolbar |            |                 |
| 2   |                        |                     |                           |            |                 |

## 2. Trường hợp dữ liệu đặc biệt (edge case)

| #   | Tình huống                                                    | Ảnh có minh họa chưa | Em đề xuất | Trả lời của anh |
| --- | ------------------------------------------------------------- | -------------------- | ---------- | --------------- |
| 1   | Tên attraction dài 80 ký tự trên card và trên trang chi tiết  |                      |            |                 |
| 2   | Có 5 loại vé thay vì 3 trong booking box và bottom bar mobile |                      |            |                 |
| 3   | Attraction chưa có review nào (rating hiển thị gì)            |                      |            |                 |
| 4   | Bấm "Thêm vào giỏ" 2 lần liên tiếp (toast chồng nhau?)        |                      |            |                 |
| 5   | Giỏ có 30 item: drawer cuộn thế nào, footer còn dính không    |                      |            |                 |
| 6   | Cart badge vượt 9 (`9+`)                                      |                      |            |                 |
| 7   | Ảnh attraction lỗi hoặc không có ảnh                          |                      |            |                 |
| 8   |                                                               |                      |            |                 |

## 3. Hành vi chưa rõ

| #   | Câu hỏi                                                                                                                    | Em đề xuất | Trả lời của anh |
| --- | -------------------------------------------------------------------------------------------------------------------------- | ---------- | --------------- |
| 1   | Loading khi đổi filter: giữ kết quả cũ và mờ 60% (spec 5.1), nhưng đổi trang (pagination) thì cuộn lên đầu hay giữ vị trí? |            |                 |
| 2   | Drawer filter trên mobile: nút "Áp dụng" riêng hay áp dụng ngay khi tick?                                                  |            |                 |
| 3   |                                                                                                                            |            |                 |

## 4. Token hoặc số đo còn thiếu

| #   | Chỗ cần                           | Đang dùng tạm                     | Trả lời của anh |
| --- | --------------------------------- | --------------------------------- | --------------- |
| 1   | Hover của nút danger              | `#B91C1C`                         |                 |
| 2   | `--color-brand-hover` ở dark mode | `#5EEAD4` (từ tokens.css mục 2.4) |                 |
| 3   |                                   |                                   |                 |

## 5. Accessibility và responsive

| #   | Câu hỏi                                                                                   | Em đề xuất | Trả lời của anh |
| --- | ----------------------------------------------------------------------------------------- | ---------- | --------------- |
| 1   | Thứ tự tab trong cart drawer: đóng → item → footer, hay footer trước?                     |            |                 |
| 2   | Ở 768 đến 1023: sidebar hay drawer filter (bảng mục 3 ghi drawer, ảnh chỉ có 1280 và 390) |            |                 |
| 3   |                                                                                           |            |                 |
