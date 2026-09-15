export type TicketType = "ADULT" | "CHILD" | "SENIOR";
export type Category = "THRILL" | "FAMILY" | "KIDS" | "SHOW" | "WATER";

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
