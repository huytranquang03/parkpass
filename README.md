# ParkPass

ParkPass là assignment học React thông qua việc xây dựng ứng dụng đặt vé trò chơi và điểm tham quan. Backend được giả lập bằng MSW để phát triển và kiểm thử frontend mà không cần chạy server riêng.

Yêu cầu đầy đủ và kế hoạch milestone nằm trong [docs/ASSIGNMENT.md](docs/ASSIGNMENT.md).

## Trạng thái hiện tại

Project đang ở **M0 — setup**. UI vẫn là màn hình Vite ban đầu, chưa có flow đặt vé hoàn chỉnh.

- Đã cấu hình Vite, TypeScript strict, alias `@/*`, ESLint, Prettier, Git hooks và Vitest/React Testing Library.
- Đã có MSW browser/node setup và đủ 11 endpoints theo API contract: attractions, parks, promo codes, auth, reviews và orders.
- Seed mặc định: 30 attractions, 4 parks, 3 promo codes; large mode: 500 attractions.
- Đã có latency, reviews lỗi 20%, chaos lỗi 30%, validation checkout, tính giá phía mock và orders persistence trong localStorage.
- Đã có PR template và GitHub Actions workflow; chưa kiểm chứng CI trên GitHub hoặc thiết lập branch protection.
- React Compiler **chưa bật**.

## Yêu cầu môi trường

- Node.js **24** (pin trong `.nvmrc`).
- pnpm **12.4.1** (pin trong `package.json`).
- Git.

Nếu dùng nvm, chạy tại thư mục project để cài/chọn Node theo `.nvmrc`:

```bash
nvm install
nvm use
```

Nếu chưa có pnpm đúng phiên bản, cài sau khi chọn Node 24:

```bash
npm install --global pnpm@12.4.1
```

Kiểm tra phiên bản trước khi cài dependencies:

```bash
node --version
pnpm --version
```

## Cài đặt và chạy local

Sau khi clone repo hoặc nhận source, mở terminal tại thư mục chứa `package.json` và README này:

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

Bỏ qua bước `cp` nếu đã có `.env.local`; không ghi đè cấu hình local của mình. Mở URL Vite in trong terminal, mặc định là `http://localhost:5173`.

`public/mockServiceWorker.js` đã có trong repo, không cần chạy lại MSW init khi clone.

### Environment variables

File `.env.example`:

```ini
VITE_API_BASE_URL=/api
VITE_ENABLE_MOCKS=true
```

| Biến                | Ý nghĩa                                                                                |
| ------------------- | -------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | Base URL theo API contract; dành cho các hàm gọi API khi triển khai frontend features. |
| `VITE_ENABLE_MOCKS` | Chỉ giá trị chuỗi `true` mới bật browser MSW worker.                                   |

`.env.local` không được commit. Restart dev server sau khi thay đổi env.

Hiện chưa có backend thật hoặc proxy backend được cấu hình, nên giữ mocks bật khi phát triển local. Tắt mocks không tự tạo backend thay thế.

## Scripts

| Lệnh                 | Mục đích                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| `pnpm dev`           | Chạy Vite development server với hot reload.                                                     |
| `pnpm build`         | Chạy TypeScript check và tạo production build trong `dist/`.                                     |
| `pnpm preview`       | Xem production build local; chạy `pnpm build` trước.                                             |
| `pnpm lint`          | Kiểm tra ESLint.                                                                                 |
| `pnpm typecheck`     | Kiểm tra TypeScript mà không emit code.                                                          |
| `pnpm test`          | Chạy Vitest một lần: unit/integration tests.                                                     |
| `pnpm test:coverage` | Chạy tests và tạo coverage report, HTML trong `coverage/index.html`.                             |
| `pnpm test:e2e`      | Script dự kiến cho Playwright; **chưa chạy được** vì chưa cài/cấu hình Playwright (M4).          |
| `pnpm format`        | Format project bằng Prettier; bỏ qua lockfile, đề bài và generated files theo `.prettierignore`. |
| `pnpm prepare`       | Cài Husky hooks; được chạy trong quá trình install thông thường.                                 |

