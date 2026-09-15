import { HttpResponse } from "msw";
import type { ApiError } from "@/lib/apiError";
import { mockDelay } from "./mockDelay";
import { isMockFlagEnabled } from "./mockStorage";

// Every API handler calls this once before its normal response logic.
export async function mockRequest() {
  await mockDelay();

  if (isMockFlagEnabled("pp:chaos") && Math.random() < 0.3) {
    return HttpResponse.json<ApiError>(
      { code: "CHAOS_ERROR", message: "Simulated server error" },
      { status: 500 },
    );
  }
}
