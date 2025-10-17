import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, Tag } from 'lucide-react';

const SearchResults = ({ 
  results, 
  isLoading, 
  error, 
  hasSearched, 
  onResultClick,
  isDark = false 
}) => {
  const navigate = useNavigate();
  if (!hasSearched && !isLoading) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={`rounded-lg shadow-lg border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#DE5E08]"></div>
            <span className={`ml-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Searching...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg shadow-lg border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="p-4">
          <div className="flex items-center justify-center">
            <span className={`text-sm text-red-500`}>
              Search failed: {error}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={`rounded-lg shadow-lg border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="p-4">
          <div className="flex items-center justify-center">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No results found
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg shadow-lg border max-h-96 overflow-y-auto ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="py-2">
        {results.map((result) => {
          const targetUrl = result.id ? `/${result.scope}/article/${result.id}` : `/${result.scope}/doc/${result.slug}`;
          
          const handleClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Call the onResultClick handler first to clean up search state
            if (onResultClick) {
              onResultClick(result);
            }
            // Use setTimeout to delay navigation so search dropdown can close first
            setTimeout(() => {
              navigate(targetUrl);
            }, 100);
          };
          
          return (
            <div
              key={result.id}
              onMouseDown={handleClick}
              data-search-result
              className={`block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 border-b cursor-pointer ${
                isDark ? 'border-gray-700' : 'border-gray-100'
              } last:border-b-0`}
            >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <FileText className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`text-sm font-medium truncate ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {result.title}
                  </h4>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    result.scope === 'platform' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {result.scope}
                  </span>
                </div>
                
                {result.excerpt && (
                  <p className={`text-xs mb-2 line-clamp-2 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {result.excerpt}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <Tag className={`w-3 h-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                      {result.category}
                    </span>
                  </div>
                  
                  {result.readingTime && (
                    <div className="flex items-center gap-1">
                      <Clock className={`w-3 h-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                        {result.readingTime} min read
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};

export default SearchResults;
