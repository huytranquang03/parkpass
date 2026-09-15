import type { TicketType } from "../attractions/types";

export interface OrderItem {
  attractionId: string;
  attractionName: string;
  ticketType: TicketType;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  visitDate: string;
  promoCode?: string;
  subtotal: number;
  discount: number;
  total: number;
  status: "PENDING" | "PAID" | "CANCELLED";
  createdAt: string;
}

export interface CreateOrderItem {
  attractionId: string;
  ticketType: TicketType;
  quantity: number;
}

export interface CreateOrderRequest {
  items: CreateOrderItem[];
  fullName: string;
  email: string;
  phone: string;
  visitDate: string;
  promoCode?: string;
  acceptTerms: boolean;
}
