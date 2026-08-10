import { protectedRequest } from '../lib/protectedRequest.js';

/**
 * Admin — the one real, documented admin endpoint (API_DOCUMENTATION.md
 * → "Admin routes"): approve a pending charity's verification.
 * Admin-gated on the backend via `authorizePermissions("admin")`.
 *
 * There is no documented endpoint yet for:
 *   - listing charities pending review (no `GET /admin/charities`)
 *   - rejecting a charity (no `PATCH /admin/charities/:userId/reject`
 *     or equivalent)
 * Both of those are still served from `lib/mockCharities.js` on the
 * frontend — see that file for details. Only `verifyCharity` below
 * talks to the real backend.
 */
export function verifyCharity(userId) {
  return protectedRequest(`/admin/charities/${userId}/verify`, { method: 'PATCH' });
}
