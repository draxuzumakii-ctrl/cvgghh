import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-dark-800/80 rounded-xl w-1/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-dark-800/60 rounded-2xl"></div>
        ))}
      </div>
      <div className="h-72 bg-dark-800/50 rounded-2xl"></div>
      <div className="space-y-2.5">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="h-12 bg-dark-800/40 rounded-xl"></div>
        ))}
      </div>
    </div>
  );
};
