import type { TicketType } from "../attractions/types";

export interface CartItem {
  attractionId: string;
  attractionName: string;
  imageUrl?: string;
  ticketType: TicketType;
  price: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}

export type CartAction =
  | {
      type: "ADD_ITEMS";
      payload: CartItem[];
    }
  | {
      type: "UPDATE_QUANTITY";
      payload: {
        attractionId: string;
        ticketType: TicketType;
        quantity: number;
      };
    }
  | {
      type: "REMOVE_ITEM";
      payload: {
        attractionId: string;
        ticketType: TicketType;
      };
    }
  | {
      type: "CLEAR_CART";
    };
