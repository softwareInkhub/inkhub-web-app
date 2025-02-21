'use client';
import { useState, useEffect } from 'react';
import { ShoppingBag, Truck, Package, Clock, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import OrderSummaryModal from './OrderSummaryModal';
import TrackOrderModal from './TrackOrderModal';
import { toast } from 'react-hot-toast';

interface OrderCardProps {
  order: any;
}

export default function OrderCard({ order }: OrderCardProps) {
  const [showSummary, setShowSummary] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [fulfillmentDetails, setFulfillmentDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFulfillmentDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/orders/${order.id}/fulfillments`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch fulfillment details');
        }
        
        const data = await response.json();
        if (data.fulfillments?.[0]) {
          setFulfillmentDetails(data.fulfillments[0]);
        }
      } catch (error) {
        console.error('Error fetching fulfillment:', error);
        toast.error('Unable to load tracking details');
      } finally {
        setIsLoading(false);
      }
    };

    if (order.fulfillment_status === 'fulfilled') {
      fetchFulfillmentDetails();
    } else {
      setIsLoading(false);
    }

    return () => {
      // Cleanup if needed
      setFulfillmentDetails(null);
    };
  }, [order.id, order.fulfillment_status]);

  const displayImage = order.line_items[0]?.image || '/placeholder.png';
  const itemCount = order.line_items.length;
  const additionalItems = itemCount > 1 ? itemCount - 1 : 0;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'text-green-600';
      case 'in_transit':
      case 'out_for_delivery':
        return 'text-blue-600';
      case 'pending':
      case 'picked_up':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatStatus = (status: string) => {
    if (!status) return 'Processing';
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const handleSupportRequest = async () => {
    try {
      const response = await fetch(`/api/orders/${order.id}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      });
      const { whatsappLink } = await response.json();
      window.open(whatsappLink, '_blank');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md transition-all duration-300">
        {/* Order Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-gray-600" />
              <p className="font-medium">Order #{order.name}</p>
            </div>
            <p className="text-sm text-gray-600 mt-1">{orderDate}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">₹{order.total_price}</p>
            <p className={`text-sm capitalize mt-1 ${getStatusColor(fulfillmentDetails?.shipment_status)}`}>
              {formatStatus(fulfillmentDetails?.shipment_status)}
            </p>
          </div>
        </div>

        {/* Order Content */}
        <div className="flex gap-4">
          <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={displayImage}
              alt="Product"
              fill
              className="object-cover"
            />
            {additionalItems > 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-sm font-medium">+{additionalItems}</span>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Package className="w-4 h-4" />
              <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
            </div>

            {fulfillmentDetails?.tracking_number && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="w-4 h-4" />
                <span>Tracking ID: {fulfillmentDetails.tracking_number}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Expected Delivery: {order.expected_delivery || 'To be updated'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t">
          <button
            onClick={() => setShowSummary(true)}
            className="flex items-center justify-center gap-2 p-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl border border-gray-200"
          >
            <ShoppingBag className="w-4 h-4" />
            Details
          </button>
          <button
            onClick={() => setShowTracking(true)}
            className="flex items-center justify-center gap-2 p-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl border border-gray-200"
          >
            <Truck className="w-4 h-4" />
            Track
          </button>
          <button
            onClick={handleSupportRequest}
            className="flex items-center justify-center gap-2 p-3 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-xl"
          >
            <MessageCircle className="w-4 h-4" />
            Help
          </button>
        </div>
      </div>

      {/* Modals */}
      <OrderSummaryModal 
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        order={order}
      />
      <TrackOrderModal 
        isOpen={showTracking}
        onClose={() => setShowTracking(false)}
        order={order}
      />
    </>
  );
} 