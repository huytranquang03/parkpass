import { http, HttpResponse } from "msw";
import { parks } from "./data/parks";
import { attractionHandlers } from "./handlers/attractions";
import { authHandlers } from "./handlers/auth";
import { mockRequest } from "./mockBehavior";
import { promoCodeHandlers } from "./handlers/promoCodes";
import { reviewHandlers } from "./handlers/reviews";
import { orderHandlers } from "./handlers/orders";

export const handlers = [
  http.get("*/api/parks", async () => {
    const failure = await mockRequest();
    if (failure) return failure;
    return HttpResponse.json(parks);
  }),
  ...attractionHandlers,
  ...promoCodeHandlers,
  ...authHandlers,
  ...reviewHandlers,
  ...orderHandlers,
];
