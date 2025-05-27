'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCartStore } from './cartStore';
import LoadingSpinner from './LoadingSpinner';
import { toast } from 'react-hot-toast';

interface CartItemProps {
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  description?: string;
}

const CartItem: React.FC<CartItemProps> = ({
  name,
  price,
  quantity,
  imageUrl,
  description,
}) => {
  const { updateQuantity, removeItem, isLoading, error } = useCartStore();
  const [localLoading, setLocalLoading] = useState(false);
  const [operationType, setOperationType] = useState<'increase' | 'decrease' | 'remove' | null>(null);

  const handleQuantityChange = async (newQuantity: number) => {
    try {
      setLocalLoading(true);
      setOperationType(newQuantity > quantity ? 'increase' : 'decrease');
      await updateQuantity(name, newQuantity);
      if (newQuantity > quantity) {
        toast.success(`Added one more ${name} to cart`);
      }
    } catch (err) {
      // Error is handled by the cart store and displayed in CartDrawer
    } finally {
      setLocalLoading(false);
      setOperationType(null);
    }
  };

  const handleRemove = async () => {
    try {
      setLocalLoading(true);
      setOperationType('remove');
      await removeItem(name);
    } catch (err) {
      // Error is handled by the cart store and displayed in CartDrawer
    } finally {
      setLocalLoading(false);
      setOperationType(null);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-dark-background/50 rounded-lg shadow-sm">
      {imageUrl && (
        <div className="relative w-20 h-20 flex-shrink-0">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover rounded-md"
            sizes="80px"
          />
        </div>
      )}
      
      <div className="flex-grow min-w-0">
        <h3 className="font-medium text-text dark:text-dark-text truncate">{name}</h3>
        {description && (
          <p className="text-sm text-text/70 dark:text-dark-text/70 truncate">{description}</p>
        )}
        <div className="mt-1 text-primary dark:text-dark-primary font-medium">
          ${price.toFixed(2)}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={isLoading || localLoading || quantity <= 1}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 dark:bg-dark-primary/10 text-primary dark:text-dark-primary hover:bg-primary/20 dark:hover:bg-dark-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Decrease quantity"
        >
          {(isLoading || (localLoading && operationType === 'decrease')) ? <LoadingSpinner size="xs" /> : '-'}
        </button>
        
        <span className="w-8 text-center font-medium">{quantity}</span>
        
        <button
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={isLoading || localLoading}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 dark:bg-dark-primary/10 text-primary dark:text-dark-primary hover:bg-primary/20 dark:hover:bg-dark-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Increase quantity"
        >
          {(isLoading || (localLoading && operationType === 'increase')) ? <LoadingSpinner size="xs" /> : '+'}
        </button>

        <button
          onClick={handleRemove}
          disabled={isLoading || localLoading}
          className="ml-2 p-2 text-red-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Remove item"
        >
          {(isLoading || (localLoading && operationType === 'remove')) ? <LoadingSpinner size="xs" /> : '×'}
        </button>
      </div>
    </div>
  );
};

export default CartItem;