import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useEffect, useState, type ReactNode } from "react";
import type { LoginRequest, LoginResponse, User } from "./types";
import { AuthContext, type AuthStatus } from "./authContext";

interface AuthProviderProps {
  children: ReactNode;
}

const AUTH_STORAGE_KEY = "parkpass-token";

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useLocalStorage<string | null>(
    AUTH_STORAGE_KEY,
    null,
  );
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(
    token ? "checking" : "anonymous",
  );

  useEffect(() => {
    if (!token || user) {
      return;
    }
    const controller = new AbortController();
    async function restoreSession() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          },
        );
        if (response.status === 401) {
          setToken(null);
          setUser(null);
          setStatus("anonymous");
          return;
        }
        if (!response.ok) {
          throw new Error("Không kiểm tra được phiên đăng nhập");
        }
        const currentUser = (await response.json()) as User;
        setUser(currentUser);
        setStatus("authenticated");
      } catch {
        if (controller.signal.aborted) return;
        setStatus("error");
      }
    }
    restoreSession();
    return () => controller.abort();
  }, [token, user, setToken]);

  async function login(credentials: LoginRequest): Promise<void> {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
      {
        method: "POST",
        headers: { "content-Type": "application/json" },
        body: JSON.stringify(credentials),
      },
    );
    if (response.status === 401) {
      throw new Error("Email hoặc mật khẩu không đúng");
    }

    if (!response.ok) {
      throw new Error("Không thể đăng nhập. Vui lòng thử lại");
    }

    const result = (await response.json()) as LoginResponse;
    setToken(result.token);
    setUser(result.user);
    setStatus("authenticated");
  }

  function logout() {
    setToken(null);
    setUser(null);
    setStatus("anonymous");
  }

  return (
    <AuthContext.Provider value={{ user, token, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
