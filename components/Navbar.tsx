"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface User {
  id: string;
}

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        if (data) {
          setIsAdmin(data.is_admin);
        }
      }
    };
    checkUser();
  }, [supabase]);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = typeof window !== 'undefined' && localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart') as string) : [];
      const count = cart.reduce((total: number, item: { quantity: number }) => total + item.quantity, 0);
      setCartCount(count);
    };
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    return () => {
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (pathname === '/login' || pathname === '/signup' || pathname === '/') {
    return null;
  }

  return (
    <nav className="bg-navy text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <div className="flex flex-col items-start justify-center">
            <Link href="/menu" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white flex items-center">
                <span className="mr-2">🚚</span> Megan&apos;s Munchies
              </span>
            </Link>
            <span className="text-sm text-green font-normal mt-1 ml-8">Fresh Off the Truck. Right on Time.</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              href="/menu" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/menu' ? 'bg-orange-100 text-primary' : 'text-white hover:text-orange-200'}`}
            >
              Menu
            </Link>
            <Link 
              href="/cart" 
              className="relative px-3 py-2 rounded-md text-sm font-medium text-white hover:text-orange-200"
            >
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link 
              href="/order-history" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/order-history' ? 'bg-orange-100 text-primary' : 'text-white hover:text-orange-200'}`}
            >
              Orders
            </Link>
            {isAdmin && (
              <Link 
                href="/admin" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${pathname.startsWith('/admin') ? 'bg-orange-100 text-primary' : 'text-white hover:text-orange-200'}`}
              >
                Admin
              </Link>
            )}
            <Link 
              href="/settings" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/settings' ? 'bg-orange-100 text-primary' : 'text-white hover:text-orange-200'}`}
            >
              Settings
            </Link>
            <button 
              onClick={handleSignOut}
              className="px-3 py-2 rounded-md text-sm font-medium text-white hover:text-orange-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 