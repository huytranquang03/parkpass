import type { LoginRequest, LoginResponse, User } from "@/features/auth/types";
import type { ApiError } from "@/lib/apiError";
import { http, HttpResponse, type PathParams } from "msw";
import { mockRequest } from "../mockBehavior";
import { demoToken, demoUser } from "../data/auth";
import { getAuthenticatedUser, unauthorizedResponse } from "../mockAuth";
import { isRecord } from "../utils";

export const authHandlers = [
  http.post<PathParams, LoginRequest, LoginResponse | ApiError>(
    "*/api/auth/login",
    async ({ request }) => {
      const failure = await mockRequest();
      if (failure) return failure;

      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return unauthorizedResponse("Invalid email or password");
      }

      if (
        !isRecord(body) ||
        body.email !== demoUser.email ||
        body.password !== "Passw0rd!"
      ) {
        return unauthorizedResponse("Invalid email or password");
      }

      return HttpResponse.json<LoginResponse>({
        token: demoToken,
        user: demoUser,
      });
    },
  ),
  http.get<PathParams, never, User | ApiError>(
    "*/api/me",
    async ({ request }) => {
      const failure = await mockRequest();
      if (failure) return failure;

      const user = getAuthenticatedUser(request);
      if (!user) return unauthorizedResponse();
      return HttpResponse.json<User>(user);
    },
  ),
];
