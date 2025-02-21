'use client';
// Add these type declarations at the top of the file
declare global {
  interface Window {
    recaptchaVerifier: any;
    confirmationResult: any;
  }
}

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ChevronLeft, MapPin, Tag, Check, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import AddressForm from '@/components/AddressForm';
import { auth } from '@/utils/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import LoginBottomSheet from '@/components/LoginBottomSheet';

// Add interface for Address type
interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

// Add interface for CartItem
interface CartItem {
  variantId: string;
  title: string;
  handle: string;
  quantity: number;
  image: { url: string; altText: string };
  price: { amount: string };
  selectedOptions: { name: string; value: string }[];
}

// Add this function before your CartPage component
const initializeRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CartPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { items, removeFromCart, updateQuantity, clearCart } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    type: 'percentage' | 'fixed_amount';
    percentageOff?: number;
    discountValue?: number;
    isValid: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price.amount) * item.quantity,
    0
  );

  // Add function to get user's phone number
  const getUserPhone = () => {
    return user?.phoneNumber?.replace('+91', '') || '';
  };

  // Update useEffect to properly type the addresses
  useEffect(() => {
    if (user) {
      const loadAddresses = async () => {
        try {
          const addressesRef = collection(db, `users/${user.uid}/addresses`);
          const snapshot = await getDocs(addressesRef);
          const loadedAddresses = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Address[];
          setAddresses(loadedAddresses);

          // Set default address as selected if exists
          const defaultAddress = loadedAddresses.find(addr => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
          }
        } catch (error) {
          console.error('Error loading addresses:', error);
          toast.error('Failed to load addresses');
        }
      };

      loadAddresses();
    }
  }, [user]);

  // Handle coupon input
  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().trim();
    setCouponCode(value);
  };

  // Handle apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode) {
      toast.error('Please enter a coupon code');
      return;
    }

    setValidatingCoupon(true);
    try {
      const response = await fetch('/api/shopify/validate-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: couponCode.toUpperCase(),
          cartTotal: subtotal 
        }),
      });

      const data = await response.json();

      if (data.valid) {
        console.log('Discount data:', data.discount);

        if (data.discount.type === 'percentage') {
          // Convert "1.00" to 100% or "0.50" to 50%
          const percentageOff = parseFloat(data.discount.amount) * 100;
          
          setAppliedDiscount({
            code: data.discount.code,
            percentageOff,
            type: 'percentage',
            isValid: true
          });
        } else {
          setAppliedDiscount({
            code: data.discount.code,
            discountValue: parseFloat(data.discount.amount),
            type: 'fixed_amount',
            isValid: true
          });
        }
        
        toast.success(`Coupon "${data.discount.code}" applied successfully!`);
        setCouponCode('');
      } else {
        setAppliedDiscount(null);
        toast.error(data.error || 'Invalid discount code');
      }
    } catch (error) {
      console.error('Coupon Error:', error);
      toast.error('Failed to validate discount code');
      setAppliedDiscount(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Calculate final amount
  const calculateFinalAmount = () => {
    if (!appliedDiscount) return subtotal;

    try {
      if (appliedDiscount.type === 'fixed_amount') {
        return Math.max(0, subtotal - (appliedDiscount.discountValue || 0));
      } else {
        const discountPercentage = parseFloat(String(appliedDiscount.percentageOff || "0")) / 100;
        const discountAmount = subtotal * discountPercentage;
        return Math.max(0, subtotal - discountAmount);
      }
    } catch (error) {
      console.error('Error calculating final amount:', error);
      return subtotal;
    }
  };

  // Calculate discount amount
  const calculateDiscountAmount = () => {
    if (!appliedDiscount) return 0;

    try {
      if (appliedDiscount.type === 'fixed_amount') {
        return appliedDiscount.discountValue || 0;
      } else {
        const discountPercentage = parseFloat(String(appliedDiscount.percentageOff || "0")) / 100;
        return subtotal * discountPercentage;
      }
    } catch (error) {
      console.error('Error calculating discount amount:', error);
      return 0;
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }

    setLoading(true);
    try {
      const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
      const finalAmount = calculateFinalAmount();

      if (!selectedAddress) {
        throw new Error('Selected address not found');
      }

      const orderData = {
        items,
        shippingAddress: selectedAddress,
        email: user?.email,
        name: `${selectedAddress.firstName} ${selectedAddress.lastName}`,
        isFreeOrder: finalAmount === 0,
        appliedDiscount: appliedDiscount ? {
          code: appliedDiscount.code,
          percentageOff: appliedDiscount.percentageOff,
          type: appliedDiscount.type
        } : null,
        finalAmount: finalAmount
      };

      if (finalAmount > 0) {
        const res = await initializeRazorpay();
        
        if (!res) {
          toast.error('Razorpay SDK failed to load');
          return;
        }

        const razorpayResponse = await fetch('/api/razorpay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: finalAmount
          }),
        });

        const orderData = await razorpayResponse.json();
        
        if (!razorpayResponse.ok || !orderData) {
          throw new Error('Failed to create Razorpay order');
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "InkHub",
          description: "Order Payment",
          order_id: orderData.id,
          handler: async function (response: any) {
            try {
              const orderResponse = await fetch('/api/shopify/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  items,
                  shippingAddress: selectedAddress,
                  email: user?.email,
                  name: `${selectedAddress.firstName} ${selectedAddress.lastName}`,
                  isFreeOrder: false,
                  appliedDiscount: appliedDiscount ? {
                    code: appliedDiscount.code,
                    percentageOff: appliedDiscount.percentageOff,
                    type: appliedDiscount.type
                  } : null,
                  paymentId: response.razorpay_payment_id,
                  finalAmount: finalAmount
                }),
              });

              const orderResult = await orderResponse.json();
              
              if (!orderResponse.ok || !orderResult.success) {
                throw new Error(orderResult.error || 'Failed to create order');
              }

              clearCart();
              router.push(`/thank-you?orderId=${orderResult.orderId}`);
            } catch (error) {
              console.error('Order creation error:', error);
              toast.error('Payment successful but order creation failed');
            }
          },
          prefill: {
            email: user?.email || '',
          },
          theme: {
            color: "#000000",
          },
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();

      } else {
        // Handle free order
        const orderResponse = await fetch('/api/shopify/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });

        const orderResult = await orderResponse.json();
        
        if (!orderResponse.ok || !orderResult.success) {
          throw new Error(orderResult.error || 'Failed to create free order');
        }

        clearCart();
        router.push(`/thank-you?orderId=${orderResult.orderId}`);
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (addressData: Omit<Address, 'id' | 'isDefault'>) => {
    if (!user) {
      toast.error('Please login to continue');
      return;
    }

    setLoading(true);
    try {
      const newAddressData = {
        ...addressData,
        isDefault: addresses.length === 0, // First address is default
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add new address
      const newAddressRef = doc(collection(db, `users/${user.uid}/addresses`));
      await setDoc(newAddressRef, newAddressData);

      // Update addresses list
      const newAddress = { id: newAddressRef.id, ...newAddressData };
      setAddresses(prev => [...prev, newAddress]);
      
      // If this is the first address, set it as selected
      if (addresses.length === 0) {
        setSelectedAddressId(newAddressRef.id);
      }

      setShowAddressForm(false);
      toast.success('Address added successfully!');
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }

      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA verified');
        },
        'expired-callback': () => {
          toast.error('reCAPTCHA expired. Please try again.');
          if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
          }
        }
      });
    } catch (error) {
      console.error('Error setting up reCAPTCHA:', error);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      setupRecaptcha();
      const formattedPhone = '+91' + phone;

      if (!window.recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized');
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        window.recaptchaVerifier
      );

      window.confirmationResult = confirmation;
      setOtpSent(true);
      toast.success('OTP sent successfully!');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast.error(error.message || 'Failed to send OTP');
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      const confirmationResult = window.confirmationResult;
      if (!confirmationResult) {
        throw new Error('Please request OTP first');
      }

      const result = await confirmationResult.confirm(otp);
      if (result.user) {
        toast.success('Successfully logged in!');
        setShowLoginModal(false);
        setOtpSent(false);
        setOtp('');
        // Continue with order placement after successful login
        handlePlaceOrder();
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRemoveAddress = async (addressId: string) => {
    if (!user) return;
    
    try {
      // Only prevent removing default address if there are multiple addresses
      const addressToRemove = addresses.find(addr => addr.id === addressId);
      if (addressToRemove?.isDefault && addresses.length > 1) {
        toast.error("Please set another address as default first before removing this one.");
        return;
      }

      await deleteDoc(doc(db, `users/${user.uid}/addresses`, addressId));

      // Update local state
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      
      // Clear selected address if it was the one removed
      if (selectedAddressId === addressId) {
        setSelectedAddressId('');
      }

      toast.success('Address removed successfully');
    } catch (error) {
      console.error('Error removing address:', error);
      toast.error('Failed to remove address');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/products" className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-medium">My Cart</h1>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <ShoppingBag className="h-16 w-16 text-gray-400" />
          <p className="text-gray-500">Your cart is empty</p>
          <Link href="/products" className="text-sm font-medium text-black hover:text-gray-700">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Address Section */}
          <div className="bg-white rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Delivery Address</h3>
              <button
                onClick={() => setShowAddressForm(true)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Add New Address
              </button>
            </div>

            {addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`border rounded-lg p-4 ${
                      selectedAddressId === addr.id 
                      ? 'border-black bg-black/5' 
                      : 'border-gray-200 bg-white'
                    } hover:border-black transition-colors`}
                  >
                    <div className="flex justify-between items-start">
                      <div 
                        className="flex-1 cursor-pointer" 
                        onClick={() => setSelectedAddressId(addr.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {addr.firstName} {addr.lastName}
                              </p>
                              {addr.isDefault && (
                                <span className="text-xs bg-black/10 px-2 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{addr.street}</p>
                            <p className="text-sm text-gray-600">
                              {addr.city}, {addr.state} {addr.pincode}
                            </p>
                            <p className="text-sm text-gray-600">
                              Phone: {addr.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedAddressId === addr.id && (
                          <Check className="w-5 h-5 text-black" />
                        )}
                        <button
                          onClick={() => handleRemoveAddress(addr.id)}
                          className={`p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors ${
                            (addr.isDefault && addresses.length > 1) ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          disabled={addr.isDefault && addresses.length > 1}
                          title={
                            addr.isDefault && addresses.length > 1
                              ? "Set another address as default first"
                              : "Remove address"
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No addresses found</p>
              </div>
            )}
          </div>

          {/* Address Form */}
          {showAddressForm && (
            <AddressForm
              onSubmit={handleAddAddress}
              onCancel={() => setShowAddressForm(false)}
              loading={loading}
              initialData={{
                phone: getUserPhone() // Auto-fill phone number from user profile
              }}
              isModal={true}
            />
          )}

          {/* Cart Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.variantId} className="bg-white rounded-xl p-4 space-y-4">
                <div className="flex gap-4">
                  <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-gray-50">
                    <Image
                      src={item.image.url}
                      alt={item.image.altText}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <Link href={`/products/${item.handle}`} className="block group">
                      <h3 className="font-medium group-hover:text-gray-600">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="text-sm text-gray-500">
                          {item.selectedOptions?.map((option) => option.value).join(' / ')}
                        </div>
                      </div>
                    </Link>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.variantId, Number(e.target.value))}
                          className="p-1 border rounded bg-gray-50"
                        >
                          {[1, 2, 3, 4, 5].map((num) => (
                            <option key={num} value={num}>
                              Qty: {num}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => removeFromCart(item.variantId)}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 line-through">
                          ₹{Number(item.price.amount).toFixed(2)}
                        </div>
                        <div className="font-medium">
                          ₹{(Number(item.price.amount) * 0.9).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Discount Code Section */}
          <div className="bg-white rounded-xl p-4 mb-4">
            <h2 className="font-medium mb-4">Discount Code</h2>
            {appliedDiscount ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-green-600" />
                  <span className="font-medium">
                    {appliedDiscount.code} 
                    {appliedDiscount.type === 'percentage' ? 
                      `(${appliedDiscount.percentageOff}% off)` : 
                      `(₹${appliedDiscount.discountValue} off)`}
                  </span>
                </div>
                <button
                  onClick={() => setAppliedDiscount(null)}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={handleCouponChange}
                  placeholder="Enter code"
                  className="flex-1 p-2 border rounded-lg uppercase"
                  disabled={validatingCoupon}
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon || !couponCode}
                  className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50"
                >
                  {validatingCoupon ? 'Applying...' : 'Apply'}
                </button>
              </div>
            )}
          </div>

          {/* Price Details */}
          <div className="bg-white rounded-xl p-4 space-y-3">
            <h3 className="font-medium mb-4">Price Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Price ({items.length} items)</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600">
                    -₹{calculateDiscountAmount().toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Charges</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="flex justify-between font-medium pt-3 border-t">
                <span>Total Amount</span>
                <span>₹{calculateFinalAmount().toFixed(2)}</span>
              </div>
            </div>
            {appliedDiscount && (
              <div className="text-sm text-green-600 pt-2">
                You will save ₹{calculateDiscountAmount().toFixed(2)} on this order
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-xl font-medium">₹{calculateFinalAmount().toFixed(2)}</div>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="bg-black text-white px-8 py-3 rounded-full font-medium
                         hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Place order'}
              </button>
            </div>
          </div>
          <div className="h-20" /> {/* Spacer for fixed footer */}
        </div>
      )}

      {/* Login Modal */}
      <LoginBottomSheet 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => {
          setShowLoginModal(false);
          handlePlaceOrder();
        }}
      />
    </div>
  );
} 