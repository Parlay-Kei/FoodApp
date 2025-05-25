"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import Navbar from '../../../components/Navbar';

export default function AdminMenu() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    is_vegan: false,
    is_vegetarian: false,
    is_spicy: false,
    is_gluten_free: false,
    available_today: false,
    quantity_available: 0
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
      fetchMenuItems();
    }
    
    async function fetchMenuItems() {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('name');
        
      if (error) {
        console.error('Error fetching menu items:', error);
        toast.error('Failed to load menu items');
      } else {
        setMenuItems(data || []);
      }
      
      setLoading(false);
    }
    
    checkAdminStatus();
  }, [router, supabase]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.price) {
      toast.error('Name and price are required');
      return;
    }
    
    try {
      const itemData = {
        ...formData,
        price: parseFloat(formData.price),
        quantity_available: parseInt(formData.quantity_available)
      };
      
      let result;
      
      if (editingItem) {
        // Update existing item
        const { data, error } = await supabase
          .from('menu_items')
          .update(itemData)
          .eq('id', editingItem.id)
          .select();
          
        if (error) throw error;
        result = data[0];
        
        // Update local state
        setMenuItems(menuItems.map(item => 
          item.id === editingItem.id ? result : item
        ));
        
        toast.success('Menu item updated successfully');
      } else {
        // Create new item
        const { data, error } = await supabase
          .from('menu_items')
          .insert([itemData])
          .select();
          
        if (error) throw error;
        result = data[0];
        
        // Update local state
        setMenuItems([...menuItems, result]);
        
        toast.success('Menu item added successfully');
      }
      
      // Reset form and close modal
      resetForm();
      setShowAddModal(false);
      setEditingItem(null);
      
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error('Failed to save menu item');
    }
  };

  // Reset form to default values
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image_url: '',
      is_vegan: false,
      is_vegetarian: false,
      is_spicy: false,
      is_gluten_free: false,
      available_today: false,
      quantity_available: 0
    });
  };

  // Open edit modal with item data
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      image_url: item.image_url || '',
      is_vegan: item.is_vegan || false,
      is_vegetarian: item.is_vegetarian || false,
      is_spicy: item.is_spicy || false,
      is_gluten_free: item.is_gluten_free || false,
      available_today: item.available_today || false,
      quantity_available: item.quantity_available || 0
    });
    setShowAddModal(true);
  };

  // Toggle item availability
  const toggleAvailability = async (item) => {
    try {
      const newAvailability = !item.available_today;
      
      const { error } = await supabase
        .from('menu_items')
        .update({ available_today: newAvailability })
        .eq('id', item.id);
        
      if (error) throw error;
      
      // Update local state
      setMenuItems(menuItems.map(menuItem => 
        menuItem.id === item.id 
          ? { ...menuItem, available_today: newAvailability } 
          : menuItem
      ));
      
      toast.success(`${item.name} is now ${newAvailability ? 'available' : 'unavailable'} today`);
      
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.error('Failed to update item availability');
    }
  };

  // Delete menu item
  const handleDelete = async (item) => {
    if (!confirm(`Are you sure you want to delete ${item.name}?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', item.id);
        
      if (error) throw error;
      
      // Update local state
      setMenuItems(menuItems.filter(menuItem => menuItem.id !== item.id));
      
      toast.success(`${item.name} deleted successfully`);
      
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  // Reset all items for next day
  const resetAllItems = async () => {
    if (!confirm('Are you sure you want to reset all items for the next day? This will set all items as unavailable.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ available_today: false, quantity_available: 0 })
        .neq('id', 0); // Update all items
        
      if (error) throw error;
      
      // Update local state
      setMenuItems(menuItems.map(item => ({
        ...item,
        available_today: false,
        quantity_available: 0
      })));
      
      toast.success('All items reset for the next day');
      
    } catch (error) {
      console.error('Error resetting items:', error);
      toast.error('Failed to reset items');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <p>Loading menu management...</p>
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
          <h1 className="text-2xl font-bold">Menu Management</h1>
          
          <div className="flex space-x-2">
            <button 
              onClick={resetAllItems}
              className="btn-outline text-sm py-1 px-3"
            >
              Reset All Items
            </button>
            
            <button 
              onClick={() => {
                resetForm();
                setEditingItem(null);
                setShowAddModal(true);
              }}
              className="btn-primary text-sm py-1 px-3"
            >
              Add New Item
            </button>
            
            <Link href="/admin" className="text-primary hover:underline flex items-center">
              &larr; Back to Dashboard
            </Link>
          </div>
        </div>
        
        {menuItems.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-lg text-gray-600 mb-4">
              No menu items yet. Add your first item to get started.
            </p>
            <button 
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="btn-primary"
            >
              Add Menu Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map(item => (
              <div key={item.id} className="card overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image 
                    src={item.image_url || 'https://placehold.co/600x400?text=Food+Image'} 
                    alt={item.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  
                  <div className="absolute top-2 right-2 flex space-x-1">
                    {item.is_vegan && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                        Vegan
                      </span>
                    )}
                    {item.is_vegetarian && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                        Veg
                      </span>
                    )}
                    {item.is_spicy && (
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                        Spicy
                      </span>
                    )}
                    {item.is_gluten_free && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
                        GF
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                    <span className="font-bold text-lg">${item.price.toFixed(2)}</span>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Available Today:</span>
                      <button 
                        onClick={() => toggleAvailability(item)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${item.available_today ? 'bg-primary' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${item.available_today ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    
                    {item.available_today && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Quantity:</span>
                        <span className="font-medium">{item.quantity_available}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-2">
                    <button 
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(item)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingItem ? `Edit ${editingItem.name}` : 'Add New Menu Item'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="input-field"
                      rows="3"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                      Price *
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="input-field"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="text"
                      id="image_url"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_vegan"
                        name="is_vegan"
                        checked={formData.is_vegan}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="is_vegan" className="ml-2 block text-sm text-gray-700">
                        Vegan
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_vegetarian"
                        name="is_vegetarian"
                        checked={formData.is_vegetarian}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="is_vegetarian" className="ml-2 block text-sm text-gray-700">
                        Vegetarian
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_spicy"
                        name="is_spicy"
                        checked={formData.is_spicy}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="is_spicy" className="ml-2 block text-sm text-gray-700">
                        Spicy
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_gluten_free"
                        name="is_gluten_free"
                        checked={formData.is_gluten_free}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="is_gluten_free" className="ml-2 block text-sm text-gray-700">
                        Gluten Free
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="available_today"
                      name="available_today"
                      checked={formData.available_today}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="available_today" className="ml-2 block text-sm text-gray-700">
                      Available Today
                    </label>
                  </div>
                  
                  {formData.available_today && (
                    <div>
                      <label htmlFor="quantity_available" className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity Available
                      </label>
                      <input
                        type="number"
                        id="quantity_available"
                        name="quantity_available"
                        value={formData.quantity_available}
                        onChange={handleInputChange}
                        className="input-field"
                        min="0"
                      />
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setEditingItem(null);
                        resetForm();
                      }}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      {editingItem ? 'Update Item' : 'Add Item'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
