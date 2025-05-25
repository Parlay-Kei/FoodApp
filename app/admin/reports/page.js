"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import Navbar from '../../../components/Navbar';

export default function AdminReports() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week'); // 'day', 'week', 'month'
  const [salesData, setSalesData] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  
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
      fetchReportData();
    }
    
    checkAdminStatus();
  }, [router, supabase]);

  // Fetch report data based on selected date range
  const fetchReportData = async () => {
    setLoading(true);
    
    try {
      // Calculate date range
      const endDate = new Date();
      let startDate = new Date();
      
      if (dateRange === 'day') {
        startDate.setHours(0, 0, 0, 0);
      } else if (dateRange === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (dateRange === 'month') {
        startDate.setMonth(startDate.getMonth() - 1);
      }
      
      const startDateISO = startDate.toISOString();
      const endDateISO = endDate.toISOString();
      
      // Fetch sales data
      const { data: salesData, error: salesError } = await supabase
        .from('orders')
        .select('id, created_at, total')
        .gte('created_at', startDateISO)
        .lte('created_at', endDateISO)
        .order('created_at', { ascending: true });
        
      if (salesError) throw salesError;
      
      // Group sales data by day
      const groupedSales = groupSalesByDay(salesData || []);
      setSalesData(groupedSales);
      
      // Fetch top selling items
      const { data: topItemsData, error: topItemsError } = await supabase
        .rpc('get_top_selling_items', {
          start_date: startDateISO,
          end_date: endDateISO,
          limit_count: 5
        });
        
      if (topItemsError) throw topItemsError;
      setTopItems(topItemsData || []);
      
      // Fetch current inventory
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('menu_items')
        .select('id, name, quantity_available, available_today')
        .order('name');
        
      if (inventoryError) throw inventoryError;
      setInventoryItems(inventoryData || []);
      
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  // Group sales data by day
  const groupSalesByDay = (orders) => {
    const grouped = {};
    
    orders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString();
      
      if (!grouped[date]) {
        grouped[date] = {
          date,
          total: 0,
          count: 0
        };
      }
      
      grouped[date].total += order.total;
      grouped[date].count += 1;
    });
    
    return Object.values(grouped);
  };

  // Handle date range change
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    setTimeout(() => {
      fetchReportData();
    }, 0);
  };

  // Generate and download CSV report
  const downloadCSVReport = () => {
    // Create CSV content
    let csvContent = "date,orders,revenue\n";
    
    salesData.forEach(day => {
      csvContent += `${day.date},${day.count},${day.total.toFixed(2)}\n`;
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_report_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV report downloaded');
  };

  // Calculate total revenue and orders
  const totalRevenue = salesData.reduce((sum, day) => sum + day.total, 0);
  const totalOrders = salesData.reduce((sum, day) => sum + day.count, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <p>Loading reports...</p>
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
          <h1 className="text-2xl font-bold">Inventory & Reports</h1>
          
          <Link href="/admin" className="text-primary hover:underline">
            &larr; Back to Dashboard
          </Link>
        </div>
        
        {/* Date Range Selector */}
        <div className="card p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <button 
                onClick={() => handleDateRangeChange('day')}
                className={`px-3 py-1 rounded-lg ${dateRange === 'day' ? 'bg-primary text-white' : 'bg-gray-200'}`}
              >
                Today
              </button>
              <button 
                onClick={() => handleDateRangeChange('week')}
                className={`px-3 py-1 rounded-lg ${dateRange === 'week' ? 'bg-primary text-white' : 'bg-gray-200'}`}
              >
                Last 7 Days
              </button>
              <button 
                onClick={() => handleDateRangeChange('month')}
                className={`px-3 py-1 rounded-lg ${dateRange === 'month' ? 'bg-primary text-white' : 'bg-gray-200'}`}
              >
                Last 30 Days
              </button>
            </div>
            
            <button 
              onClick={downloadCSVReport}
              className="btn-outline text-sm py-1 px-3 flex items-center"
              disabled={salesData.length === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download CSV
            </button>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">TOTAL REVENUE</h3>
            <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
          </div>
          
          <div className="card p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">TOTAL ORDERS</h3>
            <p className="text-3xl font-bold">{totalOrders}</p>
          </div>
          
          <div className="card p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">AVG. ORDER VALUE</h3>
            <p className="text-3xl font-bold">
              ${totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
        
        {/* Sales Chart (simplified as a table for now) */}
        <div className="card p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Sales Trend</h2>
          
          {salesData.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No sales data available for the selected period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {salesData.map((day, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap">{day.date}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{day.count}</td>
                      <td className="px-4 py-2 whitespace-nowrap">${day.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Top Selling Items */}
          <div className="card p-4">
            <h2 className="text-lg font-semibold mb-4">Top Selling Items</h2>
            
            {topItems.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No sales data available for the selected period.</p>
            ) : (
              <ul className="space-y-2">
                {topItems.map((item, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 w-6">{index + 1}.</span>
                      <span>{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.total_quantity} sold</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Current Inventory */}
          <div className="card p-4">
            <h2 className="text-lg font-semibold mb-4">Current Inventory</h2>
            
            {inventoryItems.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No menu items available.</p>
            ) : (
              <div className="overflow-y-auto max-h-64">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {inventoryItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 whitespace-nowrap">{item.name}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.available_today ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {item.available_today ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">{item.quantity_available}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
