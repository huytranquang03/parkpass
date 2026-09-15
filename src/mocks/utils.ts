import type { TicketType } from "@/features/attractions/types";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isTicketType(value: unknown): value is TicketType {
  return value === "ADULT" || value === "CHILD" || value === "SENIOR";
}
