// Search Hook for Documentation Frontend
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { searchPublicArticles, searchPlatformArticles } from '../lib/api/documentation.api';
import { useAuth } from './useAuth';

const SEARCH_CACHE_KEY = 'vidyantra_search_cache';
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

export function useSearch() {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const debounceTimeoutRef = useRef(null);

  // Clear search cache
  const clearSearchCache = useCallback(() => {
    try {
      localStorage.removeItem(SEARCH_CACHE_KEY);
    } catch (error) {
      console.error('Error clearing search cache:', error);
    }
  }, []);

  // Clear cache on page refresh/load
  useEffect(() => {
    clearSearchCache();
  }, [clearSearchCache]); // Run once on mount

  // Determine current scope from URL
  const getCurrentScope = useCallback(() => {
    const path = location.pathname;
    if (path.startsWith('/platform')) return 'platform';
    if (path.startsWith('/organization')) return 'organization';
    if (path.startsWith('/branch')) return 'branch';
    return 'organization'; // default
  }, [location.pathname]);

  // Get cached search results
  const getCachedResults = useCallback((query) => {
    try {
      const cached = localStorage.getItem(SEARCH_CACHE_KEY);
      if (!cached) return null;

      const cache = JSON.parse(cached);
      // Use universal cache key since we now search all scopes
      const cacheKey = `${query.toLowerCase()}_universal_${isAuthenticated ? 'auth' : 'public'}`;
      const cacheEntry = cache[cacheKey];
      
      console.log('Universal Cache Debug:', {
        query,
        cacheKey,
        hasCacheEntry: !!cacheEntry,
        isExpired: cacheEntry ? Date.now() - cacheEntry.timestamp >= CACHE_EXPIRY_TIME : 'N/A'
      });
      
      if (cacheEntry && Date.now() - cacheEntry.timestamp < CACHE_EXPIRY_TIME) {
        console.log('Returning cached universal results for:', cacheKey);
        return cacheEntry.results;
      }
      
      // Remove expired entry
      delete cache[cacheKey];
      localStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify(cache));
      return null;
    } catch (error) {
      console.error('Error reading search cache:', error);
      return null;
    }
  }, [isAuthenticated]);

  // Cache search results
  const cacheResults = useCallback((query, results) => {
    try {
      const cached = localStorage.getItem(SEARCH_CACHE_KEY);
      const cache = cached ? JSON.parse(cached) : {};
      // Use universal cache key since we now search all scopes
      const cacheKey = `${query.toLowerCase()}_universal_${isAuthenticated ? 'auth' : 'public'}`;
      
      console.log('Caching universal results for:', cacheKey, 'with', results.length, 'results');
      
      cache[cacheKey] = {
        results,
        timestamp: Date.now()
      };
      
      localStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Error caching search results:', error);
    }
  }, [isAuthenticated]);

  // Perform universal search across all scopes
  const performSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    const trimmedQuery = query.trim();
    
    // Check cache first
    const cachedResults = getCachedResults(trimmedQuery);
    if (cachedResults) {
      setSearchResults(cachedResults);
      setHasSearched(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Universal Search Debug:', {
        pathname: location.pathname,
        isAuthenticated,
        query: trimmedQuery
      });
      
      let allResults = [];
      
      if (isAuthenticated) {
        // For authenticated users, search platform first
        console.log('Searching platform (authenticated user)');
        try {
          const platformResponse = await searchPlatformArticles(trimmedQuery);
          if (platformResponse.success && platformResponse.data) {
            const platformResults = platformResponse.data.articles || [];
            allResults = [...allResults, ...platformResults];
          }
        } catch (error) {
          console.warn('Platform search failed:', error.message);
        }
      }
      
      // Always search public scopes (organization and branch)
      const publicScopes = ['organization', 'branch'];
      
      for (const scope of publicScopes) {
        try {
          console.log(`Searching ${scope} scope`);
          const response = await searchPublicArticles(trimmedQuery, scope);
          if (response.success && response.data) {
            const scopeResults = response.data.articles || [];
            allResults = [...allResults, ...scopeResults];
          }
        } catch (error) {
          console.warn(`${scope} search failed:`, error.message);
        }
      }
      
      // Transform results to include only necessary data
      const transformedResults = allResults.map(article => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        type: article.type,
        scope: article.scope,
        category: article.category?.name || 'Uncategorized',
        readingTime: article.readingTime,
        publishedAt: article.publishedAt
      }));

      // Sort results by scope priority: platform first, then organization, then branch
      const scopePriority = { platform: 1, organization: 2, branch: 3 };
      transformedResults.sort((a, b) => {
        const aPriority = scopePriority[a.scope] || 4;
        const bPriority = scopePriority[b.scope] || 4;
        return aPriority - bPriority;
      });

      setSearchResults(transformedResults);
      setHasSearched(true);
      
      // Cache the results
      cacheResults(trimmedQuery, transformedResults);
      
    } catch (error) {
      console.error('Universal search error:', error);
      setError(error.message || 'Search failed');
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, getCachedResults, cacheResults]);

  // Debounced search function
  const search = useCallback((query) => {
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300); // 300ms debounce
  }, [performSearch]);

  // Clear search results
  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setError(null);
    setHasSearched(false);
    
    // Clear debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    searchResults,
    isLoading,
    error,
    hasSearched,
    search,
    clearSearch,
    clearSearchCache
  };
}
