import { getAllProducts } from '@/utils/shopify';
import ProductCard from '@/components/ProductCard';

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4">
        <div className="py-8">
          <h1 className="text-4xl font-bold mb-4">All Products</h1>
          <p className="text-gray-600">Discover our complete collection</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                handle: product.handle,
                title: product.title,
                price: {
                  amount: product.price.amount,
                  currencyCode: product.price.currencyCode,
                },
                image: {
                  url: product.image.url || '/placeholder.jpg',
                  altText: product.image.altText || product.title,
                },
                variantId: product.variantId,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 