"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [todayStats, setTodayStats] = useState({
    totalOrders: 0,
    revenue: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    readyOrders: 0
  });
  
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
      fetchTodayStats();
    }
    
    async function fetchTodayStats() {
      // Get today's date in ISO format (YYYY-MM-DD)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISOString = today.toISOString();
      
      // Fetch today's orders
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, total, status')
        .gte('created_at', todayISOString);
        
      if (error) {
        console.error('Error fetching today\'s orders:', error);
        toast.error('Failed to load today\'s statistics');
      } else {
        // Calculate statistics
        const stats = {
          totalOrders: orders ? orders.length : 0,
          revenue: orders ? orders.reduce((sum, order) => sum + order.total, 0) : 0,
          pendingOrders: orders ? orders.filter(order => order.status === 'pending').length : 0,
          inProgressOrders: orders ? orders.filter(order => order.status === 'in_progress').length : 0,
          readyOrders: orders ? orders.filter(order => order.status === 'ready').length : 0
        };
        
        setTodayStats(stats);
      }
      
      setLoading(false);
    }
    
    checkAdminStatus();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <p>Loading admin dashboard...</p>
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
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card p-4 bg-primary bg-opacity-10">
            <h3 className="text-sm font-medium text-gray-500">TODAY'S ORDERS</h3>
            <p className="text-3xl font-bold">{todayStats.totalOrders}</p>
          </div>
          
          <div className="card p-4 bg-secondary bg-opacity-10">
            <h3 className="text-sm font-medium text-gray-500">TODAY'S REVENUE</h3>
            <p className="text-3xl font-bold">${todayStats.revenue.toFixed(2)}</p>
          </div>
          
          <div className="card p-4 bg-accent bg-opacity-10">
            <h3 className="text-sm font-medium text-gray-500">PENDING ORDERS</h3>
            <p className="text-3xl font-bold">{todayStats.pendingOrders}</p>
          </div>
        </div>
        
        {/* Admin Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/orders" className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Today's Orders</h2>
            <p className="text-gray-600">
              Manage incoming orders, update status, and track pickup times.
            </p>
          </Link>
          
          <Link href="/admin/menu" className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-secondary text-white mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Menu Management</h2>
            <p className="text-gray-600">
              Add, edit, or remove menu items. Set availability and quantities.
            </p>
          </Link>
          
          <Link href="/admin/reports" className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-accent text-white mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Inventory & Reports</h2>
            <p className="text-gray-600">
              View sales reports, track inventory, and download business insights.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
