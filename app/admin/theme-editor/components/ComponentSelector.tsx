'use client';
import { componentRegistry } from '@/lib/admin/componentRegistry';

interface ComponentSelectorProps {
  selectedComponent: string | null;
  onSelect: (componentId: string) => void;
}

export default function ComponentSelector({ 
  selectedComponent, 
  onSelect 
}: ComponentSelectorProps) {
  // Define all editable components on the page
  const availableComponents = [
    {
      id: 'home-hero-image',
      type: 'LandscapeImage',
      label: 'Hero Image',
      path: '/',
      location: 'Home Page'
    },
    {
      id: 'marquee-announcement',
      type: 'MarqueeText',
      label: 'Announcement Bar',
      path: '/',
      location: 'Global'
    }
  ];

  // Group components by location
  const groupedComponents = availableComponents.reduce((acc, component) => {
    const location = component.location;
    if (!acc[location]) {
      acc[location] = [];
    }
    acc[location].push(component);
    return acc;
  }, {} as Record<string, typeof availableComponents>);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Page Components</h2>
      <div className="space-y-6">
        {Object.entries(groupedComponents).map(([location, components]) => (
          <div key={location}>
            <h3 className="text-sm font-medium text-gray-500 mb-2">{location}</h3>
            <div className="space-y-2">
              {components.map((component) => (
                <div key={component.id} className="space-y-1">
                  <button
                    onClick={() => onSelect(component.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm
                      ${selectedComponent === component.id 
                        ? 'bg-black text-white' 
                        : 'hover:bg-gray-100'
                      }`}
                  >
                    {component.label}
                    <div className={`text-xs ${selectedComponent === component.id ? 'text-gray-300' : 'text-gray-500'}`}>
                      {component.type}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 