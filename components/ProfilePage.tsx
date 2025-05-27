'use client';

import React from 'react';
import { useThemeStore } from './themeStore';

// Mock order history data
const MOCK_ORDERS = [
  {
    id: 'ORD-001',
    date: '2024-03-15',
    items: 3,
    total: 29.97,
    status: 'Delivered',
  },
  {
    id: 'ORD-002',
    date: '2024-03-10',
    items: 2,
    total: 19.98,
    status: 'Delivered',
  },
];

const ProfilePage: React.FC = () => {
  const { theme, setTheme } = useThemeStore();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background text-text dark:text-dark-text transition-colors duration-200">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
            👤
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">John Doe</h1>
          <p className="text-white/80">john.doe@example.com</p>
        </div>
      </div>

      {/* Settings Section */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <section className="bg-white dark:bg-dark-background/50 rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="font-display text-xl font-semibold mb-4">Settings</h2>
          <div className="space-y-4">
            <button className="w-full text-left px-4 py-3 rounded-xl bg-background dark:bg-dark-background/80 hover:bg-primary/5 dark:hover:bg-dark-primary/5 transition-colors">
              Edit Profile Info
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl bg-background dark:bg-dark-background/80 hover:bg-primary/5 dark:hover:bg-dark-primary/5 transition-colors">
              Change Pickup Preferences
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl bg-background dark:bg-dark-background/80 hover:bg-primary/5 dark:hover:bg-dark-primary/5 transition-colors">
              Notification Settings
            </button>
            <div className="flex items-center justify-between px-4 py-3">
              <span>Dark Mode</span>
              <select
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark' | 'system')}
                className="bg-background dark:bg-dark-background/80 rounded-lg px-3 py-1.5 border border-primary/20"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </section>

        {/* Order History */}
        <section className="bg-white dark:bg-dark-background/50 rounded-2xl shadow-sm p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Order History</h2>
          <div className="space-y-4">
            {MOCK_ORDERS.map((order) => (
              <div
                key={order.id}
                className="bg-background dark:bg-dark-background/80 rounded-xl p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{order.id}</h3>
                    <p className="text-sm text-text/60 dark:text-dark-text/60">
                      {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-primary dark:text-dark-primary font-semibold">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text/60 dark:text-dark-text/60">
                    {order.items} items • {order.status}
                  </span>
                  <button className="text-primary dark:text-dark-primary text-sm font-medium hover:opacity-80">
                    Reorder
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-background border-t border-primary/10 p-4">
        <div className="max-w-2xl mx-auto">
          <button className="w-full bg-primary dark:bg-dark-primary text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity">
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 