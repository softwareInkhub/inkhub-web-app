'use client';
import { SlideProvider } from '@/context/SlideContext';
import HeroSlider from './HeroSlider';
import QuickActions from './QuickActions';
import Banner from './Banner';
import FeaturedCollections from '@/components/FeaturedCollections';
import CollectionCircles from '@/components/CollectionCircles';
import CollectionsGrid from '@/components/CollectionsGrid';
import TrendingProducts from './TrendingProducts';
import CollectionsSlider from '@/components/CollectionsSlider';
import LandscapeImage from '@/components/LandscapeImage';
import PromotionalBanner from '@/components/PromotionalBanner';
import BannerScroll from './BannerScroll';
import CollectionTabSection from './CollectionTabSection';

interface HomeContentProps {
  collections: any[];
  featuredProducts: any[];
}

// Sample banner data
const banners = [
  {
    id: '1',
    imageUrl: '/images/banner1.jpg',
    title: 'New Collection 2024'
  },
  {
    id: '2',
    imageUrl: '/images/banner2.jpg',
    title: 'Limited Edition Series'
  },
  {
    id: '3',
    imageUrl: '/images/banner3.jpg',
    title: 'Spring Collection'
  },
  {
    id: '4',
    imageUrl: '/images/banner4.jpg',
    title: 'Exclusive Designs'
  }
];

// Add this sample data
const restaurantCollections = [
  {
    id: 'whats-new',
    title: "What's NEW?",
    restaurants: [
      {
        id: '1',
        name: 'Olio - The Wood Fired Pizzeria',
        rating: 4.4,
        deliveryTime: '45-50 mins',
        cuisine: 'Pizzas',
        image: '/restaurants/pizza.jpg',
        offer: {
          text: 'BUY 1 GET 1',
          tag: 'ONE'
        }
      },
      // Add more restaurants...
    ]
  },
  {
    id: 'gourmet',
    title: 'Gourmet DELIGHTS',
    restaurants: [
      {
        id: '2',
        name: 'Goila Butter Chicken',
        rating: 4.2,
        deliveryTime: '50-55 mins',
        cuisine: 'Biryani',
        image: '/restaurants/biryani.jpg',
        offer: {
          text: '₹125 OFF ABOVE ₹249',
          tag: 'ONE'
        }
      },
      // Add more restaurants...
    ]
  },
  {
    id: 'fast-delivery',
    title: 'Fast DELIVERY',
    restaurants: [
      // Add restaurants...
    ]
  }
];

export default function HomeContent({ collections, featuredProducts }: HomeContentProps) {
  return (
    <SlideProvider>
      <main className="min-h-screen bg-white">
        <div className="relative">
          <HeroSlider />
          <QuickActions />
        </div>

        <div className="space-y-8">
          <div className="container mx-auto px-4 mt-8">
            <LandscapeImage
              componentId="home-hero-image"
              defaultSrc="/placeholders/landscape-placeholder.svg"
              alt="Welcome to our store"
              className="w-full"
            />
          </div>

          <div className="container mx-auto px-4">
            <Banner />
          </div>
        </div>

        <div className="mt-16 space-y-16">
          <FeaturedCollections collections={collections} />
          
          <div className="container mx-auto px-4">
            <PromotionalBanner />
          </div>

          <CollectionCircles collections={collections} />
          <CollectionsGrid 
            collections={collections} 
            className="container mx-auto px-4"
            gridCols="grid-cols-4 md:grid-cols-4"
          />
          <TrendingProducts products={featuredProducts} />
          <CollectionsSlider 
            collections={collections}
            onCollectionClick={() => {}}
            selectedCollectionProducts={[]}
            isLoading={false}
            error={null}
          />
          <BannerScroll banners={banners} />
          <CollectionTabSection collections={collections} />
        </div>
      </main>
    </SlideProvider>
  );
} 