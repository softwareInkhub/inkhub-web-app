'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Force remove any unwanted classes/styles
  useEffect(() => {
    // Remove any existing navigation elements
    document.body.classList.add('admin-layout');
    return () => {
      document.body.classList.remove('admin-layout');
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Admin Sidebar */}
        <div className="w-64 min-h-screen bg-white border-r">
          <div className="p-4">
            <h1 className="text-xl font-bold">Theme Editor</h1>
          </div>
          <nav className="mt-4">
            <a href="/admin/theme-editor" className="block px-4 py-2 hover:bg-gray-100">
              Theme Editor
            </a>
            <a href="/admin/settings" className="block px-4 py-2 hover:bg-gray-100">
              Settings
            </a>
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
} 