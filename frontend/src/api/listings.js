import { protectedRequest } from '../lib/protectedRequest.js';

/**
 * Listings — the three documented endpoints only. Nothing here calls
 * claim/confirm-pickup/dashboard-stats, since those are explicitly
 * listed as "Not Yet Available" in the API docs.
 *
 * All three require auth, so these go through `protectedRequest`
 * (attaches the token automatically, and centrally redirects to
 * /login on a 401) rather than `apiRequest` directly — callers no
 * longer need to pass a token in at all.
 */
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
