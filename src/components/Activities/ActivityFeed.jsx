import React from 'react';
import ActivityHeader from './ActivityHeader';
import ActivityItem from './ActivityItem';

const ActivityFeed = ({ events, onRefresh }) => {
  return (
    <div className="space-y-4">
      <ActivityHeader onRefresh={onRefresh} />
      
      {events.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
          No hay actividad reciente en el repositorio
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 sm:left-6 top-0 bottom-0 w-0.5 bg-gray-700"></div>
          
          <div className="space-y-3 sm:space-y-4">
            {events.map((event, index) => (
              <ActivityItem 
                key={event.id} 
                event={event} 
                index={index} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;