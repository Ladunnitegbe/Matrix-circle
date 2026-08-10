import { protectedRequest } from '../lib/protectedRequest.js';

/**
 * Vendors.
 *
 * `getVendorDashboard` and `getVendorListings` used to not exist —
 * the API docs still list `GET /vendors/:id/dashboard` as "Not Yet
 * Available." The backend has since shipped real equivalents
 * (`vendor.route.ts`: `GET /vendors/dashboard`, `GET
 * /vendors/listings`), even though the docs haven't caught up. Both
 * are wired for real below.
 */
export function getVendorMe() {
  return protectedRequest('/vendors/me');
}

/** Real counts, not scoped to any date range: { claimed, discarded }. */
export function getVendorDashboard() {
  return protectedRequest('/vendors/dashboard');
}

/** All of this vendor's listings, any state, newest first, with claim.claimedBy populated (name, accountType). */
export function getVendorListings() {
  return protectedRequest('/vendors/listings');
}