Trước khi xin review, chạy:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Coverage threshold 70% cho `src/features/**` chưa được thiết lập; thực hiện ở M4.

## GitHub workflow và CI

PR template nằm ở [.github/pull_request_template.md](.github/pull_request_template.md), theo mẫu trong đề. Điền nội dung riêng cho từng PR, đặc biệt là work item, cách kiểm tra và AI usage.

Theo [GitHub Docs](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository), template tự hiện khi đã được merge vào default branch. Nếu PR đầu tiên chưa có template tự động, dùng nội dung file để điền thủ công.

Workflow [.github/workflows/ci.yml](.github/workflows/ci.yml) chạy khi:

- Push vào `main` hoặc `chore/setup-tooling`.
- Mở/cập nhật PR vào `main`.

Job `Quality checks` thực hiện:

```text
checkout → Node theo .nvmrc → pnpm theo packageManager + cache
→ install --frozen-lockfile → format check → lint → typecheck → test → build
```

CI dùng quyền đọc source, không push/merge/deploy. `HUSKY=0` bỏ việc cài local Git hooks trên runner. Playwright và coverage threshold sẽ được thêm ở M4.

Repo hiện chưa có remote. Sau khi đưa repo lên GitHub, mở PR và kiểm tra run trong tab Actions. Có workflow local chưa chứng minh CI đã xanh.

Người có quyền quản trị repo cần thiết lập bảo vệ `main`: bắt buộc PR, ít nhất 1 approve và status check `Quality checks` phải pass trước khi merge. Việc này được cấu hình trên GitHub, không tự áp dụng chỉ bằng file YAML. Tham khảo [GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).

## Cấu trúc thư mục hiện tại

```text
.github/
  pull_request_template.md
  workflows/ci.yml        # GitHub Actions quality checks
src/
  App.tsx                 # UI Vite ban đầu, sẽ thay bằng app features
  main.tsx                # Bật browser mocks trước khi render React
  features/               # Domain types: attractions, auth, orders, reviews
  lib/                    # Tiện ích/type dùng chung, hiện có ApiError
  mocks/
    data/                 # Seed attractions, parks, promo codes, demo user/token
    handlers/
      attractions.ts      # Attraction request handlers
      attractions.test.ts # Large dataset và pagination edge cases
      auth.ts             # Demo login và current user request handlers
      auth.test.ts        # Login, invalid body và Bearer token tests
      promoCodes.ts       # Promo request handler
      promoCodes.test.ts  # Test cạnh handler theo convention của đề
      reviews.ts          # Review handlers, 20% lỗi khi chaos tắt
      reviews.test.ts     # Reviews success/error/404 và large mode
      orders.ts           # Create/list/detail/cancel orders
      orders.test.ts      # Auth, validation, pricing, persistence và cancel tests
    handlers.ts           # Tổng hợp handlers dùng chung cho browser/node
    handlers.test.ts      # HTTP integration tests qua server dùng handlers tổng
    browser.ts            # Browser worker
    node.ts               # Test server
    mockDelay.ts          # Latency dùng chung
    mockDelay.test.ts     # Unit tests cho latency helper
    mockBehavior.ts       # Latency + chaos preflight dùng cho mọi endpoint
    mockBehavior.test.ts  # Kiểm tra chaos trên 11 endpoints
    mockAuth.ts           # Đọc Bearer token và tạo response 401
    mockStorage.ts        # Đọc cờ pp:chaos / pp:large
    mockStorage.test.ts   # Cờ mock và storage unavailable tests
    orderValidation.ts   # Kiểm tra checkout và tự tính giá từ seed
    orderValidation.test.ts # Date, quantity, ticket price và form edge cases
    orderStore.ts        # Đọc/ghi pp:orders, không giữ orders trong module memory
    utils.ts             # Runtime type guards dùng trong mock
  test/setup.ts           # RTL cleanup và MSW start/reset/close
  test/orderFixtures.ts   # Fixtures dùng riêng cho tests, ngày tạo động
docs/
  ASSIGNMENT.md           # Đề bài và API contract
public/
  mockServiceWorker.js    # Generated MSW worker
```

