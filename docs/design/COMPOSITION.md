# ParkPass: Cây lắp ghép từng màn (composition)

> File này sinh tự động từ DOM của `mockups/*.html` (thuộc tính `data-component`, `data-slot`). Mỗi dòng là một component hoặc slot, thụt vào theo cấp lồng nhau; `×n` là số bản lặp liên tiếp; phần sau mũi tên là layout của chính container đó (flex/grid, gap, width, padding, sticky). Mở mockup tương ứng, F12, tìm `data-component="Tên"` là nhảy đúng phần tử.

Quy ước đọc: `AppHeader`, `Container`, `Grid`, `FormGroup`... là **container / layout**; `Button`, `Field`, `StatusBadge`, `QuantityStepper`, `EmptyState`, `Chip`, `Badge` là **base component** trong `components/ui`; `AttractionCard`, `BookingBox`, `TicketSummaryCard`, `CartItem`, `OrderRow`, `TicketRow` là **feature component**. Tên trong ngoặc là variant / size / state.

## 01 · Danh sách attraction · `mockups/Main.html` · 1280×960

Khung chung của mọi màn desktop: `AppHeader` (h 64, sticky, z 20) rồi `Container` (w 1200 canh giữa, padding 24 trên / 40 dưới, flex ngang gap 24). Trong container, `FilterSidebar` 256 sticky top 80 và `ResultsArea` chiếm phần còn lại (920). Grid 4 cột gap 24 cho ra card 212.

```text
├ AppHeader <header>  → flex ngang · gap 24px · height 64px · padding 0 40px
  ├ Logo <a>  → flex ngang · gap 8px
  ├ SearchBox  → flex ngang · gap 8px · max-width 480px · height 44px · padding 0 12px · flex 1
  ├ ThemeToggle <button>  → flex ngang · width 44px · height 44px
  ├ CartButton <a>  → flex ngang · width 44px · height 44px
  ├ Avatar <a>  → flex ngang · width 36px · height 36px
├ Container  → flex ngang · gap 24px · width 1200px · padding 24px 0 40px
  ├ FilterSidebar <aside>  → flex dọc · gap 24px · width 256px · sticky top 80px
    ├ Field (select)  → flex dọc
    ├ FilterGroup ×2  → flex dọc · gap 8px
  ├ ResultsArea <main>  → flex 1
    ├ Toolbar  → flex ngang · height 44px
      ├ [count]
      ├ Button (ghost, sm) <button>  → flex ngang · gap 8px · height 32px · padding 0 12px
    ├ ChipRow  → flex ngang · gap 8px · min-height 32px · mt 12px
      ├ Chip ×3  → flex ngang · gap 4px · height 32px · padding 0 4px 0 12px
    ├ Grid (4)  → grid 4 cột · gap 24px · mt 24px
      ├ AttractionCard ×8 <a>  → flex dọc
        ├ ImagePlaceholder  → flex ngang
        ├ Badge  → height 24px · padding 0 8px · absolute
        ├ [body]  → flex dọc · gap 4px · padding 16px
          ├ [name]  → height 56px
          ├ [park]
          ├ [meta]  → flex ngang wrap · gap 4px 8px · mt 8px
            ├ [rating]  → flex ngang · gap 4px
            ├ [price]
    ├ Pagination <nav>  → flex ngang · gap 8px · mt 32px
```

## 03 · Chi tiết attraction · `mockups/Detail.html` · 1280×1460

Khung chung + `Breadcrumb`. Trong container: `DetailContent` (flex 1, cột dọc) và `BookingBox` 380 sticky top 88. Gallery 796 = 1200 - 380 - 24. Widget reviews có boundary riêng, lỗi chỉ thay widget bằng `EmptyState (small)`.

