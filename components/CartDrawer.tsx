'use client';

import React from 'react';
import { useCartStore } from './cartStore';

const CartDrawer: React.FC = () => {
  const itemCount = useCartStore((s) => s.itemCount());
  const subtotal = useCartStore((s) => s.subtotal());

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 flex justify-center pointer-events-none">
      <div
        className="pointer-events-auto w-full max-w-md mx-auto bg-gradient-to-r from-secondary to-primary rounded-t-2xl shadow-lg p-4 flex items-center justify-between gap-4 transition-all duration-300 translate-y-0"
      >
        <div className="flex flex-col text-white">
          <span className="font-semibold text-lg">{itemCount} item{itemCount > 1 ? 's' : ''} in cart</span>
          <span className="text-cta font-bold text-xl">Subtotal: ${subtotal.toFixed(2)}</span>
        </div>
        <button
          className="bg-accent text-text font-bold rounded-full px-6 py-2 shadow-md text-lg hover:bg-yellow-400 transition"
          onClick={() => alert('Proceed to checkout!')}
        >
          Checkout
        </button>
      </div>
    </div>
  );
};

export default CartDrawer; 