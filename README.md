# ParkPass

ParkPass là ứng dụng frontend đặt vé công viên và điểm tham quan, được xây dựng trong assignment React Fundamentals. Dự án tập trung vào việc học React qua một luồng sản phẩm hoàn chỉnh: tìm kiếm attraction, xem chi tiết, quản lý giỏ vé, đăng nhập, checkout và theo dõi đơn hàng.

Backend hiện được giả lập bằng Mock Service Worker (MSW), vì vậy frontend vẫn gọi API bằng `fetch` như khi làm việc với backend thật nhưng có thể phát triển và kiểm thử độc lập.

Đề bài gốc và acceptance criteria nằm trong [docs/ASSIGNMENT.md](docs/ASSIGNMENT.md).

## Trạng thái hiện tại

Dự án đã hoàn thành phần chức năng chính của M0–M3 và đang ở giai đoạn hoàn thiện UI trước khi chuyển sang M4.

Đã có:

- Danh sách attraction với search debounce, filter, sort, pagination và URL là source of truth.
- Trang chi tiết, gallery/lightbox, chọn loại vé và thêm vào giỏ hàng.
- Giỏ hàng dùng Zustand, persist vào localStorage và hiển thị trong drawer.
- Đăng nhập giả lập, khôi phục phiên đăng nhập và protected routes.
- Checkout dùng React Hook Form + Zod, kiểm tra promo code và tạo đơn.
- Danh sách đơn hàng, chi tiết đơn và hủy đơn có xác nhận.
- TanStack Query cho server state, cache, prefetch và mutation.
- Error boundary, lazy routes, reviews widget và các trạng thái loading/error/empty/success.
- Theme sáng/tối, UI primitives và responsive cho trang danh sách/chi tiết.
- MSW browser/node với đầy đủ API contract, chaos mode và large dataset mode.
- Unit/integration tests bằng Vitest, React Testing Library và MSW.

Đang hoàn thiện:

- Responsive checkout và rà soát responsive cho login/orders.
- Visual QA toàn bộ màn hình ở 360px, 768px, 1280px và dark mode.
- Accessibility audit, E2E, deploy và tài liệu M4.

## Công nghệ

| Nhóm         | Công nghệ                                                                            |
| ------------ | ------------------------------------------------------------------------------------ |
| UI           | React 19, TypeScript                                                                 |
| Build        | Vite 8                                                                               |
| Routing      | React Router 7                                                                       |
| Server state | TanStack Query 5                                                                     |
| Client state | Zustand 5                                                                            |
| Form         | React Hook Form, Zod                                                                 |
| API mock     | MSW 2                                                                                |
| Styling      | CSS Modules, design tokens; Tailwind được dành cho phần UI nhỏ theo kế hoạch học tập |
| Testing      | Vitest, React Testing Library, jest-dom                                              |
| Quality      | ESLint, Prettier, Husky, lint-staged, commitlint                                     |
| CI           | GitHub Actions                                                                       |

## Yêu cầu môi trường

- Node.js 24, được pin trong `.nvmrc`.
- pnpm 12.4.1, được pin trong `package.json`.
- Git.

Nếu dùng nvm:

```bash
nvm install
nvm use
```

Nếu máy chưa có đúng phiên bản pnpm:

```bash
npm install --global pnpm@12.4.1
```

Kiểm tra môi trường:

```bash
node --version
pnpm --version
```

## Chạy project trên máy local

```bash
git clone https://github.com/huytranquang03/parkpass.git
cd parkpass
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

Mở URL do Vite in trong terminal, mặc định là <http://localhost:5173>.

`public/mockServiceWorker.js` đã có trong repository nên không cần chạy lại lệnh MSW init.

## Environment variables

```ini
VITE_API_BASE_URL=/api
VITE_ENABLE_MOCKS=true
```

| Biến                | Ý nghĩa                                     |
| ------------------- | ------------------------------------------- |
| `VITE_API_BASE_URL` | Base URL dùng bởi các hàm gọi API.          |
| `VITE_ENABLE_MOCKS` | Chỉ chuỗi `true` mới bật MSW trong browser. |

Không commit `.env.local`. Sau khi thay đổi biến môi trường, cần restart dev server.

Hiện project chưa cấu hình backend thật, vì vậy nên giữ `VITE_ENABLE_MOCKS=true` khi chạy local.

## Tài khoản demo

```text
Email:    demo@parkpass.dev
Password: Passw0rd!
```

Promo codes dùng để thử checkout:

| Mã          | Giảm giá |
| ----------- | -------: |
| `WELCOME10` |      10% |
| `SUMMER15`  |      15% |
| `FAMILY20`  |      20% |

## Các route chính

| Route              | Nội dung             | Quyền truy cập |
| ------------------ | -------------------- | -------------- |
| `/`                | Danh sách attraction | Công khai      |
| `/attractions/:id` | Chi tiết attraction  | Công khai      |
| `/login`           | Đăng nhập            | Công khai      |
| `/checkout`        | Checkout             | Cần đăng nhập  |
| `/orders`          | Lịch sử đơn hàng     | Cần đăng nhập  |
| `/orders/:id`      | Chi tiết đơn hàng    | Cần đăng nhập  |

## Scripts

| Lệnh                 | Mục đích                                                      |
| -------------------- | ------------------------------------------------------------- |
| `pnpm dev`           | Chạy Vite development server.                                 |
| `pnpm build`         | TypeScript build và tạo production bundle trong `dist/`.      |
| `pnpm preview`       | Xem production build trên máy local.                          |
| `pnpm lint`          | Kiểm tra ESLint.                                              |
| `pnpm typecheck`     | Kiểm tra TypeScript mà không emit file.                       |
| `pnpm test`          | Chạy unit/integration tests một lần.                          |
| `pnpm test:coverage` | Chạy tests và tạo coverage report.                            |
| `pnpm format`        | Format project bằng Prettier.                                 |
| `pnpm test:e2e`      | Dành cho Playwright ở M4; hiện chưa được cấu hình hoàn chỉnh. |

Trước khi mở pull request:

```bash
pnpm exec prettier . --check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Lần kiểm tra gần nhất: 25 test files với 221 tests đều pass, typecheck/lint/build đều thành công.