```text
├ AppHeader <header>  → flex ngang · gap 24px · height 64px · padding 0 40px
  ├ Logo <a>  → flex ngang · gap 8px
  ├ SearchBox  → flex ngang · gap 8px · max-width 480px · height 44px · padding 0 12px · flex 1
  ├ ThemeToggle <button>  → flex ngang · width 44px · height 44px
  ├ CartButton <a>  → flex ngang · width 44px · height 44px
  ├ Avatar <a>  → flex ngang · width 36px · height 36px
├ Breadcrumb <nav>  → flex ngang · gap 8px · width 1200px
├ Container  → flex ngang · gap 24px · width 1200px · padding 16px 0 40px
  ├ DetailContent  → flex dọc · flex 1
    ├ Gallery  → flex dọc
      ├ ImagePlaceholder  → flex ngang
      ├ [thumbs]  → flex ngang · gap 8px · mt 12px
    ├ InfoGrid  → grid 3 cột · gap 16px · mt 24px
    ├ ReviewsWidget (error)  → mt 12px
      ├ EmptyState (small)  → flex dọc · padding 24px
        ├ Button (secondary, sm) <button>  → flex ngang · gap 8px · height 32px · padding 0 12px
  ├ BookingBox <aside>  → flex dọc · width 380px · padding 24px · sticky top 88px
    ├ TicketRow ×3  → flex ngang · gap 12px · padding 12px 0
      ├ QuantityStepper  → flex ngang · gap 8px
    ├ Button (primary, lg) <button>  → flex ngang · gap 8px · height 48px · padding 0 20px
```

## 05 · Checkout · `mockups/Checkout.html` · 1280×1000

Khung chung + tiêu đề trang. Trong container: `CheckoutForm` (flex 1, 2 `FormGroup` cách nhau 32, field trong nhóm cách 20) và `TicketSummaryCard` 392 sticky top 88.

```text
├ AppHeader <header>  → flex ngang · gap 24px · height 64px · padding 0 40px
  ├ Logo <a>  → flex ngang · gap 8px
  ├ SearchBox  → flex ngang · gap 8px · max-width 480px · height 44px · padding 0 12px · flex 1
  ├ ThemeToggle <button>  → flex ngang · width 44px · height 44px
  ├ CartButton <a>  → flex ngang · width 44px · height 44px
  ├ Avatar <a>  → flex ngang · width 36px · height 36px
├ Container  → flex ngang · gap 24px · width 1200px · padding 24px 0 40px
  ├ CheckoutForm <form>  → flex dọc · gap 32px · flex 1
    ├ FormGroup ×2 <section>  → flex dọc · gap 20px
      ├ Field (input)  → flex dọc
      ├ Field (error, input)  → flex dọc
      ├ Field (input)  → flex dọc
  ├ TicketSummaryCard <aside>  → flex dọc · width 392px · padding 24px · sticky top 88px
    ├ Button (primary, lg) <button>  → flex ngang · gap 8px · height 48px · padding 0 20px
```

## 07 · Login · `mockups/Login.html` · 1280×840

`AppHeader` rồi vùng nền surface-2 flex canh giữa, `LoginCard` 400 padding 32.

```text
├ AppHeader <header>  → flex ngang · gap 24px · height 64px · padding 0 40px
  ├ Logo <a>  → flex ngang · gap 8px
  ├ SearchBox  → flex ngang · gap 8px · max-width 480px · height 44px · padding 0 12px · flex 1
  ├ ThemeToggle <button>  → flex ngang · width 44px · height 44px
  ├ CartButton <a>  → flex ngang · width 44px · height 44px
  ├ Avatar <a>  → flex ngang · width 36px · height 36px
├ LoginCard  → flex dọc · width 400px · padding 32px
  ├ Field (input) ×2  → flex dọc
  ├ Button (primary, lg) <button>  → flex ngang · gap 8px · height 48px · padding 0 20px
```

## 07b · Login · lỗi 401 · `mockups/LoginError.html` · 1280×840

Như 07a, thêm `Alert (danger)` giữa phần mô tả và form; field email ở state error.

```text
├ AppHeader <header>  → flex ngang · gap 24px · height 64px · padding 0 40px
  ├ Logo <a>  → flex ngang · gap 8px
  ├ SearchBox  → flex ngang · gap 8px · max-width 480px · height 44px · padding 0 12px · flex 1
  ├ ThemeToggle <button>  → flex ngang · width 44px · height 44px
  ├ CartButton <a>  → flex ngang · width 44px · height 44px
  ├ Avatar <a>  → flex ngang · width 36px · height 36px
├ LoginCard  → flex dọc · width 400px · padding 32px
  ├ Alert (danger)  → flex ngang · gap 10px · padding 12px · mt 20px
  ├ Field (error, input)  → flex dọc
  ├ Field (input)  → flex dọc
  ├ Button (primary, lg) <button>  → flex ngang · gap 8px · height 48px · padding 0 20px
```

