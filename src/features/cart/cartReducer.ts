import type { CartAction, CartItem, CartState } from "./types";

export const initialCartState: CartState = { items: [] };

function isSameItem(firstItem: CartItem, secondItem: CartItem) {
  return (
    firstItem.attractionId === secondItem.attractionId &&
    firstItem.ticketType === secondItem.ticketType
  );
}

function addItem(state: CartState, newItem: CartItem): CartState {
  if (newItem.quantity <= 0) {
    return state;
  }

  const existingItem = state.items.find((item) => isSameItem(item, newItem));
  if (!existingItem) {
    return { items: [...state.items, newItem] };
  }
  return {
    items: state.items.map((item) => {
      if (!isSameItem(item, newItem)) {
        return item;
      }
      return {
        ...item,
        quantity: Math.min(10, item.quantity + newItem.quantity),
      };
    }),
  };
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEMS":
      return action.payload.reduce(
        (currentState, item) => addItem(currentState, item),
        state,
      );
    case "UPDATE_QUANTITY": {
      const { attractionId, ticketType, quantity } = action.payload;
      return {
        items: state.items.map((item) => {
          const isTargetItem =
            item.attractionId === attractionId &&
            item.ticketType === ticketType;
          if (!isTargetItem) {
            return item;
          }
          return { ...item, quantity: Math.min(10, Math.max(1, quantity)) };
        }),
      };
    }
    case "REMOVE_ITEM": {
      const { attractionId, ticketType } = action.payload;
      return {
        items: state.items.filter(
          (item) =>
            item.attractionId !== attractionId ||
            item.ticketType !== ticketType,
        ),
      };
    }
    case "CLEAR_CART":
      return initialCartState;
    default:
      return state;
  }
}
