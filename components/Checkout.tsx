'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

interface CheckoutProps {
  amount: number;
  items: any[]; // Replace with your cart item type
}

export default function Checkout({ amount, items }: CheckoutProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, userProfile } = useAuth();

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!user || !userProfile) {
      toast.error('Please login to continue');
      router.push('/account/login');
      return;
    }

    setLoading(true);
    
    try {
      const res = await initializeRazorpay();
      if (!res) {
        toast.error('Razorpay SDK failed to load');
        return;
      }

      // Create order
      const response = await fetch('/api/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();
      if (!data.id) throw new Error('Failed to create order');

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'Your Store Name',
        description: 'Thank you for your purchase',
        order_id: data.id,
        prefill: {
          name: `${userProfile.firstName} ${userProfile.lastName}`,
          email: user.email || '',
          contact: userProfile.phone || '',
        },
        handler: async function (response: any) {
          try {
            // Verify payment
            const verificationResponse = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                items,
              }),
            });

            const verificationData = await verificationResponse.json();

            if (verificationData.success) {
              toast.success('Payment successful!');
              router.push('/orders');
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Verification Error:', error);
            toast.error('Payment verification failed');
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        },
        theme: {
          color: '#000000',
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Payment Error:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full bg-black text-white py-3 rounded-lg hover:bg-black/90 disabled:opacity-50"
    >
      {loading ? 'Processing...' : 'Pay Now'}
    </button>
  );
} 