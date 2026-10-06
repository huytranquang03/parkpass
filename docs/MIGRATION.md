# M3 Ecosystem Migration

- Date: 2026-10-06
- Baseline: `ac434aa` (`milestone/pre-m3-react-only`)
- Current snapshot: `59f93ee` (`refactor/checkout-rhf-zod`)

## 1. Mục tiêu

M1 và M2 cố ý dùng React thuần để tự xử lý request state, persistence và form validation. M3 thay ba phần đó bằng thư viện chuyên trách:

| Phạm vi           | Trước M3                                           | Sau M3                 | Kết quả chính                                                                                     |
| ----------------- | -------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------- |
| Server state      | `fetch`, `useEffect`, `useFetch`                   | TanStack Query v5      | Cache theo query key, dedupe, stale time, pagination ổn định, mutation và invalidation            |
| Cart client state | `useReducer` + Context + effect ghi `localStorage` | Zustand v5 + `persist` | Không cần runtime Provider, component subscribe bằng selector, persistence đặt cạnh store         |
| Checkout form     | Controlled inputs, validate và focus thủ công      | React Hook Form + Zod  | Schema là nguồn validation duy nhất, type suy ra từ schema, lỗi client/server dùng chung form API |

Auth và Theme vẫn dùng Context vì có API nhỏ, thay đổi ít và không gặp vấn đề mà Zustand cần giải quyết. Server state không đưa vào Zustand vì cache, freshness và invalidation thuộc trách nhiệm của TanStack Query.

## 2. TanStack Query

### Before

`useFetch` tự quản lý `loading`, `success`, `error`, `responseStatus`, `AbortController` và `refetch`. Mỗi URL là một request độc lập; component phải tự phối hợp nhiều request và tự gọi lại API sau mutation.

Các trường hợp phải tự xử lý gồm:

- Hủy request cũ để tránh race condition.
- Giữ hoặc xóa dữ liệu trong lúc đổi trang.
- Không gọi trùng request cho cùng một resource.
- Đồng bộ list và detail sau khi hủy đơn.
- Retry và xử lý riêng lỗi không nên retry như `404`.
- Loading/error/reset cho reviews widget.

### After

- Query key factory nằm trong `features/*/queries.ts`.
- Attraction list key chứa toàn bộ filter; `placeholderData: keepPreviousData` giữ danh sách cũ trong lúc đổi trang.
- `staleTime` mặc định là 30 giây; parks là 5 phút; attraction detail và reviews là 1 phút.
- Attraction detail được làm ấm cache khi link nhận hover hoặc keyboard focus.
- Checkout và cancel order dùng `useMutation`.
- Cancel order cập nhật optimistic: `onMutate` hủy query đang chạy, snapshot cache và đổi status; `onError` rollback; `onSettled` invalidate list và detail.
- Reviews dùng `useSuspenseQuery`, được bọc bởi `Suspense`, `ErrorBoundary` và `QueryErrorResetBoundary`.

### Edge cases

| Trường hợp                    | Trước                                | Sau                                                                                  |
| ----------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------ |
| Đổi trang liên tục            | Component tự quản request và loading | Query key tách từng trang, request nhận `signal`, `keepPreviousData` tránh nhấp nháy |
| Mở lại dữ liệu vừa xem        | Thường fetch lại                     | Cache được dùng khi còn fresh                                                        |
| Hai consumer cần cùng dữ liệu | Có thể tạo hai request               | Query cùng key được dedupe và dùng chung cache                                       |
| Hủy order thất bại            | Chờ server rồi refetch               | UI đổi ngay; snapshot được rollback nếu mutation lỗi                                 |
| Reviews lỗi rồi Retry         | Tự giữ error và gọi `refetch`        | Error boundary reset đồng thời trạng thái lỗi của query                              |
| Detail `404`                  | Có thể retry request vô ích          | Retry function dừng ngay với `404`                                                   |

### Trade-off

- Có thêm query key, query options và quy tắc invalidation cần học.
- Cache là state dùng chung; query key thiếu filter có thể trả sai dữ liệu.
- Optimistic update nhanh hơn nhưng cần snapshot và rollback chính xác.
- Bundle lớn hơn so với `useFetch` tự viết.

## 3. Zustand

### Before

Cart dùng `cartReducer`, `CartContext` và `CartProvider`. Provider khởi tạo state từ `localStorage`, chạy effect để lưu lại và truyền chung `state`, derived totals và `dispatch` cho mọi consumer.

