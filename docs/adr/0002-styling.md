# ADR-0002: Dùng CSS Modules làm phương án styling chính

- Status: Accepted
- Date: 2026-10-06

## Context

ParkPass cần style cho page, reusable UI component, portal và các trạng thái loading/error. Dự án không có design system hoàn chỉnh; mục tiêu hiện tại là học React, giữ style dễ đọc và tránh để quyết định giao diện làm chậm các user flow.

Đề bài ban đầu đề xuất Tailwind CSS v4 và đúng một component dùng CSS Modules để so sánh. Trong quá trình thực hiện, phạm vi được điều chỉnh: các page đầu được viết bằng CSS Modules, Tailwind dự kiến chỉ cân nhắc cho một số page/component nhỏ sau đó. Tại thời điểm ADR này, codebase đang dùng CSS Modules rộng rãi và chưa cài Tailwind.

ADR cần ghi lại trạng thái thực tế thay vì mô tả Tailwind như một công nghệ đã được áp dụng. Đây là điểm khác với tech stack mặc định của assignment và cần được reviewer xác nhận nếu yêu cầu “Tailwind + đúng một CSS Module” vẫn bắt buộc.

## Options considered

| Option                                           | Pros                                                                                                | Cons                                                                                                       |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| CSS Modules                                      | CSS gần component; class được scope; dùng CSS chuẩn; không thêm runtime/dependency; dễ học và debug | Tạo nhiều file; có thể lặp token/utility; class ghép động dài hơn utility class                            |
| Tailwind CSS v4                                  | Viết UI nhanh; token/utility thống nhất; production loại utility không dùng; ít phải đặt tên class  | Markup nhiều class; cần học convention; thêm build setup; migrate UI hiện tại tốn thời gian                |
| CSS-in-JS runtime như styled-components/Emotion  | Style theo props và colocate mạnh; theme API tốt                                                    | Runtime cost; thêm dependency; SSR/RSC cần cấu hình và serialization; abstraction cao hơn nhu cầu hiện tại |
| Component library như Material UI/Chakra/Mantine | Có sẵn component, theme và accessibility baseline; phát triển nhanh                                 | Bundle và abstraction lớn; khó giữ UI riêng; bài tập ít cơ hội tự xây component/semantic HTML              |
| Global CSS thuần                                 | Đơn giản, không cần tooling                                                                         | Dễ xung đột selector; khó biết component sở hữu rule nào khi project lớn                                   |

## Decision

1. Dùng **CSS Modules** làm phương án styling chính trong phiên bản hiện tại.
2. Dùng `src/index.css` cho reset nhỏ, CSS custom properties và style nền áp dụng toàn app.
3. Style thuộc component/page nằm cạnh component với tên `*.module.css`.
4. Không cài Tailwind hoặc CSS-in-JS chỉ để đạt sự đồng nhất hình thức khi UI hiện tại đã hoạt động.
5. Nếu reviewer vẫn yêu cầu Tailwind, thực hiện migration riêng sau khi chốt phạm vi; không trộn migration styling với M3 state/data/form refactor.

Ví dụ ownership hiện tại:

- `AttractionListPage.module.css` quản lý layout/filter/list của attraction list.
- `Modal.module.css` và `Drawer.module.css` quản lý portal UI.
- `TicketSummaryCard.module.css` chứng minh một summary component có style được scope cục bộ.
- Các component UI như Button, Card, Badge và QuantityStepper có module riêng.

## Consequences

### Lợi ích

- Không có class collision giữa page/component.
- Developer mới có thể đọc JSX và mở đúng file CSS tương ứng.
- Không thêm JavaScript runtime cho styling.
- Code splitting của Vite vẫn tách CSS của các lazy page checkout/order.
- Có thể dùng toàn bộ khả năng CSS chuẩn mà không học DSL mới cùng lúc với React ecosystem.

### Đánh đổi và rủi ro

- Quyết định hiện tại không đáp ứng nguyên văn yêu cầu “Tailwind CSS v4 + đúng một CSS Modules component”. Cần ghi rõ trong PR và xin reviewer xác nhận.
- Nhiều module có thể lặp spacing, color và breakpoint nếu không đưa token chung vào custom properties.
- Không có utility convention nên tốc độ dựng nhiều màn hình tương tự có thể chậm hơn Tailwind.
- CSS Modules chỉ scope tên class; nó không tự cung cấp design system, accessibility hay responsive design.

### Khi nào xem lại quyết định

Xem lại ADR nếu:

- Mentor xác nhận Tailwind là acceptance criterion bắt buộc.
- Số page tăng và CSS lặp lại đáng kể.
- Team có design tokens/component library chính thức.
- Project chuyển sang SSR/RSC và cân nhắc một styling solution khác; khi đó phải đánh giá server compatibility và runtime cost.
