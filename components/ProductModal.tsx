'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { ShoppingBag, Minus, Plus, Heart, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ProductFeatures from './ProductFeatures';
import ProductDescription from './ProductDescription';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
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
    // Optional Shopify fields
    images?: {
      edges: Array<{
        node: {
          url: string;
          altText: string | null;
        };
      }>;
    };
    priceRange?: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    variants?: {
      edges: Array<{
        node: {
          id: string;
        };
      }>;
    };
    descriptionHtml?: string;
    description?: string;
  };
  clickPosition: { x: number; y: number; width: number; height: number };
}

export default function ProductModal({ isOpen, onClose, product, clickPosition }: ProductModalProps) {
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Helper function to get images array
  const getImages = () => {
    if (product.images?.edges) {
      return product.images.edges;
    }
    // If no edges, create a single image array from the product.image
    return [{
      node: {
        url: product.image.url,
        altText: product.image.altText
      }
    }];
  };

  // Helper function to get price
  const getPrice = () => {
    if (product.priceRange?.minVariantPrice) {
      return product.priceRange.minVariantPrice.amount;
    }
    return product.price.amount;
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart({
        id: product.id,
        title: product.title,
        handle: product.handle,
        price: product.price,
        image: product.image,
        variantId: product.variantId,
        quantity,
        selectedOptions: []
      });
      toast.success('Added to cart');
      onClose();
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

  const images = getImages();

  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 }
  };

  const modalVariants = {
    closed: {
      transform: `translate(${clickPosition.x}px, ${clickPosition.y}px)`,
      top: 0,
      left: 0,
      width: clickPosition.width,
      height: clickPosition.height,
      scale: 1,
      borderRadius: 8,
      transformOrigin: '50% 50%'
    },
    open: {
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      scale: 1,
      borderRadius: 0,
      transition: {
        type: "spring",
        duration: 0.3,
        stiffness: 300,
        damping: 30
      }
    }
  };

  const contentVariants = {
    closed: {
      opacity: 0,
      scale: 0.98,
      y: 10
    },
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: 0.15,
        duration: 0.2
      }
    }
  };

  const imageVariants = {
    closed: {
      scale: 1,
      opacity: 1
    },
    open: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="overlay"
          variants={overlayVariants}
          initial="closed"
          animate="open"
          exit="closed"
          className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            key="modal"
            variants={modalVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="bg-white overflow-y-auto will-change-transform"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ delay: 0.2 }}
              onClick={onClose}
              className="fixed top-4 right-4 z-50 p-2 bg-white rounded-full shadow-lg"
            >
              <X className="w-6 h-6" />
            </motion.button>

            <motion.div
              variants={contentVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="max-w-7xl mx-auto px-4 py-6"
            >
              <div className="lg:grid lg:grid-cols-2 lg:gap-12">
                {/* Image Gallery */}
                <div className="flex gap-4">
                  {/* Thumbnails */}
                  {images.length > 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-col gap-2"
                    >
                      {images.map((image, index) => (
                        <motion.button
                          key={image.node.url}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
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
                        </motion.button>
                      ))}
                    </motion.div>
                  )}

                  {/* Main Image */}
                  <motion.div 
                    className="flex-1 aspect-square relative rounded-2xl overflow-hidden bg-gray-50"
                    layoutId={`product-image-${product.id}`}
                    variants={imageVariants}
                  >
                    <Image
                      src={images[selectedImage].node.url}
                      alt={images[selectedImage].node.altText || product.title}
                      fill
                      className="object-contain p-4"
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </motion.div>
                </div>

                {/* Product Info */}
                <motion.div
                  variants={contentVariants}
                  className="mt-8 lg:mt-0 space-y-6"
                >
                  <div className="space-y-2">
                    <h1 className="text-2xl font-medium text-gray-900">{product.title}</h1>
                    <h2 className="text-xl font-medium text-gray-900">
                      ₹{parseFloat(getPrice()).toFixed(2)}
                    </h2>
                  </div>

                  <ProductFeatures />

                  {/* Quantity Selector */}
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

                  {/* Product Description */}
                  <ProductDescription description={product.descriptionHtml || product.description} />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 