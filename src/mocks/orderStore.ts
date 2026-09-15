import type { Order, OrderItem } from "@/features/orders/types";
import { isRecord, isTicketType } from "./utils";

export const mockOrdersKey = "pp:orders";

function isOrderItem(value: unknown): value is OrderItem {
  return (
    isRecord(value) &&
    typeof value.attractionId === "string" &&
    typeof value.attractionName === "string" &&
    isTicketType(value.ticketType) &&
    typeof value.quantity === "number" &&
    Number.isSafeInteger(value.quantity) &&
    value.quantity >= 1 &&
    value.quantity <= 10 &&
    typeof value.unitPrice === "number" &&
    Number.isFinite(value.unitPrice) &&
    value.unitPrice >= 0
  );
}

function isOrder(value: unknown): value is Order {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.userId === "string" &&
    Array.isArray(value.items) &&
    value.items.every(isOrderItem) &&
    typeof value.visitDate === "string" &&
    (value.promoCode === undefined || typeof value.promoCode === "string") &&
    typeof value.subtotal === "number" &&
    Number.isFinite(value.subtotal) &&
    value.subtotal >= 0 &&
    typeof value.discount === "number" &&
    Number.isFinite(value.discount) &&
    value.discount >= 0 &&
    typeof value.total === "number" &&
    Number.isFinite(value.total) &&
    value.total >= 0 &&
    (value.status === "PENDING" ||
      value.status === "PAID" ||
      value.status === "CANCELLED") &&
    typeof value.createdAt === "string"
  );
}

export function readOrders(): Order[] {
  const raw = globalThis.localStorage.getItem(mockOrdersKey);
  if (raw === null) return [];

  const value: unknown = JSON.parse(raw);
  if (!Array.isArray(value) || !value.every(isOrder)) {
    throw new Error("Invalid mock orders in localStorage");
  }
  return value;
}

export function writeOrders(orders: Order[]): void {
  globalThis.localStorage.setItem(mockOrdersKey, JSON.stringify(orders));
}
