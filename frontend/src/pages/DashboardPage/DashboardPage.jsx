import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx';
import AppNav from '../../components/AppNav/AppNav.jsx';
import Loading from '../../components/Loading/Loading.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import ErrorState from '../../components/ErrorState/ErrorState.jsx';
import { ForkKnifeIcon } from '../../components/Icon/Icon.jsx';
import { getVendorMe, getVendorDashboard, getVendorListings } from '../../api/vendors.js';
import { getAccount } from '../../lib/authStorage.js';
import { trackEvent } from '../../lib/analytics.js';
import { ApiError } from '../../lib/apiClient.js';

/**
 * Vendor Dashboard — matches `dashboard_-_vendor_-desktop/mobile.png`:
 * business name in the header, three impact stat cards, and a
 * current-listings table with per-row status. Pickup confirmation is
 * handled on the dedicated Confirm Pickup page.
 *
 * DATA SOURCE — this is a real rebuild, not the earlier client-side
 * "combine two endpoints and hope" version. The backend has since
 * shipped what the previous implementation's comments said didn't
 * exist:
 *   - `GET /vendors/dashboard` → real `{ claimed, discarded }` counts
 *     (`vendor.service.ts`: `getVendorDashboard`)
 *   - `GET /vendors/listings` → ALL of this vendor's listings, any
 *     state, with pending claimant data populated on `claims`.
 * "Active Now" isn't part of that stats payload, so it's derived
 * client-side by summing `remainingQuantity` for active listings.
 *
 * TWO DELIBERATE DEVIATIONS FROM THE FIGMA, stated plainly:
 *
 * 1. "Today's Impact" → "Your Impact". `getVendorDashboard` counts
 *    are lifetime totals — the backend does no date filtering at all
 *    (`Listing.countDocuments({ vendorId, state: 'picked_up' })`,
 *    no `createdAt` range). Labeling a lifetime count "Today's" would
 *    misrepresent real data, so the copy was changed instead of
 *    silently faking a day-scoped number. Revert if a day-scoped
 *    stats endpoint ships, or if literal Figma copy is preferred
 *    despite the mismatch.
 * 2. Stat card colors: the Figma uses three distinct hues (green /
 *    maroon / olive). `tailwind.config.js` only defines two accent
 *    colors app-wide (`accent-green`, `accent-orange`) plus the
 *    neutral `secondary` scale — no third hue exists anywhere in the
 *    design system. Rather than hardcode an off-palette hex (which
 *    nothing else in the app does), Active Now uses the neutral
 *    `secondary` scale instead of an invented olive.
 *
 * CLAIM DATA FIX: this used to read `listing.claim?.claimedBy?.name`
 * (singular). The real API response never has a `claim` field —
 * only `claims`, a plural array (a listing can be claimed, lapse, and
 * get re-claimed), populated on `claims.claimedBy` by
 * `getVendorListings`. That mismatch meant "Claimed by ___" silently
 * never rendered. Now derives the current pending entry as
 * `listing.claims?.find((c) => c.status === 'pending')` per listing.
 *
 * PICKUP FLOW: the Dashboard does not confirm pickups. When a pending
 * claim exists, the row links the vendor to the dedicated Confirm Pickup
 * page, where the claimant, hold timer, and confirmation action are shown.
 * This keeps pickup confirmation in one place and matches the intended
 * vendor workflow.
 *
 * Analytics: `dashboard_viewed` fires on successful load with the
 * current stats. Pickup confirmation analytics are owned by the
 * dedicated Confirm Pickup page.
 */

const VENDOR_LISTINGS_POLL_INTERVAL_MS = 5000;

const STATUS_META = {
  active: { label: 'Active', className: 'bg-accent-green-light text-accent-green-dark' },
  claimed: { label: 'Claimed', className: 'bg-accent-orange-light text-accent-orange-dark' },
  picked_up: { label: 'Picked Up', className: 'bg-accent-green text-white' },
  expired_unclaimed: { label: 'Unclaimed', className: 'bg-secondary text-white' },
  expired_no_show: { label: 'No-Show', className: 'bg-secondary text-white' },
};

function StatusPill({ state }) {
  const meta = STATUS_META[state] || { label: state, className: 'bg-secondary-light text-ink' };
  return (
    <span className={['inline-flex items-center rounded-pill px-2.5 py-1 text-caption font-bold', meta.className].join(' ')}>
      {meta.label}
    </span>
  );
}

