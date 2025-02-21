export interface Collection {
  id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
}

export async function getCollections(): Promise<Collection[]> {
  // This is a mock function. Replace with your actual data fetching logic
  return [
    {
      id: '1',
      name: 'Summer Collection',
      slug: 'summer-collection',
      image: '/images/collections/summer.jpg',
      description: 'Fresh styles for summer'
    },
    {
      id: '2',
      name: 'Winter Essentials',
      slug: 'winter-essentials',
      image: '/images/collections/winter.jpg',
      description: 'Stay warm in style'
    },
    {
      id: '3',
      name: 'Sport & Active',
      slug: 'sport-active',
      image: '/images/collections/sport.jpg',
      description: 'Performance wear'
    },
    {
      id: '4',
      name: 'Casual Wear',
      slug: 'casual-wear',
      image: '/images/collections/casual.jpg',
      description: 'Everyday comfort'
    }
  ];
} 