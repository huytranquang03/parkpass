import { createContext, useContext } from "react";
import type { LoginRequest, User } from "./types";

export type AuthStatus = "checking" | "authenticated" | "anonymous" | "error";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  login: (credential: LoginRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải nằm trong AuthProvider");
  }
  return context;
}