Cấu trúc feature-based đầy đủ sẽ được bổ sung khi triển khai các milestone; chưa có các màn hình cart/checkout/orders hoặc shared hooks.

## Mock API và testing

Browser MSW intercept request ở tầng network. Frontend features vẫn cần tự viết các hàm gọi API bằng `fetch`; không import handlers để lấy dữ liệu trực tiếp.

| Endpoint đã có                     | Hành vi                                                                                                                    |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/attractions`             | `q`, `park`, nhiều `category`, `sort`, `page`, `limit`; mặc định page 1, limit 12; limit tối đa 500.                       |
| `GET /api/attractions/:id`         | Trả attraction hoặc `404 ApiError`.                                                                                        |
| `GET /api/parks`                   | Trả 4 parks.                                                                                                               |
| `GET /api/promo-codes/:code`       | Trả promo code hoặc `404 ApiError`.                                                                                        |
| `POST /api/auth/login`             | Đúng tài khoản demo → `200 { token, user }`; sai hoặc body không hợp lệ → `401 ApiError`.                                  |
| `GET /api/me`                      | Header `Authorization: Bearer <token>` hợp lệ → `200 User`; thiếu/sai → `401 ApiError`.                                    |
| `GET /api/attractions/:id/reviews` | `200 Review[]`; 20% trả `500 ApiError` khi chaos tắt; attraction không tồn tại → `404`.                                    |
| `POST /api/orders`                 | Cần auth; hợp lệ → `201 Order`; lỗi form → `422 ApiError` kèm `fieldErrors`.                                               |
| `GET /api/orders`                  | Cần auth; trả `200 Order[]` của user hiện tại.                                                                             |
| `GET /api/orders/:id`              | Cần auth; trả `200 Order`; không tồn tại/không thuộc user → `404`.                                                         |
| `PATCH /api/orders/:id/cancel`     | Cần auth; `PENDING` → `200 Order` với status `CANCELLED`; trạng thái khác → `409`; không tồn tại/không thuộc user → `404`. |

`sort` hỗ trợ `price_asc`, `price_desc`, `rating_desc`. Giá dùng để sort là giá vé thấp nhất của attraction. `category` có thể lặp: `?category=THRILL&category=WATER`.

Các handler hiện có chờ ngẫu nhiên **300–1200ms** ở dev/demo. `mockDelay()` bỏ thời gian chờ khi Vite mode là `test`; test latency dùng fake timers để kiểm tra helper.

Mọi endpoint có thể trả `500 ApiError` khi chaos bật. Các endpoint cần auth trả `401` nếu header/token không hợp lệ. Mock orders trả `500 MOCK_STORAGE_ERROR` nếu dữ liệu lưu bị hỏng hoặc browser không thể đọc/ghi storage; không báo thành công hoặc ghi đè dữ liệu hỏng.

### Body tạo đơn dành cho frontend M1

Đề chưa định nghĩa request body của `POST /api/orders`. Project dùng [CreateOrderRequest](src/features/orders/types.ts), với cấu trúc sau (thay `YYYY-MM-DD` bằng ngày hợp lệ):

```json
{
  "items": [
    { "attractionId": "attraction-1", "ticketType": "ADULT", "quantity": 2 }
  ],
  "fullName": "Demo User",
  "email": "demo@parkpass.dev",
  "phone": "0901234567",
  "visitDate": "YYYY-MM-DD",
  "promoCode": "WELCOME10",
  "acceptTerms": true
}
```

- `promoCode` optional, bỏ qua hoặc để chuỗi rỗng khi không dùng; mã được trim và chuyển uppercase, giống endpoint kiểm tra promo.
- `visitDate`: ngày hôm nay đến 90 ngày tới, tính theo ngày lịch local. Không chấp nhận ngày không tồn tại.
- Mỗi dòng vé có quantity là số nguyên 1–10; không lặp cặp attraction/ticket type; attraction và loại vé phải tồn tại.
- Họ tên bắt buộc, email/số điện thoại phải hợp lệ, `acceptTerms` phải là boolean `true`.
- Số điện thoại được kiểm tra format di động/cố định với prefix `0` hoặc `+84`, có thể chứa khoảng trắng/dấu phân cách; không xác minh số có hoạt động hay thuộc nhà mạng nào. Quy tắc mock tham khảo [national numbering plan Việt Nam do MIC thông báo qua ITU](https://www.itu.int/dms_pub/itu-t/oth/02/02/T02020000E40005PDFE.pdf).
- Mock tự lấy tên/giá vé từ seed, tính `subtotal`, `discount` (làm tròn VND) và `total`; bỏ qua giá, tổng tiền, userId hoặc status client tự gửi. Đơn mới luôn `PENDING` và thuộc user của token.
- Contact fields chỉ dùng để validate; response/persisted order giữ đúng shape `Order` trong đề. Frontend vẫn tự validate form để có UX tốt; mock kiểm tra lại ở phía API.

Orders lưu dưới key `pp:orders`, đọc lại từ localStorage trên mỗi request nên reload không mất đơn. Dữ liệu chỉ tồn tại trong browser/origin đang dùng, không chia sẻ giữa máy hay tài khoản trình duyệt khác.

### Bật/tắt mock modes

Chạy trong browser DevTools Console của app:

```js
localStorage.setItem("pp:chaos", "1"); // Mỗi endpoint có 30% khả năng lỗi 500
localStorage.setItem("pp:large", "1"); // 500 attractions, gọi list với limit=500

