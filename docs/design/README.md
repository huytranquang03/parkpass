# ParkPass: Design handoff (mid-fidelity)

Thư mục này là toàn bộ material để em cắt UI cho bài tập ParkPass. Đọc theo thứ tự: `README.md` (file này) → `DESIGN-SPEC.md` → `COMPOSITION.md` → `mockups/index.html` (mở bằng trình duyệt) → ảnh trong `exports/` → viết `QUESTIONS.md`.

> Quy tắc vàng: **con số trong `DESIGN-SPEC.md` là chuẩn.** Mockup HTML để đo và đối chiếu, ảnh chỉ để nhìn bố cục. Chỗ nào mockup / ảnh lệch spec thì spec thắng, và em ghi vào `QUESTIONS.md` để anh sửa design.

---

## 1. Có gì trong thư mục (3 lớp)

| Lớp         | File                                               | Dùng để làm gì                                                                                                                                                                                                                                                                                                                                                                          |
| ----------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Số chuẩn    | `DESIGN-SPEC.md`                                   | Token (màu, typography, spacing, radius, shadow), state của từng component, spec từng màn, microcopy, checklist review. Nguồn sự thật duy nhất về số đo.                                                                                                                                                                                                                                |
| Lắp ghép    | `COMPOSITION.md`                                   | Cây component của từng màn, sinh từ DOM mockup: component nào nằm trong container nào, flex hay grid, gap, width, sticky. Trả lời câu "ráp base component thành màn như thế nào".                                                                                                                                                                                                       |
| Đo được     | `mockups/*.html` (bắt đầu từ `mockups/index.html`) | Chính 16 artboard trên canvas, lưu thành HTML thuần. Mở bằng trình duyệt, F12 → Elements, click phần tử là đọc được `padding`, `gap`, `font-size`, `color`, `border-radius` ngay trong `style` inline. Mọi phần tử có nghĩa đều gắn `data-component="Tên"` (và `data-slot` cho phần con), nên cây DOM đọc như cây component. Đây là "Dev Mode" của bài này. Link giữa các màn bấm được. |
| Nhìn bố cục | `exports/*.png`                                    | 16 ảnh export @2x (1 px CSS = 2 px ảnh). Để xem tổng thể, so sánh trạng thái, dán vào PR. Không đo từ ảnh.                                                                                                                                                                                                                                                                              |
| Hỏi đáp     | `QUESTIONS.md`                                     | Template câu hỏi bàn giao (mục 8 của spec). Em điền rồi gửi anh trước khi code UI.                                                                                                                                                                                                                                                                                                      |
| Bản gốc     | Design canvas (link anh gửi riêng)                 | Zoom, click phần tử xem thuộc tính, bấm Play để đi thử luồng. Cần được share mới mở được.                                                                                                                                                                                                                                                                                               |

Cách đọc mockup cho đúng: thấy `#0F766E` thì gọi là `--color-brand`, thấy `padding: 16px` thì hiểu là `spacing-4`. Code bằng token, không copy số và hex từ mockup vào code.

---

## 2. Bản đồ ảnh → màn hình → mục spec

