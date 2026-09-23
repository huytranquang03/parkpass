# Route guard bằng HOC `withAuth`

Đây là cách triển khai thay thế để so sánh với layout route `RequireAuth` đang
được dùng trong ứng dụng.

```tsx
import type { ComponentType } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/features/auth/authContext";

function withAuth<Props extends object>(Component: ComponentType<Props>) {
  function ProtectedComponent(props: Props) {
    const { status } = useAuth();
    const location = useLocation();

    if (status === "checking") {
      return <p>Đang kiểm tra đăng nhập...</p>;
    }

    if (status === "error") {
      return <p>Không thể kiểm tra phiên đăng nhập.</p>;
    }

    if (status === "anonymous") {
      const redirect = `${location.pathname}${location.search}${location.hash}`;

      return (
        <Navigate
          to={`/login?redirect=${encodeURIComponent(redirect)}`}
          replace
        />
      );
    }

    return <Component {...props} />;
  }

  return ProtectedComponent;
}

// Cách dùng minh họa:
// const ProtectedCheckout = withAuth(CheckoutPage);
// {
//   path: "/checkout",
//   element: <ProtectedCheckout />,
// }
```

HOC nhận một component và trả về một component mới có bước kiểm tra auth. Nó
phù hợp khi muốn bảo vệ một component độc lập, nhưng tạo thêm một lớp bọc và có
thể làm component tree khó theo dõi khi nhiều HOC được lồng với nhau.

Ứng dụng thực tế giữ `RequireAuth` làm cách chính vì một layout route có thể bảo
vệ cả nhóm `/checkout` và `/orders/*` qua `<Outlet />`. Xem Q18 trong
`docs/LEARNING.md` để biết phần so sánh đầy đủ.
