'use client';

interface CategoryPillsProps {
  collections: any[];
  activeCollection: string;
  setActiveCollection: (id: string) => void;
}

export default function CategoryPills({ collections, activeCollection, setActiveCollection }: CategoryPillsProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm">
      <div className="flex gap-2 overflow-x-auto pb-4 px-4 no-scrollbar">
        {collections?.map((collection) => {
          if (!collection?.node) return null;
          return (
            <button
              key={collection.node.id}
              onClick={() => setActiveCollection(collection.node.id)}
              className={`
                px-4 py-1.5 rounded-full whitespace-nowrap text-sm 
                transition-all duration-200 flex-shrink-0
                ${activeCollection === collection.node.id 
                  ? 'bg-black text-white shadow-sm' 
                  : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                }
              `}
            >
              {collection.node.title}
            </button>
          );
        })}
      </div>
    </div>
  );
} 