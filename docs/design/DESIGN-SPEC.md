# ParkPass: Design Spec (mid-fidelity)

> Đi kèm `ASSIGNMENT.md`. Commit file này vào repo tại `docs/design/DESIGN-SPEC.md`, cùng thư mục với ảnh export từ design canvas.
> Mid-fidelity có chủ đích: spec khóa **token, spacing, state và hành vi**, nhưng **không** khóa từng pixel. Em tự quyết định cách chia component.

---

## 0. Em "cắt" design thế nào (đọc trước khi code)

Đây không phải Figma nên không có Dev Mode để click vào từng layer đo đạc. Quy trình thay thế:

| Bước | Việc làm                                                                                                                          | Nguồn                           |
| :--: | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
|  1   | Nhìn tổng thể: có bao nhiêu màn, màn nào dùng lại component nào                                                                   | Ảnh export trong `docs/design/` |
|  2   | Copy **tokens** ở mục 2 vào `src/styles/tokens.css` và Tailwind theme. Từ đây trở đi **không hard-code màu, spacing, radius** nữa | Mục 2 (file này)                |
|  3   | Lập **component inventory**: liệt kê component cần dựng, cái nào vào `components/ui`, cái nào thuộc feature                       | Mục 4 + ảnh                     |
|  4   | Dựng component theo **anatomy + bảng state** ở mục 4, mỗi component đủ mọi state trước khi ráp vào màn                            | Mục 4                           |
|  5   | Ráp màn theo layout ở mục 5, lấy số đo từ **artboard redline** (đã chú thích sẵn spacing)                                         | Mục 5 + ảnh redline             |
|  6   | Tự check bằng UI review checklist ở mục 9 trước khi mở PR                                                                         | Mục 9                           |

> Con số trong file này là **chuẩn**, ảnh chỉ để tham khảo bố cục. Chỗ nào ảnh và spec lệch nhau thì spec thắng, và em ping anh để anh sửa design.

---

## 1. Nguyên tắc thiết kế

- **Content first:** ảnh và tên attraction là thứ user nhìn đầu tiên, mọi thứ khác lùi về sau.
- **Mọi trạng thái đều là thiết kế:** loading, empty, error, disabled không phải "làm sau", chúng nằm trong spec.
- **Một accent duy nhất:** màu brand chỉ dùng cho hành động chính và trạng thái active. Lạm dụng màu là lỗi UI review.
- **Accessible by default:** focus ring luôn nhìn thấy, contrast đạt chuẩn, vùng chạm tối thiểu 44px.
- **Mobile 360px là first-class:** không có "bản mobile làm sau".

---

## 2. Design tokens

### 2.1 Bảng màu (đã kiểm tra contrast theo WCAG 2.1 AA)

**Light mode**

| Token                  | Hex       | Dùng cho                           | Contrast                      |
| ---------------------- | --------- | ---------------------------------- | ----------------------------- |
| `--color-bg`           | `#FFFFFF` | Nền trang                          |                               |
| `--color-surface`      | `#F8FAFC` | Nền card, panel                    |                               |
| `--color-surface-2`    | `#F1F5F9` | Nền hover, skeleton base           |                               |
| `--color-border`       | `#E2E8F0` | Viền trang trí (card, divider)     |                               |
| `--color-border-input` | `#64748B` | Viền input, checkbox, select       | 4.76 trên nền trắng (cần ≥ 3) |
| `--color-text`         | `#0F172A` | Text chính                         | 17.85                         |
| `--color-text-muted`   | `#475569` | Text phụ, label                    | 7.58                          |
| `--color-text-subtle`  | `#64748B` | Placeholder, caption               | 4.76                          |
| `--color-brand`        | `#0F766E` | Nền button chính, link, tab active | 5.47 với chữ trắng            |
| `--color-brand-hover`  | `#115E59` | Hover của button chính             |                               |
| `--color-brand-soft`   | `#F0FDFA` | Nền badge, nền chip active         |                               |
| `--color-accent`       | `#F59E0B` | Sao rating, highlight khuyến mãi   | 8.31 với chữ `#0F172A`        |
| `--color-success`      | `#15803D` | Nền badge PAID, toast thành công   | 5.02 với chữ trắng            |
| `--color-danger`       | `#DC2626` | Text lỗi, nền nút hủy              | 4.83 với chữ trắng            |
| `--color-warning`      | `#B45309` | Text cảnh báo                      | 5.02                          |
| `--color-focus`        | `#0F766E` | Focus ring                         | 5.47                          |

