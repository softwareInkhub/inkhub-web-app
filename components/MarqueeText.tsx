'use client';
import { motion } from 'framer-motion';

interface MarqueeTextProps {
  text: string;
  speed?: number;
  className?: string;
}

export default function MarqueeText({ text, speed = 15, className = '' }: MarqueeTextProps) {
  return (
    <div className="bg-black py-2">
      <div className="overflow-hidden whitespace-nowrap relative">
        <motion.div
          className={`inline-block ${className}`}
          animate={{
            x: [0, -50, -100],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: speed,
              ease: "linear",
            },
          }}
        >
          {/* Repeat text multiple times to ensure continuous scroll */}
          <span className="mr-4">{text}</span>
          <span className="mr-4">{text}</span>
          <span className="mr-4">{text}</span>
          <span className="mr-4">{text}</span>
        </motion.div>
      </div>
    </div>
  );
} 