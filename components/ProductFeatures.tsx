'use client';
import { Leaf } from 'lucide-react';

export default function ProductFeatures() {
  return (
    <div className="space-y-4">
      {/* Skin Safe Banner */}
      <div className="flex items-center gap-2">
        <Leaf className="w-5 h-5 text-gray-700" />
        <span className="text-sm font-medium text-gray-700">
          100% SKIN SAFE | WATERPROOF | LOOKS REAL
        </span>
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-sm font-medium text-gray-700">
          In stock, ready to ship
        </span>
      </div>
    </div>
  );
} 