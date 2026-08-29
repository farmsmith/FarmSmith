import type { CartState, CartAction, CartItem } from "./types";

const MAX_QTY = 50;

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, items: action.payload };

    case "ADD_ITEM": {
      const existing = state.items.find(
        (i) => i.productId === action.payload.productId
      );
      if (existing) {
        // Increment quantity, capped at MAX_QTY
        return {
          ...state,
          items: state.items.map((i) =>
            i.productId === action.payload.productId
              ? { ...i, quantity: Math.min(i.quantity + action.payload.quantity, MAX_QTY) }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          { ...action.payload, quantity: Math.min(action.payload.quantity, MAX_QTY) },
        ],
      };
    }

    case "UPDATE_QTY": {
      const qty = Math.max(1, Math.min(action.payload.quantity, MAX_QTY));
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === action.payload.productId ? { ...i, quantity: qty } : i
        ),
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.productId !== action.payload.productId),
      };

    case "CLEAR":
      return { ...state, items: [] };

    case "OPEN_DRAWER":
      return { ...state, isOpen: true };

    case "CLOSE_DRAWER":
      return { ...state, isOpen: false };

    default:
      return state;
  }
}

export const initialCartState: CartState = {
  items: [],
  isOpen: false,
};

// Helper: total item count (sum of quantities)
export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

// Helper: subtotal in INR (client-cached — not trusted at checkout)
export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}
