import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSidebarData } from '../hooks/useSidebarData';
import { useAuth } from '../hooks/useAuth';
import Platform from '../pages/Platform';
import Organization from '../pages/Organization';
import Branch from '../pages/Branch';

const ScopePage = ({ scope, StaticComponent }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarData, loading } = useSidebarData();
  const { isAuthenticated } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Only attempt redirect if we have sidebar data and haven't redirected yet
    if (!loading && sidebarData.length > 0 && !hasRedirected) {
      // Find the first available article
      const firstArticle = findFirstArticle(sidebarData);
      
      if (firstArticle) {
        console.log(`Auto-redirecting to first article: ${firstArticle.title} (${firstArticle.id})`);
        setHasRedirected(true);
        
        // Use ID-based navigation for better consistency
        const articleUrl = firstArticle.id 
          ? `/${scope}/article/${firstArticle.id}`
          : `/${scope}/doc/${firstArticle.slug}`;
        
        navigate(articleUrl, { replace: true });
        return;
      }
    }
  }, [sidebarData, loading, hasRedirected, scope, navigate]);

  // Function to find the first available article
  const findFirstArticle = (categories) => {
    for (const category of categories) {
      if (category.articles && category.articles.length > 0) {
        // Return the first article from the first category that has articles
        return category.articles[0];
      }
    }
    return null;
  };

  // Show loading state while checking for articles
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DE5E08] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading {scope} documentation...</p>
        </div>
      </div>
    );
  }

  // If we have sidebar data but no articles, or if we've already tried to redirect, show static page
  if (sidebarData.length === 0 || !findFirstArticle(sidebarData) || hasRedirected) {
    return <StaticComponent />;
  }

  // This should not be reached due to the redirect, but just in case
  return <StaticComponent />;
};

export default ScopePage;
