'use client';
import { componentRegistry } from '@/lib/admin/componentRegistry';
import { useState } from 'react';
import ColorPicker from './inputs/ColorPicker';
import ImageUpload from './inputs/ImageUpload';
import { Save } from 'lucide-react';

interface PropertyEditorProps {
  component: string | null;
  props: any;
  onChange: (props: any) => void;
}

export default function PropertyEditor({
  component,
  props,
  onChange
}: PropertyEditorProps) {
  const [isDirty, setIsDirty] = useState(false);

  if (!component) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Select a component to edit its properties
      </div>
    );
  }

  const componentConfig = componentRegistry[component];
  if (!componentConfig) return null;

  const handleChange = (key: string, value: any) => {
    onChange({ ...props, [key]: value });
    setIsDirty(true);
  };

  const renderInput = (key: string, config: any) => {
    const value = props[key] ?? config.default;

    switch (config.type) {
      case 'color':
        return (
          <ColorPicker
            value={value}
            onChange={(color) => handleChange(key, color)}
          />
        );

      case 'image':
        return (
          <ImageUpload
            value={value}
            onChange={(url) => handleChange(key, url)}
          />
        );

      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            min={config.min}
            max={config.max}
            onChange={(e) => handleChange(key, Number(e.target.value))}
            className="w-full p-2 border rounded-lg"
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleChange(key, e.target.checked)}
              className="w-4 h-4 text-black rounded"
            />
            <span className="ml-2 text-sm">{config.label}</span>
          </label>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-white flex items-center justify-between">
        <h2 className="font-medium">Properties</h2>
        {isDirty && (
          <button
            onClick={() => {
              // Save changes to database
              setIsDirty(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-lg text-sm"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-6">
          {Object.entries(componentConfig.props).map(([key, config]: [string, any]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {config.label}
              </label>
              {renderInput(key, config)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 