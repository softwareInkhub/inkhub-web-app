'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ArrowRight, Share } from 'lucide-react';

export default function InstallPWA() {
  const [showIOSPrompt, setShowIOSPrompt] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check localStorage only once on mount
    const hasShownPrompt = localStorage.getItem('hasShownPWAPrompt');
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    // Only show if:
    // 1. Never shown before
    // 2. Is iOS device
    // 3. Not already installed
    setShowIOSPrompt(!hasShownPrompt && isIOS && !isStandalone);
  }, []); // Empty dependency array ensures this runs only once

  const handleClose = () => {
    setShowIOSPrompt(false);
    localStorage.setItem('hasShownPWAPrompt', 'true');
  };

  // Don't render anything until we've checked the conditions
  if (showIOSPrompt === null || !showIOSPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative"
          onClick={e => e.stopPropagation()}
        >
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-2"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
                <Share className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Install Our App</h3>
            </div>

            <div className="space-y-2">
              <p className="text-gray-600">To install our app on iOS:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Tap the share button</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" to install</li>
              </ol>
            </div>

            <button
              onClick={handleClose}
              className="w-full bg-black text-white rounded-xl py-3 font-medium"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 