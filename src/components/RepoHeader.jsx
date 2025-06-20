import React, { memo } from 'react';
import { ExternalLink } from 'lucide-react';

const RepoHeader = memo(({ repoData }) => {
  return (
    <div className="text-center mb-8 sm:mb-12">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-400 mb-2">
        {repoData.name}
      </h1>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
        <span className="text-gray-500">{repoData.frameworkPath}</span>
        <a 
          href={repoData.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
          Ver en GitHub
        </a>
      </div>
    </div>
  );
});

export default RepoHeader;