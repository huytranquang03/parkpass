import { useState, type SubmitEvent } from "react";
import { useAuth } from "../authContext";
import { useNavigate, useSearchParams } from "react-router";
import Button from "@/components/ui/Button";
import styles from "./LoginPage.module.css";
import Field from "@/components/ui/Field";

function safeRedirect(value: string | null): string {
  if (value === null) {
    return "/";
  }
  if (!value.startsWith("/")) {
    return "/";
  }
  try {
    const target = new URL(value, window.location.origin);
    if (target.origin !== window.location.origin) return "/";
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "/";
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isCredentialError = error === "Email hoặc mật khẩu không đúng";

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await login({ email: email.trim(), password });
      const destination = safeRedirect(searchParams.get("redirect"));
      navigate(destination, { replace: true });
    } catch (error) {
      if (error instanceof Error) {
        return setError(error.message);
      } else {
        return setError("Không thể đăng nhập");
      }
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Đăng nhập</h1>

        <p className={styles.subtitle}>
          Để xem đơn hàng và thanh toán nhanh hơn.
        </p>

        {error && (
          <div className={styles.alert} role="alert">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>

            <span>
              {isCredentialError ? (
                <>
                  <strong>Đăng nhập thất bại (401).</strong> {error}. Nội dung
                  đã nhập được giữ nguyên.
                </>
              ) : (
                <>
                  <strong>Đăng nhập thất bại.</strong> {error}
                </>
              )}
            </span>
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <Field
            id="login-email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="ban@vidu.vn"
            required
            disabled={isSubmitting}
            value={email}
            error={isCredentialError ? "Kiểm tra lại email" : undefined}
            onChange={(event) => setEmail(event.currentTarget.value)}
          />

          <Field
            id="login-password"
            label="Mật khẩu"
            type="password"
            autoComplete="current-password"
            placeholder="Tối thiểu 8 ký tự"
            required
            disabled={isSubmitting}
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
          />

          <Button
            className={styles.submitButton}
            type="submit"
            size="lg"
            loading={isSubmitting}
          >
            Đăng nhập
          </Button>
        </form>

        <p className={styles.demoAccount}>
          Tài khoản test: <strong>demo@parkpass.dev</strong> /{" "}
          <strong>Passw0rd!</strong>
        </p>
      </div>
    </section>
  );
}
