'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Menu, Search, User, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import LoginBottomSheet from './LoginBottomSheet';

export default function Header() {
  const router = useRouter();
  const { user } = useAuth();
  const { items } = useCart();
  const [showLoginSheet, setShowLoginSheet] = useState(false);

  const handleProfileClick = () => {
    if (user) {
      router.push('/account');
    } else {
      setShowLoginSheet(true);
    }
  };

  return (
    <nav className="flex items-center justify-between p-4 border-b bg-white">
      <Link href="/" className="flex items-center">
        <img src="/logo.svg" alt="InkHub" className="h-8" />
      </Link>

      <div className="flex items-center gap-4">
        <button 
          onClick={handleProfileClick} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <User className="w-6 h-6" />
        </button>

        <Link href="/cart" className="p-2 hover:bg-gray-100 rounded-full relative">
          <ShoppingBag className="w-6 h-6" />
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white rounded-full text-xs flex items-center justify-center">
              {items.length}
            </span>
          )}
        </Link>
      </div>

      <LoginBottomSheet
        isOpen={showLoginSheet}
        onClose={() => setShowLoginSheet(false)}
        onLoginSuccess={() => {
          setShowLoginSheet(false);
          router.push('/account');
        }}
      />
    </nav>
  );
} 