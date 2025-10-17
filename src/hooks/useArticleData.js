import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getPublicArticleById, getPlatformArticleBySlug, getPublicArticleBySlug } from '../lib/api/documentation.api';

/**
 * Custom hook to fetch individual article data
 * Handles both public articles (by ID) and platform articles (by slug)
 */
export const useArticleData = () => {
  const [articleData, setArticleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id, slug } = useParams();
  const location = useLocation();
  
  // Extract scope from the current path
  const scope = location.pathname.split('/')[1];

  const fetchArticleData = async () => {
    if (!id && !slug) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let response;
      
      if (id) {
        // Fetch by ID (for public articles)
        response = await getPublicArticleById(id);
      } else if (slug && scope) {
        // Fetch by slug and scope
        if (scope === 'platform') {
          try {
            response = await getPlatformArticleBySlug(slug);
          } catch (error) {
            console.warn('Platform article fetch failed, trying public API:', error.message);
            // Fallback to public API if platform API fails
            response = await getPublicArticleBySlug(slug, scope);
          }
        } else {
          // For organization and branch articles
          response = await getPublicArticleBySlug(slug, scope);
        }
      } else {
        throw new Error('Invalid article parameters');
      }

            if (response.success && response.data) {
        // Handle different response structures
        if (response.data.articles && response.data.articles.length > 0) {
          // Response has articles array - find the specific article by ID if available
          if (id) {
            // Find article by ID
            const foundArticle = response.data.articles.find(article => article.id === id);
            if (foundArticle) {
              setArticleData(foundArticle);
            } else {
              // Fallback to first article if ID not found
              setArticleData(response.data.articles[0]);
            }
          } else {
            // No ID specified, use first article
            setArticleData(response.data.articles[0]);
          }
        } else if (response.data.id) {
          // Response has direct article object
          setArticleData(response.data);
        } else {
          throw new Error('Article not found');
        }
      } else {
        throw new Error(response.message || 'Failed to fetch article');
      }
    } catch (err) {
      console.error('Error fetching article data:', err);
      setError(err.message);
      setArticleData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticleData();
  }, [id, slug, scope]);

  return {
    articleData,
    loading,
    error,
    refetch: fetchArticleData
  };
};
