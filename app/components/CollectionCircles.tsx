'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface CollectionCirclesProps {
  collections: any[];
}

export default function CollectionCircles({ collections }: CollectionCirclesProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="container mx-auto px-4">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-4 md:grid-cols-5 gap-4 md:gap-8"
      >
        {collections.map((collection) => (
          <motion.div
            key={collection.node.id}
            variants={item}
            className="aspect-square relative group w-full md:w-[200px] lg:w-[250px]"
          >
            <Link href={`/collections/${collection.node.handle}`}>
              <div className="w-full h-full rounded-full overflow-hidden relative bg-gray-100">
                {collection.node.image && (
                  <Image
                    src={collection.node.image.url}
                    alt={collection.node.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 768px) 25vw, 250px"
                  />
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white text-center font-medium text-sm md:text-base lg:text-xl px-2">
                  {collection.node.title}
                </h3>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
} 