import { useState, useEffect } from 'react';
import { getPublicRelatedArticles, getRelatedArticles } from '../lib/api/documentation.api';

/**
 * Custom hook to fetch related articles for a given article
 * @param {string} articleId - The ID of the article to get related articles for
 * @param {string} scope - The scope of the article (platform, organization, branch)
 * @returns {Object} - { relatedArticles, loading, error, refetch }
 */
export const useRelatedArticles = (articleId, scope) => {
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRelatedArticles = async () => {
    if (!articleId) {
      setRelatedArticles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let response;
      if (scope === 'platform') {
        try {
          response = await getRelatedArticles(articleId);
        } catch (error) {
          console.warn('Platform related articles failed, trying public API:', error.message);
          // Fallback to public API if platform API fails
          response = await getPublicRelatedArticles(articleId);
        }
      } else {
        response = await getPublicRelatedArticles(articleId);
      }

      if (response.success && response.data) {
        setRelatedArticles(response.data || []);
      } else {
        setRelatedArticles([]);
      }
    } catch (err) {
      console.warn('Failed to load related articles:', err);
      setError(err.message);
      setRelatedArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRelatedArticles();
  }, [articleId, scope]);

  return {
    relatedArticles,
    loading,
    error,
    refetch: fetchRelatedArticles
  };
};
