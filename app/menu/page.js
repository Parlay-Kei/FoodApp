"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredItems, setFilteredItems] = useState([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Fetch menu items from Supabase
    async function fetchMenuItems() {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available_today', true)
        .order('name');

      if (error) {
        console.error('Error fetching menu items:', error);
        toast.error('Failed to load menu items');
      } else {
        setMenuItems(data || []);
        setFilteredItems(data || []);
      }
      
      setLoading(false);
    }

    fetchMenuItems();
  }, [supabase]);

  // Filter menu items based on selected filter
  const handleFilter = (filter) => {
    setActiveFilter(filter);
    
    if (filter === 'all') {
      setFilteredItems(menuItems);
    } else {
      const filtered = menuItems.filter(item => {
        if (filter === 'vegan' && item.is_vegan) return true;
        if (filter === 'spicy' && item.is_spicy) return true;
        if (filter === 'vegetarian' && item.is_vegetarian) return true;
        if (filter === 'gluten-free' && item.is_gluten_free) return true;
        return false;
      });
      
      setFilteredItems(filtered);
    }
  };

  // Add item to cart
  const addToCart = (item) => {
    // Check if item is sold out
    if (item.quantity_available <= 0) {
      toast.error(`${item.name} is sold out!`);
      return;
    }
    
    // Get current cart from local storage
    const currentCart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    
    // Check if item already exists in cart
    const existingItemIndex = currentCart.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingItemIndex >= 0) {
      // Item exists, increment quantity if not exceeding available quantity
      const updatedCart = [...currentCart];
      if (updatedCart[existingItemIndex].quantity < item.quantity_available) {
        updatedCart[existingItemIndex].quantity += 1;
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        toast.success(`Added another ${item.name} to cart`);
        
        // Trigger storage event for navbar to update cart count
        window.dispatchEvent(new Event('storage'));
      } else {
        toast.error(`Cannot add more ${item.name} (max available: ${item.quantity_available})`);
      }
    } else {
      // Item doesn't exist, add to cart
      const updatedCart = [...currentCart, {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image_url,
        quantity: 1,
        max_quantity: item.quantity_available
      }];
      
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      toast.success(`Added ${item.name} to cart`);
      
      // Trigger storage event for navbar to update cart count
      window.dispatchEvent(new Event('storage'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Today's Menu</h1>
          
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <button 
              onClick={() => handleFilter('all')} 
              className={activeFilter === 'all' ? 'filter-btn-active' : 'filter-btn'}
            >
              All
            </button>
            <button 
              onClick={() => handleFilter('vegan')} 
              className={activeFilter === 'vegan' ? 'filter-btn-active' : 'filter-btn'}
            >
              Vegan
            </button>
            <button 
              onClick={() => handleFilter('vegetarian')} 
              className={activeFilter === 'vegetarian' ? 'filter-btn-active' : 'filter-btn'}
            >
              Vegetarian
            </button>
            <button 
              onClick={() => handleFilter('spicy')} 
              className={activeFilter === 'spicy' ? 'filter-btn-active' : 'filter-btn'}
            >
              Spicy
            </button>
            <button 
              onClick={() => handleFilter('gluten-free')} 
              className={activeFilter === 'gluten-free' ? 'filter-btn-active' : 'filter-btn'}
            >
              Gluten-Free
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">Loading menu items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-lg text-gray-600">
              {activeFilter === 'all' 
                ? 'No menu items available today.' 
                : `No ${activeFilter} items available today.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div key={item.id} className="card">
                <div className="relative h-48 w-full">
                  <Image 
                    src={item.image_url || 'https://placehold.co/600x400?text=Food+Image'} 
                    alt={item.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  
                  {item.quantity_available <= 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold text-xl">SOLD OUT</span>
                    </div>
                  )}
                  
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
                  
                  <div className="mt-4 flex justify-between items-center">
                    {item.quantity_available > 0 ? (
                      <span className="text-sm text-gray-500">{item.quantity_available} available</span>
                    ) : (
                      <span className="text-sm text-red-500">Sold out</span>
                    )}
                    
                    <button 
                      onClick={() => addToCart(item)}
                      disabled={item.quantity_available <= 0}
                      className={`px-3 py-1 rounded-lg ${item.quantity_available <= 0 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-primary text-white hover:bg-opacity-90'}`}
                    >
                      Add to Cart
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
