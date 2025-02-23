'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Minus, Plus, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useWishlist } from '@/context/WishlistContext';
import ProductFeatures from './ProductFeatures';
import ProductDescription from './ProductDescription';
import RecommendedProducts from './RecommendedProducts';
import DeliveryInfo from './DeliveryInfo';
import ProductDetailsSkeleton from './ProductDetailsSkeleton';
import { motion } from 'framer-motion';
import PageTransition from './PageTransition';

interface Variant {
  node: {
    id: string;
    title: string;
    price: {
      amount: string;
      currencyCode: string;
    };
    availableForSale: boolean;
    selectedOptions: {
      name: string;
      value: string;
    }[];
  };
}

interface ProductDetailsProps {
  product: {
    id: string;
    title: string;
    handle: string;
    description: string;
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    images: {
      edges: Array<{
        node: {
          url: string;
          altText: string | null;
        };
      }>;
    };
    variants: {
      edges: Array<Variant>;
    };
    options: Array<{
      name: string;
      values: string[];
    }>;
    collections?: {
      edges: Array<{
        node: {
          handle: string;
        };
      }>;
    };
    descriptionHtml?: string;
  };
  products: any[];
}

export default function ProductDetails({ product, products }: ProductDetailsProps) {
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('Description');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  const productOptions = product.options || [];
  const hasOptions = productOptions.length > 0;

  useEffect(() => {
    if (product) {
      setIsLoading(false);
    }
  }, [product]);

  if (isLoading) {
    return <ProductDetailsSkeleton productId={product.id} />;
  }

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart({
        id: product.id,
        title: product.title,
        handle: product.handle,
        price: {
          amount: product.priceRange.minVariantPrice.amount,
          currencyCode: product.priceRange.minVariantPrice.currencyCode,
        },
        image: {
          url: product.images.edges[0]?.node.url || '',
          altText: product.images.edges[0]?.node.altText || product.title,
        },
        variantId: product.variants.edges[0]?.node.id || '',
        quantity,
        selectedOptions: []
      });
      toast.success('Added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlist = () => {
    const productId = product.id;
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(productId);
      toast.success('Added to wishlist');
    }
  };

  const updateSelectedOptions = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: value
    }));
  };

  return (
    <PageTransition>
      <motion.div 
        className="max-w-7xl mx-auto px-4 py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Image Gallery */}
          <motion.div 
            className="flex gap-3"
            layoutId={`product-gallery-${product.id}`}
          >
            {/* Thumbnails */}
            <div className="flex flex-col gap-2">
              {product.images.edges.map((image, index) => (
                <motion.button
                  key={image.node.url}
                  layoutId={`product-thumbnail-${product.id}-${index}`}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-16 aspect-square rounded-lg overflow-hidden
                           ${selectedImage === index ? 'ring-2 ring-black' : 'ring-1 ring-gray-100'}`}
                >
                  <Image
                    src={image.node.url}
                    alt={image.node.altText || ''}
                    fill
                    className="object-contain p-2"
                  />
                </motion.button>
              ))}
            </div>

            {/* Main Image */}
            <motion.div 
              className="flex-1 aspect-square relative rounded-2xl overflow-hidden bg-gray-50"
              layoutId={`product-image-${product.id}`}
            >
              <Image
                src={product.images.edges[selectedImage]?.node.url}
                alt={product.images.edges[selectedImage]?.node.altText || product.title}
                fill
                className="object-contain p-4"
                priority
              />
            </motion.div>
          </motion.div>

          {/* Product Info */}
          <motion.div 
            className="mt-6 lg:mt-0 space-y-4"
            layoutId={`product-info-${product.id}`}
          >
            {/* Title and Price stacked */}
            <motion.div 
              className="space-y-1"
              layoutId={`product-header-${product.id}`}
            >
              <h1 className="text-xl font-medium">{product.title}</h1>
              <div className="flex items-center gap-0.5">
                <span className="text-sm text-gray-500">₹</span>
                <span className="text-lg">
                  {parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}
                </span>
              </div>
            </motion.div>

            {/* Product Features */}
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              100% SKIN SAFE | WATERPROOF | LOOKS REAL
            </div>

            {/* In Stock Status */}
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              In stock, ready to ship
            </div>

            {/* Size and Quantity Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              {/* Size Display */}
              {hasOptions && productOptions.map((option) => (
                <div key={option.name}>
                  <h3 className="text-sm mb-2 text-gray-600">{option.name}</h3>
                  <div className="h-10 px-4 rounded-lg bg-gray-50 flex items-center">
                    <span className="text-sm">
                      {option.values[0]}
                    </span>
                  </div>
                </div>
              ))}

              {/* Quantity */}
              <div>
                <h3 className="text-sm mb-2 text-gray-600">Quantity</h3>
                <div className="h-10 rounded-lg bg-gray-50 flex items-center justify-between px-3">
                  <button
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-md
                             hover:bg-white active:scale-95 transition-all"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-md
                             hover:bg-white active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1 bg-black text-white h-11 rounded-lg text-sm font-medium
                         hover:opacity-90 active:scale-[0.98] transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </button>
              <button
                onClick={handleWishlist}
                className="w-11 h-11 flex items-center justify-center rounded-lg
                         bg-white border border-gray-200 hover:border-black
                         active:scale-95 transition-all"
              >
                <Heart 
                  className={`w-4 h-4 ${
                    isInWishlist(product.id) 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-gray-600'
                  }`}
                />
              </button>
            </div>

            {/* Product Description */}
            <ProductDescription description={product.descriptionHtml || product.description} />
          </motion.div>
        </div>

        {/* Recommended Products */}
        <div className="mt-12">
          <RecommendedProducts products={products} currentProductId={product.id} />
          <DeliveryInfo />
        </div>
      </motion.div>
    </PageTransition>
  );
}

// Add this CSS to your globals.css
/*
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
*/ 