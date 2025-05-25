import Image from 'next/image';

export interface CartItemType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  max_quantity: number;
  image?: string;
}

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="p-4 flex">
      <div className="relative h-20 w-20 flex-shrink-0">
        <Image 
          src={item.image || 'https://placehold.co/200x200?text=Food'} 
          alt={item.name}
          fill
          style={{ objectFit: 'cover' }}
          className="rounded"
        />
      </div>
      
      <div className="ml-4 flex-grow">
        <div className="flex justify-between">
          <h3 className="font-medium">{item.name}</h3>
          <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
        </div>
        
        <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
        
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center border rounded">
            <button 
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
              disabled={item.quantity <= 1}
            >
              -
            </button>
            <span className="px-2 py-1">{item.quantity}</span>
            <button 
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
              disabled={item.quantity >= item.max_quantity}
            >
              +
            </button>
          </div>
          
          <button 
            onClick={() => onRemove(item.id)}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
} 