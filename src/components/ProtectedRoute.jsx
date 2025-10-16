import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isTokenValid } from '../utils/tokenHandler';
import { getAccessToken } from '../utils/cookieUtils';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, redirectToLogin } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  // Define routes that don't require authentication
  const publicRoutes = ['/organization', '/branch'];
  
  // Define public route patterns (for dynamic routes)
  const publicRoutePatterns = [
    /^\/organization\/article\/.*$/,
    /^\/organization\/doc\/.*$/,
    /^\/branch\/article\/.*$/,
    /^\/branch\/doc\/.*$/
  ];
  
  useEffect(() => {
    const checkTokenAndRedirect = async () => {
      // Wait for auth hook to finish loading
      if (loading) return;

      // Check if current route is public
      const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route)) ||
                           publicRoutePatterns.some(pattern => pattern.test(location.pathname));
      
      if (isPublicRoute) {
        // Public route, allow access without authentication
        setIsChecking(false);
        return;
      }

      // Get token from cookies
      const token = getAccessToken();
      
      // Check if token exists and is valid
      if (!token || !isTokenValid(token)) {
        // No valid token found, redirect to login with current path as returnUrl
        const currentPath = window.location.pathname + window.location.search;
        redirectToLogin(currentPath);
        return;
      }

      // Token is valid, allow access
      setIsChecking(false);
    };

    checkTokenAndRedirect();
  }, [loading, isAuthenticated, redirectToLogin, location.pathname]);

  // Show loading while checking authentication
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DE5E08] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route)) ||
                       publicRoutePatterns.some(pattern => pattern.test(location.pathname));

  // If it's a public route OR if authenticated, render the content
  if (isPublicRoute || isAuthenticated) {
    return children;
  }

  // This should not be reached due to redirect, but just in case
  return null;
};

export default ProtectedRoute;
