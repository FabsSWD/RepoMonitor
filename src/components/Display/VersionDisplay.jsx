import React, { memo } from 'react';

const VersionDisplay = memo(({ version }) => {
  return (
    <div className="text-center mb-8 sm:mb-12">
      <div className="inline-block">
        <div className="text-5xl sm:text-7xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 animate-pulse">
          {version}
        </div>
        <p className="text-gray-400 mt-2 sm:mt-4 text-sm sm:text-base">Versión Actual</p>
      </div>
    </div>
  );
});

export default VersionDisplay;