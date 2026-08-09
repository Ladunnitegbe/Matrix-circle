import { protectedRequest } from '../lib/protectedRequest.js';

/**
 * Vendors — only the one documented endpoint. Nothing here calls
 * `GET /vendors/:id/dashboard` — it's explicitly listed as "Not Yet
 * Available" in the API docs.
 */
export function getVendorMe() {
  return protectedRequest('/vendors/me');
}
