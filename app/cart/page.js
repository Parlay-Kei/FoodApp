"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Navbar from '../../components/Navbar';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [serviceFee, setServiceFee] = useState(0);
  const [total, setTotal] = useState(0);
  const [pickupTime, setPickupTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [availablePickupTimes, setAvailablePickupTimes] = useState([]);
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Load cart items from local storage
    const loadCart = () => {
      const cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
      setCartItems(cart);
      
      // Calculate subtotal
      const subtotalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      setSubtotal(subtotalAmount);
      
      // Calculate service fee (10% of subtotal)
      const feeAmount = subtotalAmount * 0.10;
      setServiceFee(feeAmount);
      
      // Calculate total
      setTotal(subtotalAmount + feeAmount);
    };
    
    loadCart();
    generatePickupTimes();
  }, []);

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
  const updateQuantity = (id, newQuantity) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === id) {
        // Ensure quantity doesn't exceed available stock
        const quantity = Math.min(Math.max(1, newQuantity), item.max_quantity);
        return { ...item, quantity };
      }
      return item;
    });
    
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Recalculate totals
    const subtotalAmount = updatedCart.reduce((total, item) => total + (item.price * item.quantity), 0);
    setSubtotal(subtotalAmount);
    
    const feeAmount = subtotalAmount * 0.10;
    setServiceFee(feeAmount);
    
    setTotal(subtotalAmount + feeAmount);
    
    // Trigger storage event for navbar to update cart count
    window.dispatchEvent(new Event('storage'));
  };

  // Remove item from cart
  const removeItem = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Recalculate totals
    const subtotalAmount = updatedCart.reduce((total, item) => total + (item.price * item.quantity), 0);
    setSubtotal(subtotalAmount);
    
    const feeAmount = subtotalAmount * 0.10;
    setServiceFee(feeAmount);
    
    setTotal(subtotalAmount + feeAmount);
    
    toast.success('Item removed from cart');
    
    // Trigger storage event for navbar to update cart count
    window.dispatchEvent(new Event('storage'));
  };

  // Handle checkout process
  const handleCheckout = async () => {
    if (!pickupTime) {
      toast.error('Please select a pickup time');
      return;
    }
    
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
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
          items: cartItems,
          total: total,
          pickupTime: pickupTime
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'An error occurred during checkout');
      }
      
      // Clear cart
      localStorage.removeItem('cart');
      
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
        
        {cartItems.length === 0 ? (
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
                {cartItems.map(item => (
                  <div key={item.id} className="p-4 flex">
                    <div className="relative h-20 w-20 flex-shrink-0">
                      <Image 
                        src={item.image || 'https://placehold.co/200x200?text=Food'} 
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
                        <div className="flex items-center border rounded">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="px-2 py-1">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            disabled={item.quantity >= item.max_quantity}
                          >
                            +
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-sm text-red-500 hover:text-red-700"
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
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Fee (10%)</span>
                    <span>${serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t">
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
