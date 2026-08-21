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
 * REBUILT ON REAL DATA — nothing here is mocked anymore. The page
 * reads the vendor's real listings and derives the pending queue from
 * the `claims` array returned by `GET /vendors/listings`. A listing can
 * remain `active` when it has multiple portions and only one has been
 * claimed, so the queue must be based on the existence of a `pending`
 * claim rather than `listing.state === 'claimed'`.
 *
 * `PATCH /listings/:id/confirm-pickup` is the real confirmation endpoint.
 * The claimant id is taken from `pendingClaim.claimedBy._id`, which is
 * populated by the vendor listings endpoint.
 *
 * The pending card uses the derived `pendingClaim` object for its
 * claimant type, claimed time, and real server-side hold expiration.
 * The page also polls every 5 seconds so a newly claimed listing appears
 * without requiring the vendor to refresh the page manually.
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
 * Analytics: `confirm_pickup_viewed` fires once per successful load,
 * with the pending count shown on screen. Confirming a pickup fires
 * `picked_up_confirmed` with `source: 'confirm_pickup_page'`.
 * The previous placeholder
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
const CONFIRM_PICKUP_POLL_INTERVAL_MS = 5000;

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
        .filter((l) => l.pendingClaim);
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

  useEffect(() => {
    if (phase !== 'success') return undefined;

    let cancelled = false;

    const refreshPending = async () => {
      try {
        const listingsData = await getVendorListings();
        const stillPending = listingsData.listings
          .map((l) => ({ ...l, pendingClaim: l.claims?.find((c) => c.status === 'pending') }))
          .filter((l) => l.pendingClaim);

        if (!cancelled) {
          setPending(stillPending);
        }
      } catch {
        // Keep the current queue and retry on the next polling cycle.
      }
    };

    const interval = setInterval(refreshPending, CONFIRM_PICKUP_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [phase]);

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
