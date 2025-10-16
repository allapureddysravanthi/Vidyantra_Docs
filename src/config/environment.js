// Environment Configuration for Documentation Frontend

export const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_URL || 'https://dev-api.vidyantra-dev.com/api',
  
  // Authentication
  LOGIN_URL: import.meta.env.VITE_LOGIN_URL || '/signin',
  
  // Environment
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
  
  // Features
  FEATURES: {
    ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    ENABLE_FEEDBACK: import.meta.env.VITE_ENABLE_FEEDBACK !== 'false', // Default true
    ENABLE_SEARCH: import.meta.env.VITE_ENABLE_SEARCH !== 'false', // Default true
  },
  
  // TinyMCE Editor
  TINYMCE_API_KEY: import.meta.env.VITE_TINYMCE_API_KEY || 'skk0t1kv0jfoier68d1xlaehd3vlkge0ra17rmtgchresh68'
};

export default config;