**Dark mode** (override trong `.dark` hoặc `@media (prefers-color-scheme: dark)`)

| Token                  | Hex       | Ghi chú                                                           |
| ---------------------- | --------- | ----------------------------------------------------------------- |
| `--color-bg`           | `#020617` |                                                                   |
| `--color-surface`      | `#0F172A` |                                                                   |
| `--color-surface-2`    | `#1E293B` |                                                                   |
| `--color-border`       | `#334155` | Viền trang trí                                                    |
| `--color-border-input` | `#94A3B8` | 6.96 trên surface                                                 |
| `--color-text`         | `#F8FAFC` | 19.28 trên bg                                                     |
| `--color-text-muted`   | `#94A3B8` | 6.96                                                              |
| `--color-brand`        | `#2DD4BF` | 9.59 trên surface. **Nền brand ở dark dùng chữ `#042F2E`** (7.77) |
| `--color-accent`       | `#FBBF24` | 10.69                                                             |
| `--color-success`      | `#4ADE80` | 10.25                                                             |
| `--color-danger`       | `#F87171` | 6.45                                                              |
| `--color-focus`        | `#2DD4BF` | 9.59                                                              |

**Badge (status pill):** `PENDING` = nền `#FEF3C7` chữ `#92400E` · `PAID` = nền `#DCFCE7` chữ `#166534` · `CANCELLED` = nền `#FEE2E2` chữ `#991B1B`. Mọi cặp đều ≥ 6.3.

### 2.2 Typography

Font: `Inter`, fallback `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.

| Token       | Size / Line-height | Weight    | Dùng cho                                  |
| ----------- | ------------------ | --------- | ----------------------------------------- |
| `text-xs`   | 12 / 16            | 400 - 500 | Caption, helper text                      |
| `text-sm`   | 14 / 20            | 400 - 500 | Body phụ, label, badge                    |
| `text-base` | 16 / 24            | 400       | Body chính, input                         |
| `text-lg`   | 18 / 28            | 600       | Tên attraction trên card                  |
| `text-xl`   | 20 / 28            | 600       | Tiêu đề section                           |
| `text-2xl`  | 24 / 32            | 700       | Tiêu đề trang                             |
| `text-3xl`  | 30 / 38            | 700       | Tên attraction ở trang chi tiết (desktop) |

Quy tắc: tối đa 3 cỡ chữ trong một màn. Giá tiền luôn `font-weight: 600`, dùng `font-variant-numeric: tabular-nums`.

### 2.3 Spacing, radius, elevation, motion

| Nhóm                     | Giá trị                                                                                                                                                  |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spacing scale (4px base) | `1`=4 · `2`=8 · `3`=12 · `4`=16 · `5`=20 · `6`=24 · `8`=32 · `10`=40 · `12`=48 · `16`=64                                                                 |
| Radius                   | `sm`=6 (badge, chip) · `md`=8 (input, button) · `lg`=12 (card) · `xl`=16 (drawer, modal) · `full` (avatar, pill)                                         |
| Shadow                   | `sm` = `0 1px 2px rgb(15 23 42 / .06)` · `md` = `0 4px 12px rgb(15 23 42 / .08)` (card hover) · `lg` = `0 16px 40px rgb(15 23 42 / .16)` (drawer, modal) |
| Z-index                  | dropdown 10 · sticky header 20 · overlay 40 · drawer 50 · modal 60 · toast 70                                                                            |
| Motion                   | fast 150ms · base 200ms · slow 300ms · easing `cubic-bezier(0.4, 0, 0.2, 1)`. Bọc mọi animation trong `@media (prefers-reduced-motion: reduce)` để tắt   |
| Breakpoints              | `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280                                                                                                              |
| Container                | max-width 1200, padding ngang 16 (mobile) / 24 (≥ md) / 32 (≥ lg)                                                                                        |

### 2.4 Copy thẳng vào code

