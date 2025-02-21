'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { toast } from 'react-hot-toast';

const STEPS = {
  NAME: 'NAME',
  ADDRESS: 'ADDRESS'
} as const;

const STEP_INFO = {
  [STEPS.NAME]: {
    title: 'Welcome!',
    subtitle: 'Lets get to know you better'
  },
  [STEPS.ADDRESS]: {
    title: 'Delivery Address',
    subtitle: 'Please provide your delivery details (Optional)'
  }
} as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, userProfile, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<keyof typeof STEPS>('NAME');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/'); // Redirect to home instead of login
      } else if (userProfile?.onboardingComplete) {
        const returnUrl = sessionStorage.getItem('returnUrl') || '/';
        sessionStorage.removeItem('returnUrl');
        router.replace(returnUrl);
      }
    }
  }, [user, userProfile, isLoading, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) return;

      if (step === STEPS.NAME) {
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          toast.error('Please fill in all required fields');
          return;
        }
        setStep(STEPS.ADDRESS);
      } else {
        // Final step - save all data
        await setDoc(doc(db, 'users', user.uid), {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          onboardingComplete: true,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        // Redirect to success page instead of profile
        router.replace('/account/onboarding/success');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        toast.error('Please fill in your name before continuing');
        return;
      }

      await setDoc(doc(db, 'users', user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        onboardingComplete: true,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Redirect to success page
      router.replace('/account/onboarding/success');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          First Name
        </label>
        <input
          type="text"
          value={formData.firstName}
          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Last Name
        </label>
        <input
          type="text"
          value={formData.lastName}
          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white p-3 rounded-lg disabled:opacity-50"
      >
        {loading ? 'Please wait...' : 'Continue'}
      </button>
    </>
  );

  const renderStep2 = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          PIN Code
        </label>
        <input
          type="text"
          value={formData.pincode}
          onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
        />
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-black text-white p-3 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Please wait...' : 'Complete Profile'}
        </button>
        <button
          type="button"
          onClick={handleSkip}
          disabled={loading}
          className="flex-1 bg-gray-100 text-gray-700 p-3 rounded-lg hover:bg-gray-200 disabled:opacity-50"
        >
          Skip for Now
        </button>
      </div>
    </>
  );

  const content = (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto mt-16 bg-white rounded-lg shadow p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">
            {STEP_INFO[step].title}
          </h1>
          <p className="text-gray-600">
            {STEP_INFO[step].subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === STEPS.NAME ? renderStep1() : renderStep2()}
        </form>
      </div>
    </div>
  );

  return content;
} 