## 02 · Danh sách · loading / empty / error · `mockups/ListStates.html` · 4000×960

Cùng khung với màn 01. Loading thay `Grid` bằng 8 `SkeletonCard` cùng kích thước card thật; Empty và Error thay `Grid` bằng `EmptyState` canh giữa vùng cao 602 (đúng chiều cao 2 hàng card) và giữ nguyên `Toolbar` + `ChipRow`.

```text
├ AppHeader <header>  → flex ngang · gap 24px · height 64px · padding 0 40px
  ├ Logo <a>  → flex ngang · gap 8px
  ├ SearchBox  → flex ngang · gap 8px · max-width 480px · height 44px · padding 0 12px · flex 1
  ├ ThemeToggle <button>  → flex ngang · width 44px · height 44px
  ├ CartButton <a>  → flex ngang · width 44px · height 44px
  ├ Avatar <a>  → flex ngang · width 36px · height 36px
├ Container  → flex ngang · gap 24px · width 1200px · padding 24px 0 40px
  ├ FilterSidebar <aside>  → flex dọc · gap 24px · width 256px · sticky top 80px
    ├ Field (select)  → flex dọc
    ├ FilterGroup ×2  → flex dọc · gap 8px
  ├ ResultsArea <main>  → flex 1
    ├ Toolbar  → flex ngang · height 44px
      ├ [count]
    ├ ChipRow  → flex ngang · gap 8px · min-height 32px · mt 12px
      ├ Chip ×3  → flex ngang · gap 4px · height 32px · padding 0 4px 0 12px
    ├ Grid (4)  → grid 4 cột · gap 24px · mt 24px
      ├ SkeletonCard ×8  → flex dọc
├ AppHeader <header>  → flex ngang · gap 24px · height 64px · padding 0 40px
  ├ Logo <a>  → flex ngang · gap 8px
  ├ SearchBox  → flex ngang · gap 8px · max-width 480px · height 44px · padding 0 12px · flex 1
  ├ ThemeToggle <button>  → flex ngang · width 44px · height 44px
  ├ CartButton <a>  → flex ngang · width 44px · height 44px
  ├ Avatar <a>  → flex ngang · width 36px · height 36px
├ Container  → flex ngang · gap 24px · width 1200px · padding 24px 0 40px
  ├ FilterSidebar <aside>  → flex dọc · gap 24px · width 256px · sticky top 80px
    ├ Field (select)  → flex dọc
    ├ FilterGroup ×2  → flex dọc · gap 8px
  ├ ResultsArea <main>  → flex 1
    ├ Toolbar  → flex ngang · height 44px
      ├ [count]
      ├ Button (ghost, sm) <button>  → flex ngang · gap 8px · height 32px · padding 0 12px
    ├ ChipRow  → flex ngang · gap 8px · min-height 32px · mt 12px
      ├ Chip ×3  → flex ngang · gap 4px · height 32px · padding 0 4px 0 12px
    ├ EmptyState  → flex dọc · padding 48px 24px
      ├ Button (secondary, md) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
├ AppHeader <header>  → flex ngang · gap 24px · height 64px · padding 0 40px
  ├ Logo <a>  → flex ngang · gap 8px
  ├ SearchBox  → flex ngang · gap 8px · max-width 480px · height 44px · padding 0 12px · flex 1
  ├ ThemeToggle <button>  → flex ngang · width 44px · height 44px
  ├ CartButton <a>  → flex ngang · width 44px · height 44px
  ├ Avatar <a>  → flex ngang · width 36px · height 36px
├ Container  → flex ngang · gap 24px · width 1200px · padding 24px 0 40px
  ├ FilterSidebar <aside>  → flex dọc · gap 24px · width 256px · sticky top 80px
    ├ Field (select)  → flex dọc
    ├ FilterGroup ×2  → flex dọc · gap 8px
  ├ ResultsArea <main>  → flex 1
    ├ Toolbar  → flex ngang · height 44px
      ├ [count]
      ├ Button (ghost, sm) <button>  → flex ngang · gap 8px · height 32px · padding 0 12px
    ├ ChipRow  → flex ngang · gap 8px · min-height 32px · mt 12px
      ├ Chip ×3  → flex ngang · gap 4px · height 32px · padding 0 4px 0 12px
    ├ EmptyState  → flex dọc · padding 48px 24px
      ├ Button (primary, md) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
```

