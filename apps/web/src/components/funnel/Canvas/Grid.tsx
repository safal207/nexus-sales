import React from 'react';

export const Grid: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Vertical lines */}
      {Array.from({ length: 50 }, (_, i) => (
        <div
          key={`v-${i}`}
          className="absolute top-0 bottom-0 border-l border-gray-200"
          style={{ left: `${i * 20}px` }}
        />
      ))}

      {/* Horizontal lines */}
      {Array.from({ length: 50 }, (_, i) => (
        <div
          key={`h-${i}`}
          className="absolute left-0 right-0 border-t border-gray-200"
          style={{ top: `${i * 20}px` }}
        />
      ))}
    </div>
  );
};
