import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getPublicSidebar, getPlatformSidebar, getAdminSidebar } from '../lib/api/documentation.api';
import { useAuth } from './useAuth';

/**
 * Custom hook to fetch sidebar data based on current route
 * Handles different scopes: organization, branch, platform
 */
export const useSidebarData = () => {
  const [sidebarData, setSidebarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const loadingRef = useRef(false);
  const initialLoadRef = useRef(false);
  const location = useLocation();
  const { isAuthenticated, hasPermission, loading: authLoading } = useAuth();

  // Determine scope based on current route
  const getScopeFromRoute = () => {
    const path = location.pathname;
    
    if (path.startsWith('/platform')) {
      return 'platform';
    } else if (path.startsWith('/organization')) {
      return 'organization';
    } else if (path.startsWith('/branch')) {
      return 'branch';
    } else if (path.startsWith('/admin')) {
      return 'admin';
    }
    
    return null;
  };

  // Get article scope from URL parameters or article data
  const getArticleScope = () => {
    const path = location.pathname;
    
    // For article pages, try to determine the actual article scope
    if (path.includes('/article/')) {
      // Extract article ID from URL
      const pathParts = path.split('/');
      const articleId = pathParts[pathParts.length - 1];
      
      // For now, we'll use a simple mapping based on article ID patterns
      // This could be enhanced to fetch the actual article scope from the API
      if (articleId.includes('organization') || articleId === 'art-organization-setup') {
        return 'organization';
      } else if (articleId.includes('branch') || articleId === 'art-daily-operations') {
        return 'branch';
      } else if (articleId.includes('platform') || articleId === 'art-platform-overview') {
        return 'platform';
      }
    }
    
    // Fallback to route-based scope
    return getScopeFromRoute();
  };

  const fetchSidebarData = async () => {
    // Prevent multiple simultaneous calls
    if (loadingRef.current) {
      console.log('useSidebarData: Already loading, skipping...');
      return;
    }
    
    const scope = getArticleScope();
    console.log('useSidebarData: Fetching sidebar data for scope:', scope, 'path:', location.pathname);
    
    // Don't fetch sidebar data for admin pages - show "No articles" instead
    if (location.pathname === '/admin' || 
        location.pathname === '/admin/create' || 
        location.pathname.startsWith('/admin/edit/')) {
      console.log('useSidebarData: Admin page (dashboard/create/edit) - not fetching sidebar data, showing empty state');
      setSidebarData([]);
      setLoading(false);
      setDataLoaded(true);
      return;
    }
    
    if (!scope) {
      console.log('useSidebarData: No scope found, setting empty data');
      setSidebarData([]);
      setLoading(false);
      setDataLoaded(true);
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      let response;
      
      if (scope === 'platform') {
        // Platform requires authentication and view permission
        if (!isAuthenticated) {
          throw new Error('Authentication required for platform documentation');
        }
        if (!hasPermission('platform.documentation.view')) {
          throw new Error('Insufficient permissions for platform documentation');
        }
        console.log('useSidebarData: Calling getPlatformSidebar');
        response = await getPlatformSidebar();
      } else if (scope === 'admin') {
        // Admin pages require authentication and view permission
        if (!isAuthenticated) {
          throw new Error('Authentication required for admin documentation');
        }
        if (!hasPermission('platform.documentation.view')) {
          throw new Error('Insufficient permissions for admin documentation');
        }
        console.log('useSidebarData: Calling getAdminSidebar');
        response = await getAdminSidebar();
      } else if (scope) {
        // Organization and branch are public
        console.log('useSidebarData: Calling getPublicSidebar for scope:', scope);
        response = await getPublicSidebar(scope);
        console.log('useSidebarData: API response:', response);
      } else {
        // No specific scope, set empty data
        setSidebarData([]);
        setLoading(false);
        setDataLoaded(true);
        return;
      }

      if (response.success && response.data) {
        setSidebarData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch sidebar data');
      }
    } catch (err) {
      console.error('Error fetching sidebar data:', err);
      setError(err.message);
      setSidebarData([]);
    } finally {
      setLoading(false);
      setDataLoaded(true);
      loadingRef.current = false;
    }
  };

  // Check permissions on mount - only run once
  useEffect(() => {
    let mounted = true;
    
    const initializeSidebar = async () => {
      const scope = getScopeFromRoute();
      console.log('useSidebarData: Initializing sidebar for scope:', scope, 'dataLoaded:', dataLoaded, 'initialLoadRef:', initialLoadRef.current);
      
      // For organization and branch, load immediately without waiting for auth
      if (scope === 'organization' || scope === 'branch') {
        console.log('useSidebarData: Organization/Branch scope detected, loading immediately');
        if (!dataLoaded && !initialLoadRef.current && mounted) {
          initialLoadRef.current = true;
          const timer = setTimeout(() => {
            if (mounted) {
              console.log('useSidebarData: Calling fetchSidebarData for org/branch');
              fetchSidebarData();
            }
          }, 100);
          
          return () => clearTimeout(timer);
        }
      } else {
        // For platform and admin, wait for authentication to load
        if (authLoading) {
          return;
        }
        
        // Only load data once when component mounts and auth is ready
        if (!dataLoaded && !initialLoadRef.current && mounted) {
          initialLoadRef.current = true;
          const timer = setTimeout(() => {
            if (mounted) {
              console.log('useSidebarData: Calling fetchSidebarData for platform/admin');
              fetchSidebarData();
            }
          }, 100);
          
          return () => clearTimeout(timer);
        }
      }
    };
    
    initializeSidebar();
    
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - only run once on mount

  // Handle authentication state changes (for platform and admin)
  useEffect(() => {
    const scope = getScopeFromRoute();
    if ((scope === 'platform' || scope === 'admin') && !authLoading && isAuthenticated && hasPermission('platform.documentation.view') && !dataLoaded && !initialLoadRef.current) {
      initialLoadRef.current = true;
      fetchSidebarData();
    }
  }, [authLoading, isAuthenticated]); // Only depend on auth state

  // Handle route changes
  useEffect(() => {
    const scope = getScopeFromRoute();
    console.log('useSidebarData: Route changed to:', location.pathname, 'scope:', scope, 'dataLoaded:', dataLoaded);
    
    // For organization and branch, load immediately on route change
    if (scope === 'organization' || scope === 'branch') {
      console.log('useSidebarData: Organization/Branch route change detected');
      // Reset data loaded state when route changes
      setDataLoaded(false);
      initialLoadRef.current = false;
      fetchSidebarData();
    } else {
      // For platform and admin, wait for auth loading to complete
      if (dataLoaded && !authLoading) {
        // Reset data loaded state when route changes
        setDataLoaded(false);
        initialLoadRef.current = false;
        fetchSidebarData();
      }
    }
  }, [location.pathname]); // Only depend on pathname

  const scope = getScopeFromRoute();
  const shouldWaitForAuth = scope === 'platform' || scope === 'admin';
  
  return {
    sidebarData,
    loading: loading || (shouldWaitForAuth && authLoading),
    error,
    refetch: fetchSidebarData
  };
};