## 04 · Cart drawer · `mockups/CartDrawer.html` · 1280×960

Màn 01 nguyên vẹn bên dưới, phủ `Overlay` (z 40) và `Drawer` 400 bám phải (z 50) gồm 3 slot: header h 64, body cuộn, footer dính đáy.

```text
├ AppHeader <header>  → flex ngang · gap 24px · height 64px · padding 0 40px
  ├ Logo <a>  → flex ngang · gap 8px
  ├ SearchBox  → flex ngang · gap 8px · max-width 480px · height 44px · padding 0 12px · flex 1
  ├ ThemeToggle <button>  → flex ngang · width 44px · height 44px
  ├ CartButton <a>  → flex ngang · width 44px · height 44px
  ├ Avatar <a>  → flex ngang · width 36px · height 36px
├ Container  → flex ngang · gap 24px · width 1200px · padding 24px 0 40px
  ├ FilterSidebar <aside>  → flex dọc · gap 24px · width 256px · sticky top 80px
    ├ Field (select)  → flex dọc
    ├ FilterGroup ×2  → flex dọc · gap 8px
  ├ ResultsArea <main>  → flex 1
    ├ Toolbar  → flex ngang · height 44px
      ├ [count]
      ├ Button (ghost, sm) <button>  → flex ngang · gap 8px · height 32px · padding 0 12px
    ├ ChipRow  → flex ngang · gap 8px · min-height 32px · mt 12px
      ├ Chip ×3  → flex ngang · gap 4px · height 32px · padding 0 4px 0 12px
    ├ Grid (4)  → grid 4 cột · gap 24px · mt 24px
      ├ AttractionCard ×8 <a>  → flex dọc
        ├ ImagePlaceholder  → flex ngang
        ├ Badge  → height 24px · padding 0 8px · absolute
        ├ [body]  → flex dọc · gap 4px · padding 16px
          ├ [name]  → height 56px
          ├ [park]
          ├ [meta]  → flex ngang wrap · gap 4px 8px · mt 8px
            ├ [rating]  → flex ngang · gap 4px
            ├ [price]
    ├ Pagination <nav>  → flex ngang · gap 8px · mt 32px
├ Overlay  → absolute
├ Drawer  → flex dọc · width 400px · height 920px · absolute
  ├ [drawer-header]  → flex ngang · height 64px · padding 0 16px 0 24px
  ├ [drawer-body]  → padding 0 24px · flex 1
    ├ CartItem ×3  → flex dọc · gap 12px · padding 16px 0
      ├ QuantityStepper  → flex ngang · gap 8px
  ├ [drawer-footer]  → flex dọc · gap 12px · padding 16px 24px
    ├ Button (primary, lg) <a>  → flex ngang · gap 8px · height 48px · padding 0 20px
```

## 04b · Cart drawer · giỏ trống · `mockups/CartDrawerEmpty.html` · 1280×960

Như 04a nhưng body là `EmptyState` canh giữa và không có footer.

