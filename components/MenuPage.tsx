'use client';

import React, { useState } from 'react';
import FoodCard from './FoodCard';
import CartDrawer from './CartDrawer';
import HeroMenuHeader from './HeroMenuHeader';
import NavTabs from './NavTabs';
import { useCartStore } from './cartStore';

const DUMMY_MENU = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop',
    name: 'Classic Burger',
    description: 'Juicy beef patty with lettuce, tomato, onion, and our special sauce on a brioche bun',
    tags: ['Spicy'],
    price: '$9.99',
    priceNum: 9.99,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?q=80&w=1000&auto=format&fit=crop',
    name: 'Veggie Burger',
    description: 'Plant-based patty with avocado, lettuce, tomato, and vegan mayo',
    tags: ['Vegan'],
    price: '$10.99',
    priceNum: 10.99,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=1000&auto=format&fit=crop',
    name: 'Spicy Chicken Sandwich',
    description: 'Crispy chicken breast with spicy sauce, pickles, and coleslaw',
    tags: ['Spicy'],
    price: '$8.99',
    priceNum: 8.99,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop',
    name: 'Quinoa Bowl',
    description: 'Nutritious quinoa with roasted vegetables, avocado, and tahini dressing',
    tags: ['Vegan', 'Gluten-Free'],
    price: '$10.99',
    priceNum: 10.99,
  },
];

const CATEGORIES = {
  'Burgers & Sandwiches': ['Classic Burger', 'Veggie Burger', 'Spicy Chicken Sandwich'],
  'Healthy Bowls': ['Quinoa Bowl'],
};

const FILTERS = ['All', 'Vegan', 'Spicy', 'Gluten-Free'];

const MenuPage: React.FC = () => {
  const [active, setActive] = useState('All');
  const addItem = useCartStore((s) => s.addItem);

  const filteredMenu =
    active === 'All'
      ? DUMMY_MENU
      : DUMMY_MENU.filter((item) =>
          item.tags?.map((t) => t.toLowerCase()).includes(active.toLowerCase())
        );

  // Group menu items by category
  const menuByCategory = Object.entries(CATEGORIES).map(([category, items]) => ({
    category,
    items: filteredMenu.filter((item) => items.includes(item.name)),
  }));

  return (
    <div className="min-h-screen bg-background">
      <HeroMenuHeader />
      <NavTabs />
      
      <main className="max-w-7xl mx-auto px-4 py-6 pb-32">
        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActive(filter)}
              className={`px-4 py-1.5 rounded-full border font-medium text-sm whitespace-nowrap transition duration-200 ${
                active === filter
                  ? 'bg-gradient-to-r from-secondary to-primary text-white border-transparent shadow-sm'
                  : 'bg-white text-text/80 border-primary/20 hover:bg-primary/5'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Menu items by category */}
        <div className="space-y-8">
          {menuByCategory.map(({ category, items }) => (
            items.length > 0 && (
              <section key={category}>
                <h2 className="font-display text-2xl font-semibold text-primary mb-4">
                  {category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item) => (
                    <FoodCard
                      key={item.name}
                      imageUrl={item.imageUrl}
                      name={item.name}
                      description={item.description}
                      tags={item.tags}
                      price={item.price}
                      onAdd={() => addItem({ name: item.name, price: item.priceNum })}
                    />
                  ))}
                </div>
              </section>
            )
          ))}
        </div>
      </main>

      <CartDrawer />
    </div>
  );
};

export default MenuPage; 