// Documentation API Client
// Adapted for your existing design system

import { config } from '../../config/environment';
import { setAccessToken, getAccessToken, clearAuthCookies } from '../../utils/cookieUtils';

const API_BASE_URL = config.API_BASE_URL;

// ============================================================================
// AUTHENTICATION APIS
// ============================================================================

/**
 * Login user and store token in cookies
 */
export async function loginUser(credentials) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials),
    credentials: 'include' // Important for cookies
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const data = await response.json();
  
  // Extract access token from nested structure
  const accessToken = data.data?.tokens?.accessToken || data.accessToken;
  
  // Set access token in cookies explicitly
  if (accessToken) {
    setAccessToken(accessToken);
    
    // Also store in localStorage as backup
    localStorage.setItem('contextToken', accessToken);
  }
  
  return data;
}

/**
 * Logout user and clear cookies
 */
export async function logoutUser() {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.warn('Logout API call failed:', error);
  }
  
  // Clear cookies explicitly
  clearAuthCookies();
  
  // Clear localStorage backup
  localStorage.removeItem('contextToken');
}

/**
 * Get context token from cookies or localStorage
 */
function getContextToken() {
  if (typeof window === 'undefined') return null;
  
  // First try to get token from cookies
  const cookieToken = getAccessToken();
  if (cookieToken) {
    return cookieToken;
  }
  
  // Fallback to localStorage
  return localStorage.getItem('contextToken');
}

/**
 * Build headers with optional auth
 */
function buildHeaders(requireAuth = false) {
  const headers = {
    'Content-Type': 'application/json'
  };

  const token = getContextToken();
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (requireAuth) {
    console.warn('Authentication required but no token found. Making request without auth header.');
    // Don't throw error, just log warning and continue without auth
    // This allows graceful degradation for public endpoints
  }

  return headers;
}

/**
 * Make API request with automatic token handling
 */
async function apiRequest(endpoint, options = {}, requireAuth = false) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...buildHeaders(requireAuth),
        ...options.headers
      },
      credentials: 'include' // Important for CORS with cookies
    });

    if (!response.ok) {
      let errorMessage = 'API request failed';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch (parseError) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      // Log detailed error information
      console.error('API Request Failed:', {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        message: errorMessage,
        requireAuth
      });
      
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error('API Request Error:', {
      endpoint,
      error: error.message,
      requireAuth
    });
    throw error;
  }
}

// ============================================================================
// PUBLIC APIS - No token required
// ============================================================================

/**
 * Get public sidebar
 * For: docs.vidyantra-dev.com/org/* or /branch/*
 */
export async function getPublicSidebar(scope) {
  return apiRequest(`/documentation/public/documentation/sidebar?scope=${scope}`);
}

/**
 * Get public articles - All
 * For: docs.vidyantra-dev.com/org/docs or /branch/docs
 */
export async function getPublicArticles(params) {
  const queryParams = new URLSearchParams();
  queryParams.append('scope', params.scope);
  if (params.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params.type) queryParams.append('type', params.type);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  return apiRequest(`/documentation/public/documentation/articles?${queryParams.toString()}`);
}

/**
 * Get public article by slug
 * For: docs.vidyantra-dev.com/org/doc/getting-started
 */
export async function getPublicArticleBySlug(slug, scope) {
  return apiRequest(`/documentation/public/documentation/articles?slug=${slug}&scope=${scope}`);
}

/**
 * Get public article by ID
 */
export async function getPublicArticleById(id) {
  return apiRequest(`/documentation/public/documentation/articles?id=${id}`);
}

/**
 * Search public articles
 */
export async function searchPublicArticles(query, scope) {
  return apiRequest(`/documentation/public/documentation/articles?search=${encodeURIComponent(query)}&scope=${scope}`);
}

/**
 * Search platform articles (authenticated)
 * Token: REQUIRED (needs platform.documentation.view permission)
 */
export async function searchPlatformArticles(query) {
  return apiRequest(`/documentation/articles?search=${encodeURIComponent(query)}`, {}, true);
}

/**
 * Track article view (public - org/branch docs)
 */
