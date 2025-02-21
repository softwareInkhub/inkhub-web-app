import HomeContent from './home/HomeContent';
import { getFeaturedProducts } from '@/utils/shopify';
import { getCollections } from '@/lib/shopify';
import MarqueeText from '@/components/MarqueeText';
import LandscapeImage from '@/components/LandscapeImage';
import { Suspense } from 'react';
import ImageWithText from '@/components/ImageWithText';

export default async function Home() {
  const [featuredProducts, collections] = await Promise.all([
    getFeaturedProducts(),
    getCollections(),
  ]);

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1">
        <HomeContent featuredProducts={featuredProducts} collections={collections} />
      </div>
      <Suspense fallback={null}>
        <MarqueeText 
          text="Free shipping on orders over ₹999 • Same day dispatch • Easy returns" 
          speed={30}
          className="text-sm font-medium text-white"
        />
        <LandscapeImage 
          componentId="home-hero-image"
          defaultSrc="/default-hero.jpg"
          alt="Welcome to our store"
        />
      </Suspense>
      <ImageWithText
        title="how does"
        subtitle="it work?"
        description="Change up your look, play with your style, and experiment confidently with Inkbox, the ultimate self-expression accessory! Simply Prime, Place, and Peel, and in 24 hours your next expression will be fully developed and ready to make a bold statement."
        buttonText="LEARN MORE"
        buttonLink="/how-it-works"
        imageSrc="/path-to-your-image.jpg"
        imageAlt="How Temporary Tattoos Work"
        textColor="yellow-400"
      />
    </div>
  );
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
