import type { Order, OrderItem } from "@/features/orders/types";
import { getAttractions } from "./data/attractions";
import { promoCodes } from "./data/promoCodes";
import { isRecord, isTicketType } from "./utils";

type ValidatedOrder = Pick<
  Order,
  "items" | "visitDate" | "promoCode" | "subtotal" | "discount" | "total"
>;

type ValidationResult =
  | { success: true; data: ValidatedOrder }
  | { success: false; fieldErrors: Record<string, string> };

export function getVisitDateError(
  value: unknown,
  now = new Date(),
): string | undefined {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return "Choose a valid visit date";
  }

  const visit = new Date(`${value}T00:00:00.000Z`);
  if (
    Number.isNaN(visit.getTime()) ||
    visit.toISOString().slice(0, 10) !== value
  ) {
    return "Choose a valid visit date";
  }

  // Compare calendar days, not elapsed hours (avoids DST/time-zone offsets).
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const lastDay = Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 90,
  );
  if (visit.getTime() < today) return "Visit date cannot be in the past";
  if (visit.getTime() > lastDay) return "Visit date must be within 90 days";
}

function parseOrderItems(value: unknown): {
  items: OrderItem[];
  error?: string;
} {
  if (!Array.isArray(value) || value.length === 0) {
    return { items: [], error: "Your cart must contain at least one ticket" };
  }

  const rawItems: unknown[] = value;
  const attractions = getAttractions();
  const items: OrderItem[] = [];
  const seen = new Set<string>();

  for (const item of rawItems) {
    if (
      !isRecord(item) ||
      typeof item.attractionId !== "string" ||
      !isTicketType(item.ticketType) ||
      typeof item.quantity !== "number" ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 10
    ) {
      return {
        items: [],
        error: "Each ticket must have a valid type and quantity from 1 to 10",
      };
    }

    const attraction = attractions.find(
      (entry) => entry.id === item.attractionId,
    );
    if (!attraction) {
      return {
        items: [],
        error: "An attraction in your cart no longer exists",
      };
    }

    const key = `${attraction.id}:${item.ticketType}`;
    if (seen.has(key)) {
      return {
        items: [],
        error: "Duplicate attraction and ticket type in your cart",
      };
    }
    seen.add(key);

    // Only identifiers and quantities come from the client. Prices/names use seed data.
    items.push({
      attractionId: attraction.id,
      attractionName: attraction.name,
      ticketType: item.ticketType,
      quantity: item.quantity,
      unitPrice: attraction.prices[item.ticketType],
    });
  }

  return { items };
}

export function validateOrderRequest(
  body: unknown,
  now = new Date(),
): ValidationResult {
  if (!isRecord(body)) {
    return { success: false, fieldErrors: { form: "Invalid request body" } };
  }

  const fieldErrors: Record<string, string> = {};
  if (typeof body.fullName !== "string" || body.fullName.trim() === "") {
    fieldErrors.fullName = "Full name is required";
  }
  if (
    typeof body.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())
  ) {
    fieldErrors.email = "Enter a valid email address";
  }

  const phone =
    typeof body.phone === "string" ? body.phone.replace(/[\s().-]/g, "") : "";
  if (!/^(?:0|\+84)(?:[35789]\d{8}|2\d{9})$/.test(phone)) {
    fieldErrors.phone = "Enter a valid Vietnamese phone number";
  }

  const visitDate = typeof body.visitDate === "string" ? body.visitDate : "";
  const dateError = getVisitDateError(visitDate, now);
  if (dateError) fieldErrors.visitDate = dateError;
  if (body.acceptTerms !== true)
    fieldErrors.acceptTerms = "You must accept the terms";

  const parsed = parseOrderItems(body.items);
  if (parsed.error) fieldErrors.items = parsed.error;

  const promoCode =
    typeof body.promoCode === "string"
      ? body.promoCode.trim().toUpperCase()
      : "";
  const promo = promoCodes.find((entry) => entry.code === promoCode);
  if (body.promoCode !== undefined && typeof body.promoCode !== "string") {
    fieldErrors.promoCode = "Enter a valid promo code";
  } else if (promoCode !== "" && !promo) {
    fieldErrors.promoCode = "Promo code not found";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  const subtotal = parsed.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const discount = promo
    ? Math.round((subtotal * promo.discountPercent) / 100)
    : 0;
  return {
    success: true,
    data: {
      items: parsed.items,
      visitDate,
      ...(promoCode ? { promoCode } : {}),
      subtotal,
      discount,
      total: subtotal - discount,
    },
  };
}
