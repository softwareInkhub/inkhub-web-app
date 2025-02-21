'use client';
import { useEffect, useState, useRef } from 'react';
import { useThemeEditor } from '@/hooks/useThemeEditor';

interface PreviewPaneProps {
  selectedComponent: string | null;
}

export default function PreviewPane({ selectedComponent }: PreviewPaneProps) {
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { themeData } = useThemeEditor();

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const highlightComponent = () => {
      if (selectedComponent && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'HIGHLIGHT_COMPONENT',
          componentId: selectedComponent
        }, '*');
      }
    };

    iframe.addEventListener('load', highlightComponent);
    return () => {
      iframe.removeEventListener('load', highlightComponent);
    };
  }, [selectedComponent]);

  return (
    <div className="h-full w-full bg-gray-100 p-4">
      <iframe
        ref={iframeRef}
        key={iframeKey}
        src="/"
        className="w-full h-full rounded-lg border bg-white"
        style={{ 
          height: 'calc(100vh - 120px)'
        }}
        scrolling="yes"
      />
    </div>
  );
} 