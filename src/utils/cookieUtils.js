// Cookie utility functions for authentication

/**
 * Set a cookie with proper attributes
 */
export function setCookie(name, value, options = {}) {
  const {
    maxAge = 7 * 24 * 60 * 60, // 7 days default
    path = '/',
    sameSite = 'Lax',
    secure = window.location.protocol === 'https:'
  } = options;

  let cookieString = `${name}=${value}; path=${path}; max-age=${maxAge}; SameSite=${sameSite}`;
  
  if (secure) {
    cookieString += '; Secure';
  }

  document.cookie = cookieString;
}

/**
 * Get a cookie value by name
 */
export function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
}

/**
 * Delete a cookie by name
 */
export function deleteCookie(name, path = '/') {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
}

/**
 * Set access token in cookies
 */
export function setAccessToken(token) {
  // Set multiple cookie names for compatibility
  setCookie('accessToken', token);
  setCookie('contextToken', token);
  setCookie('token', token);
}

/**
 * Get access token from cookies
 */
export function getAccessToken() {
  // Try different cookie names
  return getCookie('accessToken') || 
         getCookie('contextToken') || 
         getCookie('token');
}

/**
 * Clear all authentication cookies
 */
export function clearAuthCookies() {
  deleteCookie('accessToken');
  deleteCookie('contextToken');
  deleteCookie('token');
}
