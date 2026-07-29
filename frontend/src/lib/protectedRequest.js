import { apiRequest, ApiError } from './apiClient.js';
import { getToken, clearSession } from './authStorage.js';

/**
 * protectedRequest — wraps apiRequest for any endpoint that requires
 * auth: attaches the stored token automatically, and on a 401 clears
 * the session and hard-redirects to /login.
 *
 * A hard redirect (`window.location.href`) rather than router
 * navigation is deliberate here — this file has no access to React
 * Router's context (it's not a component/hook), and per the API docs
 * there's no refresh-token flow, so an expired/invalid token always
 * means "start over at login" with nothing worth preserving in memory.
 * This is the one centralized place that behavior lives, per the docs'
 * own recommendation, rather than every screen handling 401 itself.
 */
export async function protectedRequest(path, options = {}) {
  const token = getToken();
  try {
    return await apiRequest(path, { ...options, token });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      clearSession();
      window.location.href = '/login';
    }
    throw err;
  }
}
