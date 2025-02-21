'use client';

import { getProducts } from '@/lib/products';
import { getCollections } from '@/lib/collections';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Tag, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Collection } from '@/lib/collections';
import { Product } from '@/lib/products';

export default function SalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const productsData = await getProducts();
      const collectionsData = await getCollections();
      setProducts(productsData);
      setCollections(collectionsData);
    };
    
    fetchData();
  }, []);

  // Filter products with discounts
  const saleProducts = products.filter(product => product.discount > 0);
  const saleCollections = collections.slice(0, 4); // Get first 4 collections

  return (
    <div className="pb-24">
      {/* Enhanced Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-purple-600 text-white p-8 rounded-b-[2.5rem] mb-10 min-h-[200px] flex flex-col justify-end"
        style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.2)'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5" />
            <span className="text-sm font-medium text-purple-200">Special Offers</span>
          </div>
          <h1 className="text-4xl font-bold mb-3 tracking-tight">Flash Sale</h1>
          <p className="text-purple-100 text-base opacity-90">Get up to 50% off on selected items</p>
        </motion.div>
      </motion.div>

      {/* Featured Collections */}
      <div className="px-4 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Featured Collections</h2>
          <Link href="/collections" className="text-sm text-gray-600 flex items-center gap-1 hover:text-black">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {saleCollections.map((collection, index) => (
            <Link 
              key={collection.id} 
              href={`/collections/${collection.slug}`}
            >
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative rounded-2xl overflow-hidden aspect-[4/3]"
              >
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                  <span className="text-white font-medium text-sm">{collection.name}</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Sale Products */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-4">Sale Products</h2>
        <div className="grid grid-cols-2 gap-3">
          {saleProducts.map((product, index) => (
            <Link 
              key={product.id}
              href={`/products/${product.slug}`}
            >
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="relative rounded-2xl overflow-hidden aspect-square mb-2">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                    -{product.discount}%
                  </div>
                </div>
                <h3 className="font-medium text-sm mb-1 truncate">{product.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-red-500 font-semibold">
                    ${(product.price * (1 - product.discount/100)).toFixed(2)}
                  </span>
                  <span className="text-gray-400 text-sm line-through">
                    ${product.price}
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 