'use client';

export default function NewsletterSignup() {
  return (
    <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md text-center">
      <h2 className="text-lg font-bold mb-2">Stay Updated!</h2>
      <p className="text-sm mb-4">Subscribe to our newsletter for the latest updates and offers.</p>
      <input type="email" placeholder="Enter your email" className="p-2 rounded-md text-black" />
      <button className="bg-white text-blue-500 p-2 rounded-md ml-2">Subscribe</button>
    </div>
  );
} 