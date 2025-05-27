'use client';

import React, { useEffect } from 'react';
import { useCartStore } from './cartStore';
import { useRouter } from 'next/navigation';
import LoadingSpinner from './LoadingSpinner';
import { toast } from 'react-hot-toast';

const CartDrawer: React.FC = () => {
  const { 
    items, 
    isLoading, 
    error, 
    isInitialized,
    isRetrying,
    itemCount, 
    subtotal, 
    fetchCart,
    retryLastOperation,
    resetError
  } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) {
      fetchCart();
    }
  }, [isInitialized, fetchCart]);

  if (!isInitialized || isLoading) {
    return (
      <div className="fixed bottom-0 left-0 w-full z-50 flex justify-center pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md mx-auto bg-gradient-to-r from-secondary to-primary rounded-t-2xl shadow-lg p-4 flex items-center justify-center gap-3">
          <LoadingSpinner size={"sm"} />
          <span className="text-white font-medium">
            {isRetrying ? 'Retrying operation...' : 'Loading cart...'}
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed bottom-0 left-0 w-full z-50 flex justify-center pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md mx-auto bg-red-500 rounded-t-2xl shadow-lg p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-white font-medium">{error}</span>
            <button 
              onClick={() => resetError()}
              className="text-white hover:text-gray-200 text-lg"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
          <div className="flex justify-end gap-3">
            <button 
              onClick={() => {
                retryLastOperation();
                toast.success('Retrying operation...');
              }}
              disabled={isRetrying}
              className="bg-white text-red-500 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {isRetrying ? <LoadingSpinner size={"xs"} /> : null}
              Retry
            </button>
            <button 
              onClick={() => fetchCart()}
              disabled={isRetrying}
              className="bg-white text-red-500 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Refresh Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  const count = itemCount();
  if (count === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 flex justify-center pointer-events-none">
      <div
        className="pointer-events-auto w-full max-w-md mx-auto bg-gradient-to-r from-secondary to-primary rounded-t-2xl shadow-lg p-4 flex items-center justify-between gap-4 transition-all duration-300 translate-y-0"
      >
        <div className="flex flex-col text-white">
          <span className="font-semibold text-lg">{itemCount()} item{itemCount() > 1 ? 's' : ''} in cart</span>
          <span className="text-cta font-bold text-xl">Subtotal: ${subtotal().toFixed(2)}</span>
        </div>
        <button
          className="bg-accent text-text font-bold rounded-full px-6 py-2 shadow-md text-lg hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => router.push('/checkout')}
          disabled={itemCount() === 0 || isLoading}
        >
          {isLoading ? <LoadingSpinner size={"sm"} /> : 'Checkout'}
        </button>
      </div>
    </div>
  );
};

export default CartDrawer; 