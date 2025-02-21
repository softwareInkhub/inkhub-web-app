'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Home,
  LayoutGrid,
  ShoppingBag,
  HelpCircle,
  TagIcon,
  Search,
  User
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import LoginBottomSheet from './LoginBottomSheet';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, items } = useCart();
  const { user } = useAuth();
  const [showShine, setShowShine] = useState(false);
  const prevCartCount = useRef(cartCount);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (cartCount > prevCartCount.current) {
      setShowShine(true);
      setTimeout(() => setShowShine(false), 1000);
    }
    prevCartCount.current = cartCount;
  }, [cartCount]);

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      router.push('/cart');
    } else {
      setShowLoginModal(true);
    }
  };

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
    },
    {
      label: 'Sale',
      href: '/sale',
      icon: TagIcon,
    },
    {
      label: 'Cart',
      href: '/cart',
      icon: ShoppingBag,
      badge: cartCount,
      onClick: handleCartClick
    },
    {
      label: 'Collections',
      href: '/collections',
      icon: LayoutGrid,
    },
    {
      label: 'Support',
      href: '/help',
      icon: HelpCircle,
    },
    {
      label: 'Search',
      href: '/search',
      icon: Search,
    },
    {
      label: 'Account',
      href: '/account',
      icon: User,
    }
  ];

  return (
    <>
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", bounce: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe z-50 md:hidden"
      >
        <nav className="h-16 max-w-screen-lg mx-auto grid grid-cols-5 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isCart = item.label === 'Cart';

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={item.onClick}
                className={`flex flex-col items-center justify-center relative
                          ${isActive ? 'text-black' : 'text-gray-400'}`}
              >
                <motion.div 
                  className="relative flex flex-col items-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 400,
                    damping: 17
                  }}
                >
                  {isActive && !isCart && (
                    <motion.div
                      layoutId="navbubble"
                      className="absolute inset-x-[-18px] inset-y-[-14px] bg-black/5 rounded-xl -z-10"
                      transition={{ 
                        type: "spring", 
                        bounce: 0.2, 
                        duration: 0.6 
                      }}
                    />
                  )}
                  <div className="relative">
                    {isCart ? (
                      <motion.div
                        className={`w-12 h-12 rounded-full flex items-center justify-center relative ${
                          isActive ? 'bg-black' : 'bg-black'
                        } -mt-6 shadow-lg overflow-hidden`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 17
                        }}
                      >
                        <item.icon 
                          className="w-5 h-5 text-white relative z-10"
                          strokeWidth={1.5}
                        />
                        <AnimatePresence>
                          {showShine && (
                            <motion.div
                              initial={{ x: '-100%', opacity: 0 }}
                              animate={{ 
                                x: '200%', 
                                opacity: [0, 1, 1, 0]
                              }}
                              exit={{ opacity: 0 }}
                              transition={{ 
                                duration: 0.8,
                                ease: "easeInOut"
                              }}
                              className="absolute inset-0 z-20 skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            />
                          )}
                        </AnimatePresence>
                        <AnimatePresence>
                          {cartCount > 0 && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 180 }}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-medium z-30"
                            >
                              {cartCount}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ) : (
                      <motion.div
                        whileHover={{ y: -2 }}
                        whileTap={{ y: 0 }}
                      >
                        <item.icon 
                          className={`w-5 h-5 mb-1 transition-colors duration-200 ${
                            isActive ? 'text-black stroke-[1.5px]' : 'text-gray-400'
                          }`}
                          strokeWidth={1.5}
                        />
                      </motion.div>
                    )}
                  </div>
                  <motion.span 
                    className={`text-[10px] font-medium transition-colors duration-200 ${
                      isCart ? 'mt-1' : ''
                    } ${
                      isActive ? 'text-black' : 'text-gray-400'
                    }`}
                    animate={{ 
                      scale: isActive ? 1.1 : 1,
                      y: isActive ? -1 : 0
                    }}
                  >
                    {item.label}
                  </motion.span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </motion.div>

      <LoginBottomSheet 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => {
          setShowLoginModal(false);
          router.push('/cart');
        }}
      />
    </>
  );
} 