'use client';
import { useThemeEditor } from '@/hooks/useThemeEditor';
import { useState, useEffect } from 'react';
import ImageUpload from './inputs/ImageUpload';
import toast from 'react-hot-toast';

interface ComponentEditorProps {
  componentId: string;
  config: any;
}

export default function ComponentEditor({ componentId, config }: ComponentEditorProps) {
  const { updateComponent, getComponentData } = useThemeEditor();
  const [componentData, setComponentData] = useState(getComponentData(componentId) || {});

  useEffect(() => {
    setComponentData(getComponentData(componentId) || {});
  }, [componentId, getComponentData]);

  const handleChange = (key: string, value: any) => {
    const newData = {
      ...componentData,
      [key]: value
    };
    console.log('Updating component:', { componentId, key, value, newData });
    setComponentData(newData);
    updateComponent(componentId, newData);
    toast.success('Changes saved');
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{config.label}</h3>
      </div>

      {Object.entries(config.props).map(([key, prop]: [string, any]) => (
        <div key={key} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {prop.label}
          </label>
          {prop.type === 'image' ? (
            <ImageUpload
              value={componentData[key] || prop.default}
              onChange={(url) => handleChange(key, url)}
            />
          ) : prop.type === 'text' ? (
            <input
              type="text"
              value={componentData[key] || prop.default}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          ) : prop.type === 'number' ? (
            <input
              type="number"
              value={componentData[key] || prop.default}
              min={prop.min}
              max={prop.max}
              onChange={(e) => handleChange(key, Number(e.target.value))}
              className="w-full p-2 border rounded-lg"
            />
          ) : null}
        </div>
      ))}
    </div>
  );
} 