"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchOrders() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            created_at,
            total,
            status,
            pickup_time,
            order_items(quantity, menu_items(id, name, price, image_url))
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching orders:', error);
          toast.error('Failed to load order history');
        } else {
          setOrders(data || []);
        }
      }
      
      setLoading(false);
    }

    fetchOrders();
  }, [supabase]);

  const handleReorder = async (orderId) => {
    // Find the order to reorder
    const orderToReorder = orders.find(order => order.id === orderId);
    
    if (!orderToReorder) {
      toast.error('Order not found');
      return;
    }
    
    // Get the cart from local storage or initialize it
    const cartItems = orderToReorder.order_items.map(item => ({
      id: item.menu_items.id,
      name: item.menu_items.name,
      price: item.menu_items.price,
      image: item.menu_items.image_url,
      quantity: item.quantity,
      max_quantity: 10 // Default to 10 since we don't know current availability
    }));
    
    // Save to local storage
    localStorage.setItem('cart', JSON.stringify(cartItems));
    toast.success('Items added to cart');
    
    // Trigger storage event for navbar to update cart count
    window.dispatchEvent(new Event('storage'));
    
    // Redirect to cart page
    window.location.href = '/cart';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Order History</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="mb-4">You haven't placed any orders yet.</p>
            <Link href="/menu" className="btn-primary">
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="card p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                    <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'ready' ? 'bg-green-100 text-green-800' :
                    order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status === 'ready' ? 'Ready' :
                     order.status === 'in_progress' ? 'In Progress' :
                     'Pending'}
                  </span>
                </div>
                
                <div className="border-t border-b border-gray-200 py-2 my-2">
                  {order.order_items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.menu_items.name}</span>
                      <span>${(item.menu_items.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <div>
                    <p className="font-semibold">Total: ${order.total.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Pickup: {new Date(order.pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleReorder(order.id)}
                      className="btn-outline text-sm py-1 px-3"
                    >
                      Reorder
                    </button>
                    
                    <Link 
                      href={`/order-status?id=${order.id}`}
                      className="btn-primary text-sm py-1 px-3"
                    >
                      Track Order
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
