// Token Handler for Documentation Frontend
// Handles token from URL parameters and stores in localStorage

import { config } from '../config/environment';

/**
 * Handle token from URL parameters
 * Called on app initialization
 */
export function handleTokenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const returnUrl = params.get('returnUrl');
  
  if (token) {
    // Store token
    localStorage.setItem('contextToken', token);
    
    // Clean URL
    const cleanUrl = returnUrl || window.location.pathname;
    window.history.replaceState({}, '', cleanUrl);
    
    // Reload to update auth state
    window.location.reload();
    
    return true;
  }
  
  return false;
}

/**
 * Generate login URL with return URL
 */
export function getLoginUrl(returnUrl) {
  const currentUrl = window.location.href;
  const encodedReturnUrl = encodeURIComponent(returnUrl || currentUrl);
  return `${config.LOGIN_URL}?returnUrl=${encodedReturnUrl}`;
}

/**
 * Check if token is valid (not expired)
 */
export function isTokenValid(token) {
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    return payload.exp > now;
  } catch (error) {
    return false;
  }
}

/**
 * Get token from localStorage
 */
export function getStoredToken() {
  return localStorage.getItem('contextToken');
}

/**
 * Remove token from localStorage
 */
export function removeToken() {
  localStorage.removeItem('contextToken');
}
