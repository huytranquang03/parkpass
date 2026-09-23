# ParkPass Learning Notes

Tài liệu này được cập nhật dần trong quá trình thực hiện assignment. Những câu
chưa được trả lời sẽ được bổ sung ở các milestone tiếp theo.

## Q18. So sánh các cách bảo vệ route

### HOC `withAuth`

`withAuth` nhận một component và trả về một component mới. Component mới đọc
trạng thái đăng nhập trước, sau đó redirect hoặc render component ban đầu và
truyền lại toàn bộ props.

Ưu điểm của HOC là có thể áp dụng trực tiếp cho từng component mà không phụ
thuộc vào cấu trúc route. Tuy nhiên, khi có nhiều HOC lồng nhau, React tree khó
đọc hơn, việc theo dõi props cũng phức tạp hơn và DevTools xuất hiện thêm các
lớp component bọc. Sau khi hooks phổ biến, nhiều logic dùng chung có thể được
tách bằng custom hook mà không cần tạo thêm một lớp component.

### Layout route `<RequireAuth />`

`RequireAuth` là một route cha không có `path`. Nó kiểm tra `AuthContext`; khi
đã đăng nhập thì `<Outlet />` render route con, còn user chưa đăng nhập được
chuyển tới `/login` và URL cần quay lại được giữ trong query `redirect`.

Cách này phù hợp khi nhiều trang có cùng chính sách truy cập vì chỉ cần đặt
`/checkout` và `/orders/*` dưới cùng một route cha. Loading và error của bước
khôi phục phiên cũng được xử lý tập trung tại một nơi.

### Custom hook `useRequireAuth`

Custom hook có thể đóng gói việc đọc auth và điều hướng, nhưng mỗi component
gọi hook vẫn phải tự quyết định render gì trong lúc checking hoặc khi có lỗi.
Nếu redirect được thực hiện trong effect, nội dung được bảo vệ còn có nguy cơ
hiện thoáng qua trước khi effect chạy nếu component không chặn render đúng.

### Quyết định trong ParkPass

ParkPass dùng layout route `RequireAuth` trong ứng dụng vì checkout và toàn bộ
orders dùng chung yêu cầu đăng nhập. Bản HOC vẫn được giữ tại
`docs/patterns/withAuth.md` để minh họa và so sánh, nhưng không được dùng đồng
thời nhằm tránh hai lớp guard làm cùng một việc.

## Q33. Token và redirect

### Vì sao bài tập lưu token trong localStorage?

Trong assignment, localStorage giúp mô phỏng một phiên đăng nhập hoàn toàn ở
frontend: token còn sau khi reload và `AuthProvider` dùng token đó gọi
`GET /api/me` để khôi phục user. Cách này đơn giản để quan sát vòng đời state và
route guard khi chưa có backend thật.

### Vì sao production không nên lưu token theo cách này?

JavaScript chạy trong cùng origin có thể đọc localStorage. Nếu ứng dụng có lỗ
hổng XSS và mã độc chạy được trên trang, token có thể bị đọc rồi gửi ra ngoài.
Token bị đánh cắp có thể được dùng cho tới khi hết hạn hoặc bị thu hồi.

Một phương án thường phù hợp hơn là để server quản lý session bằng cookie có
`HttpOnly`, `Secure` và `SameSite` thích hợp. JavaScript phía client không đọc
được cookie `HttpOnly`. Dùng cookie vẫn cần bảo vệ XSS, xử lý CSRF, giới hạn
thời gian sống của session và có cơ chế thu hồi/đổi token; nó không tự động giải
quyết mọi vấn đề bảo mật.

### ParkPass xử lý redirect ngoài website

Trang login không điều hướng thẳng tới giá trị `redirect`. Hàm `safeRedirect`
phân giải giá trị đó dựa trên origin hiện tại rồi chỉ chấp nhận kết quả có cùng
origin. Vì vậy `/checkout` được giữ lại, còn `https://evil.com` hoặc
`//evil.com` bị thay bằng `/`. Test auth cũng kiểm tra trường hợp redirect tới
website bên ngoài.
