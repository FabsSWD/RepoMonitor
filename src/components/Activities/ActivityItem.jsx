import React from 'react';
import { GitCommit, GitBranch, GitPullRequest } from 'lucide-react';
import { formatTimestamp, getEventColor } from '../../utils/formatters';

const getEventIcon = (type) => {
  const iconClass = "w-3 h-3 sm:w-4 sm:h-4";
  switch (type) {
    case 'push':
      return <GitCommit className={iconClass} />;
    case 'branch':
      return <GitBranch className={iconClass} />;
    case 'pr':
      return <GitPullRequest className={iconClass} />;
    default:
      return <GitCommit className={iconClass} />;
  }
};

const ActivityItem = ({ event, index }) => {
  return (
    <div
      className="relative flex items-start gap-3 sm:gap-4 animate-slideUp"
      style={{
        animationDelay: `${index * 0.1}s`,
        opacity: 0,
        animationFillMode: 'forwards'
      }}
    >
      <div className="relative flex-shrink-0">
        <img 
          src={event.avatarUrl} 
          alt={event.author}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-gray-700"
          loading="lazy"
        />
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full ${getEventColor(event.type)} flex items-center justify-center text-white shadow-lg`}>
          {getEventIcon(event.type)}
        </div>
      </div>
      
      <div className="flex-1 bg-gray-800 rounded-lg p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 mb-2">
          <div>
            <span className="text-xs sm:text-sm font-semibold text-gray-300">
              {event.type === 'branch' ? 'Nueva rama: ' : 'Push a '}
              <span className="text-blue-400">{event.branch}</span>
            </span>
          </div>
          <span className="text-xs text-gray-500">{formatTimestamp(event.timestamp)}</span>
        </div>
        <p className="text-white mb-2 break-words text-sm sm:text-base">{event.message}</p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-400">
          <span>Por: @{event.author}</span>
          {event.sha !== 'N/A' && <span className="hidden sm:inline">SHA: {event.sha}</span>}
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;