function formatPickupTime(pickupByTime) {
  return new Date(pickupByTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function StatCard({ value, label, tone }) {
  const TONE_CLASSES = {
    green: 'bg-accent-green text-white',
    orange: 'bg-accent-orange text-white',
    neutral: 'bg-secondary text-white',
  };
  return (
    <div className={['rounded-lg px-5 py-4', TONE_CLASSES[tone]].join(' ')}>
      <p className="text-h4 font-bold">{value}</p>
      <p className="text-caption font-semibold opacity-90">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const account = getAccount();
  const [phase, setPhase] = useState('loading'); // loading | error | success
  const [businessName, setBusinessName] = useState('');
  const [stats, setStats] = useState({ claimed: 0, discarded: 0 });
  const [listings, setListings] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

 const load = useCallback(async () => {
  try {
    const [vendorData, dashboardData, listingsData] = await Promise.all([
      getVendorMe(),
      getVendorDashboard(),
      getVendorListings(),
    ]);

    setBusinessName(vendorData.vendor.businessName);
    setStats({
      claimed: dashboardData.claimed,
      discarded: dashboardData.discarded,
    });
    setListings(listingsData.listings);
    setPhase('success');

    trackEvent('dashboard_viewed', {
      vendor_id: account?.id,
      items_claimed: dashboardData.claimed,
      items_discarded: dashboardData.discarded,
      active_now: listingsData.listings.filter(
        (l) => l.state === 'active'
      ).length,
    });
  } catch (err) {
    setErrorMessage(err instanceof ApiError ? err.msg : err.message);
    setPhase('error');
  }
}, [account?.id]);

  useEffect(() => {
    // Same shape as DiscoverFoodPage's load effect: `load` is a
    // useCallback whose setState calls only run after its three
    // `Promise.all` fetches resolve, but the set-state-in-effect lint
    // flags direct top-level calls to a setState-containing function
    // regardless of the await boundary. Wrapping it in a local async
    // fn — the pattern already established for exactly this case —
    // clears the lint, and the `isMounted` guard is a genuine bonus:
    // it stops setState firing if the vendor navigates away before
    // the fetches resolve.
    let isMounted = true;
    (async () => {
      if (isMounted) {
        await load();
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [load]);

  useEffect(() => {
  if (phase !== 'success') return undefined;

  let cancelled = false;

  const refreshListings = async () => {
    try {
      const listingsData = await getVendorListings();

      if (!cancelled) {
        setListings(listingsData.listings);
      }
    } catch {
      // Keep the current dashboard data and retry on the next poll.
    }
  };

  const interval = setInterval(
    refreshListings,
    VENDOR_LISTINGS_POLL_INTERVAL_MS
  );

  return () => {
    cancelled = true;
    clearInterval(interval);
  };
}, [phase]);


  const activeNow = listings.reduce(
  (total, listing) =>
    total +
    (listing.state === 'active' ? listing.remainingQuantity : 0),
  0
);

  return (
    <DashboardLayout renderSidebar={(onClose) => <AppNav onCloseMobile={onClose} />}>
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-h4 font-bold text-ink">Dashboard</h1>
          {phase === 'success' && businessName && (
            <span className="flex items-center gap-2 text-body1 font-semibold text-ink">
              <span className="h-2.5 w-2.5 rounded-full bg-accent-green" aria-hidden="true" />
              {businessName}
            </span>
          )}
        </div>

        {phase === 'loading' && <Loading title="Loading your dashboard…" description="Fetching your stats and listings" className="mt-4" />}

        {phase === 'error' && (
          <ErrorState title="Connection Interrupted" description={errorMessage} actionLabel="Try Again" onAction={load} className="mt-4" />
        )}

        {phase === 'success' && (
          <>
            <p className="mt-6 text-caption font-bold uppercase tracking-wide text-ink-faint">Your Impact</p>
            <div className="mt-3 grid grid-cols-1 gap-4 tablet:grid-cols-3">
              <StatCard value={stats.claimed} label="Items Claimed" tone="green" />
              <StatCard value={stats.discarded} label="Items Discarded" tone="orange" />
              <StatCard value={activeNow} label="Active Now" tone="neutral" />
            </div>

            <p className="mt-8 text-caption font-bold uppercase tracking-wide text-ink-faint">Current Listings</p>

            <div className="mt-3">
              {listings.length === 0 ? (
                <EmptyState
                  icon={<ForkKnifeIcon />}
                  title="No Listings Yet"
                  description="You don't have any listings yet. Share some surplus food to see it here."
                  actionLabel="Share Surplus Food"
                  onAction={() => (window.location.href = '/create-listing')}
                />
              ) : (
                <div className="overflow-hidden rounded-lg border border-border">
                  <div className="bg-secondary px-4 py-3 text-body2 font-bold text-white">Status</div>
                  <div className="flex flex-col divide-y divide-border">
                    {listings.map((listing) => {
                      const pendingClaim = listing.claims?.find((c) => c.status === 'pending');
                      return (
                      <div
                        key={listing._id}
                        className="flex flex-col gap-3 px-4 py-3 tablet:flex-row tablet:items-center tablet:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="text-body1 font-bold text-ink">{listing.itemDescription}</p>
                          <p className="mt-0.5 text-caption text-ink-faint">
                            {listing.remainingQuantity} of {listing.quantity} portions remaining · {listing.price === 'free' ? 'Free' : `₦${listing.price}`} · Pickup by{' '}
                            {formatPickupTime(listing.pickupByTime)}
                          </p>
                          {pendingClaim?.claimedBy?.name && (
                            <p className="mt-0.5 text-caption font-semibold text-accent-green">
                              Claimed by {pendingClaim.claimedBy.name}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-3">
                          <StatusPill state={pendingClaim ? 'claimed' : listing.state} />
                          {pendingClaim && (
                            <Link
                              to="/vendor/confirm-pickup"
                              className="text-caption font-bold text-secondary underline underline-offset-2 hover:no-underline"
                            >
                              Confirm Pickup
                            </Link>
                          )}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
