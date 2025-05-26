'use client';

import React from 'react';
import { FC } from 'react';
import Image from 'next/image';

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

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col h-full border border-primary/5">
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
          <h3 className="font-display text-lg font-semibold text-text flex-grow">{name}</h3>
        </div>
        
        {description && (
          <p className="text-sm text-text/70 mb-3 line-clamp-2">{description}</p>
        )}
        
        <div className="mt-auto">
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/5 text-primary/80"
                >
                  {getTagIcon(tag)} {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-primary">{price}</span>
            <button
              onClick={onAdd}
              className="flex-1 max-w-[120px] bg-gradient-to-r from-secondary to-primary text-white font-medium py-2 px-4 rounded-full hover:opacity-90 transition-opacity duration-200 text-sm"
            >
              + Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodCard; 