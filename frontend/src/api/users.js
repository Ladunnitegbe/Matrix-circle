import { protectedRequest } from '../lib/protectedRequest.js';

/**
 * Users — the individual/charity equivalent of `vendors.js`'s
 * `getVendorMe`. `GET /users/me` (`user.route.ts`) returns
 * `{ user: { id, accountType, name, charityRegNumber?,
 * charityVerifiedAt?, location?, createdAt } }`. Used by ClaimFoodPage
 * to check a charity account's verification status before letting
 * them attempt a claim, and to show their name/type on the "Pending
 * verification" screen when they aren't.
 */
export function getUserMe() {
  return protectedRequest('/users/me');
}

/**
 * Real endpoint (`PATCH /api/users/me/location`, `user.route.ts`) —
 * unlike vendors (no profile-update endpoint exists at all, so
 * ProfilePage is fully read-only), individual/charity accounts have a
 * genuine, working way to set or update their location after
 * registration — registration itself never captures one for these two
 * roles (`auth.service.ts`'s `createUserProfile` call passes no
 * coordinates). Used by RecipientProfilePage.
 */
export function updateUserLocation(coordinates) {
  return protectedRequest('/users/me/location', { method: 'PATCH', body: { coordinates } });
}
