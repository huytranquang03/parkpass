import { useState, type SubmitEvent } from "react";
import { useAuth } from "../authContext";
import { useNavigate, useSearchParams } from "react-router";
import Button from "@/components/ui/Button";
import styles from "./LoginPage.module.css";

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
      <h1>Đăng nhập</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
        />

        <label htmlFor="login-password">Mật khẩu</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
        />

        {error && <p role="alert">{error}</p>}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>
    </section>
  );
}
