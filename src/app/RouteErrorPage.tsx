import { isRouteErrorResponse, useRouteError } from "react-router";

export default function RouteErrorPage() {
  const error = useRouteError();

  let message = "Không thể hiển thị trang này.";

  if (isRouteErrorResponse(error)) {
    message = `${error.status} ${error.statusText}`;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <main>
      <h1>Đã xảy ra lỗi</h1>
      <p>{message}</p>

      <button type="button" onClick={() => window.location.reload()}>
        Thử lại
      </button>

      <p>
        <a href="/">Quay về trang chủ</a>
      </p>
    </main>
  );
}
