'use client';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight,
  Search, 
  TrendingUp, 
  Clock, 
  Image as ImageIcon,
  Layers as LayersIcon,
  Tag as TagIcon 
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { productsIndex, collectionsIndex } from '@/utils/algolia';
import { getCollections } from '@/utils/shopify';
import type { ShopifyCollection as IShopifyCollection } from '@/types/shopify';
import CollectionsSlider from './CollectionsSlider';
import ItemsOnSale from './ItemsOnSale';
import ProductCard from '@/components/ProductCard';
import SimpleProductCard from '../SimpleProductCard';
import { useRouter } from 'next/navigation';

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
  const [recentSearches, setRecentSearches] = useState<string[]>([
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

  const router = useRouter();

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
        const formattedCollections = collections.map(collection => ({
          id: collection.id,
          title: collection.title,
          handle: collection.handle,
          description: '',
          products_count: 0, // You'll need to get this from your API
          image: {
            url: collection.imageUrl,
            altText: collection.altText || collection.title
          }
        })) as IShopifyCollection[];
        
        setTrendingCollections(formattedCollections);
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
        const [productsResults, collectionsResults] = await Promise.all([
          productsIndex.search(searchQuery),
          collectionsIndex.search(searchQuery)
        ]);

        // Add to recent searches when search is successful
        if (productsResults?.hits?.length > 0 || collectionsResults?.hits?.length > 0) {
          addRecentSearch(searchQuery);
        }

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

  // Add this effect to save recent searches
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }
  }, [recentSearches]);

  // Add this function to handle clearing recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('recentSearches');
    }
  };

  // Add this function to handle adding new searches
  const addRecentSearch = (search: string) => {
    if (!search.trim()) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s !== search);
      return [search, ...filtered].slice(0, 5); // Keep only last 5 searches
    });
  };

  useEffect(() => {
    const hasShownInstallPrompt = localStorage.getItem('hasShownInstallPrompt');
    
    if (!hasShownInstallPrompt) {
      // Your existing PWA install prompt code here
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        // Show your custom install prompt
        // After user interaction with prompt:
        localStorage.setItem('hasShownInstallPrompt', 'true');
      });
    }
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
        <div className="px-4 h-16 flex items-center gap-3 border-b">
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
            {/* Recent Searches */}
            <div className="px-4 py-3 border-b">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <h3 className="text-xs font-medium text-gray-500">Recent Searches</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <motion.button
                    key={search}
                    onClick={() => setSearchQuery(search)}
                    whileTap={{ scale: 0.95 }}
                    className="group flex items-center gap-1.5 px-3 py-1.5 
                             bg-gray-50 hover:bg-gray-100 rounded-full 
                             transition-colors text-sm text-gray-700"
                  >
                    <Search className="w-3.5 h-3.5 text-gray-400 
                                     group-hover:text-gray-600 transition-colors" />
                    <span className="group-hover:text-gray-900 transition-colors">
                      {search}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Banner Section */}
            <div className="w-full h-40 bg-zinc-100 relative overflow-hidden">
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

            {/* Collections Grid */}
            <div className="px-4 pt-6 pb-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-medium text-gray-900">Popular Collections</h3>
                </div>
                <Link 
                  href="/collections"
                  className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1"
                >
                  View all
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {trendingCollections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => {
                      onClose();
                      setTimeout(() => {
                        router.push(`/collections/${collection.handle}`, {
                          scroll: false
                        });
                      }, 150);
                    }}
                    className="block w-full text-left"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative group overflow-hidden rounded-2xl aspect-[4/3]
                                 hover:ring-1 hover:ring-black/50 transition-all"
                    >
                      {/* Background Image */}
                      <div className="absolute inset-0 bg-gray-100">
                        {collection.image?.url ? (
                          <Image
                            src={collection.image.url}
                            alt={collection.title}
                            fill
                            className="object-cover transition-transform duration-300 
                                     group-hover:scale-110"
                            sizes="(max-width: 768px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      </div>

                      {/* Content */}
                      <div className="absolute inset-x-0 bottom-0 p-3 text-left">
                        <h4 className="text-white font-medium text-sm mb-0.5 drop-shadow-sm">
                          {collection.title}
                        </h4>
                        <p className="text-white/90 text-xs flex items-center gap-1">
                          <LayersIcon className="w-3 h-3" />
                          {collection.products_count} designs
                        </p>
                      </div>
                    </motion.div>
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Searches */}
            <div className="px-4 py-6 border-t">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                <h3 className="text-xs font-medium text-gray-500">Trending Searches</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Minimal', 'Black & Grey', 'Traditional', 'Japanese', 'Watercolor'].map((trend) => (
                  <motion.button
                    key={trend}
                    onClick={() => setSearchQuery(trend)}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 
                             rounded-full text-sm text-gray-700 transition-colors"
                  >
                    {trend}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Sale Items with improved header */}
            <div className="mt-2">
              <div className="px-4 flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TagIcon className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-medium text-gray-900">On Sale</h3>
                </div>
                <Link 
                  href="/sale"
                  className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1"
                >
                  View all
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <ItemsOnSale products={saleProducts} />
            </div>
          </div>
        ) : (
          <div className="px-4 py-6 space-y-8">
            {searchResults.loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              </div>
            ) : (
              <>
                {/* Collections Results */}
                {searchResults.collections.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-4">Collections</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {searchResults.collections.map((collection) => (
                        <Link
                          key={collection.objectID}
                          href={`/collections/${collection.handle}`}
                          className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100"
                        >
                          {collection.image && (
                            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-200">
                              <Image
                                src={typeof collection.image === 'string' ? collection.image : collection.image.url}
                                alt={collection.title || 'Collection image'}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-sm">{collection.title}</h4>
                            <p className="text-xs text-gray-500">
                              {collection.products_count} products
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products Results */}
                {searchResults.products.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-4">Products</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {searchResults.products.map((product) => (
                        <SimpleProductCard
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
                          className="aspect-[1/1.2]"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results State */}
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