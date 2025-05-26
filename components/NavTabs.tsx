'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { name: 'Menu', href: '/menu' },
  { name: 'Cart', href: '/cart' },
  { name: 'Orders', href: '/orders' },
  { name: 'Profile', href: '/profile' },
];

const NavTabs: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="sticky top-[72px] z-30 bg-background/95 backdrop-blur-sm border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center gap-2 py-3">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-secondary to-primary text-white shadow-sm'
                    : 'text-text/80 hover:text-primary hover:bg-primary/5'
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default NavTabs; 