```css
/* src/styles/tokens.css */
:root {
  --color-bg: #ffffff;
  --color-surface: #f8fafc;
  --color-surface-2: #f1f5f9;
  --color-border: #e2e8f0;
  --color-border-input: #64748b;
  --color-text: #0f172a;
  --color-text-muted: #475569;
  --color-text-subtle: #64748b;
  --color-brand: #0f766e;
  --color-brand-hover: #115e59;
  --color-brand-soft: #f0fdfa;
  --color-brand-on: #ffffff;
  --color-accent: #f59e0b;
  --color-success: #15803d;
  --color-danger: #dc2626;
  --color-warning: #b45309;
  --color-focus: #0f766e;
}

.dark {
  --color-bg: #020617;
  --color-surface: #0f172a;
  --color-surface-2: #1e293b;
  --color-border: #334155;
  --color-border-input: #94a3b8;
  --color-text: #f8fafc;
  --color-text-muted: #94a3b8;
  --color-text-subtle: #94a3b8;
  --color-brand: #2dd4bf;
  --color-brand-hover: #5eead4;
  --color-brand-soft: #134e4a;
  --color-brand-on: #042f2e;
  --color-accent: #fbbf24;
  --color-success: #4ade80;
  --color-danger: #f87171;
  --color-warning: #fbbf24;
  --color-focus: #2dd4bf;
}
```

```css
/* src/styles/index.css (Tailwind v4) */
@import "tailwindcss";
@import "./tokens.css";

@theme inline {
  --color-bg: var(--color-bg);
  --color-surface: var(--color-surface);
  --color-surface-2: var(--color-surface-2);
  --color-border: var(--color-border);
  --color-border-input: var(--color-border-input);
  --color-text: var(--color-text);
  --color-text-muted: var(--color-text-muted);
  --color-brand: var(--color-brand);
  --color-brand-hover: var(--color-brand-hover);
  --color-brand-soft: var(--color-brand-soft);
  --color-brand-on: var(--color-brand-on);
  --color-accent: var(--color-accent);
  --color-success: var(--color-success);
  --color-danger: var(--color-danger);

  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  --shadow-card: 0 1px 2px rgb(15 23 42 / 0.06);
  --shadow-card-hover: 0 4px 12px rgb(15 23 42 / 0.08);
  --shadow-overlay: 0 16px 40px rgb(15 23 42 / 0.16);
}
```

> Em tự kiểm chứng cú pháp `@theme` với version Tailwind đang cài, đừng tin file này 100%. Nếu khác, sửa lại và ghi vào ADR-0002.

---

## 3. Layout chung

```text
┌─────────────────────────────────────────────────────────────┐
│ Header (sticky, h=64, shadow khi scroll)                     │
│  Logo    [ Search .............. / ]      Theme  Cart(2) User│
├─────────────────────────────────────────────────────────────┤
│  Container max-w 1200, padding 16/24/32                      │
│  ┌───────────┬───────────────────────────────────────────┐   │
│  │ Filters   │  Toolbar: "36 kết quả"      [Sort ▾]      │   │
│  │ (aside    │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │   │
│  │  256px,   │  │ Card │ │ Card │ │ Card │ │ Card │      │   │
│  │  ≥ lg)    │  └──────┘ └──────┘ └──────┘ └──────┘      │   │
│  └───────────┴───────────────────────────────────────────┘   │
│  Footer (mt 64)                                              │
└─────────────────────────────────────────────────────────────┘
```

| Breakpoint  | Grid card | Filters                            | Gap |
| ----------- | :-------: | ---------------------------------- | :-: |
| < 640       |   1 cột   | Nút "Bộ lọc" mở drawer từ dưới lên | 16  |
| 640 - 1023  |   2 cột   | Drawer                             | 16  |
| 1024 - 1279 |   3 cột   | Sidebar 256px, sticky top 80       | 24  |
| ≥ 1280      |   4 cột   | Sidebar 256px                      | 24  |

---

## 4. Component spec

Mọi component tương tác đều có chung 6 state: `default`, `hover`, `focus-visible`, `active`, `disabled`, `loading` (nếu có async). **Focus ring toàn hệ thống:** `outline: 2px solid var(--color-focus); outline-offset: 2px`. Không bao giờ `outline: none` mà không thay bằng chỉ báo khác.

### 4.1 Button (`components/ui/Button`)

| Thuộc tính | Giá trị                                                                                                                                                               |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Variants   | `primary` (nền brand, chữ `--color-brand-on`) · `secondary` (nền surface, viền border) · `ghost` (trong suốt, hover nền surface-2) · `danger` (nền danger, chữ trắng) |
| Sizes      | `sm` h=32 px 12 text-sm · `md` h=44 px 16 text-sm · `lg` h=48 px 20 text-base                                                                                         |
| Radius     | `md` (8)                                                                                                                                                              |
| Hover      | Nền đậm hơn 1 bậc, `transition: 150ms`                                                                                                                                |
| Disabled   | `opacity: .5`, `cursor: not-allowed`, không có hover                                                                                                                  |
| Loading    | Spinner 16px bên trái, **giữ nguyên label**, `aria-busy="true"`, không đổi chiều rộng nút                                                                             |
| Icon-only  | Vuông 44x44, bắt buộc có `aria-label`                                                                                                                                 |

