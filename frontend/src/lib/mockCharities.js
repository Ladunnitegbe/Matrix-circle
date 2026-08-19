import { getPendingCharities } from '../api/admin.js';

/**
 * Charity store (filename kept as `mockCharities` to avoid touching
 * every import path in this pass — worth a rename follow-up, since
 * it's no longer accurate).
 *
 * NO LONGER HARDCODED. This used to ship two fake charities
 * ('grace-foundation', 'hope-relief-initiative') because there was no
 * `GET` endpoint to list real ones. The backend has since shipped
 * `GET /admin/charities/pending` (see `api/admin.js`) — this is what
 * actually fixed the 500 on approve: those hardcoded ids weren't real
 * Mongo `_id`s, so `verifyCharity('grace-foundation')` hit
 * `User.findOneAndUpdate({ _id: 'grace-foundation', ... })` on the
 * backend, Mongoose threw a CastError trying to cast a non-ObjectId
 * string, and that uncaught error fell through to a generic 500 —
 * not a bug in `verifyCharity` itself, just fake input reaching a
 * real endpoint. `loadPendingCharities()` below now seeds this store
 * with real ids from the real endpoint, so that stops happening.
 *
 * STILL PARTIALLY MOCKED, because the backend still doesn't support
 * these:
 *   - Rejecting a charity — no reject/decline endpoint exists at all
 *     anywhere in the backend, so `rejectCharity` is still a pure
 *     local mutation, same as before.
 *   - A "decided" (approved/rejected) history — `GET
 *     /admin/charities/pending` is scoped to pending charities only;
 *     nothing returns what's already been approved or rejected. So
 *     once a charity is approved or rejected here, it's kept in this
 *     store's local state (this session, this tab, only) so
 *     AdminSummaryPage has something to show — unlike the pending
 *     queue, which now reloads for real from the server every time,
 *     this "decided" history does NOT survive a refresh or a
 *     different admin's session.
 *
 * `loadPendingCharities()` MERGES rather than replaces: it keeps any
 * locally-decided entries from this session and only replaces the
 * 'pending' ones with what the server just returned. A charity that
 * was locally 'pending' and no longer appears in a fresh fetch is
 * inferred as approved (the only server-side action that removes a
 * charity from this query) — there's no way to tell that apart from
 * a reject using only what this endpoint returns, but a reject can
 * only ever have happened locally in this store to begin with (since
 * there's no reject endpoint), so if it's missing and wasn't rejected
 * here, approval is the only real possibility left.
 *
 * Implemented as a tiny manual pub/sub (no new dependency) so the
 * Review list, Summary list, and the detail page all stay in sync
 * when an admin approves or rejects something, without prop-drilling
 * through routes — same structure as before, just fetch-backed now.
 */
let charities = [];
let loaded = false;

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

/** Whether `loadPendingCharities` has completed at least once this session. */
export function hasLoaded() {
  return loaded;
}

/**
 * Fetches the real pending queue and merges it into the store. Throws
 * on failure rather than catching — same convention as every other
 * page's own `load()` in this app — so callers show their own
 * loading/error state instead of this file swallowing it silently.
 */
export async function loadPendingCharities() {
  const data = await getPendingCharities();

  const freshPending = data.charities.map((c) => ({
    id: c._id,
    name: c.name,
    regNumber: c.charityRegNumber || 'Not set',
    signUpDate: new Date(c.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    status: 'pending',
  }));

  const decidedLocally = charities.filter((c) => c.status !== 'pending');
  const decidedIds = new Set(decidedLocally.map((c) => c.id));

  charities = [...decidedLocally, ...freshPending.filter((c) => !decidedIds.has(c.id))];
  loaded = true;
  notify();
}

/** Call after a real `verifyCharity(id)` API call succeeds — does not itself hit the network. */
export function markApproved(id) {
  charities = charities.map((c) => (c.id === id ? { ...c, status: 'approved' } : c));
  notify();
}

/** No backend endpoint exists for this yet — local-only, this session only. */
export function rejectCharity(id) {
  charities = charities.map((c) => (c.id === id ? { ...c, status: 'rejected' } : c));
  notify();
}
