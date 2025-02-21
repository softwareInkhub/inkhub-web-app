import HomeContent from './home/HomeContent';
import { getFeaturedProducts } from '@/utils/shopify';
import { getCollections } from '@/lib/shopify';
import MarqueeText from '@/components/MarqueeText';
import LandscapeImage from '@/components/LandscapeImage';
import { Suspense } from 'react';

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
    </div>
  );
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
