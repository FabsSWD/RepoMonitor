import React, { memo } from 'react';
import { Trello } from 'lucide-react';

const TrelloButton = memo(({ url }) => {
  return (
    <div className="text-center mb-8">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
      >
        <Trello className="w-5 h-5" />
        Abrir Tablero de Trello
      </a>
    </div>
  );
});

export default TrelloButton;