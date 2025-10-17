import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchPublicArticles } from '../lib/api/documentation.api';
import SearchInput from '../Design Library/SearchInput/SearchInput';
import ButtonV1 from '../Design Library/Button/ButtonV1';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const scope = searchParams.get('scope') || 'organization';
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    if (query) {
      performSearch(query, scope);
    }
  }, [query, scope]);

  async function performSearch(searchTerm, searchScope) {
    try {
      setLoading(true);
      setError(null);
      
      const data = await searchPublicArticles(searchTerm, searchScope);
      setResults(data.data || []);
    } catch (error) {
      console.error('Search failed:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/${scope}/search?q=${encodeURIComponent(searchQuery)}`);
    }
  }

  function handleArticleClick(article) {
    // Use ID-based navigation for better sidebar integration and cross-scope support
    if (article.id) {
      navigate(`/${scope}/article/${article.id}`);
    } else {
      // Fallback to slug-based navigation if no ID is available
      navigate(`/${scope}/doc/${article.slug}`);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Results</h1>
        
        <form onSubmit={handleSearch}>
          <SearchInput
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon="search"
            width="w-full"
            height="h-12"
          />
        </form>
        
        {query && (
          <p className="mt-4 text-gray-600">
            Showing results for "<span className="font-medium">{query}</span>" in {scope} documentation
          </p>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Search Error</h2>
          <p className="text-red-600">{error}</p>
          <ButtonV1 
            onClick={() => performSearch(query, scope)}
            bgColor="#EF4444"
            textColor="white"
            className="mt-4"
          >
            Try Again
          </ButtonV1>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && results.length === 0 && query && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">No results found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find any articles matching "<span className="font-medium">{query}</span>"
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Try:</p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Using different keywords</li>
              <li>• Checking your spelling</li>
              <li>• Using more general terms</li>
            </ul>
          </div>
        </div>
      )}

      {/* Search Results */}
      {!loading && !error && results.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="space-y-4">
            {results.map((article) => (
              <div 
                key={article.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleArticleClick(article)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {article.type || 'Article'}
                    </span>
                    {article.category && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {article.category.name}
                      </span>
                    )}
                  </div>
                  {article.readingTime && (
                    <span className="text-sm text-gray-500">📖 {article.readingTime} min</span>
                  )}
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600">
                  {article.title}
                </h3>
                
                {article.excerpt && (
                  <p className="text-gray-600 mb-3 line-clamp-2">{article.excerpt}</p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {article.publishedAt && (
                    <span>📅 {new Date(article.publishedAt).toLocaleDateString()}</span>
                  )}
                  <span>🔗 {article.slug}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State - No Search Query */}
      {!query && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Search Documentation</h2>
          <p className="text-gray-600 mb-6">
            Enter a search term above to find articles, tutorials, and guides
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
