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
    return <ProductDetailsSkeleton />;
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
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Main Product Section */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-12">
        {/* Image Gallery */}
        <div className="flex gap-4">
          {/* Thumbnails - Left Side */}
          {product.images.edges.length > 1 && (
            <div className="flex flex-col gap-2">
              {product.images.edges.map((image, index) => (
                <button
                  key={image.node.url}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-16 aspect-square rounded-lg overflow-hidden
                             ${selectedImage === index ? 'ring-2 ring-black' : 'ring-1 ring-gray-100'}
                             hover:ring-2 hover:ring-black transition-all`}
                >
                  <Image
                    src={image.node.url}
                    alt={image.node.altText || `Product image ${index + 1}`}
                    fill
                    className="object-contain p-2"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Image */}
          <div className="flex-1 aspect-square relative rounded-2xl overflow-hidden bg-gray-50">
            <Image
              src={product.images.edges[selectedImage]?.node.url}
              alt={product.images.edges[selectedImage]?.node.altText || product.title}
              fill
              className="object-contain p-4"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Product Info - Right Column */}
        <div className="mt-8 lg:mt-0 space-y-6">
          {/* Title, Price and Rating */}
          <div className="space-y-2">
            {/* Title */}
            <h1 className="text-2xl font-medium text-gray-900">{product.title}</h1>
            
            {/* Price */}
            <h2 className="text-xl font-medium text-gray-900">
              ₹{parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}
            </h2>
            
            {/* Rating */}
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i} 
                    className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-500">(128 reviews)</span>
            </div>
          </div>

          {/* Product Features */}
          <ProductFeatures />

          {/* Size and Quantity Side by Side */}
          <div className="grid grid-cols-2 gap-6">
            {/* Size Display */}
            {hasOptions && productOptions.map((option) => (
              <div key={option.name}>
                <h3 className="text-base mb-3">{option.name}</h3>
                <div className="h-14 px-6 rounded-full bg-gray-50 flex items-center">
                  <span className="text-base font-medium">
                    {option.values[0]}
                  </span>
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div>
              <h3 className="text-base mb-3">Quantity</h3>
              <div className="h-14 rounded-full bg-gray-50 flex items-center justify-between px-6">
                <button
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-full
                           hover:bg-white active:scale-95 transition-all"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-base font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-full
                           hover:bg-white active:scale-95 transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="flex-1 bg-black text-white h-14 rounded-full font-medium
                       hover:opacity-90 active:scale-[0.98] transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Add to Cart
            </button>
            <button
              onClick={handleWishlist}
              className="w-14 h-14 flex items-center justify-center rounded-full
                       bg-white border border-gray-200 hover:border-black
                       active:scale-95 transition-all"
            >
              <Heart 
                className={`w-5 h-5 ${
                  isInWishlist(product.id) 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-gray-600'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Product Description */}
      <ProductDescription description={product.descriptionHtml || product.description} />
      
      {/* Recommended Products - Moved below description */}
      <RecommendedProducts 
        products={products} 
        currentProductId={product.id}
      />
      
      {/* Delivery Info */}
      <DeliveryInfo />
    </div>
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