```text
├ AppHeader <header>  → flex ngang · gap 24px · height 64px · padding 0 40px
  ├ Logo <a>  → flex ngang · gap 8px
  ├ SearchBox  → flex ngang · gap 8px · max-width 480px · height 44px · padding 0 12px · flex 1
  ├ ThemeToggle <button>  → flex ngang · width 44px · height 44px
  ├ CartButton <a>  → flex ngang · width 44px · height 44px
  ├ Avatar <a>  → flex ngang · width 36px · height 36px
├ Container  → flex ngang · gap 24px · width 1200px · padding 24px 0 40px
  ├ FilterSidebar <aside>  → flex dọc · gap 24px · width 256px · sticky top 80px
    ├ Field (select)  → flex dọc
    ├ FilterGroup ×2  → flex dọc · gap 8px
  ├ ResultsArea <main>  → flex 1
    ├ Toolbar  → flex ngang · height 44px
      ├ [count]
      ├ Button (ghost, sm) <button>  → flex ngang · gap 8px · height 32px · padding 0 12px
    ├ ChipRow  → flex ngang · gap 8px · min-height 32px · mt 12px
      ├ Chip ×3  → flex ngang · gap 4px · height 32px · padding 0 4px 0 12px
    ├ Grid (4)  → grid 4 cột · gap 24px · mt 24px
      ├ AttractionCard ×8 <a>  → flex dọc
        ├ ImagePlaceholder  → flex ngang
        ├ Badge  → height 24px · padding 0 8px · absolute
        ├ [body]  → flex dọc · gap 4px · padding 16px
          ├ [name]  → height 56px
          ├ [park]
          ├ [meta]  → flex ngang wrap · gap 4px 8px · mt 8px
            ├ [rating]  → flex ngang · gap 4px
            ├ [price]
    ├ Pagination <nav>  → flex ngang · gap 8px · mt 32px
├ Overlay  → absolute
├ Drawer  → flex dọc · width 400px · height 920px · absolute
  ├ [drawer-header]  → flex ngang · height 64px · padding 0 16px 0 24px
  ├ EmptyState  → flex dọc · padding 48px 24px
    ├ Button (primary, md) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
```

## 06 · Danh sách đơn · `mockups/Orders.html` · 1280×920

Khung chung. Một cột: tiêu đề, `Tabs`, `OrderList` (card bo 12 chứa `OrderRow` ngăn bằng border-top).

```text
├ AppHeader <header>  → flex ngang · gap 24px · height 64px · padding 0 40px
  ├ Logo <a>  → flex ngang · gap 8px
  ├ SearchBox  → flex ngang · gap 8px · max-width 480px · height 44px · padding 0 12px · flex 1
  ├ ThemeToggle <button>  → flex ngang · width 44px · height 44px
  ├ CartButton <a>  → flex ngang · width 44px · height 44px
  ├ Avatar <a>  → flex ngang · width 36px · height 36px
├ Container  → flex ngang · gap 24px · width 1200px · padding 32px 0 40px
  ├ Tabs  → flex ngang · gap 24px · mt 16px
  ├ OrderList  → mt 24px
    ├ OrderRow ×5 <a>  → flex ngang · gap 24px · min-height 72px · padding 16px 20px
      ├ StatusBadge (PENDING)  → flex ngang · height 24px · padding 0 8px
```

## 06b · Chi tiết đơn · modal hủy · `mockups/OrderDetail.html` · 1280×920

Khung chung. Hàng tiêu đề chứa `StatusBadge` + 2 `Button` đẩy sang phải bằng spacer; bảng item; hàng dưới chia info grid 3 cột (flex 1) và khối tổng 360. `Overlay` + `Modal` 440 canh giữa tuyệt đối.

```text
├ AppHeader <header>  → flex ngang · gap 24px · height 64px · padding 0 40px
  ├ Logo <a>  → flex ngang · gap 8px
  ├ SearchBox  → flex ngang · gap 8px · max-width 480px · height 44px · padding 0 12px · flex 1
  ├ ThemeToggle <button>  → flex ngang · width 44px · height 44px
  ├ CartButton <a>  → flex ngang · width 44px · height 44px
  ├ Avatar <a>  → flex ngang · width 36px · height 36px
├ Container  → flex ngang · gap 24px · width 1200px · padding 24px 0 40px
  ├ StatusBadge (PENDING)  → flex ngang · height 24px · padding 0 8px
  ├ Button (danger-secondary, md) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
  ├ Button (primary, md) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
  ├ OrderItemsTable <table>
├ Overlay  → absolute
├ Modal  → flex dọc · width 440px · padding 24px · absolute
  ├ Button (secondary, md, focus) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
  ├ Button (danger, md) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
```

## 08a · Mobile · danh sách · `mockups/MobileList.html` · 390×884

`MobileHeader` h 56, vùng padding 16: `SearchBox` full width, hàng count + `Button secondary` "Bộ lọc", `Grid 1 cột` gap 16.

