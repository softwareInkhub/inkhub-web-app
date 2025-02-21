'use client';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Check } from 'lucide-react';

type ProductDetails = {
  id: string;
  title: string;
  handle: string;
  price: number;
  image: string;
  variantId: string;
};

export default function AddToCartButton({ product }: { product: ProductDetails }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      ...product,
      handle: product.handle,
      price: {
        amount: product.price.toString(),
        currencyCode: 'INR'
      },
      image: {
        url: product.image,
        altText: product.title
      },
      quantity,
      selectedOptions: []
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-gray-200 rounded-lg">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="px-4 py-2 text-gray-600 hover:text-black transition-colors"
          >
            -
          </button>
          <span className="px-4 py-2 border-x border-gray-200">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(q => q + 1)}
            className="px-4 py-2 text-gray-600 hover:text-black transition-colors"
          >
            +
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          className={`flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-lg text-lg font-medium transition-all duration-300 ${
            isAdded
              ? 'bg-green-500 text-white'
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-5 h-5" />
              Added to Cart
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
} 