### 4.2 Field (Input / Select / Textarea)

```text
Label (text-sm, 500, mb 6)
┌───────────────────────────────┐  h=44, radius md
│ Placeholder (text-subtle)     │  viền 1px border-input, padding ngang 12
└───────────────────────────────┘
Helper text hoặc Error (text-xs, mt 6)
```

| State                    | Thể hiện                                                                                                                            |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Focus                    | Viền `--color-brand` + focus ring                                                                                                   |
| Error                    | Viền `--color-danger`, helper text đổi thành thông báo lỗi màu danger, `aria-invalid="true"`, `aria-describedby` trỏ tới id của lỗi |
| Disabled                 | Nền surface-2, chữ subtle                                                                                                           |
| Loading (validate async) | Spinner 16px ở góc phải trong input (dùng cho ô mã khuyến mãi)                                                                      |

Label luôn là thẻ `<label>` gắn `htmlFor`, không dùng placeholder thay label.

### 4.3 AttractionCard (`features/attractions`)

```text
┌──────────────────────────────┐
│  Ảnh 16:9, radius lg phía trên│
│  ┌──────┐ badge category      │  badge nằm đè, top 12 left 12
│  └──────┘                     │
├──────────────────────────────┤  padding 16
│ Tên attraction (text-lg, 600) │  tối đa 2 dòng, ellipsis
│ Tên park (text-sm, muted)     │
│ ★ 4.8 (128)      Từ 150.000 ₫ │  sao màu accent, giá 600
└──────────────────────────────┘
```

- Toàn card là 1 link tới trang chi tiết. Nút "Thêm nhanh" (nếu có) phải `stopPropagation`.
- Hover: `shadow-card-hover`, ảnh `scale(1.02)`, 200ms.
- Focus-visible: focus ring bọc cả card.
- Ảnh có `aspect-ratio: 16/9`, `object-fit: cover`, `loading="lazy"`, `alt` = tên attraction.

### 4.4 QuantityStepper

`[ − ]  2  [ + ]` · nút 44x44, số ở giữa rộng tối thiểu 40, `text-base` 600, `tabular-nums`.
Nút `−` disabled khi giá trị = min, `+` disabled khi = max. Vùng số có `aria-live="polite"` để screen reader đọc khi đổi.

### 4.5 Badge / StatusBadge

Cao 24, padding ngang 8, radius `sm`, `text-xs` 500. Màu theo bảng ở mục 2.1. **Không dùng màu làm tín hiệu duy nhất:** luôn kèm chữ ("Chờ thanh toán", "Đã thanh toán", "Đã hủy").

### 4.6 Skeleton

Nền `--color-surface-2`, radius theo khối thật, animation shimmer 1.2s (tắt khi `prefers-reduced-motion`). Skeleton card phải **giữ đúng kích thước** card thật để không gây layout shift. Grid loading hiển thị đúng số card của breakpoint hiện tại.

### 4.7 EmptyState và ErrorState

```text
        [ Icon 48, màu text-subtle ]
   Tiêu đề (text-lg, 600, mt 16)
   Mô tả 1 - 2 dòng (text-sm, muted, mt 8, max-w 420, canh giữa)
        [ Nút hành động, mt 24 ]
```

| Loại           | Tiêu đề                         | Mô tả                                                              | Nút                   |
| -------------- | ------------------------------- | ------------------------------------------------------------------ | --------------------- |
| Empty (list)   | "Không tìm thấy attraction nào" | "Thử bỏ bớt bộ lọc hoặc đổi từ khóa tìm kiếm."                     | "Xóa bộ lọc"          |
| Empty (cart)   | "Giỏ vé đang trống"             | "Chọn một trò chơi và thêm vé để bắt đầu."                         | "Khám phá attraction" |
| Empty (orders) | "Chưa có đơn hàng nào"          | "Đơn hàng của bạn sẽ xuất hiện ở đây sau khi đặt vé."              | "Đặt vé ngay"         |
| Error          | "Không tải được dữ liệu"        | "Kết nối có vấn đề hoặc hệ thống đang bận. Thử lại giúp mình nhé." | "Thử lại"             |

### 4.8 Drawer (cart, filter trên mobile)

