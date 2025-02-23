"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Home, Search, Heart, ShoppingBag } from "lucide-react";
import { useRouter } from 'next/navigation';

const FloatingNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const options = [
    {
      label: "Home",
      onClick: () => router.push('/'),
      Icon: <Home className="w-5 h-5" />
    },
    {
      label: "Search",
      onClick: () => router.push('/search'),
      Icon: <Search className="w-5 h-5" />
    },
    {
      label: "Wishlist",
      onClick: () => router.push('/wishlist'),
      Icon: <Heart className="w-5 h-5" />
    },
    {
      label: "Cart",
      onClick: () => router.push('/cart'),
      Icon: <ShoppingBag className="w-5 h-5" />
    }
  ];

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="default"
        size="icon"
        className="w-12 h-12 rounded-full bg-black text-white shadow-lg hover:bg-black/90"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{
            duration: 0.2,
            ease: "easeInOut",
          }}
        >
          <Plus className="w-6 h-6" />
        </motion.div>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 mb-2"
          >
            <div className="flex flex-col items-end gap-2">
              {options.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.05,
                  }}
                >
                  <Button
                    onClick={() => {
                      setIsOpen(false);
                      option.onClick();
                    }}
                    variant="default"
                    className="flex items-center gap-3 bg-white text-black border border-gray-200
                             hover:bg-gray-50 shadow-lg px-4 py-2 rounded-full min-w-[120px]
                             justify-center font-medium"
                  >
                    {option.Icon}
                    <span className="text-sm">{option.label}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingNav; 