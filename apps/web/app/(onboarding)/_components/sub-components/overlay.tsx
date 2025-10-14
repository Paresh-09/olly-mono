// Overlay.tsx
import React, { useEffect, useState } from 'react';

interface OverlayProps {
  highlightRef: React.RefObject<HTMLElement | null>;
  message: string;
}

const Overlay: React.FC<OverlayProps> = ({ highlightRef, message }) => {
  const [highlightStyle, setHighlightStyle] = useState({});
  const [messagePosition, setMessagePosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (highlightRef.current) {
      const rect = highlightRef.current.getBoundingClientRect();
      setHighlightStyle({
        position: 'absolute',
        top: rect.top + window.scrollY - 8,
        left: rect.left + window.scrollX - 8,
        width: rect.width + 16,
        height: rect.height + 16,
        border: '2px solid #4F46E5',
        borderRadius: '8px',
        pointerEvents: 'none',
        zIndex: 50,
      });
      setMessagePosition({
        top: rect.top + window.scrollY - 50,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }
  }, [highlightRef]);

  return (
    <>
      {/* Dark Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 pointer-events-none"
        style={{ zIndex: 40 }}
      ></div>

      {/* Highlighted Element Border */}
      {highlightRef.current && (
        <>
          <div style={highlightStyle}></div>
          {/* Instruction Message */}
          <div
            className="absolute text-white text-lg bg-gray-800 bg-opacity-80 px-4 py-2 rounded-md"
            style={{
              top: messagePosition.top,
              left: messagePosition.left,
              transform: 'translateX(-50%)',
              zIndex: 60,
            }}
          >
            {message}
          </div>
        </>
      )}
    </>
  );
};

export default Overlay;