```text
├ MobileHeader <header>  → flex ngang · gap 8px · height 56px · padding 0 16px
├ Button (secondary, md) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
├ Grid (1)  → grid 1 cột · gap 16px · mt 16px
  ├ AttractionCard ×2 <a>  → flex dọc
    ├ ImagePlaceholder  → flex ngang
    ├ Badge  → height 24px · padding 0 8px · absolute
    ├ [body]  → flex dọc · gap 4px · padding 16px
      ├ [name]  → height 56px
      ├ [park]
      ├ [meta]  → flex ngang wrap · gap 4px 8px · mt 8px
        ├ [rating]  → flex ngang · gap 4px
        ├ [price]
```

## 08b · Mobile · chi tiết · `mockups/MobileDetail.html` · 390×884

`MobileHeader` (back + tiêu đề), gallery tràn lề, nội dung padding 16, `TicketRow` ×3; `BottomBar` absolute đáy (padding 12 16 28, chừa safe-area).

```text
├ MobileHeader <header>  → flex ngang · gap 8px · height 56px · padding 0 16px
├ ImagePlaceholder  → flex ngang
├ TicketRow ×3  → flex ngang · gap 12px · padding 12px 0
  ├ QuantityStepper  → flex ngang · gap 8px
├ BottomBar  → flex ngang · gap 16px · padding 12px 16px 28px · absolute
  ├ Button (primary, lg) <a>  → flex ngang · gap 8px · height 48px · padding 0 20px
```

## 08c · Mobile · checkout · `mockups/MobileCheckout.html` · 390×884

`MobileHeader`, vùng padding 16 cột dọc gap 24: `TicketSummaryCard` (width 100%, không sticky, không nút) rồi `CheckoutForm`; nút "Đặt vé" full width ở cuối form.

```text
├ MobileHeader <header>  → flex ngang · gap 8px · height 56px · padding 0 16px
├ TicketSummaryCard <aside>  → flex dọc · padding 24px
├ CheckoutForm <form>  → flex dọc · gap 32px · flex 1
  ├ FormGroup ×2 <section>  → flex dọc · gap 20px
    ├ Field (input)  → flex dọc
    ├ Field (error, input)  → flex dọc
    ├ Field (input)  → flex dọc
```

## 09a · Dark mode · danh sách · `mockups/DarkList.html` · 1280×960

Cây giống màn 01, chỉ đổi token sang bảng dark. Dùng để đối chiếu: không có component nào đổi cấu trúc khi đổi theme.

```text
├ AppHeader <header>  → flex ngang · gap 24px · height 64px · padding 0 40px
  ├ Logo <a>  → flex ngang · gap 8px
  ├ SearchBox  → flex ngang · gap 8px · max-width 480px · height 44px · padding 0 12px · flex 1
  ├ ThemeToggle <button>  → flex ngang · width 44px · height 44px
  ├ CartButton <a>  → flex ngang · width 44px · height 44px
  ├ Avatar <a>  → flex ngang · width 36px · height 36px
├ Container  → flex ngang · gap 24px · width 1200px · padding 24px 0 40px
  ├ FilterSidebar <aside>  → flex dọc · gap 24px · width 256px · sticky top 80px
    ├ Field (select)  → flex dọc
    ├ FilterGroup ×2  → flex dọc · gap 8px
  ├ ResultsArea <main>  → flex 1
    ├ Toolbar  → flex ngang · height 44px
      ├ [count]
      ├ Button (ghost, sm) <button>  → flex ngang · gap 8px · height 32px · padding 0 12px
    ├ ChipRow  → flex ngang · gap 8px · min-height 32px · mt 12px
      ├ Chip ×3  → flex ngang · gap 4px · height 32px · padding 0 4px 0 12px
    ├ Grid (4)  → grid 4 cột · gap 24px · mt 24px
      ├ AttractionCard ×8 <a>  → flex dọc
        ├ ImagePlaceholder  → flex ngang
        ├ Badge  → height 24px · padding 0 8px · absolute
        ├ [body]  → flex dọc · gap 4px · padding 16px
          ├ [name]  → height 56px
          ├ [park]
          ├ [meta]  → flex ngang wrap · gap 4px 8px · mt 8px
            ├ [rating]  → flex ngang · gap 4px
            ├ [price]
    ├ Pagination <nav>  → flex ngang · gap 8px · mt 32px
```

## 09b · Dark mode · chi tiết · `mockups/DarkDetail.html` · 1280×1460

Cây giống màn 03, token dark.

