'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ChevronLeft, Plus, MapPin, Trash2, Check, Tag } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase';

interface Address {
  id: string;
  isDefault: boolean;
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

interface DiscountCode {
  code: string;
  percentageOff?: number;
  discountValue?: number;
  type: 'percentage' | 'fixed_amount';
  isValid: boolean;
}

// Add Address Form Component
const AddressForm = ({ 
  onSubmit, 
  onCancel, 
  loading, 
  initialData 
}: { 
  onSubmit: (address: Omit<Address, 'id' | 'isDefault'>) => void;
  onCancel: () => void;
  loading: boolean;
  initialData?: Omit<Address, 'id' | 'isDefault'>;
}) => {
  const [formData, setFormData] = useState<Omit<Address, 'id' | 'isDefault'>>(
    initialData || {
      firstName: '',
      lastName: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      pincode: ''
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          className="w-full p-2 border rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
        <input
          type="text"
          value={formData.street}
          onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
          className="w-full p-2 border rounded-lg"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
        <input
          type="text"
          value={formData.pincode}
          onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
          className="w-full p-2 border rounded-lg"
          required
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-black text-white p-3 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Address'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-100 text-gray-700 p-3 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

// Add this type for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { items, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Load addresses and set default from profile
  useEffect(() => {
    if (user && userProfile) {
      loadAddresses();
    }
  }, [user, userProfile]);

  const loadAddresses = async () => {
    if (!user) return;
    try {
      // First, check for existing addresses
      const addressesRef = collection(db, `users/${user.uid}/addresses`);
      const snapshot = await getDocs(addressesRef);
      let loadedAddresses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Address[];

      // If no addresses exist and we have userProfile data, create default address
      if (loadedAddresses.length === 0 && userProfile) {
        // Check if we have the minimum required fields
        if (userProfile.firstName && userProfile.address) {
          const defaultAddress: Address = {
            id: 'default',
            isDefault: true,
            firstName: userProfile.firstName || '',
            lastName: userProfile.lastName || '',
            phone: userProfile.phone || '',
            street: userProfile.address || '',
            city: userProfile.city || '',
            state: userProfile.state || '',
            pincode: userProfile.pincode || ''
          };

          // Save default address to Firestore
          await setDoc(
            doc(db, `users/${user.uid}/addresses`, 'default'),
            defaultAddress
          );

          // Add to loaded addresses
          loadedAddresses = [defaultAddress];
          
          // Set as selected address
          setSelectedAddressId('default');
        }
      }

      // Update state with loaded addresses
      setAddresses(loadedAddresses);
      
      // Select default address if exists
      const defaultAddress = loadedAddresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }

      console.log('Loaded addresses:', loadedAddresses); // Debug log
      console.log('User profile:', userProfile); // Debug log
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast.error('Failed to load addresses');
    }
  };

  // Handle adding new address
  const handleAddAddress = async (addressData: Omit<Address, 'id' | 'isDefault'>) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const newAddressId = `address_${Date.now()}`;
      const newAddressData: Address = {
        id: newAddressId,
        isDefault: addresses.length === 0, // Make default if first address
        ...addressData
      };

      // Save to Firestore
      await setDoc(
        doc(db, `users/${user.uid}/addresses`, newAddressId),
        newAddressData
      );

      // Update local state
      setAddresses(prev => [...prev, newAddressData]);
      setSelectedAddressId(newAddressId);
      setShowAddressForm(false);
      toast.success('Address added successfully!');
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total
  const total = items.reduce(
    (sum, item) => sum + Number(item.price.amount) * item.quantity,
    0
  );

  // Handle apply coupon
  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to uppercase and remove spaces
    const value = e.target.value.toUpperCase().trim();
    setCouponCode(value);
  };

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
          cartTotal: total 
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
            percentageOff: percentageOff, // This will be 100 for "1.00"
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

  // Add function to remove applied discount
  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    toast.success('Discount removed');
  };

