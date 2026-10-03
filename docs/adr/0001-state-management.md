# ADR-0001: Dùng Zustand cho Cart, giữ Context cho Auth và Theme

- Status: Accepted
- Date: 2026-10-03

## Context

ParkPass có ba nhóm client state được dùng ở nhiều component:

- **Cart:** danh sách vé, cập nhật số lượng, xóa vé, xóa toàn bộ giỏ hàng và lưu dữ liệu qua `localStorage`.
- **Auth:** token, thông tin user, trạng thái kiểm tra phiên đăng nhập, `login()` và `logout()`.
- **Theme:** lựa chọn sáng/tối và thao tác đổi theme.

Ở M1, Cart được cài đặt bằng `useReducer` kết hợp với `CartContext`. Cách này giúp học rõ action, reducer, immutable update và cách chia sẻ state trong React. Tuy nhiên, để sử dụng Cart, ứng dụng phải có `CartProvider`; provider cũng phải tự đồng bộ state với `localStorage` bằng effect.

Khi giá trị do `CartContext.Provider` cung cấp thay đổi, các component đang đọc context đó sẽ được thông báo render lại. Cart có nhiều phần dữ liệu và thao tác được dùng ở các nơi khác nhau: `AppLayout` cần badge, drawer và tổng tiền; trang attraction detail chỉ cần thêm vé; checkout cần items, tổng tiền và thao tác clear. Các component này không cần toàn bộ cùng một context value.

Auth và Theme có đặc điểm khác Cart:

- Auth được dùng như trạng thái phiên của toàn ứng dụng. Các consumer thường cần biết khi user hoặc trạng thái đăng nhập thay đổi.
- Theme chỉ có một giá trị nhỏ, thay đổi ít và khi thay đổi thì phần lớn giao diện cũng cần phản ứng.
- Cả hai đã có Provider rõ ràng, API nhỏ và chưa tạo ra vấn đề phức tạp về cập nhật state.

Server state như attractions, reviews và orders không thuộc phạm vi quyết định này. Các dữ liệu đó có vòng đời request, cache và invalidation nên được quản lý bằng TanStack Query thay vì Context hoặc Zustand.

## Options considered

| Option                                               | Pros                                                                                                                       | Cons                                                                                                                                                             |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Giữ `useReducer` + Context cho Cart, Auth và Theme   | Chỉ dùng API React; dễ nhìn thấy reducer/action; không thêm dependency                                                     | Cart cần Provider và effect persistence; consumer nhận context value chung; thêm action cần sửa reducer/type/provider; khó chọn riêng từng phần state            |
| Chuyển toàn bộ Cart, Auth và Theme sang Zustand      | Một cách quản lý client state thống nhất; selector và middleware dùng được ở mọi store; không cần Provider                 | Migrate Auth/Theme không giải quyết vấn đề hiện tại; tăng coupling với thư viện; làm mất cơ hội dùng Context đúng trường hợp; phạm vi refactor lớn hơn cần thiết |
| Dùng Zustand cho Cart, giữ Context cho Auth và Theme | Cart có actions trực tiếp, selector và `persist`; Auth/Theme vẫn đơn giản và phù hợp Context; thay đổi đúng phạm vi có lợi | Dự án dùng hai cách quản lý client state; thành viên phải hiểu ranh giới lựa chọn; Zustand là dependency bổ sung                                                 |
| Dùng Redux Toolkit cho Cart                          | Convention và DevTools mạnh; phù hợp state lớn, nhiều workflow và middleware                                               | Quá nhiều cấu trúc cho Cart hiện tại; tăng code và khái niệm phải học mà chưa đem lại lợi ích tương xứng                                                         |

## Decision

Chọn phương án kết hợp:

1. Dùng **Zustand v5** cho Cart.
2. Giữ **AuthContext** và **ThemeContext**.
3. Giữ server state trong **TanStack Query**, không đưa vào Zustand.

Cart store được khai báo trong [`cartStore.ts`](../../src/features/cart/cartStore.ts) với các thành phần:

