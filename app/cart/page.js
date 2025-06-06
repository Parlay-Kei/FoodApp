"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Navbar from '../../components/Navbar';
import { useCartStore } from '../../components/cartStore';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Cart() {
  // Use the cart store instead of local state
  const { 
    items: cartItems, 
    isLoading: cartLoading, 
    error: cartError,
    subtotal: getSubtotal,
    itemCount,
    updateQuantity: updateCartQuantity,
    removeItem: removeCartItem,
    fetchCart
  } = useCartStore();
  
  const [serviceFee, setServiceFee] = useState(0);
  const [total, setTotal] = useState(0);
  const [pickupTime, setPickupTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [availablePickupTimes, setAvailablePickupTimes] = useState([]);
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Function to load cart items from localStorage as a fallback
  const loadCartFromLocalStorage = () => {
    if (typeof window === 'undefined') return [];
    
    try {
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        return JSON.parse(localCart);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
    return [];
  };
  
  // State for fallback cart items
  const [fallbackItems, setFallbackItems] = useState([]);
  // State to track if we're using the fallback
  const [usingFallback, setUsingFallback] = useState(false);
  
  useEffect(() => {
    console.log('Cart page mounted, fetching cart items...');
    // Fetch cart items from the store
    fetchCart();
    generatePickupTimes();
    
    // Load fallback items from localStorage immediately
    const localItems = loadCartFromLocalStorage();
    if (localItems.length > 0) {
      console.log('Loaded localStorage fallback for cart items:', localItems);
      setFallbackItems(localItems);
    }
  }, [fetchCart]);
  
  // Check if we need to use fallback items
  useEffect(() => {
    // If cart is empty after loading completes, use fallback if available
    if (!cartLoading && cartItems.length === 0 && fallbackItems.length > 0) {
      console.log('Using localStorage fallback items');
      setUsingFallback(true);
    } else if (cartItems.length > 0) {
      // If we have real cart items, don't use fallback
      setUsingFallback(false);
    }
  }, [cartItems, cartLoading, fallbackItems]);
  
  // Constants for calculations
  const SERVICE_FEE_PERCENTAGE = 0.10;

  // Helper function to calculate cart totals
  const calculateCartTotals = (items) => {
    try {
      // Use reduce with proper decimal handling
      const subtotal = items.reduce((total, item) => {
        // Ensure price and quantity are valid numbers
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        return total + (price * quantity);
      }, 0);
      
      // Calculate service fee with proper rounding to 2 decimal places
      const fee = Math.round(subtotal * SERVICE_FEE_PERCENTAGE * 100) / 100;
      const total = Math.round((subtotal + fee) * 100) / 100;
      
      return { subtotal, fee, total };
    } catch (error) {
      console.error('Error calculating cart totals:', error);
      return { subtotal: 0, fee: 0, total: 0 };
    }
  };

  // Update service fee and total whenever relevant data changes
  useEffect(() => {
    // Skip calculations if cart is still loading and not using fallback
    if (cartLoading && !usingFallback) return;
    
    // Determine which items to use for calculations
    const itemsToUse = usingFallback ? fallbackItems : cartItems;
    
    // Calculate totals
    const { subtotal, fee, total } = calculateCartTotals(itemsToUse);
    
    // Update state
    setServiceFee(fee);
    setTotal(total);
  }, [cartLoading, cartItems, usingFallback, fallbackItems]);

  // Generate pickup times in 15-minute intervals for the next 3 hours
  const generatePickupTimes = () => {
    const times = [];
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
    
    setAvailablePickupTimes(times);
  };

  // Update item quantity
  const updateQuantity = async (name, newQuantity) => {
    try {
      // Ensure quantity is at least 1
      const quantity = Math.max(1, newQuantity);
      
      if (usingFallback) {
        // Update in localStorage if using fallback
        const updatedItems = fallbackItems.map(item => {
          if (item.name === name || item.id === name) {
            return { ...item, quantity };
          }
          return item;
        });
        
        setFallbackItems(updatedItems);
        localStorage.setItem('cart', JSON.stringify(updatedItems));
        toast.success('Updated quantity');
      } else {
        // Use cart store if not using fallback
        await updateCartQuantity(name, quantity);
      }
      
      // Service fee and total are updated via the useEffect hook
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  // Remove item from cart
  const removeItem = async (name) => {
    try {
      if (usingFallback) {
        // Remove from localStorage if using fallback
        const updatedItems = fallbackItems.filter(item => 
          item.name !== name && item.id !== name
        );
        
        setFallbackItems(updatedItems);
        localStorage.setItem('cart', JSON.stringify(updatedItems));
        toast.success('Item removed from cart');
        
        // If no items left, show empty cart
        if (updatedItems.length === 0) {
          setUsingFallback(false);
        }
      } else {
        // Use cart store if not using fallback
        await removeCartItem(name);
      }
      // Service fee and total are updated via the useEffect hook
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  // Handle checkout process
  const handleCheckout = async () => {
    if (!pickupTime) {
      toast.error('Please select a pickup time');
      return;
    }
    
    // Get the items to use for checkout (either fallback or cart store)
    const itemsToUse = usingFallback ? fallbackItems : cartItems;
    
    if (itemsToUse.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    // If cart is still loading and not using fallback, wait
    if (cartLoading && !usingFallback) {
      toast.error('Please wait while we load your cart');
      return;
    }
    
    // Recalculate totals to ensure consistency
    const { total: calculatedTotal } = calculateCartTotals(itemsToUse);
    
    setLoading(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please login to checkout');
        router.push('/login');
        return;
      }
      
      // Use our checkout API endpoint instead of direct database operations
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: itemsToUse,
          total: calculatedTotal, // Use the freshly calculated total
          serviceFeePercentage: SERVICE_FEE_PERCENTAGE,
          pickupTime: pickupTime
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'An error occurred during checkout');
      }
      
      // Clear cart based on which storage we're using
      if (usingFallback) {
        // Clear localStorage cart
        localStorage.removeItem('cart');
        setFallbackItems([]);
        setUsingFallback(false);
      } else {
        // Clear cart using the cart store
        await useCartStore.getState().clearCart();
      }
      
      // Redirect to order confirmation page
      router.push(`/order-confirmation?id=${result.order.id}`);
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('An error occurred during checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        
        {cartLoading ? (
          <div className="text-center py-8 flex flex-col items-center">
            <LoadingSpinner size={"medium"} />
            <p className="text-lg mt-4">Loading your cart...</p>
          </div>
        ) : cartItems.length === 0 && !usingFallback ? (
          <div className="text-center py-8">
            <p className="text-lg mb-4">Your cart is empty</p>
            <button 
              onClick={() => router.push('/menu')}
              className="btn-primary"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Cart Items */}
            <div className="md:w-2/3">
              <div className="card divide-y">
                {(usingFallback ? fallbackItems : cartItems).map(item => (
                  <div key={item.name || item.id} className="p-4 flex">
                    <div className="relative h-20 w-20 flex-shrink-0">
                      <Image 
                        src={item.imageUrl || item.image || 'https://placehold.co/200x200?text=Food'} 
                        alt={item.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="rounded"
                      />
                    </div>
                    
                    <div className="ml-4 flex-grow">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{item.name}</h3>
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      
                      <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                      
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => updateQuantity(item.name, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                            disabled={item.quantity <= 1}
                          >
                            {cartLoading ? <LoadingSpinner size={"xs"} /> : '-'}
                          </button>
                          <span className="text-center w-8">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.name, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                          >
                            {cartLoading ? <LoadingSpinner size={"xs"} /> : '+'}
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => removeItem(item.name)}
                          className="text-sm text-red-500 hover:text-red-700"
                          disabled={cartLoading}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="md:w-1/3">
              <div className="card p-4">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center border-t pt-4">
                    <span className="font-semibold">Subtotal</span>
                    <span>${usingFallback ? 
                      calculateCartTotals(fallbackItems).subtotal.toFixed(2) : 
                      getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Service Fee (10%)</span>
                    <span>${serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="pickupTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Pickup Time
                  </label>
                  <select
                    id="pickupTime"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Select a time</option>
                    {availablePickupTimes.map((time, index) => (
                      <option key={index} value={time.value}>
                        {time.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={handleCheckout}
                  disabled={loading || cartItems.length === 0 || !pickupTime}
                  className={`btn-primary w-full ${(loading || cartItems.length === 0 || !pickupTime) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Processing...' : 'Proceed to Checkout'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
