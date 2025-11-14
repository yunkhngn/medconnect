/**
 * API Utility - Get API base URL
 * Uses environment variable or falls back to localhost for development
 */
export const getApiUrl = () => {
  // Use environment variable if available
  if (typeof window !== 'undefined') {
    // Client-side: use NEXT_PUBLIC_API_URL
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  }
  // Server-side: use NEXT_PUBLIC_API_URL
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
};

export const API_BASE_URL = getApiUrl();

/**
 * Get base URL without /api suffix (for endpoints like /doctor/dashboard/all)
 */
export const getBaseUrl = () => {
  const apiUrl = getApiUrl();
  return apiUrl.replace('/api', '');
};
