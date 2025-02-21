'use client';
import { useEffect, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import { drawKeypoints, drawSkeleton } from '@/utils/drawHandMesh';

interface TattooVariant {
  id: string;
  title: string;
  size: string;
  imageUrl: string;
  imageElement?: HTMLImageElement;
  scale?: number;
}

interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

interface TattooPosition {
  offsetX: number;
  offsetY: number;
}

export default function TattooAR() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [model, setModel] = useState<handpose.HandPose | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [selectedVariant, setSelectedVariant] = useState<TattooVariant | null>(null);
  const [error, setError] = useState<string>('');
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [tattooScale, setTattooScale] = useState(1);
  const [tattooPosition, setTattooPosition] = useState<TattooPosition>({ offsetX: 0, offsetY: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const testTattoos = [
    {
      id: '1',
      title: 'Small',
      size: '2',
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iYmxhY2siLz48L3N2Zz4='
    },
    {
      id: '2',
      title: 'Medium',
      size: '3',
      imageUrl: '/ar-test-tattoo.jpg'
    },
    {
      id: '3',
      title: 'Large',
      size: '4',
      imageUrl: '/ar-test-tattoo.jpg'
    }
  ];

  // Initialize TensorFlow and HandPose model
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const handModel = await handpose.load();
        setModel(handModel);
      } catch (err) {
        setError('Failed to load hand tracking model');
      }
    };
    loadModel();
  }, []);

  // Start hand tracking
  const detectHand = async () => {
    if (!model || !videoRef.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Detect hand landmarks
    const predictions = await model.estimateHands(videoRef.current);
    
    // Clear canvas and draw video frame
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

    if (predictions.length > 0) {
      const landmarks = predictions[0].landmarks.map(([x, y, z]) => ({ x, y, z }));
      
      // Draw tracking visualization
      ctx.globalCompositeOperation = 'screen';
      drawSkeleton(ctx, predictions[0].landmarks);
      drawKeypoints(ctx, predictions[0].landmarks);
      ctx.globalCompositeOperation = 'source-over';

      // Draw tattoo if selected
      if (selectedVariant) {
        projectTattooOntoHand(ctx, landmarks, selectedVariant);
      }
    }

    animationRef.current = requestAnimationFrame(detectHand);
  };

  const projectTattooOntoHand = (
    ctx: CanvasRenderingContext2D, 
    landmarks: HandLandmark[],
    variant: TattooVariant
  ) => {
    // Calculate hand orientation and center
    const palmBase = landmarks[0];
    const indexBase = landmarks[5];
    const pinkyBase = landmarks[17];
    
    const handWidth = Math.hypot(
      indexBase.x - pinkyBase.x,
      indexBase.y - pinkyBase.y
    );
    
    const angle = Math.atan2(
      pinkyBase.y - indexBase.y,
      pinkyBase.x - indexBase.x
    );

    const palmCenter = {
      x: (indexBase.x + pinkyBase.x) / 2 + tattooPosition.offsetX,
      y: (indexBase.y + pinkyBase.y) / 2 + tattooPosition.offsetY
    };

    if (!variant.imageElement) {
      const img = new Image();
      img.src = variant.imageUrl;
      variant.imageElement = img;
    }

    if (variant.imageElement?.complete) {
      const baseSize = handWidth * 0.8;
      const size = baseSize * (tattooScale || 1);

      ctx.save();
      
      // Position and rotate
      ctx.translate(palmCenter.x, palmCenter.y);
      ctx.rotate(angle);
      
      // Apply blending for transparent background
      ctx.globalCompositeOperation = 'darken';
      ctx.globalAlpha = 0.85;
      
      // Draw tattoo
      ctx.drawImage(
        variant.imageElement,
        -size/2, -size/2,
        size, size
      );
      
      // Add skin texture blend
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.3;
      ctx.drawImage(
        variant.imageElement,
        -size/2, -size/2,
        size, size
      );
      
      ctx.restore();
    }
  };

  // Camera setup with tracking
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (canvasRef.current) {
              canvasRef.current.width = videoRef.current!.videoWidth;
              canvasRef.current.height = videoRef.current!.videoHeight;
              detectHand();
            }
          };
        }
      } catch (err) {
        setError('Camera access denied');
      }
    };

    startCamera();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [model]);

  const switchCamera = async () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: isFrontCamera ? 'environment' : 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsFrontCamera(!isFrontCamera);
    } catch (err) {
      setError('Failed to switch camera');
    }
  };

  const handleTattooSelect = (tattoo: TattooVariant) => {
    console.log('Selected tattoo:', tattoo.id);
    setSelectedVariant(tattoo);
  };

  // Add touch/drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const movementX = touch.clientX - (e.touches[0]?.clientX ?? 0);
    const movementY = touch.clientY - (e.touches[0]?.clientY ?? 0);
    
    setTattooPosition(prev => ({
      offsetX: prev.offsetX + movementX,
      offsetY: prev.offsetY + movementY
    }));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Camera Switch Button */}
      <button
        onClick={switchCamera}
        className="absolute top-4 right-4 p-3 bg-black/50 rounded-full text-white z-10 hover:bg-black/70"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9" />
          <path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6" />
          <path d="M3 4v4h18V4" />
          <path d="M12 2v2" />
        </svg>
      </button>

      {/* Tracking Status */}
      {isTracking && (
        <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          Tracking Hand...
        </div>
      )}

      {/* Position Controls */}
      {selectedVariant && (
        <div className="absolute bottom-44 left-0 right-0 flex flex-col items-center gap-4 px-4">
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setTattooPosition(prev => ({ ...prev, offsetY: prev.offsetY - 10 }))}
              className="p-2 bg-black/50 rounded-full text-white"
            >
              ↑
            </button>
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setTattooPosition(prev => ({ ...prev, offsetX: prev.offsetX - 10 }))}
              className="p-2 bg-black/50 rounded-full text-white"
            >
              ←
            </button>
            <button
              onClick={() => setTattooPosition({ offsetX: 0, offsetY: 0 })}
              className="p-2 bg-black/50 rounded-full text-white text-sm"
            >
              Reset
            </button>
            <button
              onClick={() => setTattooPosition(prev => ({ ...prev, offsetX: prev.offsetX + 10 }))}
              className="p-2 bg-black/50 rounded-full text-white"
            >
              →
            </button>
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setTattooPosition(prev => ({ ...prev, offsetY: prev.offsetY + 10 }))}
              className="p-2 bg-black/50 rounded-full text-white"
            >
              ↓
            </button>
          </div>
        </div>
      )}

      {/* Size Controls */}
      {selectedVariant && (
        <div className="absolute bottom-32 left-0 right-0 flex justify-center items-center gap-4 px-4">
          <button
            onClick={() => setTattooScale(prev => Math.max(0.5, prev - 0.1))}
            className="p-2 bg-black/50 rounded-full text-white"
          >
            -
          </button>
          
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={tattooScale}
            onChange={(e) => setTattooScale(parseFloat(e.target.value))}
            className="w-48 accent-cyan-400"
          />
          
          <button
            onClick={() => setTattooScale(prev => Math.min(2, prev + 0.1))}
            className="p-2 bg-black/50 rounded-full text-white"
          >
            +
          </button>
        </div>
      )}

      {/* Tattoo Selection Panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-4">
        <h3 className="text-white text-center mb-4 font-medium">Select Tattoo Size</h3>
        <div className="flex justify-center gap-4 overflow-x-auto pb-4">
          {testTattoos.map((tattoo) => (
            <button
              key={tattoo.id}
              onClick={() => handleTattooSelect(tattoo)}
              className={`relative group ${
                selectedVariant?.id === tattoo.id 
                  ? 'ring-2 ring-cyan-400 scale-110' 
                  : 'hover:scale-105'
              } transition-all duration-200`}
            >
              <div className="w-24 h-24 rounded-lg overflow-hidden">
                <img
                  src={tattoo.imageUrl}
                  alt={tattoo.title}
                  className="w-full h-full object-cover"
                />
                {selectedVariant?.id === tattoo.id && (
                  <div className="absolute inset-0 bg-cyan-400/20" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Instructions */}
        <p className="text-white/70 text-center text-sm mt-2">
          {selectedVariant 
            ? "Show your hand to apply the tattoo" 
            : "Select a tattoo to begin"}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="bg-white p-6 rounded-lg max-w-md text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-900 font-medium mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 