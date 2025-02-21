'use client';
import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-lg border shadow-sm"
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-2">
          <div
            className="fixed inset-0"
            onClick={() => setIsOpen(false)}
          />
          <HexColorPicker
            color={value}
            onChange={onChange}
            className="relative z-20"
          />
        </div>
      )}
    </div>
  );
} 