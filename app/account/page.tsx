'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  doc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '@/utils/firebase';
import { toast } from 'react-hot-toast';
import {
  LogOut,
  User,
  ShoppingBag,
  HeadphonesIcon,
  Edit2,
  X,
  MapPin,
  Home,
  Building,
  Briefcase,
  Plus,
  Star,
  StarOff,
  Trash2
} from 'lucide-react';
import { formatDistance } from 'date-fns';
import Image from 'next/image';
import { useTab } from '@/context/TabContext';
import OrderCard from '@/components/OrderCard';
import { useSwipeable } from 'react-swipeable';

type Tab = 'profile' | 'addresses' | 'orders' | 'support';

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
  createdAt?: string;
  updatedAt?: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, userProfile, isLoading, isInitialized, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressType, setAddressType] = useState<'home' | 'work' | 'other'>('home');
  const [addressForm, setAddressForm] = useState({
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const { activeTab, setActiveTab } = useTab();
  const [mounted, setMounted] = useState(false);

  // Define tab order for swipe navigation
  const tabOrder: Tab[] = ['profile', 'addresses', 'orders', 'support'];

  // Handle swipe navigation
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      const currentIndex = tabOrder.indexOf(activeTab);
      if (currentIndex < tabOrder.length - 1) {
        setActiveTab(tabOrder[currentIndex + 1]);
      }
    },
    onSwipedRight: () => {
      const currentIndex = tabOrder.indexOf(activeTab);
      if (currentIndex > 0) {
        setActiveTab(tabOrder[currentIndex - 1]);
      }
    },
    trackMouse: false,
    preventScrollOnSwipe: true,
    delta: 10, // Minimum swipe distance
    swipeDuration: 500, // Maximum time for swipe gesture
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    console.log('Account page mounted', { user, isLoading, userProfile });
    
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        phone: userProfile.phone || '',
        email: userProfile.email || '',
        address: userProfile.address || '',
        city: userProfile.city || '',
        state: userProfile.state || '',
        pincode: userProfile.pincode || '',
      });
    }
  }, [user, userProfile, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...formData,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'support', label: 'Support', icon: HeadphonesIcon },
  ];

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const addressData = {
        ...addressForm,
        type: addressType,
        phone: userProfile?.phone || '', // Use user's phone number
        isDefault: addresses.length === 0, // First address is default
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingAddress) {
        // Preserve isDefault status when editing
        addressData.isDefault = editingAddress.isDefault;

        await setDoc(
          doc(db, `users/${user.uid}/addresses/${editingAddress.id}`),
          addressData,
          { merge: true }
        );
        toast.success('Address updated successfully!');
      } else {
        // Add new address
        const newAddressRef = doc(collection(db, `users/${user.uid}/addresses`));
        await setDoc(newAddressRef, addressData);
        toast.success('Address added successfully!');
      }

      // Reset form and close modal
      resetAddressForm();
      loadAddresses(); // Reload addresses
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save address');
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      firstName: '',
      lastName: '',
      street: '',
      city: '',
      state: '',
      pincode: ''
    });
    setAddressType('home');
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    if (!user) return;

    try {
      // Remove default from all addresses
      const batch = writeBatch(db);
      addresses.forEach(addr => {
        if (addr.isDefault) {
          batch.update(doc(db, `users/${user.uid}/addresses/${addr.id}`), {
            isDefault: false
          });
        }
      });

      // Set new default
      batch.update(doc(db, `users/${user.uid}/addresses/${addressId}`), {
        isDefault: true
      });

      await batch.commit();
      loadAddresses(); // Reload addresses
      toast.success('Default address updated!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update default address');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, `users/${user.uid}/addresses/${addressId}`));
      loadAddresses(); // Reload addresses
      toast.success('Address deleted successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete address');
    }
  };

  // Add this useEffect to populate form when editing
  useEffect(() => {
    if (editingAddress) {
      setAddressForm({
        firstName: editingAddress.firstName,
        lastName: editingAddress.lastName,
        street: editingAddress.street,
        city: editingAddress.city,
        state: editingAddress.state,
        pincode: editingAddress.pincode
      });
      setAddressType(editingAddress.type);
    }
  }, [editingAddress]);

  // Add this useEffect to load addresses
  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user]);

  const loadAddresses = async () => {
    if (!user) return;

    try {
      const addressesRef = collection(db, `users/${user.uid}/addresses`);
      const snapshot = await getDocs(addressesRef);
      const loadedAddresses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Address[];

      // If no addresses exist and we have user profile data, create default address
      if (loadedAddresses.length === 0 && userProfile) {
        const defaultAddress = {
          type: 'home' as const,
          isDefault: true,
          firstName: userProfile.firstName || '',
          lastName: userProfile.lastName || '',
          phone: userProfile.phone || '',
          street: userProfile.address || '',
          city: userProfile.city || '',
          state: userProfile.state || '',
          pincode: userProfile.pincode || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const newAddressRef = doc(collection(db, `users/${user.uid}/addresses`));
        await setDoc(newAddressRef, defaultAddress);

        loadedAddresses.push({ id: newAddressRef.id, ...defaultAddress });
      }

      setAddresses(loadedAddresses);
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast.error('Failed to load addresses');
    }
  };

  const fetchOrders = async () => {
    if (!userProfile?.phone) return;
    
    setIsLoadingOrders(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: userProfile.phone
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
      } else {
        console.error('Error from API:', data.error);
        toast.error(data.error || 'Failed to load orders');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        toast.error('Request timed out. Please try again.');
      } else {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      }
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Add this useEffect to fetch orders when tab changes
  useEffect(() => {
    if (activeTab === 'orders' && userProfile?.phone) {
      fetchOrders();
    }
  }, [activeTab, userProfile?.phone]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Sticky Header with Tabs */}
      <div className="sticky top-0 bg-white border-b z-50 shadow-sm">
        <div className="max-w-3xl mx-auto">
          <div className="flex overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`
                  flex-1 flex items-center justify-center gap-2 
                  py-4 px-6 text-sm font-medium transition-colors 
                  whitespace-nowrap border-b-2
                  ${activeTab === tab.id 
                    ? 'text-black border-black' 
                    : 'text-gray-500 border-transparent hover:text-black hover:border-gray-200'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container max-w-3xl mx-auto px-4 mt-6">
        <div className="mt-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold">
                      {userProfile?.firstName?.[0]}{userProfile?.lastName?.[0]}
                    </div>
                    <div>
                      <h1 className="text-xl font-semibold">Your Profile</h1>
                      <p className="text-sm text-gray-600">Manage your account details</p>
                    </div>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit Profile</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm"
                    >
                      <X className="w-4 h-4" />
                      <span className="hidden sm:inline">Cancel</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Form */}
              <div className="bg-white rounded-2xl p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h2 className="text-lg font-medium mb-4">Contact Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1.5">First Name</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black/5"
                          disabled={!isEditing}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1.5">Last Name</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black/5"
                          disabled={!isEditing}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1.5">Phone Number</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black/5"
                          disabled={true} // Phone number should not be editable
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1.5">
                          Email (Optional)
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black/5"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-black text-white p-3.5 rounded-xl disabled:opacity-50 hover:bg-black/90 transition-colors"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  )}
                </form>

                {/* Logout Button */}
                <div className="mt-8 pt-6 border-t">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-3.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-semibold">Your Addresses</h1>
                    <p className="text-sm text-gray-600">Manage your delivery addresses</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddressForm(true);
                      setEditingAddress(null);
                    }}
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Address</span>
                  </button>
                </div>
              </div>

              {/* Address List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="bg-white rounded-2xl p-6 space-y-4 relative"
                  >
                    {/* Address Type Icon */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        {address.type === 'home' && <Home className="w-5 h-5" />}
                        {address.type === 'work' && <Briefcase className="w-5 h-5" />}
                        {address.type === 'other' && <Building className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-medium capitalize">{address.type}</h3>
                        <p className="text-sm text-gray-600">{address.firstName} {address.lastName}</p>
                      </div>
                    </div>

                    {/* Address Details */}
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{address.street}</p>
                      <p>{address.city}, {address.state} {address.pincode}</p>
                      <p>{address.phone}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <button
                        onClick={() => handleSetDefaultAddress(address.id)}
                        type="button"
                        className={`text-sm flex items-center gap-1 ${
                          address.isDefault 
                            ? 'text-yellow-600 hover:text-yellow-700' 
                            : 'text-gray-600 hover:text-gray-700'
                        }`}
                      >
                        {address.isDefault ? (
                          <>
                            <Star className="w-4 h-4 fill-yellow-600" />
                            Default
                          </>
                        ) : (
                          <>
                            <StarOff className="w-4 h-4" />
                            Set as Default
                          </>
                        )}
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingAddress(address);
                            setShowAddressForm(true);
                          }}
                          type="button"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          type="button"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Addresses Message */}
              {addresses.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl">
                  <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h2 className="text-xl font-medium mb-2">No Addresses Added</h2>
                  <p className="text-gray-600">Add your first delivery address</p>
                </div>
              )}

              {/* Add/Edit Address Form Modal */}
              {showAddressForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold">
                        {editingAddress ? 'Edit Address' : 'Add New Address'}
                      </h2>
                      <button
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddress(null);
                        }}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleAddressSubmit} className="space-y-4">
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
                            value={addressForm.firstName}
                            onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1.5">Last Name</label>
                          <input
                            type="text"
                            value={addressForm.lastName}
                            onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                            required
                          />
                        </div>
                      </div>

                      {/* Address Details */}
                      <div>
                        <label className="block text-sm text-gray-600 mb-1.5">Street Address</label>
                        <input
                          type="text"
                          value={addressForm.street}
                          onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1.5">City</label>
                          <input
                            type="text"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1.5">State</label>
                          <input
                            type="text"
                            value={addressForm.state}
                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                            required
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-sm text-gray-600 mb-1.5">PIN Code</label>
                          <input
                            type="text"
                            value={addressForm.pincode}
                            onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-black text-white p-3.5 rounded-xl hover:bg-black/90 transition-colors"
                      >
                        {editingAddress ? 'Update Address' : 'Add Address'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Orders Header */}
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-semibold">Your Orders</h1>
                    <p className="text-sm text-gray-600">Track your order history</p>
                  </div>
                </div>

              </div>

              {isLoadingOrders ? (
                <div className="text-center py-12 bg-white rounded-2xl">
                  <div className="animate-spin w-6 h-6 border-2 border-black border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-gray-600">Loading orders...</p>
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl">
                  <ShoppingBag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h2 className="text-xl font-medium mb-2">No Orders Yet</h2>
                  <p className="text-gray-600">Your order history will appear here</p>
                </div>
              )}
            </div>
          )}

          {/* Support Tab */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 text-center">
                <HeadphonesIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-medium mb-2">Need Help?</h2>
                <p className="text-gray-600">Contact our support team</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 