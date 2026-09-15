import { expect, test } from "vitest";
import type { LoginResponse } from "@/features/auth/types";

const loginUrl = "http://localhost/api/auth/login";
const meUrl = "http://localhost/api/me";
const validCredentials = {
  email: "demo@parkpass.dev",
  password: "Passw0rd!",
};

function login(body: unknown) {
  return fetch(loginUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function expectUnauthorized(
  response: Response,
  message = "Invalid email or password",
) {
  expect(response.status).toBe(401);
  await expect(response.json()).resolves.toEqual({
    code: "UNAUTHORIZED",
    message,
  });
}

test("returns a token and public user data for the demo account", async () => {
  const response = await login(validCredentials);

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({
    token: "parkpass-demo-token",
    user: {
      id: "user-demo",
      name: "Demo User",
      email: "demo@parkpass.dev",
    },
  });
});

test.each([
  { label: "email", body: { ...validCredentials, email: "other@example.com" } },
  {
    label: "password",
    body: { ...validCredentials, password: "wrong-password" },
  },
  {
    label: "email and password",
    body: { email: "other@example.com", password: "wrong-password" },
  },
])("returns 401 for an incorrect $label", async ({ body }) => {
  await expectUnauthorized(await login(body));
});

test.each([
  { label: "an empty object", body: {} },
  { label: "a missing email", body: { password: validCredentials.password } },
  { label: "a missing password", body: { email: validCredentials.email } },
  { label: "null", body: null },
  { label: "an array", body: [] },
  { label: "a string", body: "credentials" },
  { label: "a number", body: 42 },
  { label: "a non-string email", body: { ...validCredentials, email: 42 } },
  {
    label: "a non-string password",
    body: { ...validCredentials, password: 42 },
  },
])("returns 401 when the login body is $label", async ({ body }) => {
  await expectUnauthorized(await login(body));
});

test.each(["", "not-json"])(
  "returns 401 instead of throwing for a malformed JSON body: %j",
  async (body) => {
    const response = await fetch(loginUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    await expectUnauthorized(response);
  },
);

test.each(["Bearer", "bearer", "BEARER"])(
  "returns the current user with a valid token and %s scheme",
  async (scheme) => {
    const response = await fetch(meUrl, {
      headers: { Authorization: `${scheme} parkpass-demo-token` },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: "user-demo",
      name: "Demo User",
      email: "demo@parkpass.dev",
    });
  },
);

test("accepts the token returned by login to fetch the current user", async () => {
  const loginResponse = await login(validCredentials);
  expect(loginResponse.status).toBe(200);
  const session: LoginResponse = await loginResponse.json();

  const response = await fetch(meUrl, {
    headers: { Authorization: `Bearer ${session.token}` },
  });

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual(session.user);
});

test("returns 401 when the authentication header is missing", async () => {
  const response = await fetch(meUrl);

  await expectUnauthorized(response, "Missing or invalid authentication token");
});

test.each([
  "",
  "Bearer",
  "Bearer wrong-token",
  "Basic parkpass-demo-token",
  "parkpass-demo-token",
  "Bearer parkpass-demo-token extra",
])("returns 401 for an invalid Authorization header: %j", async (header) => {
  const response = await fetch(meUrl, {
    headers: { Authorization: header },
  });

  await expectUnauthorized(response, "Missing or invalid authentication token");
});
