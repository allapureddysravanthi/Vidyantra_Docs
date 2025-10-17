// Debug utility for authentication issues
// This can be called from browser console to debug auth problems

export function debugAuth() {
  console.log('=== AUTH DEBUG INFO ===');
  
  // Check cookies
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    acc[name] = value;
    return acc;
  }, {});
  
  console.log('Cookies:', cookies);
  
  // Check localStorage
  const contextToken = localStorage.getItem('contextToken');
  console.log('localStorage contextToken:', contextToken ? 'Present' : 'Not found');
  
  // Check token validity
  if (contextToken) {
    try {
      const payload = JSON.parse(atob(contextToken.split('.')[1]));
      const now = Date.now() / 1000;
      const isExpired = payload.exp <= now;
      
      console.log('Token payload:', payload);
      console.log('Token expires at:', new Date(payload.exp * 1000));
      console.log('Current time:', new Date(now * 1000));
      console.log('Token is expired:', isExpired);
    } catch (error) {
      console.error('Token decode error:', error);
    }
  }
  
  // Check API base URL
  try {
    const { config } = require('../config/environment');
    console.log('API Base URL:', config.API_BASE_URL);
  } catch (error) {
    console.error('Could not load config:', error);
  }
  
  console.log('=== END AUTH DEBUG ===');
}

// Make it available globally for console debugging
if (typeof window !== 'undefined') {
  window.debugAuth = debugAuth;
}
