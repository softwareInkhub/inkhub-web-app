'use client';
import { useRouter } from 'next/navigation';
import Skeleton from '@/components/Skeleton';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { X } from 'lucide-react';

export default function Cart() {
  const { items, isLoading, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="w-20 h-20 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const total = items.reduce((sum, item) => (
    sum + (Number(item.price.amount) * item.quantity)
  ), 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-8">
        {/* Cart Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.variantId} className="bg-white rounded-2xl p-4 flex gap-4">
              <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={item.image.url}
                  alt={item.image.altText || item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-medium">{item.title}</h3>
                  <button
                    onClick={() => removeFromCart(item.variantId)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <select
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.variantId, Number(e.target.value))}
                    className="bg-gray-50 border rounded-lg px-2 py-1"
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <p className="font-medium">
                    ₹{(Number(item.price.amount) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        {items.length > 0 ? (
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <div className="flex justify-between text-lg font-medium">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <button
              onClick={() => router.push('/checkout')}
              className="w-full bg-black text-white py-4 rounded-xl font-medium 
                       hover:bg-black/90 active:scale-[0.99] transition-all"
            >
              Checkout • ₹{total.toFixed(2)}
            </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Your cart is empty</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 text-black hover:underline"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 