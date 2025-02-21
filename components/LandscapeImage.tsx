'use client';
import Image from 'next/image';
import { useThemeEditor } from '@/hooks/useThemeEditor';
import { useState, useEffect } from 'react';

interface LandscapeImageProps {
  defaultSrc?: string;
  alt?: string;
  className?: string;
  componentId: string;
}

export default function LandscapeImage({ 
  defaultSrc = '/placeholders/landscape-placeholder.svg',
  alt = 'Landscape image',
  className = '',
  componentId
}: LandscapeImageProps) {
  const { getComponentData } = useThemeEditor();
  const [currentSrc, setCurrentSrc] = useState(defaultSrc);
  const imageData = getComponentData(componentId);
  
  useEffect(() => {
    if (imageData?.src) {
      setCurrentSrc(imageData.src);
    }
  }, [imageData?.src]);

  console.log('LandscapeImage render:', { 
    componentId, 
    imageData, 
    currentSrc,
    defaultSrc 
  });

  const altText = imageData?.alt || alt;

  const handleError = () => {
    console.error('Image load error:', { currentSrc, defaultSrc });
    if (currentSrc !== defaultSrc) {
      setCurrentSrc(defaultSrc);
    }
  };

  return (
    <div className={`relative w-full aspect-[16/9] overflow-hidden rounded-lg ${className}`}>
      <Image
        src={currentSrc}
        alt={altText}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority
        quality={90}
        onError={handleError}
      />
    </div>
  );
} 