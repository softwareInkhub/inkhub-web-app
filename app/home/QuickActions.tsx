'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { getCollections } from '@/utils/shopify';
import { useSlide } from '@/context/SlideContext';

export default function QuickActions() {
  const [allCollections, setAllCollections] = useState([]);
  const [displayedCollections, setDisplayedCollections] = useState([]);
  const { currentSlide } = useSlide();

  useEffect(() => {
    async function fetchCollections() {
      const data = await getCollections(16);
      setAllCollections(data);
    }
    fetchCollections();
  }, []);

  useEffect(() => {
    if (allCollections.length === 0) return;

    const collectionSets = {
      'new-year': allCollections.slice(0, 4),
      'summer': allCollections.slice(4, 8),
      'sale': allCollections.slice(8, 12),
      'premium': allCollections.slice(12, 16)
    };

    setDisplayedCollections(collectionSets[currentSlide] || collectionSets['new-year']);
  }, [currentSlide, allCollections]);

  return (
    <div className="w-full absolute left-0 right-0 -mt-16 z-20">
      <div className="container mx-auto px-4">
        <AnimatePresence mode="wait">
          <div key={currentSlide} className="flex justify-center gap-4 flex-wrap">
            {displayedCollections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: index * 0.1 }
                }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Link href={`/collections/${collection.handle}`}>
                  <motion.div 
                    className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-lg cursor-pointer group"
                    whileHover={{ 
                      scale: 1.1,
                      rotate: [0, -5, 5, 0],
                      transition: {
                        rotate: {
                          repeat: Infinity,
                          duration: 0.5
                        }
                      }
                    }}
                    whileTap={{ 
                      scale: 0.9,
                      rotate: 0,
                      borderRadius: "16px"
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 15,
                      mass: 0.5
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    />
                    <Image
                      src={collection.imageUrl}
                      alt={collection.altText}
                      layout="fill"
                      className="object-cover"
                    />
                    <motion.div 
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    >
                      <span className="text-white text-sm font-medium text-center px-2">
                        {collection.altText}
                      </span>
                    </motion.div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
} 