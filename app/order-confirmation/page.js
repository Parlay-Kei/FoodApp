"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import EmailConfirmation from '../../components/EmailConfirmation';

export default function OrderConfirmation() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const total = searchParams.get('total') || '0.00';
  
  // Use effect to create a static order object
  useEffect(() => {
    // Create a static order object based on URL parameters
    const staticOrder = {
      id: orderId || 'mock-' + Date.now().toString(),
      status: 'pending',
      created_at: new Date().toISOString(),
      total: total,
      pickup_time: new Date(Date.now() + 30 * 60000).toISOString() // 30 minutes from now
    };
    
    // Set the order and finish loading
    setOrder(staticOrder);
    setLoading(false);
    
    // Show a success toast
    toast.success('Order placed successfully!');
  }, [orderId, total]);

  // Format date for display
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto p-4 flex justify-center items-center h-64">
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto p-4 text-center py-10">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="mb-6">We couldn't find the order you're looking for.</p>
          <Link href="/menu" className="btn-primary">
            Return to Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto p-4">
        <div className="card p-6 text-center mb-6">
          <div className="text-5xl text-green-500 mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-2">Thank You for Your Order!</h1>
          <p className="text-gray-600 mb-4">
            Your order has been received and is being prepared.
          </p>
          <div className="bg-gray-100 rounded-lg p-3 inline-block">
            <p className="font-medium">Order #{orderId.slice(0, 8)}</p>
          </div>
        </div>
        
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Items</h2>
          <div className="divide-y">
            <div className="py-3 flex justify-between">
              <div>
                <span className="font-medium">Deluxe Burger</span>
                <span className="text-gray-600 ml-2">x2</span>
              </div>
              <span>$15.98</span>
            </div>
            <div className="py-3 flex justify-between">
              <div>
                <span className="font-medium">French Fries</span>
                <span className="text-gray-600 ml-2">x1</span>
              </div>
              <span>$3.99</span>
            </div>
            <div className="py-3 flex justify-between">
              <div>
                <span className="font-medium">Chocolate Shake</span>
                <span className="text-gray-600 ml-2">x1</span>
              </div>
              <span>$4.99</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t flex justify-between font-semibold">
            <span>Total</span>
            <span>${parseFloat(order?.total || '24.96').toFixed(2)}</span>
          </div>
        </div>
        
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Pickup Information</h2>
          
          <div className="flex items-center mb-4">
            <div className="bg-primary bg-opacity-10 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Pickup Time</p>
              <p className="text-gray-600">{formatDateTime(order.pickup_time)}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="bg-primary bg-opacity-10 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Pickup Location</p>
              <p className="text-gray-600">Food Truck Location</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Confirmation</h2>
          <p className="mb-4">
            Would you like to receive an email confirmation for your order?
          </p>
          
          {/* Import the EmailConfirmation component */}
          <div className="mt-4">
            <EmailConfirmation orderId={orderId} userEmail="" />
          </div>
        </div>
        
        <div className="flex justify-center space-x-4 mb-8">
          <Link href={`/order-status?id=${orderId}`} className="btn-primary">
            Track Order
          </Link>
          <Link href="/menu" className="btn-outline">
            Order More
          </Link>
        </div>
      </main>
    </div>
  );
}
