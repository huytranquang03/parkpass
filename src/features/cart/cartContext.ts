import { createContext, useContext, type Dispatch } from "react";
import type { CartAction, CartItem } from "./types";

export interface CartContextValue {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  dispatch: Dispatch<CartAction>;
}

export const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart phải được sử dụng bên trong CartProvider");
  }

  return context;
}