| Ảnh                                                 | Màn / trạng thái                                                                                                                                  | Breakpoint   | Mục spec        | Component chính                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | --------------- | -------------------------------------------------------------------------- |
| `01-attraction-list-desktop-1280.png`               | Danh sách attraction, trạng thái mặc định                                                                                                         | 1280         | 3, 5.1          | Header, Search, Sidebar filter, Toolbar + chip, AttractionCard, Pagination |
| `02-attraction-list-states-loading-empty-error.png` | 3 panel cạnh nhau: loading skeleton (8 card), empty, error (giữ filter bar)                                                                       | 1280 ×3      | 4.6, 4.7, 5.1   | Skeleton, EmptyState, ErrorState                                           |
| `03-attraction-detail-desktop-1280.png`             | Chi tiết attraction, booking box sticky, widget reviews đang lỗi                                                                                  | 1280         | 4.4, 4.7, 5.2   | Gallery, QuantityStepper, Booking box, ErrorState nhỏ                      |
| `04a-cart-drawer-3-items.png`                       | Cart drawer có 3 item, footer dính đáy                                                                                                            | 1280 overlay | 4.8             | Drawer, QuantityStepper, Button                                            |
| `04b-cart-drawer-empty.png`                         | Cart drawer giỏ trống                                                                                                                             | 1280 overlay | 4.7, 4.8        | Drawer, EmptyState                                                         |
| `05-checkout-desktop-1280.png`                      | Checkout: field email lỗi, ô mã khuyến mãi đang validate                                                                                          | 1280         | 4.2, 4.11, 5.3  | Field (error, loading), TicketSummaryCard                                  |
| `06a-orders-list-desktop-1280.png`                  | Danh sách đơn dạng row                                                                                                                            | 1280         | 4.5, 5.4        | StatusBadge, tabs                                                          |
| `06b-order-detail-cancel-modal.png`                 | Chi tiết đơn PENDING, modal xác nhận hủy đang mở, focus ở nút "Quay lại"                                                                          | 1280 modal   | 4.9, 5.4        | Modal, Button danger / danger-secondary                                    |
| `07a-login-default.png`                             | Login mặc định                                                                                                                                    | 1280         | 5.5             | Field, Button                                                              |
| `07b-login-error-401.png`                           | Login lỗi 401, giữ nội dung đã nhập                                                                                                               | 1280         | 5.5             | Alert, Field error                                                         |
| `08a-mobile-390-list.png`                           | Danh sách 1 cột, nút "Bộ lọc" mở drawer                                                                                                           | 390          | 3, 5.1          | AttractionCard (1 cột)                                                     |
| `08b-mobile-390-detail-bottom-bar.png`              | Chi tiết với bottom bar cố định                                                                                                                   | 390          | 5.2             | QuantityStepper, bottom bar                                                |
| `08c-mobile-390-checkout.png`                       | Checkout, summary nằm trên form                                                                                                                   | 390          | 5.3             | TicketSummaryCard, Field                                                   |
| `09a-dark-attraction-list.png`                      | Danh sách ở dark mode                                                                                                                             | 1280         | 2.1 (bảng dark) | Toàn bộ token `.dark`                                                      |
| `09b-dark-attraction-detail.png`                    | Chi tiết ở dark mode                                                                                                                              | 1280         | 2.1 (bảng dark) | Toàn bộ token `.dark`                                                      |
| `10-redline-components.png`                         | Redline: AttractionCard, Button (4 variant × 3 size × 5 state), Field (4 state), StatusBadge, QuantityStepper, EmptyState, kèm số đo và tên token | n/a          | 4.1 đến 4.7     | Tất cả component trong `components/ui`                                     |

Mỗi ảnh có dải nhãn phía trên ghi tên màn và breakpoint. Dải này không phải UI, đừng code nó.

---

## 3. Cách đọc redline (`10-redline-components.png`)

- **Số tròn màu hồng đậm** (①, ②, ...) đánh dấu phần tử, chú thích cùng số nằm bên cạnh. Màu hồng là màu annotation, **không phải token UI**.
- **Vạch đo** (├──┤) ghi kích thước theo px CSS. Mọi số đều nằm trên spacing scale 4 px của spec mục 2.3: nếu em đo ra 15 hay 17 thì là ảnh bị scale, hãy tin con số ghi cạnh vạch.
- Tên token ghi theo CSS variable trong spec, ví dụ `--color-brand`, `radius-md 8`, `text-sm 14/20`. Code đúng tên này, không hard-code hex.
- Button matrix: hàng = variant × size, cột = state. Mỗi ô là một state phải dựng được, kể cả `loading` (spinner trái, giữ label, không đổi width).

Vài quyết định trong design mà spec không ghi rõ, em cứ làm theo ảnh (hoặc hỏi nếu thấy chưa hợp lý):

| Chỗ                          | Trong design                                                                                | Ghi chú                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Sort                         | Radio group trong sidebar, toolbar chỉ có số kết quả + chip filter                          | Spec 5.1 ghi sort ở toolbar. Em chọn một trong hai và ghi vào QUESTIONS.md |
| Hàng rating + giá trên card  | `flex-wrap`: ở 4 cột (card 212 px) giá tự xuống dòng canh phải, ở 1 đến 3 cột nằm cùng dòng | Để tên dài và giá 7 chữ số không bị bẻ giữa chữ                            |
| Hover của nút danger         | `#B91C1C`                                                                                   | Spec chỉ ghi "đậm hơn 1 bậc"                                               |
| `--color-brand-hover` ở dark | `#5EEAD4`                                                                                   | Lấy từ `tokens.css` mục 2.4, bảng 2.1 dark không liệt kê                   |

