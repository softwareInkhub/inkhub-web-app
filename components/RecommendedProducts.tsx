'use client';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';

interface RecommendedProductsProps {
  products: any[];
  currentProductId: string;
}

export default function RecommendedProducts({ products, currentProductId }: RecommendedProductsProps) {
  // Add null check for products
  if (!products || products.length === 0) return null;

  // Filter out the current product and get up to 10 recommended products
  const recommendedProducts = products
    .filter(product => product.id !== currentProductId)
    .slice(0, 10);

  if (recommendedProducts.length === 0) return null;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-medium text-gray-900 mb-6"
        >
          You might also like
        </motion.h2>

        {/* Scrollable container without gradient masks */}
        <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4 -mx-4 px-4">
          {recommendedProducts.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-[200px] sm:w-[220px]">
              <ProductCard 
                product={product}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 