Rộng 400 (desktop) hoặc `100%` khi < 640, cao full, bám phải, radius `xl` ở cạnh trái, `shadow-overlay`. Overlay `rgb(15 23 42 / .5)`, fade 200ms; panel trượt 200ms.
Hành vi bắt buộc: `Esc` đóng · click overlay đóng · focus trap bên trong · trả focus về nút mở · khóa scroll `body` · `role="dialog"` + `aria-modal="true"` + `aria-labelledby`.

Cấu trúc: header (tiêu đề + nút đóng 44x44, h=64) · body scroll được · footer dính đáy (tổng tiền + nút primary full width, padding 16, viền trên).

### 4.9 Modal (confirm hủy đơn)

Rộng tối đa 440, canh giữa, radius `xl`, padding 24. Nút xếp phải: `secondary` "Quay lại" rồi `danger` "Hủy đơn". Trên mobile 2 nút full width, xếp dọc, nút chính ở dưới. Focus mặc định vào nút an toàn ("Quay lại").

### 4.10 Toast

Góc trên bên phải (desktop), trên cùng (mobile). Rộng tối đa 380, radius `lg`, `shadow-overlay`, có icon + text + nút đóng. Tự ẩn sau 4s, hover thì dừng đếm. Vùng chứa toast đặt `role="status"` `aria-live="polite"`; toast lỗi dùng `role="alert"`.

### 4.11 TicketSummaryCard (viết bằng CSS Modules)

Card tóm tắt đơn ở checkout: danh sách vé, tạm tính, giảm giá, tổng. Tổng tiền `text-xl` 700. Ở desktop dính bên phải (`position: sticky; top: 88px`), ở mobile nằm trên form. **Đây là component duy nhất dùng CSS Modules**, mục đích để so sánh với Tailwind trong ADR-0002.

---

## 5. Spec theo màn hình

### 5.1 Danh sách attraction (`/`)

- Toolbar: số kết quả bên trái (`text-sm`, muted), select sort bên phải. Chip filter đang áp dụng nằm dưới toolbar, mỗi chip có nút `×`, kèm nút "Xóa tất cả".
- Search nằm trên header, rộng tối đa 480, có icon kính lúp bên trái và gợi ý phím tắt `/` bên phải (ẩn khi < 768).
- Pagination ở giữa, cách grid 32.

| Trạng thái             | Hiển thị                                                                        |
| ---------------------- | ------------------------------------------------------------------------------- |
| Loading lần đầu        | 8 skeleton card đúng layout grid                                                |
| Loading khi đổi filter | Giữ kết quả cũ, giảm `opacity` còn .6 và khóa tương tác, không nhảy về skeleton |
| Empty                  | EmptyState (mục 4.7)                                                            |
| Error                  | ErrorState, giữ nguyên filter bar để user sửa điều kiện                         |

### 5.2 Chi tiết attraction (`/attractions/:id`)

Desktop 2 cột: trái là gallery (ảnh lớn 16:9 + 4 thumbnail 72x72) và mô tả, phải là booking box dính (`sticky top: 88`) rộng 380 gồm giá theo loại vé, `QuantityStepper` từng loại, tổng tạm tính, nút "Thêm vào giỏ" full width.
Mobile 1 cột: gallery → tên → mô tả → chọn vé; booking box biến thành **bottom bar cố định** (tổng tiền bên trái, nút primary bên phải, `padding-bottom: env(safe-area-inset-bottom)`).
Widget reviews nằm cuối trang, có boundary riêng: lỗi widget chỉ thay phần widget bằng ErrorState nhỏ, phần trên vẫn hiển thị bình thường.

### 5.3 Checkout (`/checkout`)

Desktop 2 cột: form 2/3, `TicketSummaryCard` 1/3. Form chia 2 nhóm có tiêu đề: "Thông tin người đặt" và "Thông tin chuyến đi". Các field xếp dọc, cách nhau 20, nhóm cách nhau 32.
Nút submit full width ở cuối form (mobile) hoặc trong summary card (desktop). Khi submit lỗi: hiện alert tóm tắt ở đầu form (`role="alert"`, liệt kê các field lỗi, click vào được để nhảy tới field) và focus vào field lỗi đầu tiên.

### 5.4 Lịch sử đơn (`/orders`, `/orders/:id`)

