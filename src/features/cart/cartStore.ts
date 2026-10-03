import { create } from "zustand";
import type { TicketType } from "../attractions/types";
import type { CartItem, CartState } from "./types";
import { persist } from "zustand/middleware";

interface CartStore extends CartState {
  addItems: (items: CartItem[]) => void;
  updateQuantity: (
    attractionId: string,
    ticketType: TicketType,
    quantity: number,
  ) => void;
  removeItem: (attractionId: string, ticketType: TicketType) => void;
  clearCart: () => void;
}

function isSameItem(firstItem: CartItem, secondItem: CartItem) {
  return (
    firstItem.attractionId === secondItem.attractionId &&
    firstItem.ticketType === secondItem.ticketType
  );
}

function addItem(currentItems: CartItem[], newItem: CartItem): CartItem[] {
  if (newItem.quantity <= 0) {
    return currentItems;
  }
  const existingItem = currentItems.find((item) => isSameItem(item, newItem));

  if (!existingItem) {
    return [...currentItems, newItem];
  }
  return currentItems.map((item) =>
    isSameItem(item, newItem)
      ? {
          ...item,
          quantity: Math.min(10, item.quantity + newItem.quantity),
        }
      : item,
  );
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],

      addItems: (newItems) => {
        set((state) => ({
          items: newItems.reduce(
            (currentItems, newItem) => addItem(currentItems, newItem),
            state.items,
          ),
        }));
      },

      updateQuantity: (attractionId, ticketType, quantity) => {
        set((state) => ({
          items: state.items.map((item) => {
            const isTargetItem =
              item.attractionId === attractionId &&
              item.ticketType === ticketType;

            if (!isTargetItem) {
              return item;
            }

            return {
              ...item,
              quantity: Math.min(10, Math.max(1, quantity)),
            };
          }),
        }));
      },

      removeItem: (attractionId, ticketType) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              item.attractionId !== attractionId ||
              item.ticketType !== ticketType,
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },
    }),
    {
      name: "parkpass-cart",

      partialize: (state) => ({
        items: state.items,
      }),
    },
  ),
);

export const selectTotalQuantity = (state: CartStore) => {
  return state.items.reduce((total, item) => total + item.quantity, 0);
};

export const selectTotalPrice = (state: CartStore) =>
  state.items.reduce((total, item) => total + item.price * item.quantity, 0);

// const totalQuantity = useCartStore(selectTotalQuantity);
// const totalQuantity = useCartStore((state) => {
//   return state.items.reduce((total, item) => total + item.quantity, 0);
// });
