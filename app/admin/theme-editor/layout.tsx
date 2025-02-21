'use client';
import { useState } from 'react';
import { Monitor, Smartphone, Tablet, Eye, Code, Save, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function ThemeEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <div className="h-14 border-b bg-white flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link 
            href="/admin"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Admin
          </Link>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">Home page</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* View Mode */}
          <div className="flex rounded-lg border overflow-hidden">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 text-sm ${
                viewMode === 'preview' 
                  ? 'bg-black text-white' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`px-3 py-1.5 text-sm ${
                viewMode === 'code' 
                  ? 'bg-black text-white' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <Code className="w-4 h-4" />
            </button>
          </div>

          {/* Device Preview */}
          <div className="flex rounded-lg border overflow-hidden">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`px-3 py-1.5 ${
                previewDevice === 'desktop' 
                  ? 'bg-black text-white' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewDevice('tablet')}
              className={`px-3 py-1.5 ${
                previewDevice === 'tablet' 
                  ? 'bg-black text-white' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`px-3 py-1.5 ${
                previewDevice === 'mobile' 
                  ? 'bg-black text-white' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <button className="flex items-center gap-2 px-4 py-1.5 bg-black text-white rounded-lg text-sm">
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {children}
      </div>
    </div>
  );
} 