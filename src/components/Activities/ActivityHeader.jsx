import React from 'react';

const ActivityHeader = ({ onRefresh }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
      <h2 className="text-lg sm:text-xl font-semibold">Actividad Reciente</h2>
      <button
        onClick={onRefresh}
        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-400 hover:text-white transition-all"
      >
        Actualizar
      </button>
    </div>
  );
};

export default ActivityHeader;