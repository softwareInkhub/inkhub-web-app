'use client';
import { Truck, Calendar, RefreshCw } from 'lucide-react';

export default function DeliveryInfo() {
  return (
    <div className="mt-8 bg-gray-50 rounded-xl p-4 space-y-3">
      <h3 className="font-medium text-sm">Delivery & Returns</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Truck className="w-4 h-4" />
          <span>Free delivery on orders above ₹499</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Estimated delivery: 3-5 business days</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <RefreshCw className="w-4 h-4" />
          <span>Easy 7-day returns</span>
        </div>
      </div>
    </div>
  );
} 