'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface ImageWithTextProps {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageSrc: string;
  imageAlt: string;
  textColor?: string;
}

export default function ImageWithText({
  title,
  subtitle,
  description,
  buttonText,
  buttonLink,
  imageSrc,
  imageAlt,
}: ImageWithTextProps) {
  return (
    <div className="w-full">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="relative w-full aspect-[4/3] bg-gray-100">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
            priority
          />
          <motion.h1 
            className="absolute top-8 left-6 text-[4rem] leading-[0.9] font-bold text-yellow-400"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {title}
            <br />
            {subtitle}
          </motion.h1>
        </div>
        
        <div className="px-6 py-10 bg-[#E8F1F1]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="text-lg leading-relaxed">
              {description}
            </p>
            <Link 
              href={buttonLink}
              className="inline-block bg-black text-white px-8 py-3 rounded-full
                       text-sm font-medium uppercase tracking-wider"
            >
              {buttonText}
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid grid-cols-2">
        <div className="relative aspect-[3/4]">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
            priority
          />
          <motion.h1 
            className="absolute top-12 left-12 text-[5rem] leading-[0.9] font-bold text-yellow-400"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {title}
            <br />
            {subtitle}
          </motion.h1>
        </div>
        
        <div className="bg-[#E8F1F1] p-12 flex items-center">
          <motion.div 
            className="max-w-xl space-y-8"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xl leading-relaxed">
              {description}
            </p>
            <Link 
              href={buttonLink}
              className="inline-block bg-black text-white px-8 py-3 rounded-full
                       text-sm font-medium uppercase tracking-wider"
            >
              {buttonText}
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 