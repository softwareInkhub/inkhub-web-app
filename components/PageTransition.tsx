'use client';
import { motion, useMotionValue, useTransform, useAnimation, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const x = useMotionValue(0);
  const controls = useAnimation();
  const [canSwipeBack, setCanSwipeBack] = useState(true);

  // Smoother visual feedback
  const opacity = useTransform(x, [0, 100], [1, 0.85]);
  const scale = useTransform(x, [0, 100], [1, 0.95]);

  useEffect(() => {
    // Reset state when component mounts
    setCanSwipeBack(true);
    return () => setCanSwipeBack(false);
  }, []);

  const handleDragStart = () => {
    // Prevent scrolling while dragging
    document.body.style.overflowY = 'hidden';
  };

  const handleDrag = (event: any, info: any) => {
    if (!canSwipeBack) return;

    const threshold = 75;
    const velocity = 200;

    if (info.offset.x > threshold && info.velocity.x > velocity) {
      setCanSwipeBack(false); // Prevent multiple triggers
      controls.start({
        x: window.innerWidth,
        transition: { duration: 0.2, ease: "easeOut" }
      }).then(() => {
        router.back();
        document.body.style.overflowY = 'auto';
      });
    } else {
      controls.start({
        x: 0,
        transition: { 
          type: "spring",
          stiffness: 400,
          damping: 40
        }
      }).then(() => {
        document.body.style.overflowY = 'auto';
      });
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full min-h-screen"
      >
        <motion.div
          drag="x"
          dragDirectionLock
          dragElastic={{ left: 0, right: 0.3 }}
          dragConstraints={{ left: 0, right: 100 }}
          onDragStart={handleDragStart}
          onDragEnd={handleDrag}
          animate={controls}
          style={{ x, opacity, scale }}
          className="w-full min-h-screen bg-white overflow-y-auto"
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 