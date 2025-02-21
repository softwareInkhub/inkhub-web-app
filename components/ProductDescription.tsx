'use client';
import { useState } from 'react';
import RichText from './RichText';

interface ProductDescriptionProps {
  description: string;
}

export default function ProductDescription({ description }: ProductDescriptionProps) {
  const [activeTab, setActiveTab] = useState('Description');

  return (
    <div className="mt-12 bg-white rounded-2xl p-6">
      <div className="border-b border-gray-200">
        <div className="flex gap-8">
          {['Description', 'Specifications', 'Reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                py-4 text-sm font-medium border-b-2 transition-colors
                ${activeTab === tab 
                  ? 'border-black text-black' 
                  : 'border-transparent text-gray-500 hover:text-black'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      <div className="py-6">
        {activeTab === 'Description' && (
          <div className="space-y-4">
            <RichText content={description} />
          </div>
        )}
        {activeTab === 'Specifications' && (
          <div className="space-y-4">
            <h3 className="font-medium">Product Specifications</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                Material: High-quality temporary ink
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                Duration: 3-5 days
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                Water-resistant
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                Dermatologically tested
              </li>
            </ul>
          </div>
        )}
        {activeTab === 'Reviews' && (
          <div className="space-y-6">
            {/* Reviews Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="font-medium">Customer Reviews</h3>
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">Based on 128 reviews</span>
                </div>
              </div>
              <button className="text-sm font-medium text-black hover:opacity-70">
                Write a review
              </button>
            </div>

            {/* Review List Placeholder */}
            <div className="space-y-4">
              <div className="text-sm text-gray-500 text-center py-8">
                No reviews yet. Be the first to write a review!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 