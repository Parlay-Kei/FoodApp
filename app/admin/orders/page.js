"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import Navbar from '../../../components/Navbar';

export default function AdminOrders() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'in_progress', 'ready'
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Check if user is logged in and is an admin
    async function checkAdminStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please login to access this page');
        router.push('/login');
        return;
      }
      
      // Check if user is an admin
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
        
      if (error || !data || !data.is_admin) {
        toast.error('You do not have permission to access this page');
        router.push('/menu');
        return;
      }
      
      setIsAdmin(true);
      fetchTodaysOrders();
    }
    
    async function fetchTodaysOrders() {
      // Get today's date in ISO format (YYYY-MM-DD)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISOString = today.toISOString();
      
      // Fetch today's orders with user and order items
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          pickup_time,
          status,
          total,
          profiles(email, phone),
          order_items(quantity, menu_items(name))
        `)
        .gte('created_at', todayISOString)
        .order('pickup_time', { ascending: true });
        
      if (error) {
        console.error('Error fetching today&apos;s orders:', error);
        toast.error('Failed to load today&apos;s orders');
      } else {
        setOrders(data || []);
      }
      
      setLoading(false);
    }
    
    checkAdminStatus();
    
    // Set up real-time subscription to order changes
    const subscription = supabase
      .channel('orders-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders'
      }, () => {
        fetchTodaysOrders();
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
        
      if (error) throw error;
      
      toast.success(`Order status updated to ${newStatus.replace('_', ' ')}`);
      
      // Update local state
      setOrders(orders.map(order => {
        if (order.id === orderId) {
          return { ...order, status: newStatus };
        }
        return order;
      }));
      
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  // Format date for display
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Filter orders based on status
  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Today&apos;s Orders</h1>
          
          <Link href="/admin" className="text-primary hover:underline">
            &larr; Back to Dashboard
          </Link>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          <button 
            onClick={() => setFilter('all')} 
            className={filter === 'all' ? 'filter-btn-active' : 'filter-btn'}
          >
            All Orders
          </button>
          <button 
            onClick={() => setFilter('pending')} 
            className={filter === 'pending' ? 'filter-btn-active' : 'filter-btn'}
          >
            Pending
          </button>
          <button 
            onClick={() => setFilter('in_progress')} 
            className={filter === 'in_progress' ? 'filter-btn-active' : 'filter-btn'}
          >
            In Progress
          </button>
          <button 
            onClick={() => setFilter('ready')} 
            className={filter === 'ready' ? 'filter-btn-active' : 'filter-btn'}
          >
            Ready
          </button>
        </div>
        
        {filteredOrders.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-lg text-gray-600">
              {filter === 'all' 
                ? 'No orders for today yet.' 
                : `No ${filter.replace('_', ' ')} orders.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map(order => (
              <div key={order.id} className="card">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
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
                  
                  <div className="mt-2">
                    <p className="text-sm">
                      <span className="font-medium">Pickup:</span> {formatDateTime(order.pickup_time)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Contact:</span> {order.profiles.email || order.profiles.phone}
                    </p>
                  </div>
                </div>
                
                <div className="p-4 border-b">
                  <h4 className="font-medium mb-2">Items:</h4>
                  <ul className="text-sm space-y-1">
                    {order.order_items.map((item, index) => (
                      <li key={index}>
                        {item.quantity}x {item.menu_items.name}
                      </li>
                    ))}
                  </ul>
                  <p className="font-medium mt-3">Total: ${order.total.toFixed(2)}</p>
                </div>
                
                <div className="p-4">
                  <h4 className="font-medium mb-2">Update Status:</h4>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'pending')}
                      disabled={order.status === 'pending'}
                      className={`px-2 py-1 text-xs rounded ${order.status === 'pending' 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
                    >
                      Pending
                    </button>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'in_progress')}
                      disabled={order.status === 'in_progress'}
                      className={`px-2 py-1 text-xs rounded ${order.status === 'in_progress' 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                    >
                      In Progress
                    </button>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      disabled={order.status === 'ready'}
                      className={`px-2 py-1 text-xs rounded ${order.status === 'ready' 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                    >
                      Ready
                    </button>
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
