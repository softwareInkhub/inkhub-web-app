export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discount: number;
  images: string[];
  description?: string;
}

export async function getProducts(): Promise<Product[]> {
  // This is a mock function. Replace with your actual data fetching logic
  return [
    {
      id: '1',
      name: 'Classic White T-Shirt',
      slug: 'classic-white-tshirt',
      price: 29.99,
      discount: 20,
      images: ['/images/products/tshirt-white.jpg'],
      description: 'Premium cotton t-shirt'
    },
    {
      id: '2',
      name: 'Black Denim Jeans',
      slug: 'black-denim-jeans',
      price: 79.99,
      discount: 30,
      images: ['/images/products/jeans-black.jpg'],
      description: 'Slim fit denim jeans'
    },
    {
      id: '3',
      name: 'Running Shoes',
      slug: 'running-shoes',
      price: 129.99,
      discount: 25,
      images: ['/images/products/shoes-running.jpg'],
      description: 'Lightweight running shoes'
    },
    // Add more products as needed
  ];
} 