// Tắt khi muốn trở lại luồng bình thường:
localStorage.removeItem("pp:chaos");
localStorage.removeItem("pp:large");
```

Fetch lại dữ liệu sau khi đổi mode; không cần restart Vite. Large mode áp dụng thống nhất cho list, detail, reviews và tính giá khi tạo đơn. Tắt large mode không xóa các đơn đã lưu.

Reviews có lỗi 20% khi chaos tắt; khi chaos bật, gate lỗi 30% chạy trước hành vi bình thường của endpoint. Tests điều khiển `Math.random()` để kiểm tra các ngưỡng này, không dựa vào may rủi. Setup dọn đúng 3 key mock sau mỗi test để tránh rò state giữa test cases.

Vitest chạy trong `jsdom`, có React Testing Library, jest-dom và MSW server dùng chung handlers. Request không khớp handler sẽ làm test fail để phát hiện endpoint sai hoặc quên đăng ký handler.

Các file `*.test.ts` nằm cạnh source theo convention trong đề; vì vậy test nằm trong `mocks/handlers/` là hợp lệ. `handlers.ts` chỉ import các module handler cụ thể, không tự nạp tất cả file trong folder. Các test không được import từ browser entry nên không nằm trong client build.

## Tài khoản và promo codes

Tài khoản theo đề: `demo@parkpass.dev` / `Passw0rd!`. Mock `POST /api/auth/login` trả token cố định dành cho demo và public user data, không trả password. Gửi token này trong header `Authorization: Bearer <token>` khi gọi `GET /api/me` để nhận user hiện tại. Thiếu/sai token trả `401 ApiError`.

Mock auth không lưu token vào localStorage; việc đó thuộc frontend auth khi triển khai. Đây không phải cơ chế xác thực production: token mock không hết hạn và không bị thu hồi. AuthContext và UI Login chưa có, nên hiện chưa có flow đăng nhập trên giao diện.

Promo codes đang có: `WELCOME10` (10%), `SUMMER15` (15%), `FAMILY20` (20%). Checkout chưa triển khai.

## Deploy

Chưa deploy. Link Vercel sẽ được bổ sung ở M4, với `VITE_ENABLE_MOCKS=true` cho bản demo.
