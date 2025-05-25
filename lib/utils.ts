// Types for order status
export interface OrderStatusInfo {
  label: string;
  description: string;
  color: 'yellow' | 'blue' | 'green' | 'gray';
  step: number;
}

// Types for pickup time options
export interface PickupTimeOption {
  value: string;
  label: string;
}

// Format date for display
export const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Format date with day for display
export const formatDateWithDay = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Generate pickup times in 15-minute intervals for the next 3 hours
export const generatePickupTimes = (): PickupTimeOption[] => {
  const times: PickupTimeOption[] = [];
  const now = new Date();
  const startTime = new Date(now);
  
  // Round up to the next 15-minute interval and add 30 minutes preparation time
  startTime.setMinutes(Math.ceil(now.getMinutes() / 15) * 15 + 30);
  startTime.setSeconds(0);
  startTime.setMilliseconds(0);
  
  // Generate times for the next 3 hours in 15-minute intervals
  for (let i = 0; i < 12; i++) { // 12 intervals of 15 minutes = 3 hours
    const timeOption = new Date(startTime);
    timeOption.setMinutes(startTime.getMinutes() + (i * 15));
    
    times.push({
      value: timeOption.toISOString(),
      label: timeOption.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }
  
  return times;
};

// Get status information based on order status
export const getOrderStatusInfo = (status: string): OrderStatusInfo => {
  switch (status) {
    case 'pending':
      return {
        label: 'Order Received',
        description: 'Your order has been received and is waiting to be prepared.',
        color: 'yellow',
        step: 1
      };
    case 'in_progress':
      return {
        label: 'In Progress',
        description: 'Your food is being prepared by our chefs.',
        color: 'blue',
        step: 2
      };
    case 'ready':
      return {
        label: 'Ready for Pickup',
        description: 'Your order is ready! Come pick it up at the food truck.',
        color: 'green',
        step: 3
      };
    default:
      return {
        label: 'Unknown Status',
        description: 'We\'re having trouble determining the status of your order.',
        color: 'gray',
        step: 0
      };
  }
}; 