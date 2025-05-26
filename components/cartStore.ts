import { create } from 'zustand';

export interface CartItem {
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (name: string) => void;
  clearCart: () => void;
  subtotal: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => {
    set((state) => {
      const existing = state.items.find((i) => i.name === item.name);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity: 1 }] };
    });
  },
  removeItem: (name) => {
    set((state) => ({
      items: state.items.filter((i) => i.name !== name),
    }));
  },
  clearCart: () => set({ items: [] }),
  subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
})); 