### After

- `cartStore.ts` chứa `items` và bốn action: `addItems`, `updateQuantity`, `removeItem`, `clearCart`.
- Middleware `persist` lưu riêng `items` dưới key `parkpass-cart`.
- `selectTotalQuantity` và `selectTotalPrice` tính derived state, không lưu dữ liệu trùng lặp.
- Component chỉ subscribe phần cần dùng, ví dụ badge đọc `selectTotalQuantity`, checkout đọc `items`, `selectTotalPrice` và `clearCart`.
- Store được test trực tiếp qua `getState`/`setState`, không cần render Provider.

### Edge cases

| Trường hợp                          | Cách xử lý sau migration                                              |
| ----------------------------------- | --------------------------------------------------------------------- |
| Thêm cùng attraction và ticket type | Merge item và giới hạn quantity tối đa 10                             |
| Quantity ngoài giới hạn             | Clamp về khoảng 1–10 khi update                                       |
| Reload trang                        | `persist` hydrate `items` từ `localStorage`                           |
| Action/function bị ghi vào storage  | `partialize` chỉ chọn `items`                                         |
| Total lệch khỏi items               | Total luôn được tính bằng selector, không có state thứ hai để đồng bộ |

Chi tiết lý do giữ Context cho Auth/Theme nằm trong [ADR-0001](./adr/0001-state-management.md).

### Trade-off

- Thêm một dependency và một cơ chế state bên cạnh Context.
- Selector tạo object/array mới không cần thiết vẫn có thể gây render lại.
- Dữ liệu persistence M1 và Zustand có shape khác nhau; production thật cần version/migration thay vì xóa storage cũ.

## 4. React Hook Form + Zod

### Before

`CheckoutPage` giữ object `values`, object `errors`, nhiều ref và một hàm submit làm đồng thời các việc:

1. Đọc controlled inputs.
2. Validate từng field bằng `if` và regex.
3. Tự xác định field lỗi đầu tiên rồi focus ref tương ứng.
4. Kiểm tra promo bất đồng bộ.
5. Map `fieldErrors` từ response `422`.
6. Quản lý trạng thái submit và tạo order.

Type và validation tồn tại riêng nên khi thêm field phải nhớ cập nhật nhiều vị trí.

### After

- `checkoutSchema.ts` chứa validation cho tên, email, số điện thoại Việt Nam, ngày tham quan, promo và điều khoản.
- `CheckoutFormValues` được suy ra bằng `z.infer<typeof checkoutSchema>`.
- `zodResolver` nối schema với React Hook Form.
- Input đăng ký qua `register`; React Hook Form giữ giá trị form thay vì component render lại vì object `values` đổi.
- `handleSubmit` chỉ gọi business flow khi client validation thành công.
- Promo vẫn là validation bất đồng bộ vì kết quả phụ thuộc server; lỗi được đưa vào form bằng `setError` và focus bằng `setFocus`.
- Lỗi `422` được map theo `CHECKOUT_FIELD_ORDER`, sau đó focus field lỗi đầu tiên.
- `isSubmitting`, `isCheckingPromo` và mutation pending cùng chặn double submit.

### Edge cases

| Trường hợp                                        | Cách xử lý                                                  |
| ------------------------------------------------- | ----------------------------------------------------------- |
| Ngày như `2026-02-31` bị `Date` tự đổi tháng      | So sánh lại year/month/day sau khi tạo `Date`               |
| Ngày quá khứ hoặc quá 90 ngày                     | Custom refinement trong Zod                                 |
| Số điện thoại có dấu cách, chấm, ngoặc hoặc `+84` | Normalize trước khi regex kiểm tra và trước khi gửi         |
| Promo `404`                                       | `setError("promoCode")`, giữ thông báo API và focus promo   |
| Server trả nhiều field errors                     | Set toàn bộ lỗi nhưng focus field đầu theo thứ tự giao diện |
| Bấm submit liên tục                               | Button disabled khi form hoặc mutation đang submit          |

### Trade-off

- Validation đồng bộ gọn và tái sử dụng được, nhưng promo vẫn cần code async riêng.
- Developer phải hiểu cả React Hook Form, resolver và Zod error model.
- Zod và React Hook Form làm chunk checkout tăng đáng kể; route checkout đã lazy-load nên phần lớn chi phí chỉ tải khi user mở checkout.

