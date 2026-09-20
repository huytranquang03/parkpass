import { describe, expect, it } from "vitest";
import type { CartItem, CartState } from "./types";
import { cartReducer, initialCartState } from "./cartReducer";

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

describe("cartReducer", () => {
  it("adds new items without mutating the previous state", () => {
    const previousState = initialCartState;

    const nextState = cartReducer(previousState, {
      type: "ADD_ITEMS",
      payload: [adultTicket, childTicket],
    });

    expect(nextState.items).toEqual([adultTicket, childTicket]);
    expect(nextState).not.toBe(previousState);
    expect(previousState.items).toEqual([]);
  });

  it("merges an existing item and caps its quantity at ten", () => {
    const state: CartState = {
      items: [{ ...adultTicket, quantity: 8 }],
    };

    const nextState = cartReducer(state, {
      type: "ADD_ITEMS",
      payload: [{ ...adultTicket, quantity: 4 }],
    });

    expect(nextState.items[0]?.quantity).toBe(10);
    expect(state.items[0]?.quantity).toBe(8);
  });

  it("updates the requested item quantity", () => {
    const state: CartState = {
      items: [adultTicket, childTicket],
    };

    const nextState = cartReducer(state, {
      type: "UPDATE_QUANTITY",
      payload: {
        attractionId: adultTicket.attractionId,
        ticketType: adultTicket.ticketType,
        quantity: 5,
      },
    });

    expect(nextState.items[0]?.quantity).toBe(5);
    expect(nextState.items[1]).toBe(childTicket);
    expect(state.items[0]?.quantity).toBe(2);
  });

  it("removes only the requested item", () => {
    const state: CartState = {
      items: [adultTicket, childTicket],
    };

    const nextState = cartReducer(state, {
      type: "REMOVE_ITEM",
      payload: {
        attractionId: adultTicket.attractionId,
        ticketType: adultTicket.ticketType,
      },
    });

    expect(nextState.items).toEqual([childTicket]);
    expect(state.items).toHaveLength(2);
  });

  it("clears every cart item", () => {
    const state: CartState = {
      items: [adultTicket, childTicket],
    };

    const nextState = cartReducer(state, { type: "CLEAR_CART" });

    expect(nextState).toEqual(initialCartState);
  });
});
