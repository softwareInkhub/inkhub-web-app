'use client';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/ProductCard';
import { useEffect, useState } from 'react';
import Link from 'next/link';

// Define the Product type
type Product = {
  id: string;
  handle: string;
  title: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  image: {
    url: string;
    altText: string;
  };
  variantId: string;
};

export default function WishlistPage() {
  const { wishlistItems } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Fetch each product by ID
        const productPromises = wishlistItems.map(async (id) => {
          const response = await fetch(`/api/products/${id}`);
          if (!response.ok) throw new Error('Failed to fetch product');
          return response.json();
        });

        const fetchedProducts = await Promise.all(productPromises);
        console.log('Fetched products:', fetchedProducts); // Debug log
        setProducts(fetchedProducts.filter(Boolean));
      } catch (error) {
        console.error('Error fetching wishlist products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (wishlistItems.length > 0) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [wishlistItems]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">My Wishlist ({wishlistItems.length})</h1>
        <div className="animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 aspect-square rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">My Wishlist ({wishlistItems.length})</h1>
      
      {wishlistItems.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            Your wishlist is empty
          </h2>
          <p className="text-gray-500 mb-8">
            Add items you love to your wishlist. Review them anytime and easily move them to the cart.
          </p>
          <Link
            href="/collections/all"
            className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium 
                     hover:bg-gray-900 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
} 