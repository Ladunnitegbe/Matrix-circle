import { apiRequest, ApiError } from './apiClient.js';
import { getToken, clearSession } from './authStorage.js';

/**
 * protectedRequest — wraps apiRequest for any endpoint that requires
 * auth: attaches the stored token automatically, and centrally
 * redirects to /login on a 401 (per the API doc's own integration
 * checklist: "treat 401 as redirect to login globally").
 */
export async function protectedRequest(path, options = {}) {
  const token = getToken();
  try {
    return await apiRequest(path, { ...options, token });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      clearSession();
      window.location.assign('/login');
    }
    throw err;
  }
}
