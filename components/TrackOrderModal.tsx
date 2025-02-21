'use client';
import { useEffect, useState } from 'react';
import { X, Package, Truck, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import axios from 'axios';

interface Order {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: Date | string;
  trackingNumber?: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  totalAmount: number;
  created_at: Date | string;
  financial_status: string;
  fulfillment_status: string;
}

interface FulfillmentEvent {
  id: string;
  status: string;
  message: string;
  happened_at: string;
  estimated_delivery_at?: string;
  location?: string;
}

interface Fulfillment {
  id: string;
  order_id: string;
  status: string;
  created_at: string;
  tracking_company: string;
  tracking_number: string;
  tracking_url: string;
  estimated_delivery_at: string;
  events: FulfillmentEvent[];
  shipment_status: string;
}

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

export default function TrackOrderModal({ isOpen, onClose, order }: TrackOrderModalProps) {
  const [fulfillments, setFulfillments] = useState<Fulfillment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && order.id) {
      fetchFulfillmentDetails();
    }
  }, [isOpen, order.id]);

  const fetchFulfillmentDetails = async () => {
    try {
      const response = await axios.get(`/api/orders/${order.id}/fulfillments`);
      setFulfillments(response.data.fulfillments);
    } catch (error) {
      console.error('Error fetching fulfillment details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isCurrentStatus = (eventStatus: string, currentShipmentStatus: string) => {
    // Normalize both statuses for comparison
    const normalizedEventStatus = eventStatus.toLowerCase().replace(/[^a-z]/g, '');
    const normalizedShipmentStatus = currentShipmentStatus.toLowerCase().replace(/[^a-z]/g, '');
    return normalizedEventStatus === normalizedShipmentStatus;
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">Track Order</h2>
            <p className="text-sm text-gray-500">#{order.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-6 h-6 border-2 border-black border-t-transparent rounded-full" />
            </div>
          ) : fulfillments.length > 0 ? (
            <div className="space-y-8">
              {fulfillments.map((fulfillment) => (
                <div key={fulfillment.id} className="space-y-6">
                  {/* Tracking Timeline */}
                  <div className="relative">
                    {fulfillment.events?.map((event, index) => (
                      <div key={event.id} className="flex gap-4 pb-8 last:pb-0">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            isCurrentStatus(event.status, fulfillment.shipment_status) 
                              ? 'bg-green-500' 
                              : index === 0 
                                ? 'bg-gray-300' 
                                : 'bg-gray-300'
                          }`} />
                          {index !== fulfillment.events.length - 1 && (
                            <div className={`w-0.5 h-full ${
                              isCurrentStatus(event.status, fulfillment.shipment_status) 
                                ? 'bg-green-500' 
                                : 'bg-gray-200'
                            } mt-1`} />
                          )}
                        </div>
                        <div className={`flex-1 pt-[-4px] ${
                          isCurrentStatus(event.status, fulfillment.shipment_status)
                            ? 'text-green-700'
                            : 'text-gray-700'
                        }`}>
                          <p className="font-medium">{event.message || event.status}</p>
                          <p className={`text-sm ${
                            isCurrentStatus(event.status, fulfillment.shipment_status)
                              ? 'text-green-600'
                              : 'text-gray-500'
                          }`}>
                            {new Date(event.happened_at).toLocaleString()}
                          </p>
                          {event.location && (
                            <p className="text-sm text-gray-500 mt-1">{event.location}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tracking Info Card */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Tracking Number</p>
                      <p className="font-medium">{fulfillment.tracking_number}</p>
                    </div>
                    {fulfillment.tracking_company && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Carrier</p>
                        <p className="font-medium">{fulfillment.tracking_company}</p>
                      </div>
                    )}
                    {fulfillment.estimated_delivery_at && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Estimated Delivery</p>
                        <p className="font-medium">
                          {new Date(fulfillment.estimated_delivery_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {fulfillment.tracking_url && (
                      <a
                        href={fulfillment.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-4 text-center py-2 px-4 bg-black text-white rounded-lg hover:bg-black/90 transition-colors"
                      >
                        Track Package
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No tracking information yet</h3>
              <p className="text-gray-500">We'll update this once your order ships</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 