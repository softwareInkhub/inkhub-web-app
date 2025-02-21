'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, Search, Heart, Camera, Menu, X } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import LoginModal from '@/components/LoginModal';
import { AnimatePresence, motion } from 'framer-motion';
import SearchModal from './Search/SearchModal';
import Image from 'next/image';

interface NavbarProps {
  collections?: any[];
}

function useScrollDirection() {
  const [show, setShow] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
          // Scrolling down & past navbar height
          setShow(false);
        } else {
          // Scrolling up or at top
          setShow(true);
        }
        
        lastScrollY.current = currentScrollY;
      }
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, []);

  return show;
}

export default function Navbar({ collections = [] }: NavbarProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { wishlistCount } = useWishlist();
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const showNav = useScrollDirection();

  const handleProfileClick = () => {
    if (user) {
      console.log('Profile clicked, attempting navigation');
      // Use push instead of replace and remove the timeout
      router.push('/account');
    } else {
      setShowLoginModal(true);
    }
  };

  const getInitials = () => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName[0]}${userProfile.lastName[0]}`.toUpperCase();
    }
    return 'G';
  };

  const profileSection = user ? (
    <button 
      onClick={handleProfileClick}
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      <div className="w-9 h-9 p-1 rounded-full bg-black text-white flex items-center justify-center text-sm font-medium shadow-sm">
        {getInitials()}
      </div>
      <span className="hidden md:block text-sm font-medium">
        {userProfile?.firstName ? `Hi, ${userProfile.firstName}` : 'Account'}
      </span>
    </button>
  ) : (
    <button 
      onClick={handleProfileClick}
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shadow-sm">
        <User className="w-4 h-4" />
      </div>
      <span className="hidden md:block text-sm font-medium">Login</span>
    </button>
  );

  // Add menu items
  const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Collections', href: '/collections' },
    { label: 'Help & Support', href: '/help' },
  ];

  return (
    <>
      <motion.nav 
        initial={{ y: 0 }}
        animate={{ y: showNav ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className="bg-white border-b border-gray-100 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left section with hamburger and search */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Menu"
              >
                <Menu className="w-6 h-6" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Search"
              >
                <Search className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>

            {/* Logo - Updated */}
            <Link 
              href="/" 
              className="hover:opacity-80 transition-opacity"
            >
              <Image
                src="/logo.svg"
                alt="Store Logo"
                width={120}
                height={40}
                className="w-auto h-8 md:h-10"
                priority
              />
            </Link>

            {/* Right Icons */}
            <div className="flex items-center gap-2">
              <Link 
                href="/wishlist" 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                aria-label="Wishlist"
              >
                <Heart className="w-[18px] h-[18px]" strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-black text-white text-[9px] rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              {profileSection}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Slide-in Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 shadow-xl"
            >
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="py-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => {
          setShowLoginModal(false);
          router.push('/account');
        }}
      />

      <AnimatePresence>
        {isSearchOpen && (
          <SearchModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            collections={collections}
          />
        )}
      </AnimatePresence>
    </>
  );
} 