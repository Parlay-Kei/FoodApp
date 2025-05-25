"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';

export default function OrderStatus() {
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!orderId) {
      router.push('/menu');
      return;
    }
    
    async function fetchOrderDetails() {
      try {
        // Fetch order details
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();
          
        if (orderError) throw orderError;
        
        setOrder(orderData);
        
        // Fetch order items with menu item details
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            id,
            quantity,
            price,
            menu_items(id, name)
          `)
          .eq('order_id', orderId);
          
        if (itemsError) throw itemsError;
        
        setOrderItems(itemsData || []);
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrderDetails();
    
    // Set up real-time subscription to order status changes
    const subscription = supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`
      }, (payload) => {
        setOrder(payload.new);
      })
      .subscribe();
      
    // Poll for updates as a fallback
    const pollInterval = setInterval(() => {
      fetchOrderDetails();
    }, 30000); // Poll every 30 seconds
    
    return () => {
      subscription.unsubscribe();
      clearInterval(pollInterval);
    };
  }, [orderId, router, supabase]);

  // Format date for display
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get status information
  const getStatusInfo = (status) => {
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
          description: 'We&apos;re having trouble determining the status of your order.',
          color: 'gray',
          step: 0
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto p-4 flex justify-center items-center h-64">
          <p>Loading order status...</p>
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
          <p className="mb-6">We couldn&apos;t find the order you&apos;re looking for.</p>
          <Link href="/menu" className="btn-primary">
            Return to Menu
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto p-4">
        <div className="card p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Order Status</h1>
            <div className="bg-gray-100 rounded-lg p-2">
              <p className="font-medium">Order #{orderId.slice(0, 8)}</p>
            </div>
          </div>
          
          {/* Status Tracker */}
          <div className="mb-8">
            <div className="relative">
              {/* Progress Bar */}
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className={`h-full rounded-full bg-${statusInfo.color}-500`}
                  style={{ width: `${(statusInfo.step / 3) * 100}%` }}
                ></div>
              </div>
              
              {/* Status Points */}
              <div className="flex justify-between mt-2">
                <div className="text-center">
                  <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${statusInfo.step >= 1 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                    {statusInfo.step > 1 ? '✓' : '1'}
                  </div>
                  <p className="text-xs mt-1">Received</p>
                </div>
                
                <div className="text-center">
                  <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${statusInfo.step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                    {statusInfo.step > 2 ? '✓' : '2'}
                  </div>
                  <p className="text-xs mt-1">Preparing</p>
                </div>
                
                <div className="text-center">
                  <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${statusInfo.step >= 3 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                    3
                  </div>
                  <p className="text-xs mt-1">Ready</p>
                </div>
              </div>
            </div>
            
            {/* Current Status */}
            <div className={`mt-6 p-4 border-l-4 border-${statusInfo.color}-500 bg-${statusInfo.color}-50 rounded-r-lg`}>
              <h3 className="font-bold text-lg">{statusInfo.label}</h3>
              <p className="text-gray-600">{statusInfo.description}</p>
            </div>
          </div>
          
          {/* Pickup Information */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">Pickup Information</h3>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Pickup at: <span className="font-medium">{formatDateTime(order.pickup_time)}</span></p>
            </div>
          </div>
          
          {/* Order Summary */}
          <div>
            <h3 className="font-semibold mb-2">Order Summary</h3>
            <div className="divide-y">
              {orderItems.map(item => (
                <div key={item.id} className="py-2 flex justify-between">
                  <div>
                    <span className="font-medium">{item.quantity}x </span>
                    <span>{item.menu_items.name}</span>
                  </div>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="py-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contact Options */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Need Help?</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <a 
              href="tel:+15551234567" 
              className="btn-outline flex-1 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Us
            </a>
            <a 
              href="https://wa.me/15551234567" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-outline flex-1 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