## Mock API

Frontend không import dữ liệu trực tiếp từ handlers. Mọi feature vẫn gọi HTTP API; MSW chỉ intercept request và trả response giả lập.

Các nhóm endpoint hiện có:

- Attractions: list, search/filter/sort/pagination và detail.
- Parks.
- Promo codes.
- Authentication: login và current user.
- Reviews.
- Orders: create, list, detail và cancel.

API contract đầy đủ nằm trong [docs/ASSIGNMENT.md](docs/ASSIGNMENT.md). Cấu hình và cách tổ chức mock nằm trong `src/mocks/`.

### Mock modes

Chạy trong DevTools Console rồi reload hoặc refetch dữ liệu:

```js
localStorage.setItem("pp:chaos", "1");
localStorage.setItem("pp:large", "1");
```

- `pp:chaos`: cho phép API trả lỗi ngẫu nhiên để thử error states.
- `pp:large`: dùng bộ 500 attractions để kiểm tra hiệu năng.

Tắt các mode:

```js
localStorage.removeItem("pp:chaos");
localStorage.removeItem("pp:large");
```

Orders và cart được persist trong localStorage của browser. Đây chỉ là dữ liệu demo và không được chia sẻ giữa các browser/origin.

## Cấu trúc project

```text
src/
  app/                    # Router, app layout, lazy pages, route error UI
  components/
    errors/               # Error boundaries
    ui/                   # Shared UI primitives
  features/
    attractions/          # List, detail, search, filters, queries
    auth/                 # Auth provider, route guard, login
    cart/                 # Zustand cart store và cart components
    checkout/             # Checkout form, schema, summary
    orders/               # Orders API, queries và pages
    reviews/              # Lazy reviews widget
    theme/                # Theme provider
  hooks/                  # Reusable custom hooks
  lib/                    # Shared API/error utilities
  mocks/                  # MSW data, handlers, storage và validation
  styles/                 # Design tokens
  test/                   # Shared test setup và fixtures
docs/
  adr/                    # Architecture Decision Records
  design/                 # Design spec, composition và HTML mockups
  patterns/               # Pattern/refactor notes
  ASSIGNMENT.md            # Đề bài gốc
  LEARNING.md              # Ghi chú kiến thức
  MIGRATION.md             # Báo cáo migration M3
  PERF.md                  # Performance lab M2
```

Code được tổ chức theo feature. State phía server nằm trong TanStack Query; state dùng chung phía client nằm trong Zustand hoặc Context tùy phạm vi.

## Tài liệu kỹ thuật

- [Performance lab](docs/PERF.md)
- [M3 migration report](docs/MIGRATION.md)
- [ADR-0001: State management](docs/adr/0001-state-management.md)
- [ADR-0002: Styling](docs/adr/0002-styling.md)
- [ADR-0003: Data fetching](docs/adr/0003-data-fetching.md)
- [Custom hooks refactor](docs/patterns/custom-hooks-refactor.md)
- [Route guard comparison](docs/patterns/withAuth.md)
- [Design handoff](docs/design/README.md)

## Git và CI

Repository sử dụng Conventional Commits. Husky chạy lint-staged trước commit và commitlint kiểm tra commit message.

GitHub Actions chạy quality checks khi mở hoặc cập nhật pull request vào `main`:

```text
install → format check → lint → typecheck → test → build
```

PR template nằm ở [.github/pull_request_template.md](.github/pull_request_template.md).

Các branch milestone được giữ lại để mentor có thể xem tiến trình. Branch tổng hợp dành cho review chứa toàn bộ lịch sử từ M0 đến checkpoint UI hiện tại; `main` chỉ được cập nhật sau khi pull request được review và merge.

## Design và responsive

UI được triển khai dựa trên:

- `docs/design/DESIGN-SPEC.md`: nguồn chuẩn cho token và số đo.
- `docs/design/COMPOSITION.md`: cấu trúc lắp ghép từng màn hình.
- `docs/design/mockups/`: HTML dùng để inspect trực tiếp.
- `docs/design/exports/`: ảnh tham chiếu bố cục.

Responsive chính:

- Dưới 640px: list một cột, filter mở từ bottom drawer.
- 640–1023px: list hai cột, filter dùng drawer.
- 1024–1279px: list ba cột và sidebar.
- Từ 1280px: list bốn cột và sidebar.

## Giới hạn hiện tại

- Chưa kết nối backend thật.
- Chưa cấu hình Playwright E2E và deploy production.
- UI responsive/dark mode vẫn đang được rà soát ở một số màn hình.
- Offline banner và final accessibility audit được để lại cho M4.

## Deploy

Chưa deploy. Link Vercel sẽ được bổ sung trong M4.
