import React from 'react';

const ErrorDisplay = ({ error }) => {
  return (
    <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400 text-sm sm:text-base">
      {error}
    </div>
  );
};

export default ErrorDisplay;