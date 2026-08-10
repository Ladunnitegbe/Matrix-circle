/**
 * mockCharities — local, in-memory store standing in for the parts of
 * charity verification the backend doesn't cover yet.
 *
 * IMPORTANT — this is narrower than it might look. The backend DOES
 * have a real, documented, working endpoint for approval:
 *   PATCH /api/admin/charities/:userId/verify
 * (see `admin.route.ts` / `admin.controller.ts` / `admin.service.ts`
 * on the backend, and "Admin routes" in API_DOCUMENTATION.md). That
 * endpoint is called for real — see `api/admin.js` and how
 * `AdminCharityDetailPage` uses it.
 *
 * What's still genuinely missing from the backend, and therefore
 * still mocked here:
 *   - listing charities pending review — there's no `GET` endpoint
 *     for this at all (`user.route.ts` only exposes `/me` and
 *     `/me/location`)
 *   - rejecting a charity — no reject/decline endpoint exists
 *
 * So this store only owns: the charity list itself, and the
 * `reject` mutation. `markApproved` exists so the UI can reflect a
 * *successful* real API call locally (there's no GET to re-fetch
 * from) — it does not itself call the network.
 *
 * Caveat worth keeping in mind while this is still mock data: these
 * ids ('grace-foundation', etc.) are not real Mongo `_id`s, so a real
 * `verifyCharity(id)` call against them will 404 against a live
 * backend. Swap this store for a real `GET /admin/charities`-backed
 * hook the moment that endpoint ships, and real ids will flow through
 * to the existing `verifyCharity` call with no changes needed there.
 *
 * Implemented as a tiny manual pub/sub (no new dependency) so the
 * Review list, Summary list, and the detail page all stay in sync
 * when an admin approves or rejects something, without prop-drilling
 * through routes.
 */
let charities = [
  { id: 'grace-foundation', name: 'Grace Foundation', regNumber: 'CAC-123456', signUpDate: 'Aug 2, 2026', status: 'pending' },
  { id: 'hope-relief-initiative', name: 'Hope relief initiative', regNumber: 'CAC-123456', signUpDate: 'Aug 4, 2026', status: 'pending' },
];

const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot() {
  return charities;
}

export function getCharity(id) {
  return charities.find((c) => c.id === id) || null;
}

/** Call after a real `verifyCharity(id)` API call succeeds — does not itself hit the network. */
export function markApproved(id) {
  charities = charities.map((c) => (c.id === id ? { ...c, status: 'approved' } : c));
  notify();
}

/** No backend endpoint exists for this yet — local-only. */
export function rejectCharity(id) {
  charities = charities.map((c) => (c.id === id ? { ...c, status: 'rejected' } : c));
  notify();
}
