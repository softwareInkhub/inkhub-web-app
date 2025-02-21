import Skeleton from '@/components/Skeleton';

export default function ProductDetailsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="lg:grid lg:grid-cols-2 lg:gap-12">
        {/* Image Gallery Skeleton */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="w-16 aspect-square rounded-lg" />
            ))}
          </div>
          <Skeleton className="flex-1 aspect-square rounded-2xl" />
        </div>

        {/* Product Info Skeleton */}
        <div className="mt-8 lg:mt-0 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <Skeleton className="h-4 w-20 mb-3" />
              <Skeleton className="h-14 w-full rounded-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-3" />
              <Skeleton className="h-14 w-full rounded-full" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Skeleton className="flex-1 h-14 rounded-full" />
            <Skeleton className="w-14 h-14 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
} 