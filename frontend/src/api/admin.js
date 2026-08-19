import { protectedRequest } from '../lib/protectedRequest.js';

/**
 * Admin.
 *
 * `getPendingCharities` is new — the backend has since shipped
 * `GET /admin/charities/pending` (`admin.route.ts` /
 * `admin.controller.ts`: `getPendingCharities`), which didn't exist
 * when this file only had `verifyCharity`. `API_DOCUMENTATION.md`
 * hasn't caught up yet, but the route is real and admin-gated the
 * same way `verifyCharity` is. See `lib/mockCharities.js` for how the
 * two are combined now that this exists (a "decided" — approved or
 * rejected — history still isn't backed by any endpoint, so that part
 * stays local-only).
 *
 * `verifyCharity` — the one already-real, already-documented admin
 * endpoint: approve a pending charity's verification. Admin-gated on
 * the backend via `authorizePermissions("admin")`. NOTE: the backend
 * route has no param validation on `:userId` — passing anything that
 * isn't a real Mongo ObjectId (like the old hardcoded mock ids this
 * app used to send) throws an uncaught Mongoose CastError there and
 * surfaces as a generic 500, not a clean 4xx. Real ids from
 * `getPendingCharities` avoid that; don't reintroduce a hand-typed id
 * here.
 *
 * There is still no documented/real endpoint for rejecting a charity
 * — see `lib/mockCharities.js`.
 */
export function getPendingCharities() {
  return protectedRequest('/admin/charities/pending');
}

export function verifyCharity(userId) {
  return protectedRequest(`/admin/charities/${userId}/verify`, { method: 'PATCH' });
}