## 5. Số dòng code

Phép đo đếm các dòng có nội dung, bỏ dòng trống và dòng comment bắt đầu bằng `//` hoặc JSX comment. Test và CSS không nằm trong phép đo. Các vùng có thể chồng lặp nên không cộng thành tổng project.

| Phạm vi đo                 | Before | After |     Thay đổi | Ghi chú                                                                                      |
| -------------------------- | -----: | ----: | -----------: | -------------------------------------------------------------------------------------------- |
| Shared server-data layer   |     50 |   255 |         +205 | Before chỉ có `useFetch`; after gồm QueryClient, API modules và query options cho ba feature |
| Cart state core            |    120 |    91 | -29 (-24.2%) | Before gồm reducer, context và provider; after là Zustand store                              |
| Checkout form + validation |    351 |   330 |  -21 (-6.0%) | After gồm active code trong page và schema                                                   |

TanStack Query không làm tổng data-layer ngắn hơn vì M3 bổ sung API modules, query key factories, cache policy và optimistic update mà `useFetch` chưa có. Mục tiêu ở đây là giảm số edge case tự quản trong component, không phải chỉ giảm LOC.

Theo yêu cầu học tập hiện tại, code M1 cũ và các đoạn comment vẫn được giữ để đối chiếu. Vì vậy file checkout sau migration có 616 dòng vật lý (`CheckoutPage.tsx` + schema), nhưng các dòng comment cũ không được tính là implementation đang chạy trong bảng trên.

## 6. Bundle size

Đo bằng Node 24, Vite 8.3.0 và `VITE_ENABLE_MOCKS=true`. Baseline được build từ commit `ac434aa`; after từ `59f93ee`. Bảng JavaScript ứng dụng không cộng chunk MSW vì chunk đó giống nhau ở hai bản (`430.93 kB`, gzip `161.54 kB`).

| Chỉ số                   | Before M3 |  After M3 |          Chênh lệch |
| ------------------------ | --------: | --------: | ------------------: |
| Tổng app JS              | 356.19 kB | 509.04 kB | +152.85 kB (+42.9%) |
| Tổng app JS gzip         | 113.59 kB | 160.73 kB |  +47.14 kB (+41.5%) |
| Entry JS                 | 342.96 kB | 379.24 kB |           +36.28 kB |
| Entry JS gzip            | 108.14 kB | 119.12 kB |           +10.98 kB |
| Checkout lazy chunk      |   6.70 kB | 118.98 kB |          +112.28 kB |
| Checkout lazy chunk gzip |   2.57 kB |  36.93 kB |           +34.36 kB |
| CSS                      |   7.51 kB |   7.51 kB |           Không đổi |

Kết luận: M3 đổi bundle size lấy cache/mutation lifecycle, selector/persistence và schema/form management. Tác động lớn nhất nằm ở checkout chunk do React Hook Form, resolver và Zod. Lazy route giữ phần này khỏi entry path, nhưng nếu bundle budget trở thành yêu cầu production thì cần đánh giá schema library nhỏ hơn, manual validation hoặc cấu hình chunking sau khi đo trải nghiệm thật.

## 7. Verification

Tại snapshot hiện tại:

```text
pnpm test -- --run  -> 23 files, 212 tests passed
pnpm lint           -> passed
pnpm typecheck      -> passed
pnpm build          -> passed
```

Test mới của checkout bao phủ schema, focus field lỗi đầu tiên, promo không hợp lệ, order thành công, clear cart và mapping lỗi server `422`.

## 8. Trạng thái M3

- [x] TanStack Query thay runtime usage của `useFetch`.
- [x] Query keys, stale time, pagination placeholder và prefetch detail.
- [x] Mutation checkout và optimistic cancel order.
- [x] Reviews dùng Suspense + ErrorBoundary + QueryErrorResetBoundary.
- [x] Cart runtime chuyển sang Zustand + persist + selectors.
- [x] Checkout chuyển sang React Hook Form + Zod.
- [x] ADR cho state management, styling và data fetching.
- [x] Đo LOC và bundle before/after.
- [ ] Xóa dead code cuối cùng.

Mục cuối được chủ động hoãn: code cũ và comment đang được giữ để người học đối chiếu. Chúng không tham gia runtime. Trước release cuối nên chuyển ví dụ cần giữ vào `docs/patterns/` rồi mới xóa dead code, nếu phạm vi bài cho phép.
