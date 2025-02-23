'use client';
import { AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from 'react-hot-toast';
import { WishlistProvider } from '@/context/WishlistContext';
import { Providers } from "./providers";
import { AuthProvider } from "@/context/AuthContext";
import { TabProvider } from '@/context/TabContext';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/context/ThemeContext';
import InstallPWA from '@/components/InstallPWA';
import FloatingNav from '@/components/FloatingNav';

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  // Common providers wrapper
  const withProviders = (content: React.ReactNode) => (
    <AuthProvider>
      <TabProvider>
        <Providers>
          <CartProvider>
            <WishlistProvider>
              <ThemeProvider>
                <AnimatePresence mode="wait">
                  {content}
                </AnimatePresence>
                <Toaster position="bottom-center" />
              </ThemeProvider>
            </WishlistProvider>
          </CartProvider>
        </Providers>
      </TabProvider>
    </AuthProvider>
  );

  if (isAdminRoute) {
    return withProviders(children);
  }

  return withProviders(
    <div className="min-h-screen flex flex-col">
      <Navbar collections={[]} />
      <main className="flex-1 w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <div key={pathname}>
            {children}
          </div>
        </AnimatePresence>
      </main>
      <FloatingNav />
      <Footer />
      <BottomNav />
      <InstallPWA />
    </div>
  );
} 