export async function trackPublicView(articleId, data = {}) {
  return apiRequest(`/documentation/public/documentation/articles/${articleId}/view`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Submit feedback (public - org/branch docs)
 */
export async function submitPublicFeedback(articleId, data) {
  return apiRequest(`/documentation/public/documentation/articles/${articleId}/feedback`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Get related articles (public)
 */
export async function getPublicRelatedArticles(articleId) {
  return apiRequest(`/documentation/public/documentation/articles?id=${articleId}&action=related`);
}

// ============================================================================
// PLATFORM APIS - Auth behavior varies
// ============================================================================

/**
 * Get platform article by slug
 * For: docs.vidyantra-dev.com/platform/doc/authentication-guide
 * 
 * Token: REQUIRED (needs platform.documentation.view permission)
 */
export async function getPlatformArticleBySlug(slug) {
  return apiRequest(
    `/documentation/articles?slug=${slug}&scope=platform`,
    {},
    true // Require auth
  );
}

/**
 * Track platform article view
 * For: User engagement tracking
 * 
 * Token: OPTIONAL (tracks userId if present, anonymous if not)
 */
export async function trackPlatformView(articleId, data = {}) {
  return apiRequest(`/documentation/articles/${articleId}/view`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Submit feedback on platform article
 * 
 * Token: OPTIONAL
 * - If token present: tracks userId from token
 * - If no token: requires userEmail in data
 */
export async function submitPlatformFeedback(articleId, data) {
  return apiRequest(`/documentation/articles/${articleId}/feedback`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Get related articles
 * 
 * Token: OPTIONAL (accessible to all)
 */
export async function getRelatedArticles(articleId) {
  return apiRequest(`/documentation/articles/${articleId}/related`);
}

// ============================================================================
// ADMIN APIS - Token + Permissions required
// ============================================================================

/**
 * Get platform sidebar (Admin)
 * Permission: platform.documentation.view
 */
export async function getAdminSidebar() {
  return apiRequest('/documentation/sidebar', {}, true);
}

/**
 * Get platform sidebar (Public)
 * For: docs.vidyantra-dev.com/platform/*
 * Token: REQUIRED (needs platform.documentation.view permission)
 */
export async function getPlatformSidebar() {
  return apiRequest('/documentation/sidebar', {}, true);
}

/**
 * Get all categories (Admin)
 * Permission: platform.documentation.view
 */
export async function getCategories(filters = {}) {
  const params = new URLSearchParams();
  if (filters.id) params.append('id', filters.id);
  if (filters.scope) params.append('scope', filters.scope);
  if (filters.parentId) params.append('parentId', filters.parentId);
  if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());

  return apiRequest(`/documentation/categories?${params.toString()}`, {}, true);
}

/**
 * Get all articles (Admin)
 * Permission: platform.documentation.view
 */
export async function getArticles(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value.toString());
    }
  });

  return apiRequest(`/documentation/articles?${params.toString()}`, {}, true);
}

/**
 * Get single article by ID (Admin)
 * Permission: platform.documentation.view
 */
export async function getArticleById(articleId) {
  return apiRequest(`/documentation/articles?id=${articleId}`, {}, true);
}

/**
 * Create article (Admin)
 * Permission: platform.documentation.create
 */
export async function createArticle(data) {
  return apiRequest('/documentation/articles', {
    method: 'POST',
    body: JSON.stringify(data)
  }, true);
}

/**
 * Smart patch article (Admin)
 * Permission: platform.documentation.edit
 */
export async function patchArticle(articleId, data) {
  return apiRequest(`/documentation/articles/${articleId}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }, true);
}

/**
 * Delete article (Admin)
 * Permission: platform.documentation.delete
 */
export async function deleteArticle(articleId) {
  return apiRequest(`/documentation/articles/${articleId}`, {
    method: 'DELETE'
  }, true);
}

/**
 * Get all feedback for article (Admin)
 * Permission: platform.documentation.view
 */
export async function getArticleFeedback(articleId, pagination = {}) {
  const params = new URLSearchParams();
  if (pagination.page) params.append('page', pagination.page.toString());
  if (pagination.limit) params.append('limit', pagination.limit.toString());

  return apiRequest(
    `/documentation/articles/${articleId}/feedback?${params.toString()}`,
    {},
    true
  );
}

/**
 * Create category (Admin)
 * Permission: platform.documentation.create
 */
export async function createCategory(data) {
  return apiRequest('/documentation/categories', {
    method: 'POST',
    body: JSON.stringify(data)
  }, true);
}

/**
 * Delete category (Admin)
 * Permission: platform.documentation.delete
 */
export async function deleteCategory(categoryId) {
  return apiRequest(`/documentation/categories/${categoryId}`, {
    method: 'DELETE'
  }, true);
}

// ============================================================================
// S3 FILE UPLOAD APIS
// ============================================================================

/**
 * Upload file to S3
 * Permission: platform.documentation.create or platform.documentation.edit
 */
export async function uploadFileToS3(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('scope', 'platform');
  formData.append('category', 'media');
  formData.append('isPublic', 'true');
  
  const token = getContextToken();
  if (!token) {
    throw new Error('Authentication required for file upload');
  }

  console.log('Upload token:', token); // Debug log

  const response = await fetch(`${API_BASE_URL}/s3/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    },
    body: formData,
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Upload error response:', error); // Debug log
    throw new Error(error.message || 'File upload failed');
  }

  const result = await response.json();
  console.log('S3 Upload API response:', result); // Debug log
  return result;
}

/**
 * Delete file from S3
 * Permission: platform.documentation.delete
 */
export async function deleteFileFromS3(fileId) {
  return apiRequest(`/s3/files/${fileId}`, {
    method: 'DELETE'
  }, true);
}
