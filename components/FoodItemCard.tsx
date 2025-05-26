import Image from 'next/image';
import { toast } from 'react-hot-toast';

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  is_vegan?: boolean;
  is_vegetarian?: boolean;
  is_spicy?: boolean;
  is_gluten_free?: boolean;
  quantity_available: number;
}

interface FoodItemCardProps {
  item: FoodItem;
  onAddToCart: (item: FoodItem) => void;
}

export default function FoodItemCard({ item, onAddToCart }: FoodItemCardProps) {
  const handleAddToCart = () => {
    if (item.quantity_available <= 0) {
      toast.error(`${item.name} is sold out!`);
      return;
    }
    onAddToCart(item);
  };

  return (
    <div className="card h-full flex flex-col bg-beige border border-orange-200 rounded-xl shadow-lg">
      <div className="relative h-48 w-full rounded-t-xl overflow-hidden">
        <Image 
          src={item.image_url || 'https://placehold.co/600x400?text=Food+Image'} 
          alt={item.name}
          fill
          style={{ objectFit: 'cover', borderTopLeftRadius: '0.75rem', borderTopRightRadius: '0.75rem' }}
        />
        {item.quantity_available <= 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-xl">
            <span className="text-white font-bold text-xl">SOLD OUT</span>
          </div>
        )}
        <div className="absolute top-2 right-2 flex flex-wrap gap-1 max-w-[80%]">
          {item.is_vegan && (
            <span className="bg-green text-white text-xs font-medium px-2 py-1 rounded">Vegan</span>
          )}
          {item.is_vegetarian && (
            <span className="bg-green/80 text-white text-xs font-medium px-2 py-1 rounded">Veg</span>
          )}
          {item.is_spicy && (
            <span className="bg-red text-white text-xs font-medium px-2 py-1 rounded">Spicy</span>
          )}
          {item.is_gluten_free && (
            <span className="bg-orange-200 text-navy text-xs font-medium px-2 py-1 rounded">GF</span>
          )}
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-navy">{item.name}</h3>
            <p className="text-gray-700 text-sm line-clamp-2">{item.description}</p>
          </div>
          <span className="font-bold text-lg text-primary">${item.price.toFixed(2)}</span>
        </div>
        <div className="mt-auto pt-4 flex justify-between items-center">
          {item.quantity_available > 0 ? (
            <span className="text-sm text-green font-semibold">{item.quantity_available} available</span>
          ) : (
            <span className="text-sm text-red font-semibold">Sold out</span>
          )}
          <button 
            onClick={handleAddToCart}
            disabled={item.quantity_available <= 0}
            className={`btn-primary px-4 py-2 ${item.quantity_available <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
} 