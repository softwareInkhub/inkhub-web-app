'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ArrowRight, Share } from 'lucide-react';

export default function InstallPWA() {
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  
  useEffect(() => {
    // Check if it's iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isIOS && !isStandalone) {
      setShowIOSPrompt(true);
    }
  }, []);

  if (!showIOSPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setShowIOSPrompt(false)}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative"
          onClick={e => e.stopPropagation()}
        >
          <button 
            onClick={() => setShowIOSPrompt(false)}
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
              onClick={() => setShowIOSPrompt(false)}
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