```text
├ AppHeader <header>  → flex ngang · gap 24px · height 64px · padding 0 40px
  ├ Logo <a>  → flex ngang · gap 8px
  ├ SearchBox  → flex ngang · gap 8px · max-width 480px · height 44px · padding 0 12px · flex 1
  ├ ThemeToggle <button>  → flex ngang · width 44px · height 44px
  ├ CartButton <a>  → flex ngang · width 44px · height 44px
  ├ Avatar <a>  → flex ngang · width 36px · height 36px
├ Breadcrumb <nav>  → flex ngang · gap 8px · width 1200px
├ Container  → flex ngang · gap 24px · width 1200px · padding 16px 0 40px
  ├ DetailContent  → flex dọc · flex 1
    ├ Gallery  → flex dọc
      ├ ImagePlaceholder  → flex ngang
      ├ [thumbs]  → flex ngang · gap 8px · mt 12px
    ├ InfoGrid  → grid 3 cột · gap 16px · mt 24px
    ├ ReviewsWidget (error)  → mt 12px
      ├ EmptyState (small)  → flex dọc · padding 24px
        ├ Button (secondary, sm) <button>  → flex ngang · gap 8px · height 32px · padding 0 12px
  ├ BookingBox <aside>  → flex dọc · width 380px · padding 24px · sticky top 88px
    ├ TicketRow ×3  → flex ngang · gap 12px · padding 12px 0
      ├ QuantityStepper  → flex ngang · gap 8px
    ├ Button (primary, lg) <button>  → flex ngang · gap 8px · height 48px · padding 0 20px
```

## 10 · Redline · component + số đo · `mockups/Redline.html` · 1760×2040

Không phải màn, là bảng component. Cây dưới đây liệt kê đủ variant / state đã dựng để đối chiếu với component inventory.

