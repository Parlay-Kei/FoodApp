import { create } from 'zustand';

export type OrderStatus = 'order-received' | 'preparing' | 'ready' | 'picked-up';

interface OrderStep {
  id: OrderStatus;
  label: string;
  icon: string;
  timestamp: string | null;
}

const ORDER_STEPS: OrderStep[] = [
  {
    id: 'order-received',
    label: 'Order Received',
    icon: '🧾',
    timestamp: null,
  },
  {
    id: 'preparing',
    label: 'Being Prepared',
    icon: '👩‍🍳',
    timestamp: null,
  },
  {
    id: 'ready',
    label: 'Ready for Pickup',
    icon: '✅',
    timestamp: null,
  },
  {
    id: 'picked-up',
    label: 'Picked Up',
    icon: '🚗',
    timestamp: null,
  },
];

interface OrderState {
  orderId: string;
  status: OrderStatus;
  eta: string;
  steps: OrderStep[];
  items: { name: string; quantity: number }[];
  total: number;
  pickupLocation: string;
  startMockUpdates: () => void;
  stopMockUpdates: () => void;
}

export const useOrderStatusStore = create<OrderState>((set, get) => ({
  orderId: '#MM-1742',
  status: 'order-received',
  eta: '12:45 PM',
  steps: ORDER_STEPS.map(step => ({
    ...step,
    timestamp: step.id === 'order-received' ? new Date().toLocaleTimeString() : null,
  })),
  items: [
    { name: 'Classic Burger', quantity: 2 },
    { name: 'Veggie Burger', quantity: 1 },
    { name: 'Fries', quantity: 2 },
  ],
  total: 29.97,
  pickupLocation: '123 Main St, Downtown',
  startMockUpdates: () => {
    const updateInterval = setInterval(() => {
      const { status, steps } = get();
      const currentIndex = ORDER_STEPS.findIndex(step => step.id === status);
      
      if (currentIndex < ORDER_STEPS.length - 1) {
        const nextStatus = ORDER_STEPS[currentIndex + 1].id;
        const updatedSteps = steps.map(step => ({
          ...step,
          timestamp: step.id === nextStatus ? new Date().toLocaleTimeString() : step.timestamp,
        }));
        
        set({ status: nextStatus, steps: updatedSteps });
      } else {
        get().stopMockUpdates();
      }
    }, 15000); // Update every 15 seconds

    // Store the interval ID in the store
    set({ _updateInterval: updateInterval });
  },
  stopMockUpdates: () => {
    const { _updateInterval } = get() as any;
    if (_updateInterval) {
      clearInterval(_updateInterval);
      set({ _updateInterval: undefined });
    }
  },
})); 