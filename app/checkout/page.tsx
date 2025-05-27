'use client';

import React, { useState } from 'react';
import { useCartStore } from '../../components/cartStore';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const CheckoutPage: React.FC = () => {
  const { items, subtotal, clearCart } = useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickupTime, setPickupTime] = useState('ASAP'); // Mock pickup time

  const handlePlaceOrder = async () => {
    setError(null);
    setLoading(true);

    // Setup a timeout to detect network issues
    const timeoutId = setTimeout(() => {
      if (loading) {
        setError('The request is taking longer than expected. Please check your connection.');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    try {
      // Get the actual user ID from Supabase auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error('Authentication error: ' + userError.message);
      }
      
      if (!user) {
        throw new Error('You must be signed in to place an order');
      }

      if (items.length === 0) {
        setError('Cannot place an empty order');
        toast.error('Your cart is empty');
        setLoading(false);
        clearTimeout(timeoutId);
        return;
      }

      // 1. Insert into the orders table
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            total: subtotal(),
            pickup_time: pickupTime === 'ASAP' 
              ? new Date().toISOString() 
              : new Date(Date.now() + getPickupTimeMinutes(pickupTime) * 60000).toISOString(),
            status: 'received',
          },
        ])
        .select()
        .single();

      if (orderError || !order) {
        throw new Error('Error creating order: ' + (orderError?.message || 'Unknown error'));
      }

      // 2. Prepare and insert into the order_items table
      const orderItemsToInsert = items.map(item => ({
        order_id: order.id,
        // IMPORTANT: Replace with actual menu_item_id from your menu_items table
        // This mock uses item name as a placeholder, which is NOT correct for a real FK relationship
        // You would need to map cart item names to actual menu_item_ids
        menu_item_id: '00000000-0000-0000-0000-' + item.name.replace(/\s+/g, '').toLowerCase().substring(0, 12).padEnd(12, '0'), // MOCK UUID based on name
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (orderItemsError) {
        // If order items fail, delete the order to maintain consistency
        await supabase.from('orders').delete().eq('id', order.id);
        throw new Error('Error adding items to order: ' + orderItemsError.message);
      }

      // 3. Clear cart and redirect to order status page with new order ID
      await clearCart();
      toast.success('Order placed successfully!');
      clearTimeout(timeoutId);
      setLoading(false);
      router.push(`/order-status?orderId=${order.id}`);

    } catch (error) {
      clearTimeout(timeoutId);
      setLoading(false);
      
      let errorMessage = 'An unexpected error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Order placement error:', error);
    }
  };
  
  // Helper function to convert pickup time selection to minutes
  const getPickupTimeMinutes = (pickupTime: string): number => {
    switch(pickupTime) {
      case '15min': return 15;
      case '30min': return 30;
      case '1hour': return 60;
      default: return 0; // ASAP
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background text-text dark:text-dark-text transition-colors duration-200 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-primary dark:text-dark-primary mb-6">Checkout</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <button 
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setError(null)}
              aria-label="Dismiss error"
            >
              <span className="text-red-500 hover:text-red-700">×</span>
            </button>
          </div>
        )}

        {/* Order Summary */}
        <section className="bg-white dark:bg-dark-background/50 rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="font-display text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.name} className="flex justify-between items-center text-sm">
                <span className="text-text/80 dark:text-dark-text/80">{item.quantity}x {item.name}</span>
                <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-primary/10 dark:border-dark-primary/10 pt-4 flex justify-between items-center font-bold text-lg">
              <span>Subtotal</span>
              <span>${subtotal().toFixed(2)}</span>
            </div>
            {/* Add Service Fee/Tax later */}
          </div>
        </section>

        {/* Pickup Details */}
        <section className="bg-white dark:bg-dark-background/50 rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="font-display text-xl font-semibold mb-4">Pickup Details</h2>
          {/* Mock Pickup Time Selector */}
          <div>
            <label htmlFor="pickup-time" className="block text-sm font-medium text-text/80 dark:text-dark-text/80 mb-2">Preferred Pickup Time</label>
            <select
              id="pickup-time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background dark:bg-dark-background/80 border border-primary/20 dark:border-dark-primary/20 text-text dark:text-dark-text"
            >
              <option value="ASAP">ASAP</option>
              <option value="15min">In 15 minutes</option>
              <option value="30min">In 30 minutes</option>
              <option value="1hour">In 1 hour</option>
            </select>
          </div>
        </section>

        {/* Place Order Button */}
        <button
          onClick={handlePlaceOrder}
          disabled={items.length === 0 || loading}
          className={`w-full bg-gradient-to-r from-primary to-secondary dark:from-dark-primary dark:to-dark-secondary text-white font-semibold py-3 rounded-xl transition-opacity ${
            items.length === 0 || loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <LoadingSpinner size={"sm"} />
              <span>Placing Order...</span>
            </div>
          ) : 'Place My Order'}
        </button>

        {/* Optional: Add other sections like contact info toggle, promo code */}

      </div>
    </div>
  );
};

export default CheckoutPage; 