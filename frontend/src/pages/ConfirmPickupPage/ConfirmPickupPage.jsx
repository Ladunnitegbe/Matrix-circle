import { useCallback, useEffect, useRef, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx';
import AppNav from '../../components/AppNav/AppNav.jsx';
import Button from '../../components/Button/Button.jsx';
import Loading from '../../components/Loading/Loading.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import ErrorState from '../../components/ErrorState/ErrorState.jsx';
import { ForkKnifeIcon } from '../../components/Icon/Icon.jsx';
import { getVendorMe, getVendorListings } from '../../api/vendors.js';
import { confirmPickup } from '../../api/listings.js';
import { getAccount } from '../../lib/authStorage.js';
import { trackEvent } from '../../lib/analytics.js';
import { ApiError } from '../../lib/apiClient.js';
import { useToast } from '../../components/Toast/ToastProvider.jsx';

/**
 * Confirm Pickup — matches `confirm_pickup_-_vendor_-_desktop.png`: a
 * responsive grid of "Pending" cards (Claimed by / Claimed at / live
 * "Hold expires in" countdown / Confirm Pickup button), plus the same
 * business-name header used on the Dashboard.
 *
 * REBUILT ON REAL DATA — nothing here is mocked anymore. The previous
 * version ran on local mock state because, at the time, there was no
 * way to know which listings had a pending claim, and no working
 * confirm-pickup endpoint. Both now exist:
 *   - `GET /vendors/listings` (already used by the Dashboard) returns
 *     ALL of this vendor's listings, any state, with `claims`
 *     (plural — populated on `claims.claimedBy`) — filtered here to
 *     `state === 'claimed'` for the pending queue.
 *   - `PATCH /listings/:id/confirm-pickup` (also already wired for
 *     the Dashboard's "Mark Picked Up") is the same real call used
 *     here.
 *
 * THREE BUGS FOUND AND FIXED HERE, all the same root cause as
 * DashboardPage's: this file assumed a singular `claim` field that
 * the real API never returns — only `claims`, a plural array (a
 * listing can be claimed, lapse, and get re-claimed).
 *   1. The pending-queue filter was `l.state === 'claimed' && l.claim`
 *      — `l.claim` is always `undefined`, so this filtered OUT every
 *      single listing, always, regardless of real pending claims.
 *      "Nothing showing in Confirm Pickup" traces directly to this
 *      line, not a rendering issue. Now derives
 *      `l.claims?.find((c) => c.status === 'pending')` per listing
 *      and keeps only listings where that's found.
 *   2. `PendingCard` read `listing.claim.holdExpiresAt` /
 *      `.claimantType` / `.claimedAt` — all would have thrown
 *      (`Cannot read properties of undefined`) the moment a listing
 *      actually reached this component, once bug #1 stopped silently
 *      hiding everything. Each listing passed to `PendingCard` now
 *      carries its derived `pendingClaim` object instead.
 *   3. `handleConfirm` called `confirmPickup(listing._id)` with no
 *      claimant id — the backend (`claim.validation.ts`:
 *      `confirmPickupBodySchema`) requires `claimantUserId` in the
 *      body. Now pulls `pendingClaim.claimedBy._id` (populated by
 *      `getVendorListings`, same as Dashboard) and sends it.
 *
 * "Claimed by" shows the claimant type (Individual/Charity) — from
 * `claim.claimantType`, which the backend sets to the claimant's
 * `accountType` at claim time. This matches the Figma literally: both
 * Pending cards in the design show a type, not a claimant's name
 * (unlike the Dashboard's listing rows, which do show a name where
 * one's available).
 *
 * "Hold expires in" is a real, independently-ticking countdown driven
 * by `claim.holdExpiresAt` — claims hold for a real 15 minutes
 * (`claim.service.ts`: `HOLD_DURATION_MS`), not a static mock value.
 * When a card's countdown reaches 0, its button disables locally AND
 * the list is silently refetched once — a background job on the
 * backend (`expireListings.job.ts`) is what actually flips an expired
 * hold's state server-side, so this just re-syncs the UI to that
 * rather than trusting the client-side countdown as ground truth.
 *
 * Analytics: `confirm_pickup_viewed` fires once per successful load
 * (same fire-in-the-load-function placement as `dashboard_viewed`),
 * with the pending count shown on screen. Confirming a pickup fires
 * `picked_up_confirmed` — the SAME event name the Dashboard's "Mark
 * Picked Up" button fires, since both trigger the literal same
 * backend action (`PATCH /listings/:id/confirm-pickup`); the
 * `source: 'confirm_pickup_page'` property (vs. `'dashboard'` there)
 * is what tells the two entry points apart. The previous placeholder
 * `claim_id` property has been dropped entirely — a claim is embedded
 * directly on the listing document here, not a separate record with
 * its own id, so there was never a real value to put there.
 * `listing_id` identifies the event on its own. Neither event is part
 * of the original Event Tracking Plan — same extension caveat already
 * noted on the Dashboard, Admin, and Landing pages' analytics.
 */
function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function secondsUntil(dateStr) {
  return Math.max(0, Math.round((new Date(dateStr).getTime() - Date.now()) / 1000));
}

function formatCountdown(totalSeconds) {
  const clamped = Math.max(0, totalSeconds);
  const mm = String(Math.floor(clamped / 60)).padStart(2, '0');
  const ss = String(clamped % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

const CLAIMANT_LABEL = { individual: 'Individual', charity: 'Charity' };

function PendingCard({ listing, confirming, onConfirm, onExpire }) {
  const { pendingClaim } = listing;
  const [secondsLeft, setSecondsLeft] = useState(() => secondsUntil(pendingClaim.holdExpiresAt));
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (!hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onExpire();
      }
      return undefined;
    }
    const interval = setInterval(() => setSecondsLeft(secondsUntil(pendingClaim.holdExpiresAt)), 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="bg-accent-green px-4 py-3 text-center text-body1 font-bold text-white">Pending</div>
      <div className="bg-secondary-light px-4 py-3">
        <div className="flex items-center justify-between border-b border-border py-2.5">
          <span className="text-body2 font-bold text-ink">Claimed by</span>
          <span className="text-body2 text-ink-muted">
            {CLAIMANT_LABEL[pendingClaim.claimantType] || pendingClaim.claimantType}
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-border py-2.5">
          <span className="text-body2 font-bold text-ink">Claimed at</span>
          <span className="text-body2 text-ink-muted">{formatTime(pendingClaim.claimedAt)}</span>
        </div>
        <div className="flex items-center justify-between py-2.5">
          <span className="text-body2 font-bold text-ink">Hold expires in</span>
          <span className="text-body2 font-semibold text-ink">{formatCountdown(secondsLeft)}</span>
        </div>
      </div>
      <div className="bg-primary-light p-4">
        <Button
          color="accent"
          variant="solid"
          fullWidth
          loading={confirming}
          disabled={secondsLeft <= 0 || confirming}
          onClick={() => onConfirm(listing)}
        >
          Confirm Pickup
        </Button>
      </div>
    </div>
  );
}

export default function ConfirmPickupPage() {
  const { showToast } = useToast();
  const account = getAccount();
  const [phase, setPhase] = useState('loading'); // loading | error | success
  const [businessName, setBusinessName] = useState('');
  const [pending, setPending] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);

  const load = useCallback(async () => {
    setPhase('loading');
    setErrorMessage('');
    try {
      const [vendorData, listingsData] = await Promise.all([getVendorMe(), getVendorListings()]);
      const stillPending = listingsData.listings
        .map((l) => ({ ...l, pendingClaim: l.claims?.find((c) => c.status === 'pending') }))
        .filter((l) => l.state === 'claimed' && l.pendingClaim);
      setBusinessName(vendorData.vendor.businessName);
      setPending(stillPending);
      setPhase('success');
      trackEvent('confirm_pickup_viewed', { vendor_id: account?.id, pending_count: stillPending.length });
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.msg : err.message);
      setPhase('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleConfirm(listing) {
    setConfirmingId(listing._id);
    try {
      await confirmPickup(listing._id, listing.pendingClaim.claimedBy?._id);
      trackEvent('picked_up_confirmed', { vendor_id: account?.id, listing_id: listing._id, source: 'confirm_pickup_page' });
      setPending((prev) => prev.filter((l) => l._id !== listing._id));
      showToast({ tone: 'success', message: `${listing.itemDescription} confirmed as picked up.` });
    } catch (err) {
      showToast({
        tone: 'error',
        message: err instanceof ApiError ? err.msg : 'Could not confirm pickup. Please try again.',
      });
    } finally {
      setConfirmingId(null);
    }
  }

  return (
    <DashboardLayout renderSidebar={(onClose) => <AppNav onCloseMobile={onClose} />}>
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-h4 font-bold text-ink">Confirm Pickup</h1>
          {phase === 'success' && businessName && (
            <span className="flex items-center gap-2 text-body1 font-semibold text-ink">
              <span className="h-2.5 w-2.5 rounded-full bg-accent-green" aria-hidden="true" />
              {businessName}
            </span>
          )}
        </div>

        <div className="mt-4">
          {phase === 'loading' && (
            <Loading title="Loading pending pickups…" description="Fetching claimed listings awaiting confirmation" />
          )}

          {phase === 'error' && (
            <ErrorState title="Connection Interrupted" description={errorMessage} actionLabel="Try Again" onAction={load} />
          )}

          {phase === 'success' && pending.length === 0 && (
            <EmptyState
              icon={<ForkKnifeIcon />}
              title="Nothing Awaiting Pickup"
              description="Claimed listings that are waiting for pickup confirmation will show up here."
            />
          )}

          {phase === 'success' && pending.length > 0 && (
            <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2">
              {pending.map((listing) => (
                <PendingCard
                  key={listing._id}
                  listing={listing}
                  confirming={confirmingId === listing._id}
                  onConfirm={handleConfirm}
                  onExpire={load}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
