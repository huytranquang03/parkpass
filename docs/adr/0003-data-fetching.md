# ADR-0003: Dùng TanStack Query cho server state

- Status: Accepted
- Date: 2026-10-06

## Context

Ở M1, ParkPass dùng `fetch` và custom hook `useFetch`. Cách này phù hợp để học lifecycle của request: loading, success, error, cleanup bằng `AbortController`, race condition và refetch.

Khi ứng dụng có attraction list/detail, parks, reviews và orders, dữ liệu từ server bắt đầu cần thêm các hành vi:

- Cache theo resource và filter.
- Không tạo request trùng khi nhiều component cần cùng dữ liệu.
- Phân biệt fresh/stale data và retry theo loại lỗi.
- Giữ dữ liệu cũ trong lúc chuyển trang.
- Prefetch detail trước khi điều hướng.
- Đồng bộ list/detail sau mutation.
- Optimistic update với rollback.
- Kết nối reviews với Suspense và ErrorBoundary.

Đây là server state: dữ liệu có nguồn gốc từ API, có freshness và cần được invalidated. Nó không nên được copy vào Zustand hoặc Context chỉ để chia sẻ giữa component.

## Options considered

| Option                              | Pros                                                                                               | Cons                                                                                                        |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Tiếp tục `fetch` + `useFetch`       | Không thêm dependency; toàn bộ lifecycle nhìn thấy rõ; bundle nhỏ                                  | Tự xây cache, dedupe, retry, invalidation và optimistic update; dễ tạo implementation khác nhau ở từng page |
| TanStack Query v5                   | Cache/query key/mutation đầy đủ; framework-agnostic API; Devtools và tài liệu tốt; hỗ trợ Suspense | Thêm dependency và bundle; query key/invalidation có learning curve; cache sai nếu thiết kế key sai         |
| SWR                                 | API nhỏ; phù hợp read-heavy và stale-while-revalidate                                              | Mutation/optimistic workflow phức tạp của bài ít trực tiếp hơn TanStack Query                               |
| RTK Query                           | Cache tích hợp Redux Toolkit; convention mạnh                                                      | Project không dùng Redux; thêm Redux chỉ cho server state là quá phạm vi                                    |
| Đưa server data vào Zustand/Context | Một store chung, component đọc thuận tiện                                                          | Phải tự quản request lifecycle, freshness, dedupe và invalidation; trộn server state với client state       |

## Decision

Chọn **TanStack Query v5** cho server state; giữ native `fetch` trong các API function.

### Ranh giới trách nhiệm

- `api.ts`: tạo HTTP request, parse response và ném `ApiRequestError`.
- `queries.ts`: query key factory, query function, stale time, retry và placeholder policy.
- Page/component: render loading/error/data và gọi mutation theo interaction.
- Zustand: chỉ quản lý Cart là client state.
- Context: tiếp tục quản lý Auth và Theme.

### Cache policy

- QueryClient mặc định `staleTime: 30_000` và `retry: 1`.
- Attraction list: key chứa toàn bộ filter, `keepPreviousData` cho pagination.
- Parks: stale 5 phút vì thay đổi ít.
- Attraction detail và reviews: stale 1 phút.
- Detail/order `404` không retry vì request lặp lại không thể làm resource xuất hiện ngay.
- Reviews tắt retry để ErrorBoundary hiển thị lỗi mock rõ ràng và nút Retry do user quyết định.

### Mutation policy

- Checkout dùng `useMutation`; thành công clear Cart và điều hướng tới order detail.
- Cancel order dùng optimistic update:
  1. Hủy list/detail query đang chạy.
  2. Snapshot dữ liệu cache hiện tại.
  3. Đặt status thành `CANCELLED` trong list và detail.
  4. Nếu request lỗi, phục hồi snapshot.
  5. Dù thành công hay lỗi, invalidate để đồng bộ với server.

### Suspense và prefetch

- Reviews dùng `useSuspenseQuery`; `Suspense` chịu trách nhiệm loading và `ErrorBoundary` chịu trách nhiệm render failure.
- `QueryErrorResetBoundary` reset error state của query khi user thử lại.
- Attraction card làm ấm detail query khi link được hover hoặc focus, giúp cả chuột và bàn phím hưởng prefetch.

## Consequences

### Lợi ích

- Cache, dedupe, stale/fresh state và AbortSignal có convention chung.
- Query key mô tả dependency của dữ liệu và là điểm chung cho read, prefetch và invalidation.
- Pagination không xóa list cũ trong lúc tải trang mới.
- Optimistic cancellation phản hồi ngay nhưng vẫn rollback an toàn.
- Reviews widget không phải tự giữ ba trạng thái loading/error/data.
- API layer vẫn là TypeScript function độc lập và có thể dùng native `fetch`.

### Đánh đổi và rủi ro

- App JavaScript gzip tăng; số liệu cụ thể nằm trong [MIGRATION.md](../MIGRATION.md).
- Developer phải hiểu query keys, stale time, cache invalidation và mutation callbacks.
- Đặt object filter không ổn định hoặc bỏ sót filter trong key có thể tạo cache không chính xác.
- Optimistic update thêm code snapshot/rollback và phải cập nhật mọi cache view liên quan.
- Query cache không thay thế URL state: filter/pagination đã áp dụng vẫn nằm trên URL.
- Query cache cũng không thay thế Auth/Cart/Theme state.

### Khi nào xem lại quyết định

Xem lại ADR nếu:

- Backend chuyển sang GraphQL và cần normalized graph cache như Apollo/Relay/urql.
- Project dùng Redux Toolkit làm state architecture chính và muốn hợp nhất vào RTK Query.
- Bundle budget không chấp nhận chi phí hiện tại sau khi đã đo production traffic.
- Ứng dụng chuyển sang SSR/streaming; khi đó cần thiết kế prefetch, dehydration và hydration phía server.
