import { http, HttpResponse } from "msw";
import { mockRequest } from "../mockBehavior";
import { promoCodes } from "../data/promoCodes";
import type { ApiError } from "@/lib/apiError";

export const promoCodeHandlers = [
  http.get("*/api/promo-codes/:code", async ({ params }) => {
    const failure = await mockRequest();
    if (failure) return failure;
    const code = String(params.code).trim().toUpperCase();
    const promoCode = promoCodes.find((item) => item.code === code);
    if (promoCode === undefined) {
      return HttpResponse.json<ApiError>(
        {
          code: "PROMO_CODE_NOT_FOUND",
          message: "promo code not found",
        },
        {
          status: 404,
        },
      );
    }
    return HttpResponse.json(promoCode);
  }),
];
