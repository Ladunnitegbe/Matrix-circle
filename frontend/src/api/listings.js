import { protectedRequest } from '../lib/protectedRequest.js';

export function getListings({ lat, lng, category, maxDistanceKm }) {
  const params = new URLSearchParams();
  params.set('lat', lat);
  params.set('lng', lng);
  if (category) params.set('category', category);
  if (maxDistanceKm) params.set('maxDistanceKm', maxDistanceKm);
  return protectedRequest(`/listings?${params.toString()}`);
}

export function getListing(id) {
  return protectedRequest(`/listings/${id}`);
}

export function createListing(payload) {
  return protectedRequest('/listings', { method: 'POST', body: payload });
}

/**
 * Real endpoint (`PATCH /api/listings/:id/claim`, mounted via
 * `claim.route.ts`) — not mocked. Only `individual` and `charity`
 * accounts are authorized server-side; an unverified charity gets a
 * 403 with a specific message the backend also uses (checked
 * proactively on the frontend via `GET /users/me` before this is even
 * callable — see ClaimFoodPage).
 */
export function claimListing(id) {
  return protectedRequest(`/listings/${id}/claim`, { method: 'PATCH' });
}

/**
 * Real endpoint (`PATCH /api/listings/:id/confirm-pickup`, mounted via
 * `claim.route.ts`) — not mocked. Used by the vendor Dashboard's
 * "Mark Picked Up" action on a claimed listing.
 *
 * `claimantUserId` is REQUIRED by the backend
 * (`claim.validation.ts`: `confirmPickupBodySchema`), not optional —
 * this used to be called with no body at all, which meant every
 * confirm-pickup attempt 400'd on Zod validation, silently on the
 * vendor's screen, with no way to actually close out a claim early.
 * Callers get this from the pending entry in that listing's `claims`
 * array (`claims.claimedBy._id` — populated by `getVendorListings`),
 * not invented client-side.
 */
export function confirmPickup(id, claimantUserId) {
  return protectedRequest(`/listings/${id}/confirm-pickup`, { method: 'PATCH', body: { claimantUserId } });
}
