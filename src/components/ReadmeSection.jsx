import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ReadmeSection = ({ readme }) => {
  const [showReadme, setShowReadme] = useState(false);

  const toggleReadme = () => {
    setShowReadme(!showReadme);
  };

  return (
    <div className="mb-12">
      <button
        onClick={toggleReadme}
        className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all"
      >
        <span className="text-lg font-semibold">README.md</span>
        {showReadme ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      
      {showReadme && (
        <div className="mt-4 p-6 bg-gray-800 rounded-lg overflow-x-auto">
          <div className="prose prose-invert prose-sm sm:prose-base max-w-none
            prose-headings:text-gray-200 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
            prose-p:text-gray-300 prose-p:leading-relaxed
            prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-100
            prose-code:text-pink-400 prose-code:bg-gray-900 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700
            prose-blockquote:border-l-4 prose-blockquote:border-gray-600 prose-blockquote:pl-4 prose-blockquote:italic
            prose-ul:text-gray-300 prose-ol:text-gray-300
            prose-li:marker:text-gray-500
            prose-hr:border-gray-700
            prose-table:border-collapse prose-th:border prose-th:border-gray-700 prose-th:px-3 prose-th:py-2
            prose-td:border prose-td:border-gray-700 prose-td:px-3 prose-td:py-2">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                code({inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <pre className="overflow-x-auto">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {readme}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadmeSection;