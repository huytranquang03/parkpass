import type { CreateOrderRequest } from "@/features/orders/types";

export function getVisitDate(offset = 1): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return [
    String(date.getFullYear()).padStart(4, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function createValidOrderRequest(
  overrides: Partial<CreateOrderRequest> = {},
): CreateOrderRequest {
  return {
    items: [{ attractionId: "attraction-1", ticketType: "ADULT", quantity: 1 }],
    fullName: "Demo User",
    email: "demo@parkpass.dev",
    phone: "0901234567",
    visitDate: getVisitDate(),
    acceptTerms: true,
    ...overrides,
  };
}