---

## 4. Quy trình cắt (tóm tắt mục 0 của spec)

1. Nhìn tổng thể 16 ảnh, đếm xem component nào lặp lại ở nhiều màn.
2. Copy token mục 2.4 vào `src/styles/tokens.css` và Tailwind theme. Từ đây không hard-code màu, spacing, radius.
3. Lập **component inventory** (gợi ý bên dưới), chia `components/ui` và `features/*`.
4. Dựng từng component **đủ mọi state** theo bảng mục 4, số đo lấy từ redline và inspect trong `mockups/Redline.html`. Dựng xong mới ráp màn.
5. Ráp màn theo cây trong `COMPOSITION.md` (container nào, flex/grid, gap) và mục 5 của spec; khoảng cách và kích thước inspect trong `mockups/<Màn>.html`; bố cục nhìn ảnh.
6. Tự check bằng checklist mục 9 trước khi mở PR.

### Component inventory gợi ý

| Component               | Nơi đặt                           | Màn dùng                           | State bắt buộc                                                                                |
| ----------------------- | --------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------- |
| Button                  | `components/ui`                   | mọi màn                            | default, hover, focus-visible, active, disabled, loading; 4 variant × 3 size; icon-only 44×44 |
| Field (Input / Select)  | `components/ui`                   | sidebar, checkout, login           | default, focus, error, disabled, loading (spinner phải)                                       |
| QuantityStepper         | `components/ui`                   | detail, cart drawer                | min / max disabled, `aria-live`                                                               |
| StatusBadge             | `components/ui`                   | orders, order detail               | PENDING, PAID, CANCELLED                                                                      |
| Skeleton                | `components/ui`                   | list loading                       | đúng kích thước card thật                                                                     |
| EmptyState / ErrorState | `components/ui`                   | list, cart, orders, reviews widget | 4 bộ copy ở mục 4.7                                                                           |
| Drawer                  | `components/ui`                   | cart, filter mobile                | Esc, click overlay, focus trap, trả focus, khóa scroll                                        |
| Modal                   | `components/ui`                   | hủy đơn                            | focus mặc định vào nút an toàn                                                                |
| Toast                   | `components/ui`                   | thêm giỏ, hủy đơn lỗi              | tự ẩn 4 s, hover dừng đếm                                                                     |
| AttractionCard          | `features/attractions`            | list (desktop + mobile)            | default, hover, focus-visible; tên 2 dòng ellipsis                                            |
| TicketSummaryCard       | `features/checkout` (CSS Modules) | checkout desktop + mobile          | sticky desktop, nằm trên form ở mobile                                                        |
| Header / Search         | `components/layout`               | mọi màn                            | badge cart `9+`, phím tắt `/` ẩn dưới 768                                                     |

---

## 5. Luồng chính để đi thử

Trên canvas, bấm **Play** ở artboard "01 · Danh sách attraction" rồi click theo: card → chi tiết → icon giỏ → cart drawer → "Thanh toán" → checkout; avatar góc phải → đơn hàng → một đơn → modal hủy. Đây cũng là luồng em sẽ demo trong buổi review.

---

## 6. Trước khi code UI (bắt buộc, mục 8 của spec)

1. Đọc hết `DESIGN-SPEC.md` và 16 ảnh.
2. Điền `QUESTIONS.md` và gửi anh. Design nào cũng thiếu thông tin, tìm ra chỗ thiếu là một phần của nghề.
3. Chốt câu trả lời trong buổi 15 phút, ghi ngược vào `DESIGN-SPEC.md`.
4. Chốt xong mới dựng component.

Xuất lại khi design đổi: cả `exports/` (ảnh) lẫn `mockups/` (HTML) phải được xuất lại cùng lúc từ canvas để hai lớp không lệch nhau; giữ nguyên tên file để git diff đọc được.
