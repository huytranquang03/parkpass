import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "./authContext";

export default function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "checking") {
    return <p role="status">Đang kiểm tra đăng nhập...</p>;
  }

  if (status === "error") {
    return (
      <div role="alert">
        <p>Không thể kiểm tra phiên đăng nhập.</p>
        <button type="button" onClick={() => window.location.reload()}>
          Thử lại
        </button>
      </div>
    );
  }

  if (status === "authenticated") {
    return <Outlet />;
  }
  const redirect = `${location.pathname}${location.search}${location.hash}`;
  return (
    <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />
  );
}