  // In the CheckoutPage component, add these functions:
  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }

    setLoading(true);
    try {
      const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
      const finalAmount = calculateFinalAmount();

      if (finalAmount > 0) {
        // 1. Load Razorpay SDK first
        const res = await initializeRazorpay();
        if (!res) {
          toast.error('Razorpay SDK failed to load');
          return;
        }

        // 2. Create Razorpay order
        const razorpayResponse = await fetch('/api/razorpay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Math.round(finalAmount * 100), // Convert to paise and ensure it's an integer
            currency: 'INR',
            receipt: `order_${Date.now()}`
          }),
        });

        const orderData = await razorpayResponse.json();
        
        if (!razorpayResponse.ok || !orderData) {
          throw new Error('Failed to create Razorpay order');
        }

        // 3. Initialize Razorpay options
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "InkHub",
          description: "Order Payment",
          order_id: orderData.id,
          prefill: {
            name: `${selectedAddress?.firstName} ${selectedAddress?.lastName}`,
            email: user?.email || '',
            contact: selectedAddress?.phone || ''
          },
          notes: {
            address: selectedAddress?.street
          },
          theme: {
            color: "#000000"
          },
          modal: {
            ondismiss: function() {
              setLoading(false);
            },
            escape: false,
            backdropclose: false
          },
          handler: async function(response: any) {
            try {
              // 4. Create order in your system after payment
              const orderResponse = await fetch('/api/shopify/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  items,
                  shippingAddress: selectedAddress,
                  email: user?.email,
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  signature: response.razorpay_signature,
                  finalAmount,
                  appliedDiscount: appliedDiscount ? {
                    code: appliedDiscount.code,
                    percentageOff: appliedDiscount.percentageOff,
                    type: appliedDiscount.type
                  } : null
                }),
              });

              const orderResult = await orderResponse.json();
              
              if (!orderResponse.ok || !orderResult.success) {
                throw new Error(orderResult.error || 'Failed to create order');
              }

              // 5. Success handling
              clearCart();
              toast.success('Order placed successfully!');
              router.push(`/thank-you?orderId=${orderResult.orderId}`);
            } catch (error) {
              console.error('Order creation error:', error);
              toast.error('Payment successful but order creation failed. Please contact support.');
            }
          }
        };

        // 4. Create Razorpay instance and open
        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function(response: any) {
          toast.error('Payment failed. Please try again.');
          setLoading(false);
        });
        paymentObject.open();

      } else {
        // Handle free orders
        const orderResponse = await fetch('/api/shopify/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items,
            shippingAddress: selectedAddress,
            email: user?.email,
            isFreeOrder: true,
            appliedDiscount: appliedDiscount ? {
              code: appliedDiscount.code,
              percentageOff: appliedDiscount.percentageOff,
              type: appliedDiscount.type
            } : null,
            finalAmount: finalAmount
          }),
        });

        const orderResult = await orderResponse.json();
        
        if (!orderResponse.ok || !orderResult.success) {
          throw new Error(orderResult.error || 'Failed to create free order');
        }

        clearCart();
        router.push(`/thank-you?orderId=${orderResult.orderId}`);
      }
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error('Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  // Handle remove address
  const handleRemoveAddress = async (addressId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Don't allow removing the only address
      if (addresses.length === 1) {
        toast.error("You can't remove your only address");
        return;
      }

      // Remove from Firestore
      await deleteDoc(doc(db, `users/${user.uid}/addresses`, addressId));

      // Update local state
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      
      // If we removed the selected address, select another one
      if (selectedAddressId === addressId) {
        const remainingAddresses = addresses.filter(addr => addr.id !== addressId);
        if (remainingAddresses.length > 0) {
          setSelectedAddressId(remainingAddresses[0].id);
        }
      }

      toast.success('Address removed successfully');
    } catch (error) {
      console.error('Error removing address:', error);
      toast.error('Failed to remove address');
    } finally {
      setLoading(false);
    }
  };

  // Calculate final amount with proper number handling
  const calculateFinalAmount = () => {
    if (!appliedDiscount) return total;

    try {
      if (appliedDiscount.type === 'fixed_amount') {
        return Math.max(0, total - (appliedDiscount.discountValue || 0));
      } else {
        const discountPercentage = parseFloat(String(appliedDiscount.percentageOff || "0")) / 100;
        const discountAmount = total * discountPercentage;
        return Math.max(0, total - discountAmount);
      }
    } catch (error) {
      console.error('Error calculating final amount:', error);
      return total;
    }
  };

  // Add this helper function to calculate discount amount
  const calculateDiscountAmount = () => {
    if (!appliedDiscount) return 0;

    try {
      if (appliedDiscount.type === 'fixed_amount') {
        return appliedDiscount.discountValue || 0;
      } else {
        const discountPercentage = parseFloat(String(appliedDiscount.percentageOff || "0")) / 100;
        return total * discountPercentage;
      }
    } catch (error) {
      console.error('Error calculating discount amount:', error);
      return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-medium">Checkout</h1>
        </div>

        {/* Delivery Address Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Delivery Address</h2>
            <button
              onClick={() => setShowAddressForm(true)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add New
            </button>
          </div>

          {showAddressForm ? (
            <AddressForm
              onSubmit={handleAddAddress}
              onCancel={() => setShowAddressForm(false)}
              loading={loading}
              initialData={{
                firstName: userProfile?.firstName || '',
                lastName: userProfile?.lastName || '',
                phone: userProfile?.phone || '',
                street: userProfile?.address || '',
                city: userProfile?.city || '',
                state: userProfile?.state || '',
                pincode: userProfile?.pincode || ''
              }}
            />
          ) : (
            // Address List
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`border rounded-lg p-4 ${
                    selectedAddressId === addr.id ? 'border-black' : 'border-gray-200'
                  }`}
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
                              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
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
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        disabled={loading || addresses.length === 1}
                        title={addresses.length === 1 ? "Can't remove only address" : "Remove address"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Discount Code Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Discount Code</h2>
          {appliedDiscount ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-green-600" />
                  <span className="font-medium">
                    {appliedDiscount.code} ({appliedDiscount.type === 'percentage' ? 
                      `${(parseFloat(String(appliedDiscount.percentageOff || "0")) * 1).toFixed(0)}% off` : 
                      `₹${appliedDiscount.discountValue} off`})
                  </span>
                  <button
                    onClick={handleRemoveDiscount}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-green-600">
                Savings: ₹{calculateDiscountAmount().toFixed(2)}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={couponCode}
                  onChange={handleCouponChange}
                  placeholder="Enter code"
                  className="w-full p-2 border rounded-lg uppercase"
                  disabled={validatingCoupon}
                />
              </div>
              <button
                onClick={handleApplyCoupon}
                disabled={validatingCoupon || !couponCode}
                className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50 
                           hover:bg-black/90 transition-colors"
              >
                {validatingCoupon ? 'Applying...' : 'Apply'}
              </button>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Order Summary</h2>
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.variantId} className="flex gap-4">
                <div className="relative h-20 w-20 rounded-lg border bg-gray-50 overflow-hidden">
                  <Image
                    src={item.image.url}
                    alt={item.image.altText}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  <p className="text-sm font-medium">
                    {item.price.currencyCode === 'INR' ? '₹' : '$'}
                    {(Number(item.price.amount) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-base">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₹{total.toFixed(2)}</span>
            </div>
            {appliedDiscount && (
              <div className="flex justify-between text-base text-green-600">
                <span>
                  {appliedDiscount.type === 'fixed_amount' 
                    ? `Discount (₹${appliedDiscount.discountValue})`
                    : `Discount (${appliedDiscount.percentageOff}%)`
                  }
                </span>
                <span>
                  {appliedDiscount.type === 'fixed_amount'
                    ? `-₹${appliedDiscount.discountValue}`
                    : `-₹${((total * (appliedDiscount.percentageOff || 0)) / 100).toFixed(2)}`
                  }
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-medium pt-2 border-t">
              <span>Total</span>
              <span>
                ₹{calculateFinalAmount().toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <button
          onClick={handlePlaceOrder}
          disabled={loading || !selectedAddressId}
          className="w-full bg-black text-white py-4 rounded-full font-medium disabled:opacity-50"
        >
          {loading ? 'Processing...' : 
            total > 0 
              ? `Pay Now • ₹${calculateFinalAmount().toFixed(2)}`
              : 'Place Free Order'
          }
        </button>
      </div>
    </div>
  );
}