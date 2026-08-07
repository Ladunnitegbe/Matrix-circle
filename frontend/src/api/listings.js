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
