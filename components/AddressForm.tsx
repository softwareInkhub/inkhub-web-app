'use client';
import { useState } from 'react';
import { Home, Briefcase, Building, X } from 'lucide-react';

interface Address {
  id: string;
  type?: 'home' | 'work' | 'other';
  isDefault: boolean;
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

interface AddressFormProps {
  onSubmit: (address: Omit<Address, 'id' | 'isDefault'>) => void;
  onCancel: () => void;
  loading?: boolean;
  initialData?: Partial<Address>;
  isModal?: boolean;
}

export default function AddressForm({ 
  onSubmit, 
  onCancel, 
  loading = false,
  initialData,
  isModal = false
}: AddressFormProps) {
  const [addressType, setAddressType] = useState<'home' | 'work' | 'other'>(
    initialData?.type || 'home'
  );
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    phone: initialData?.phone || '',
    street: initialData?.street || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    pincode: initialData?.pincode || '',
    type: addressType
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, type: addressType });
  };

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Address Type */}
      <div className="grid grid-cols-3 gap-4">
        {['home', 'work', 'other'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setAddressType(type as "home" | "work" | "other")}
            className={`p-3 rounded-xl border text-sm font-medium flex flex-col items-center gap-2
              ${addressType === type
                ? 'border-black bg-black text-white'
                : 'border-gray-200 hover:border-black'
              }`}
          >
            {type === 'home' && <Home className="w-4 h-4" />}
            {type === 'work' && <Briefcase className="w-4 h-4" />}
            {type === 'other' && <Building className="w-4 h-4" />}
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Contact Details */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1.5">First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1.5">Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1.5">Phone</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1.5">Street Address</label>
        <input
          type="text"
          value={formData.street}
          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
          required
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1.5">City</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1.5">State</label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
            required
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm text-gray-600 mb-1.5">PIN Code</label>
          <input
            type="text"
            value={formData.pincode}
            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-black text-white p-3.5 rounded-xl hover:bg-black/90 transition-colors"
      >
        {loading ? 'Saving...' : 'Save Address'}
      </button>
    </form>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {initialData ? 'Edit Address' : 'Add New Address'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {content}
        </div>
      </div>
    );
  }

  return content;
} 