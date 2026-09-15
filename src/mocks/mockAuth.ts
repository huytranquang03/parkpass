import { HttpResponse } from "msw";
import type { User } from "@/features/auth/types";
import type { ApiError } from "@/lib/apiError";
import { demoToken, demoUser } from "./data/auth";

export function getAuthenticatedUser(request: Request): User | undefined {
  const authorization = request.headers.get("Authorization");
  const token = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];
  return token === demoToken ? demoUser : undefined;
}

export function unauthorizedResponse(
  message = "Missing or invalid authentication token",
) {
  return HttpResponse.json<ApiError>(
    { code: "UNAUTHORIZED", message },
    { status: 401 },
  );
}
