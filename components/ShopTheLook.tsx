'use client';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  image: string;
  link: string;
}

interface ShopTheLookProps {
  products: Product[];
}

export default function ShopTheLook({ products }: ShopTheLookProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Shop the Look</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link key={product.id} href={product.link}>
            <div className="group">
              <div className="relative aspect-square overflow-hidden rounded-lg shadow-md">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900 text-center">{product.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 