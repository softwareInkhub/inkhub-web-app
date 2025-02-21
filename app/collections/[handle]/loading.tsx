export default function CollectionLoading() {
  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in">
      {/* Title Skeleton */}
      <div className="h-10 w-2/3 bg-gray-200 rounded-lg mb-4 animate-pulse" />
      
      {/* Description Skeleton */}
      <div className="h-4 w-1/2 bg-gray-200 rounded-lg mb-8 animate-pulse" />
      
      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-square rounded-xl overflow-hidden">
            {/* Image Skeleton */}
            <div className="w-full h-full bg-gray-200 animate-pulse" />
            
            {/* Content Skeleton */}
            <div className="p-2.5">
              <div className="h-4 w-3/4 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 