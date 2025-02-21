'use client';

interface RichTextProps {
  content: string;
}

export default function RichText({ content }: RichTextProps) {
  return (
    <div 
      className="prose prose-sm max-w-none text-gray-600"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
} 