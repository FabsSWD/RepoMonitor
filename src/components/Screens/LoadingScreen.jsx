import React from 'react';

const LoadingScreen = ({ message = "Cargando..." }) => {
  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-400 text-sm sm:text-base">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;