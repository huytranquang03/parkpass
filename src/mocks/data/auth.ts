import type { User } from "@/features/auth/types";

export const demoUser: User = {
  id: "user-demo",
  name: "Demo User",
  email: "demo@parkpass.dev",
};

// A fixed token for the mock API only, not a real authentication token.
export const demoToken = "parkpass-demo-token";