```text
├ AttractionCard <a>  → flex dọc
  ├ ImagePlaceholder  → flex ngang
  ├ Badge  → height 24px · padding 0 8px · absolute
  ├ [body]  → flex dọc · gap 4px · padding 16px
    ├ [name]  → height 56px
    ├ [park]
    ├ [meta]  → flex ngang wrap · gap 4px 8px · mt 8px
      ├ [rating]  → flex ngang · gap 4px
      ├ [price]
├ Field (input)  → flex dọc · width 240px
├ Field (focus, input)  → flex dọc · width 240px
├ Field (error, input)  → flex dọc · width 240px
├ Field (disabled, input)  → flex dọc · width 240px
├ Button (primary, sm) <button>  → flex ngang · gap 8px · height 32px · padding 0 12px
├ Button (primary, sm, hover) <button>  → flex ngang · gap 8px · height 32px · padding 0 12px
├ Button (primary, sm, focus) <button>  → flex ngang · gap 8px · height 32px · padding 0 12px
├ Button (primary, sm, disabled) <button>  → flex ngang · gap 8px · height 32px · padding 0 12px
├ Button (primary, sm, loading) <button>  → flex ngang · gap 8px · height 32px · padding 0 12px
├ Button (primary, md) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
├ Button (primary, md, hover) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
├ Button (primary, md, focus) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
├ Button (primary, md, disabled) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
├ Button (primary, md, loading) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
├ Button (primary, lg) <button>  → flex ngang · gap 8px · height 48px · padding 0 20px
├ Button (primary, lg, hover) <button>  → flex ngang · gap 8px · height 48px · padding 0 20px
├ Button (primary, lg, focus) <button>  → flex ngang · gap 8px · height 48px · padding 0 20px
├ Button (primary, lg, disabled) <button>  → flex ngang · gap 8px · height 48px · padding 0 20px
├ Button (primary, lg, loading) <button>  → flex ngang · gap 8px · height 48px · padding 0 20px
├ Button (secondary, sm) <button>  → flex ngang · gap 8px · height 32px · padding 0 12px
├ Button (secondary, sm, hover) <button>  → flex ngang · gap 8px · height 32px · padding 0 12px
├ Button (secondary, sm, focus) <button>  → flex ngang · gap 8px · height 32px · padding 0 12px
├ Button (secondary, sm, disabled) <button>  → flex ngang · gap 8px · height 32px · padding 0 12px
├ Button (secondary, sm, loading) <button>  → flex ngang · gap 8px · height 32px · padding 0 12px
├ Button (secondary, md) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
├ Button (secondary, md, hover) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
├ Button (secondary, md, focus) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
├ Button (secondary, md, disabled) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
├ Button (secondary, md, loading) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
├ Button (secondary, lg) <button>  → flex ngang · gap 8px · height 48px · padding 0 20px
├ Button (secondary, lg, hover) <button>  → flex ngang · gap 8px · height 48px · padding 0 20px
├ Button (secondary, lg, focus) <button>  → flex ngang · gap 8px · height 48px · padding 0 20px
├ Button (secondary, lg, disabled) <button>  → flex ngang · gap 8px · height 48px · padding 0 20px
├ Button (secondary, lg, loading) <button>  → flex ngang · gap 8px · height 48px · padding 0 20px
├ Button (ghost, sm) <button>  → flex ngang · gap 8px · height 32px · padding 0 12px
├ Button (ghost, sm, hover) <button>  → flex ngang · gap 8px · height 32px · padding 0 12px
├ Button (ghost, sm, focus) <button>  → flex ngang · gap 8px · height 32px · padding 0 12px
├ Button (ghost, sm, disabled) <button>  → flex ngang · gap 8px · height 32px · padding 0 12px
├ Button (ghost, sm, loading) <button>  → flex ngang · gap 8px · height 32px · padding 0 12px
├ Button (ghost, md) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
├ Button (ghost, md, hover) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
├ Button (ghost, md, focus) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
├ Button (ghost, md, disabled) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
├ Button (ghost, md, loading) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
├ Button (ghost, lg) <button>  → flex ngang · gap 8px · height 48px · padding 0 20px
├ Button (ghost, lg, hover) <button>  → flex ngang · gap 8px · height 48px · padding 0 20px
├ Button (ghost, lg, focus) <button>  → flex ngang · gap 8px · height 48px · padding 0 20px
├ Button (ghost, lg, disabled) <button>  → flex ngang · gap 8px · height 48px · padding 0 20px
├ Button (ghost, lg, loading) <button>  → flex ngang · gap 8px · height 48px · padding 0 20px
├ Button (danger, sm) <button>  → flex ngang · gap 8px · height 32px · padding 0 12px
├ Button (danger, sm, hover) <button>  → flex ngang · gap 8px · height 32px · padding 0 12px
├ Button (danger, sm, focus) <button>  → flex ngang · gap 8px · height 32px · padding 0 12px
├ Button (danger, sm, disabled) <button>  → flex ngang · gap 8px · height 32px · padding 0 12px
├ Button (danger, sm, loading) <button>  → flex ngang · gap 8px · height 32px · padding 0 12px
├ Button (danger, md) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
├ Button (danger, md, hover) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
├ Button (danger, md, focus) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
├ Button (danger, md, disabled) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
├ Button (danger, md, loading) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
├ Button (danger, lg) <button>  → flex ngang · gap 8px · height 48px · padding 0 20px
├ Button (danger, lg, hover) <button>  → flex ngang · gap 8px · height 48px · padding 0 20px
├ Button (danger, lg, focus) <button>  → flex ngang · gap 8px · height 48px · padding 0 20px
├ Button (danger, lg, disabled) <button>  → flex ngang · gap 8px · height 48px · padding 0 20px
├ Button (danger, lg, loading) <button>  → flex ngang · gap 8px · height 48px · padding 0 20px
├ Button (secondary, md) <button>  → flex ngang · gap 8px · width 44px · height 44px
├ Button (ghost, md) <button>  → flex ngang · gap 8px · width 44px · height 44px
├ Button (primary, md) <button>  → flex ngang · gap 8px · width 44px · height 44px
├ Button (danger, md) <button>  → flex ngang · gap 8px · width 44px · height 44px
├ StatusBadge (PENDING)  → flex ngang · height 24px · padding 0 8px
├ StatusBadge (PAID)  → flex ngang · height 24px · padding 0 8px
├ StatusBadge (CANCELLED)  → flex ngang · height 24px · padding 0 8px
├ QuantityStepper  → flex ngang · gap 8px
├ QuantityStepper  → flex ngang · gap 8px
├ EmptyState  → flex dọc · padding 48px 24px
  ├ Button (secondary, md) <button>  → flex ngang · gap 8px · height 44px · padding 0 16px
```
