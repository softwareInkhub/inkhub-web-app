'use client';
import { useState } from 'react';
import ComponentSelector from './components/ComponentSelector';
import PreviewPane from './components/PreviewPane';
import ComponentEditor from './components/ComponentEditor';
import { componentRegistry } from '@/lib/admin/componentRegistry';
import { useThemeEditor } from '@/hooks/useThemeEditor';

export default function ThemeEditorPage() {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const { getComponentData } = useThemeEditor();

  const handleComponentSelect = (componentId: string) => {
    console.log('Selected component:', componentId);
    setSelectedComponent(componentId);
  };

  const getComponentConfig = (componentId: string) => {
    const type = componentId === 'home-hero-image' ? 'LandscapeImage' : 'MarqueeText';
    return {
      ...componentRegistry[type],
      id: componentId
    };
  };

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Component Selector */}
      <div className="w-64 border-r bg-white overflow-y-auto">
        <ComponentSelector 
          onSelect={handleComponentSelect}
          selectedComponent={selectedComponent}
        />
      </div>

      {/* Center - Preview */}
      <div className="flex-1 bg-gray-50">
        <PreviewPane 
          selectedComponent={selectedComponent}
        />
      </div>

      {/* Right Sidebar - Property Editor */}
      <div className="w-80 border-l bg-white overflow-y-auto">
        {selectedComponent ? (
          <ComponentEditor
            componentId={selectedComponent}
            config={getComponentConfig(selectedComponent)}
          />
        ) : (
          <div className="p-4 text-gray-500">
            Select a component to edit its properties
          </div>
        )}
      </div>
    </div>
  );
} 