'use client';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="
        inline-flex items-center gap-1 px-3 py-2 mb-6
        text-sm font-medium text-gray-700 hover:text-gray-900
        transition-colors duration-200
        group
      "
    >
      <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
      <span>Back to collections</span>
    </button>
  );
} 