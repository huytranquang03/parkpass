import { useEffect, useReducer, type ReactNode } from "react";
import { cartReducer, initialCartState } from "./cartReducer";
import { CartContext } from "./cartContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { CartState } from "./types";

interface CartProviderProps {
  children: ReactNode;
}

const CART_STORAGE_KEY = "parkpass-cart";

export function CartProvider({ children }: CartProviderProps) {
  const [storedState, setStoredState] = useLocalStorage<CartState>(
    CART_STORAGE_KEY,
    initialCartState,
  );
  const [state, dispatch] = useReducer(cartReducer, storedState);

  useEffect(() => {
    setStoredState(state);
  }, [state, setStoredState]);

  const totalQuantity = state.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const totalPrice = state.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        totalQuantity,
        totalPrice,
        dispatch,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
