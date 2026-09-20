export type TicketType = "ADULT" | "CHILD" | "SENIOR";
export type Category = "THRILL" | "FAMILY" | "KIDS" | "SHOW" | "WATER";
export interface CategoryOption {
  value: Category;
  label: string;
}

export interface TicketOption {
  type: TicketType;
  label: string;
}

export interface Park {
  id: string;
  name: string;
  city: string;
}

export interface Attraction {
  id: string;
  name: string;
  parkId: string;
  category: Category;
  description: string;
  images: string[];
  rating: number; // 0 - 5
  prices: Record<TicketType, number>; // VND
}

export interface AttractionListResponse {
  data: Attraction[];
  total: number;
  page: number;
  limit: number;
}