Danh sách dạng row: mã đơn + ngày bên trái, `StatusBadge` + tổng tiền bên phải, chevron. Mobile chuyển thành card xếp dọc.
Trang chi tiết: header (mã đơn, badge, ngày đặt), bảng item, khối tổng tiền, nút "Hủy đơn" `danger secondary` chỉ hiện khi `PENDING`.
Optimistic: ngay khi bấm hủy, badge đổi sang "Đã hủy" và mờ 60% cho tới khi server trả về. Lỗi thì rollback kèm toast đỏ.

### 5.5 Login (`/login`)

Card giữa màn, rộng tối đa 400, padding 32, `shadow-card`. Tiêu đề, 2 field, nút primary full width, dòng gợi ý tài khoản test (`text-xs`, muted). Lỗi 401 hiện alert phía trên form, không xóa nội dung đã nhập.

---

## 6. Microcopy tiếng Việt

| Ngữ cảnh            | Nội dung                                                                     |
| ------------------- | ---------------------------------------------------------------------------- |
| Giá                 | `150.000 ₫` (dùng `Intl.NumberFormat('vi-VN')`), giá "từ" ghi `Từ 150.000 ₫` |
| Ngày                | `dd/MM/yyyy`, ngày tham quan hiển thị kèm thứ: `Thứ Bảy, 26/09/2026`         |
| Email lỗi           | "Email chưa đúng định dạng"                                                  |
| Điện thoại lỗi      | "Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0"                           |
| Ngày quá khứ        | "Ngày tham quan phải từ hôm nay trở đi"                                      |
| Promo sai           | "Mã khuyến mãi không tồn tại hoặc đã hết hạn"                                |
| Thêm giỏ thành công | "Đã thêm 2 vé vào giỏ"                                                       |
| Đặt vé thành công   | "Đặt vé thành công. Mã đơn: PP-000123"                                       |
| Hủy đơn thất bại    | "Không hủy được đơn, vui lòng thử lại"                                       |

Giọng văn: xưng hô trung tính, không dùng "bạn ơi", không dùng emoji trong UI.

---

## 7. Responsive và trạng thái đặc biệt

- Text dài: tên attraction tối đa 2 dòng rồi `ellipsis`, không cắt giữa từ.
- Số lượng lớn: badge cart hiển thị `9+` khi vượt 9.
- Ảnh lỗi: hiện khối surface-2 kèm icon, không để icon ảnh vỡ mặc định của browser.
- Offline hoặc API chết: banner phía trên header "Đang mất kết nối tới máy chủ" (dùng khi bật chaos mode).
- Zoom 200%: layout không vỡ, không có scroll ngang.

---

## 8. Nghi thức bàn giao design (bắt buộc trước khi code UI)

1. Em đọc hết file này và ảnh export.
2. Em viết **danh sách câu hỏi** vào `docs/design/QUESTIONS.md` rồi gửi anh (design nào cũng thiếu thông tin, tìm ra chỗ thiếu là một phần của nghề).
3. Anh trả lời trong buổi 15 phút, câu trả lời được ghi ngược lại vào file này.
4. Chốt xong mới bắt đầu dựng component.

Vài câu hỏi anh **kỳ vọng** em tự phát hiện: tên attraction dài 80 ký tự thì card trông thế nào? · Có 5 loại vé thay vì 3 thì booking box ra sao? · Rating chưa có review thì hiển thị gì? · Bấm "Thêm vào giỏ" 2 lần liên tiếp thì toast chồng nhau kiểu gì? · Giỏ có 30 item thì drawer cuộn thế nào, footer có còn dính không?

---

## 9. UI review checklist (tự check trước khi mở PR)

- [ ] Không hard-code màu, spacing, radius: mọi giá trị lấy từ token
- [ ] Mọi màn có API đều đủ 4 trạng thái: loading, error, empty, success
- [ ] Mọi phần tử tương tác có `:focus-visible` nhìn thấy rõ
- [ ] Đi hết flow chính chỉ bằng bàn phím, thứ tự tab hợp lý, không bị bẫy focus ngoài ý muốn
- [ ] Vùng chạm ≥ 44x44 trên mobile
- [ ] Không layout shift khi ảnh hoặc dữ liệu load xong (skeleton đúng kích thước, ảnh có `aspect-ratio`)
- [ ] Màu không phải tín hiệu duy nhất (badge luôn có chữ)
- [ ] Dark mode kiểm tra đủ mọi màn, không còn chỗ chữ trắng trên nền trắng
- [ ] Kiểm tra ở 360px, 768px, 1280px và ở mức zoom 200%
- [ ] `prefers-reduced-motion` được tôn trọng
