import { apiRequest } from '../lib/apiClient.js';

/**
 * `login` and `register` — both `/auth` endpoints, both needed now
 * that Registration is in scope. (`login` was built alone in the
 * previous pass since Registration hadn't been approved yet.)
 */
export function login({ email, password }) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function register(payload) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: payload,
  });
}
