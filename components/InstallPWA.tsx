'use client';

import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ArrowRight } from 'lucide-react';

export default function InstallPWA() {
  const prompt = useInstallPrompt();
  const [showPrompt, setShowPrompt] = useState(true);

  if (!prompt || !showPrompt) return null;

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowPrompt(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.3 }}
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              onClick={() => setShowPrompt(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>

            {/* Icon */}
            <div className="mb-4">
              <motion.div 
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center"
              >
                <Download className="w-6 h-6 text-white" />
              </motion.div>
            </div>

            {/* Content */}
            <h3 className="text-xl font-semibold mb-2">Install Our App</h3>
            <p className="text-gray-600 mb-6">
              Get the best experience with our mobile app. Install it now for quick access and exclusive features!
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPrompt(false)}
                className="flex-1 px-4 py-2.5 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Maybe Later
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleInstall}
                className="flex-1 px-4 py-2.5 bg-black text-white rounded-xl flex items-center justify-center gap-2 group hover:bg-black/90 transition-colors"
              >
                Install Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 