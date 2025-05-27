'use client';

import React, { useState } from 'react';
import { FC } from 'react';
import Image from 'next/image';
import { useCartStore } from './cartStore';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface FoodCardProps {
  imageUrl: string;
  name: string;
  description?: string;
  tags?: string[];
  price: string;
  onAdd: () => void;
}

const FoodCard: FC<FoodCardProps> = ({
  imageUrl,
  name,
  description,
  tags = [],
  price,
  onAdd,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const getTagIcon = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'spicy':
        return '🌶️';
      case 'vegan':
        return '🥦';
      case 'gluten-free':
        return '✅';
      default:
        return '';
    }
  };

  const handleAddToCart = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please sign in to add items to cart');
        return;
      }
      
      await onAdd();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item to cart');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-background/50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full border border-primary/5 dark:border-dark-primary/5">
      <div className="relative w-full h-48">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display text-lg font-semibold text-text dark:text-dark-text flex-grow">{name}</h3>
        </div>
        
        {description && (
          <p className="text-sm text-text/70 dark:text-dark-text/70 mb-3 line-clamp-2">{description}</p>
        )}
        
        <div className="mt-auto">
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/5 dark:bg-dark-primary/5 text-primary/80 dark:text-dark-primary/80"
                >
                  {getTagIcon(tag)} {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-primary dark:text-dark-primary">{price}</span>
            {error && (
              <div className="text-red-500 text-sm mb-2">
                {error}
              </div>
            )}
            <button
              onClick={handleAddToCart}
              disabled={isLoading}
              className={`flex-1 max-w-[120px] bg-gradient-to-r from-primary to-secondary dark:from-dark-primary dark:to-dark-secondary text-white font-medium py-2 px-4 rounded-full hover:opacity-90 transition-opacity duration-200 text-sm ${
                isLoading
                  ? 'cursor-not-allowed'
                  : ''
              }`}
            >
              {isLoading ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodCard; 