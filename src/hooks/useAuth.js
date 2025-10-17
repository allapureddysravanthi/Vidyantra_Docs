// Authentication Hook for Documentation Frontend
import { useEffect, useState } from 'react';
import { config } from '../config/environment';
import { logoutUser } from '../lib/api/documentation.api';
import { getAccessToken, setAccessToken, clearAuthCookies } from '../utils/cookieUtils';
import { displayToast } from '../Design Library/Toast/Toast';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to get token from cookies (using utility)
  const getTokenFromCookies = () => {
    return getAccessToken();
  };

  // Function to validate token
  const isTokenValid = (token) => {
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch (error) {
      return false;
    }
  };

  // Function to check authentication status
  const checkAuthStatus = async () => {
    try {
      // First try to get token from cookies
      let token = getTokenFromCookies();
      
      // Fallback to localStorage
      if (!token) {
        token = localStorage.getItem('contextToken');
      }
      
      if (token) {
        // Check if token is valid (not expired)
        if (!isTokenValid(token)) {
          console.warn('Token is expired or invalid');
          localStorage.removeItem('contextToken');
          clearAuthCookies();
          displayToast('warning', 'Your session has expired. Please log in again.');
          return;
        }

        try {
          // Simple JWT decode (you can install jwt-decode for production)
          const payload = JSON.parse(atob(token.split('.')[1]));
          
          setUser(payload);
          
          // Convert MD array to permission strings
          const mdToPermissions = (mdArray) => {
            // If MD is null or undefined, give read-only permission
            if (!mdArray || !Array.isArray(mdArray)) {
              return ['platform.documentation.view']; // Read-only access
            }
            
            const permissionMap = {
              'R': 'platform.documentation.view',
              'C': 'platform.documentation.create', 
              'U': 'platform.documentation.edit',
              'D': 'platform.documentation.delete'
            };
            
            return mdArray.map(md => permissionMap[md]).filter(Boolean);
          };
          
          // Set permissions based on MD array from token
          const userPermissions = mdToPermissions(payload.MD);
          console.log('User MD array:', payload.MD);
          console.log('Converted permissions:', userPermissions);
          setPermissions(userPermissions);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Invalid token format:', error);
          // Clear invalid tokens
          localStorage.removeItem('contextToken');
          clearAuthCookies();
          // Show toast notification for expired/invalid token
          displayToast('warning', 'Your session has expired. Please log in again.');
        }
      } else {
        console.log('No authentication token found');
        setIsAuthenticated(false);
        setUser(null);
        setPermissions([]);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  function hasPermission(permission) {
    return permissions.includes(permission);
  }

  function redirectToLogin(returnUrl) {
    const url = returnUrl 
      ? `${config.LOGIN_URL}?returnUrl=${encodeURIComponent(returnUrl)}`
      : config.LOGIN_URL;
    window.location.href = url;
  }

  async function logout() {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout failed:', error);
    }
    
    setIsAuthenticated(false);
    setUser(null);
    setPermissions([]);
    
    // Clear all authentication cookies
    clearAuthCookies();
    
    // Clear search cache on logout
    try {
      localStorage.removeItem('vidyantra_search_cache');
    } catch (error) {
      console.error('Error clearing search cache:', error);
    }
    
    // Note: Navigation is now handled by the calling component
    // No longer reloading the page here
  }

  function setToken(token) {
    // Set token in both cookies and localStorage
    setAccessToken(token);
    localStorage.setItem('contextToken', token);
    // Reload to update auth state
    window.location.reload();
  }

  return {
    isAuthenticated,
    user,
    permissions,
    loading,
    hasPermission,
    redirectToLogin,
    logout,
    setToken,
    checkAuthStatus
  };
}