- State duy nhất cần lưu là `items`.
- Actions gồm `addItems`, `updateQuantity`, `removeItem` và `clearCart`.
- Middleware `persist` lưu Cart dưới key `parkpass-cart`.
- `partialize` chỉ đưa `items` vào `localStorage`, không coi các function action là persisted data.
- `totalQuantity` và `totalPrice` là derived state, được tính bằng selector thay vì lưu thêm vào store.

Component đọc đúng phần state cần dùng:

```ts
const items = useCartStore((state) => state.items);
const totalQuantity = useCartStore(selectTotalQuantity);
const clearCart = useCartStore((state) => state.clearCart);
```

Cách này giúp API của component nói rõ dependency của nó. Ví dụ:

- [`AppLayout.tsx`](../../src/app/AppLayout.tsx) đọc items, totals và actions cập nhật/xóa.
- [`AttractionDetailPage.tsx`](../../src/features/attractions/pages/AttractionDetailPage.tsx) chỉ lấy `addItems`.
- [`CheckoutPage.tsx`](../../src/features/checkout/pages/CheckoutPage.tsx) đọc items, tổng tiền và lấy `clearCart`.

Auth tiếp tục dùng [`AuthProvider.tsx`](../../src/features/auth/AuthProvider.tsx) vì nó quản lý một phiên đăng nhập có API nhỏ, bao gồm quá trình khôi phục session và các trạng thái `checking`, `authenticated`, `anonymous`, `error`.

Theme tiếp tục dùng [`ThemeProvider.tsx`](../../src/features/theme/ThemeProvider.tsx) vì state chỉ gồm `theme` và `toggleTheme`; theme thay đổi ít và bản chất là cấu hình áp dụng cho toàn bộ cây giao diện.

Logic Cart mới được kiểm tra trong [`cartStore.test.ts`](../../src/features/cart/cartStore.test.ts), bao gồm add/merge, giới hạn quantity, update, remove, clear, derived selectors và persistence.

## Consequences

### Lợi ích

- Không còn cần `CartProvider` trong runtime component tree.
- Component có thể subscribe bằng selector thay vì luôn đọc một context value chứa toàn bộ Cart.
- Cart persistence được cấu hình cùng store, không cần một effect riêng để đồng bộ mỗi lần state thay đổi.
- Actions được gọi trực tiếp, ví dụ `addItems(items)` thay cho object action `dispatch({ type: "ADD_ITEMS", payload: items })`.
- Store có thể được kiểm tra trực tiếp bằng `getState()` và `setState()` mà không cần render Provider.
- Auth và Theme vẫn minh họa trường hợp Context là lựa chọn phù hợp; Zustand không được dùng chỉ để thống nhất công nghệ.

### Đánh đổi và rủi ro

- Dự án có thêm dependency Zustand và hai cơ chế quản lý client state.
- Logic action chuyển vào store nên developer phải giữ các cập nhật immutable và viết test cho store.
- Selector trả về object/array mới không cần thiết có thể gây render lại; ưu tiên selector nhỏ trả về primitive, action hoặc reference ổn định.
- Dữ liệu Cart M1 được lưu trực tiếp dưới dạng `{ items: [...] }`, còn Zustand `persist` dùng một wrapper có `state` và `version`. Trong môi trường development hiện tại cần xóa key cũ một lần. Nếu đây là production có dữ liệu thật, phải thêm version và migration thay vì làm mất Cart hiện có.
- Code Context/reducer cũ đang được giữ tạm thời để học và đối chiếu. Nó không còn tham gia runtime; trước Definition of Done cuối cùng cần chuyển phần so sánh cần thiết vào tài liệu và loại bỏ dead code.

### Khi nào xem lại quyết định

Xem lại ADR này nếu:

- Cart cần đồng bộ với tài khoản/backend thay vì chỉ `localStorage`.
- Ứng dụng có nhiều store phụ thuộc lẫn nhau hoặc workflow phức tạp cần convention/middleware mạnh hơn.
- Auth có nhiều consumer chỉ cần các lát state rất nhỏ và profiling chứng minh Context gây render thừa đáng kể.
- Ứng dụng chuyển sang SSR, nơi quá trình tạo store theo request và hydration cần được thiết kế lại.
