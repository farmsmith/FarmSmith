// Cart item stored in state — denormalized so we can render without refetching
export interface CartItem {
  productId: string;
  quantity: number;
  // Denormalized product info for rendering
  name: string;
  price: number;       // in INR, e.g. 299.00
  currency: string;    // "INR"
  unit: string | null; // e.g. "100g" or null
  imageUrl: string | null;
  imageAlt: string | null;
  slug: string;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean; // drawer open/closed
}

export type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { productId: string } }
  | { type: "UPDATE_QTY"; payload: { productId: string; quantity: number } }
  | { type: "CLEAR" }
  | { type: "OPEN_DRAWER" }
  | { type: "CLOSE_DRAWER" }
  | { type: "HYDRATE"; payload: CartItem[] };
