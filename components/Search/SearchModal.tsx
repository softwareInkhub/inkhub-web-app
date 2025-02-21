'use client';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { productsIndex, collectionsIndex } from '@/utils/algolia';
import { getCollections } from '@/utils/shopify';
import type { ShopifyCollection as IShopifyCollection } from '@/types/shopify';
import CollectionsSlider from './CollectionsSlider';
import ItemsOnSale from './ItemsOnSale';
import ProductCard from '@/components/ProductCard';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  collections: any;
}

// Add interface for the API response
interface ProductsApiResponse {
  collection?: {
    products: {
      edges: Array<{
        id: string;
        handle: string;
        title: string;
        image?: {
          url: string;
          altText?: string;
        };
        price: string;
      }>;
    };
  };
  error?: string;
}

export default function SearchModal({ 
  isOpen, 
  onClose, 
  searchQuery, 
  setSearchQuery,
}: SearchModalProps) {
  const [recentSearches] = useState([
    'Minimal Tattoo',
    'Urban Style Art',
    'Black & White Design'
  ]);
  
  const [searchResults, setSearchResults] = useState({
    products: [],
    collections: [],
    loading: false,
  });

  const [trendingCollections, setTrendingCollections] = useState<IShopifyCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedCollectionProducts, setSelectedCollectionProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);

  // Add saleProducts state
  const [saleProducts, setSaleProducts] = useState([]);
  const [isLoadingSale, setIsLoadingSale] = useState(true);

  const [currentBanner, setCurrentBanner] = useState(0);
  const banners = [
    '/sc-bn-1.png',
    '/sc-bn-2.png',
    '/sc-bn-3.png'
  ];

  console.log('Banner paths:', banners);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchCollections = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const collections = await getCollections();
        if (!Array.isArray(collections)) {
          throw new Error('Invalid collections response');
        }
        setTrendingCollections(collections);
      } catch (err) {
        console.error('Error fetching collections:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch collections');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery) {
        setSearchResults({ products: [], collections: [], loading: false });
        return;
      }

      setSearchResults(prev => ({ ...prev, loading: true }));

      try {
        console.log('Starting search for:', searchQuery);
        
        const [productsResults, collectionsResults] = await Promise.all([
          productsIndex.search(searchQuery),
          collectionsIndex.search(searchQuery)
        ]);

        console.log('Search completed:', {
          products: productsResults,
          collections: collectionsResults
        });

        setSearchResults({
          products: productsResults?.hits || [],
          collections: collectionsResults?.hits || [],
          loading: false
        });
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults({ products: [], collections: [], loading: false });
      }
    };

    performSearch();
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setSearchQuery(e.target.value);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // Add click handler to prevent propagation
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleCollectionClick = async (collection: IShopifyCollection) => {
    setIsLoading(true);
    setError(null);
    setActiveCollection(collection.id);

    try {
      const cleanId = collection.id.replace('gid://shopify/Collection/', '');
      const response = await fetch(`/api/products?collection=${cleanId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load collection products');
      }

      const formattedProducts = data.collection.products.edges.map(({ node }: any) => ({
        id: node.id,
        title: node.title,
        handle: node.handle,
        price: {
          amount: node.priceRange.minVariantPrice.amount,
          currencyCode: node.priceRange.minVariantPrice.currencyCode
        },
        image: {
          url: node.images.edges[0]?.node.url || '',
          altText: node.images.edges[0]?.node.altText || node.title
        },
        variantId: node.variants.edges[0]?.node.id
      }));

      setSelectedCollectionProducts(formattedProducts);
    } catch (err) {
      console.error('Error loading collection products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
      setSelectedCollectionProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch sale products on component mount
  useEffect(() => {
    const fetchSaleProducts = async () => {
      try {
        const response = await fetch('/api/products?type=sale');
        const data = await response.json();
        
        if (data.products) {
          setSaleProducts(data.products);
        }
      } catch (error) {
        console.error('Error fetching sale products:', error);
      } finally {
        setIsLoadingSale(false);
      }
    };

    fetchSaleProducts();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed inset-0 bg-white z-50"
    >
      <div className="safe-top bg-white">
        <div className="px-4 h-16 flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1">
            <div className="relative">
              <input
                type="search"
                placeholder="Search tattoo designs..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full h-11 pl-11 pr-4 bg-gray-100 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-black/5"
                autoFocus
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto h-[calc(100vh-64px)]">
        {!searchQuery ? (
          <div className="flex flex-col">
            <div className="w-full h-48 bg-zinc-100 relative overflow-hidden">
              {banners.map((banner, index) => (
                <div
                  key={banner}
                  className="absolute inset-0 w-full h-full transition-opacity duration-500"
                  style={{ opacity: currentBanner === index ? 1 : 0 }}
                >
                  <Image
                    src={banner}
                    alt={`Banner ${index + 1}`}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              ))}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBanner(index)}
                    className={`w-2 h-2 rounded-full ${
                      currentBanner === index ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            <ItemsOnSale products={saleProducts} />

            <CollectionsSlider
              collections={trendingCollections}
              activeCollection={activeCollection}
              onCollectionClick={handleCollectionClick}
              selectedCollectionProducts={selectedCollectionProducts}
              isLoading={isLoading}
              error={error}
            />

          <ItemsOnSale products={saleProducts} />

          </div>
        ) : (
          <div className="px-4 py-6 space-y-8">
            {searchResults.loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Searching...</p>
              </div>
            ) : (
              <>
                {searchResults.collections.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-4">Collections</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {searchResults.collections.map((collection) => (
                        <Link
                          key={collection.objectID}
                          href={`/collections/${collection.handle}`}
                          className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100"
                        >
                          {collection.image && (
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                              <Image
                                src={typeof collection.image === 'string' ? collection.image : collection.image.url}
                                alt={collection.title || 'Collection image'}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium">{collection.title}</h4>
                            <p className="text-sm text-gray-500">
                              {collection.products_count} products
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.products.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-4">Products</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                      {searchResults.products.map((product) => (
                        <ProductCard
                          key={product.objectID}
                          product={{
                            id: product.objectID,
                            title: product.title,
                            handle: product.handle,
                            price: {
                              amount: product.priceRange?.minVariantPrice?.amount || '0',
                              currencyCode: 'INR'
                            },
                            image: {
                              url: product.image?.url || '/placeholder.jpg',
                              altText: product.title
                            },
                            variantId: product.variantId || product.objectID
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {!searchResults.collections.length && !searchResults.products.length && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No results found for "{searchQuery}"</p>
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="mt-2 text-sm text-black hover:opacity-70"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
} 