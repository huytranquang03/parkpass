import { beforeEach, describe, expect, it } from "vitest";
import type { CartItem } from "./types";
import {
  selectTotalPrice,
  selectTotalQuantity,
  useCartStore,
} from "./cartStore";

const adultTicket: CartItem = {
  attractionId: "attraction-1",
  attractionName: "Roller Coaster",
  ticketType: "ADULT",
  price: 150_000,
  quantity: 2,
};

const childTicket: CartItem = {
  attractionId: "attraction-1",
  attractionName: "Roller Coaster",
  ticketType: "CHILD",
  price: 100_000,
  quantity: 1,
};

beforeEach(() => {
  useCartStore.setState({ items: [] });
  localStorage.removeItem("parkpass-cart");
});

describe("cartStore", () => {
  it("adds new items and merges matching items up to ten", () => {
    useCartStore.getState().addItems([adultTicket, childTicket]);
    useCartStore.getState().addItems([
      {
        ...adultTicket,
        quantity: 9,
      },
    ]);

    expect(useCartStore.getState().items).toEqual([
      {
        ...adultTicket,
        quantity: 10,
      },
      childTicket,
    ]);
  });

  it("updates only the requested item and clamps its quantity", () => {
    useCartStore.getState().addItems([adultTicket, childTicket]);

    useCartStore
      .getState()
      .updateQuantity(adultTicket.attractionId, adultTicket.ticketType, 20);

    expect(useCartStore.getState().items[0]?.quantity).toBe(10);
    expect(useCartStore.getState().items[1]).toEqual(childTicket);

    useCartStore
      .getState()
      .updateQuantity(adultTicket.attractionId, adultTicket.ticketType, 0);

    expect(useCartStore.getState().items[0]?.quantity).toBe(1);
  });

  it("removes only the requested item", () => {
    useCartStore.getState().addItems([adultTicket, childTicket]);

    useCartStore
      .getState()
      .removeItem(adultTicket.attractionId, adultTicket.ticketType);

    expect(useCartStore.getState().items).toEqual([childTicket]);
  });

  it("clears every cart item", () => {
    useCartStore.getState().addItems([adultTicket, childTicket]);

    useCartStore.getState().clearCart();

    expect(useCartStore.getState().items).toEqual([]);
  });

  it("calculates total quantity and price through selectors", () => {
    useCartStore.getState().addItems([adultTicket, childTicket]);

    const state = useCartStore.getState();

    expect(selectTotalQuantity(state)).toBe(3);
    expect(selectTotalPrice(state)).toBe(400_000);
  });

  it("persists cart items in localStorage", () => {
    useCartStore.getState().addItems([adultTicket]);

    const storedCart = JSON.parse(
      localStorage.getItem("parkpass-cart") ?? "null",
    ) as {
      state: {
        items: CartItem[];
      };
    } | null;

    expect(storedCart?.state.items).toEqual([adultTicket]);
  });
});
