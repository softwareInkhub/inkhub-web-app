'use client';
import { X } from 'lucide-react';
import Image from 'next/image';

interface OrderSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any; // Replace with proper type
}

export default function OrderSummaryModal({ isOpen, onClose, order }: OrderSummaryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">Order Summary</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Order Number</p>
              <p className="font-medium">{order.name}</p>
            </div>
            <div>
              <p className="text-gray-500">Order Date</p>
              <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Payment Status</p>
              <p className="font-medium capitalize">{order.financial_status}</p>
            </div>
            <div>
              <p className="text-gray-500">Fulfillment Status</p>
              <p className="font-medium capitalize">{order.fulfillment_status || 'Unfulfilled'}</p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <h3 className="font-medium">Items</h3>
            {order.line_items.map((item: any) => (
              <div key={item.id} className="flex gap-4 py-4 border-t">
                <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  <p className="text-sm font-medium">₹{item.price}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Price Summary */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">₹{order.total_price}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span className="font-medium">₹0.00</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t">
              <span>Total</span>
              <span>₹{order.total_price}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 