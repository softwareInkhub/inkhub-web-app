'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeData {
  [componentId: string]: any;
}

interface ThemeEditorStore {
  themeData: ThemeData;
  updateComponent: (componentId: string, data: any) => void;
  getComponentData: (componentId: string) => any;
}

export const useThemeEditor = create<ThemeEditorStore>()(
  persist(
    (set, get) => ({
      themeData: {
        'home-hero-image': {
          src: '/placeholders/landscape-placeholder.svg',
          alt: 'Welcome to our store'
        },
        'marquee-announcement': {
          text: 'Free shipping on orders over ₹999 • Same day dispatch • Easy returns',
          speed: 30
        }
      },
      updateComponent: async (componentId, data) => {
        // Validate image path if it's an image update
        if (data.src && data.src !== get().themeData[componentId]?.src) {
          try {
            const response = await fetch(`/api/verify-image?path=${data.src}`);
            const { exists } = await response.json();
            if (!exists) {
              console.error('Image not found:', data.src);
              return;
            }
          } catch (error) {
            console.error('Error validating image:', error);
            return;
          }
        }

        set((state) => ({
          themeData: {
            ...state.themeData,
            [componentId]: data
          }
        }));
      },
      getComponentData: (componentId) => {
        const data = get().themeData[componentId];
        console.log('Getting component data:', { componentId, data });
        return data;
      }
    }),
    {
      name: 'theme-editor-storage'
    }
  )
); 