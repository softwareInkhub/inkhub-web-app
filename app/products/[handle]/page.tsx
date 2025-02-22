import { getProductByHandle, getAllProducts } from '@/utils/shopify';
import ProductDetails from '@/components/ProductDetails';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

// Update generateStaticParams to handle all products
export async function generateStaticParams() {
  try {
    const products = await getAllProducts();
    
    // Map directly since getAllProducts already returns formatted products
    return products
      .map(product => ({
        handle: product.handle || '',
      }))
      .filter(({ handle }) => handle);
  } catch (error) {
    console.error('Error getting product handles:', error);
    return [];
  }
}

// Change to dynamic rendering instead of static
export const dynamic = 'force-dynamic';
// Remove revalidate since we're using dynamic rendering
// export const revalidate = 3600;

interface PageProps {
  params: Promise<{ handle: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { handle } = await params;
  
  try {
    const [product, products] = await Promise.all([
      getProductByHandle(handle),
      getAllProducts()
    ]);

    if (!product) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-white">
        <ProductDetails 
          product={product}
          products={products || []}
        />
      </div>
    );
  } catch (error) {
    console.error(`Error loading product with handle ${handle}:`, error);
    notFound();
  }
}

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  try {
    const { handle } = await params;
    const product = await getProductByHandle(handle);

    if (!product) {
      return {
        title: 'Product Not Found',
        description: 'The requested product could not be found.',
      };
    }

    return {
      title: `${product.title} | Your Store Name`,
      description: product.description || '',
      openGraph: {
        images: [product.images.edges[0]?.node.url || ''],
      },
    };
  } catch (error) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
    };
  }
} 