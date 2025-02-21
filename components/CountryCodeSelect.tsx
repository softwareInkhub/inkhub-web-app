'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

type Country = {
  name: string;
  code: string;
  dial_code: string;
  flag: string;
};

const countries: Country[] = [
  { name: 'India', code: 'IN', dial_code: '+91', flag: '🇮🇳' },
  { name: 'United States', code: 'US', dial_code: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', dial_code: '+44', flag: '🇬🇧' },
  // Add more countries as needed
];

type CountryCodeSelectProps = {
  selectedCode: string;
  onSelect: (code: string) => void;
};

export default function CountryCodeSelect({ selectedCode, onSelect }: CountryCodeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCountry = countries.find(country => country.dial_code === selectedCode);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
      >
        <span>{selectedCountry?.flag}</span>
        <span>{selectedCode}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-48 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {countries.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => {
                onSelect(country.dial_code);
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
            >
              <span>{country.flag}</span>
              <span className="text-sm">{country.name}</span>
              <span className="text-sm text-gray-500 ml-auto">{country.dial_code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 