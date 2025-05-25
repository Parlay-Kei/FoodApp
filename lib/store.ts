import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItemType } from '@/components/CartItem';

// Cart store types
interface CartState {
  items: CartItemType[];
  addItem: (item: CartItemType) => boolean;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

// User preferences store types
interface PreferencesState {
  darkMode: boolean;
  notificationsEnabled: boolean;
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
  setPreference: (key: keyof Omit<PreferencesState, 'toggleDarkMode' | 'toggleNotifications' | 'setPreference'>, value: boolean) => void;
}

// Cart store with persistence
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      // Add item to cart
      addItem: (item: CartItemType) => {
        const { items } = get();
        const existingItem = items.find(i => i.id === item.id);
        
        if (existingItem) {
          // Item exists, update quantity if not exceeding max
          if (existingItem.quantity < existingItem.max_quantity) {
            set({
              items: items.map(i => 
                i.id === item.id 
                  ? { ...i, quantity: i.quantity + 1 } 
                  : i
              )
            });
            return true;
          }
          return false; // Can't add more
        } else {
          // New item
          set({ items: [...items, { ...item, quantity: 1 }] });
          return true;
        }
      },
      
      // Update item quantity
      updateQuantity: (id: string, quantity: number) => {
        const { items } = get();
        const item = items.find(i => i.id === id);
        
        if (item) {
          // Ensure quantity doesn't exceed max or go below 1
          const newQuantity = Math.min(Math.max(1, quantity), item.max_quantity);
          
          set({
            items: items.map(i => 
              i.id === id 
                ? { ...i, quantity: newQuantity } 
                : i
            )
          });
        }
      },
      
      // Remove item from cart
      removeItem: (id: string) => {
        const { items } = get();
        set({ items: items.filter(i => i.id !== id) });
      },
      
      // Clear cart
      clearCart: () => set({ items: [] }),
      
      // Get cart total
      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      // Get cart item count
      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: 'food-truck-cart',
    }
  )
);

// User preferences store
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      darkMode: false,
      notificationsEnabled: true,
      
      toggleDarkMode: () => set(state => ({ darkMode: !state.darkMode })),
      toggleNotifications: () => set(state => ({ notificationsEnabled: !state.notificationsEnabled })),
      setPreference: (key, value) => set({ [key]: value })
    }),
    {
      name: 'food-truck-preferences',
    }
  )
); 