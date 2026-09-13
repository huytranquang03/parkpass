import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("*/api/parks", () => {
    return HttpResponse.json([
      {
        id: "park-1",
        name: "Adventure Park",
        city: "Ho Chi Minh City",
      },
    ]);
  }),
];
