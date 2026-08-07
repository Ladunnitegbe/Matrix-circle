import { apiRequest } from '../lib/apiClient.js';

/** login and register — both public /auth endpoints (no token needed). */
export function login({ email, password }) {
  return apiRequest('/auth/login', { method: 'POST', body: { email, password } });
}

export function register(payload) {
  return apiRequest('/auth/register', { method: 'POST', body: payload });
}
