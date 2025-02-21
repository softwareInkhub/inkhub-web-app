'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Video {
  id: string;
  url: string;
  title: string;
}

interface UGCVideoCarouselProps {
  videos: Video[];
}

export default function UGCVideoCarousel({ videos }: UGCVideoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextVideo = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % videos.length);
  };

  const prevVideo = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + videos.length) % videos.length);
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div className="flex transition-transform duration-300" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {videos.map((video) => (
          <div key={video.id} className="w-full flex-shrink-0">
            <video controls className="w-full h-auto">
              <source src={video.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <h3 className="text-center mt-2">{video.title}</h3>
          </div>
        ))}
      </div>
      <button onClick={prevVideo} className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md">
        <ChevronLeft />
      </button>
      <button onClick={nextVideo} className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md">
        <ChevronRight />
      </button>
    </div>
  );
} 