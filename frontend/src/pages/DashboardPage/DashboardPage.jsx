import { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx';
import AppNav from '../../components/AppNav/AppNav.jsx';
import Card from '../../components/Card/Card.jsx';
import Badge from '../../components/Badge/Badge.jsx';
import Loading from '../../components/Loading/Loading.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import ErrorState from '../../components/ErrorState/ErrorState.jsx';
import { ForkKnifeIcon, ClockIcon } from '../../components/Icon/Icon.jsx';
import { getVendorMe } from '../../api/vendors.js';
import { getListings } from '../../api/listings.js';
import { getCurrentPosition } from '../../lib/geolocation.js';
import { ApiError } from '../../lib/apiClient.js';

/**
 * Vendor Dashboard — matches `dashboard_-_vendor_-_desktop.png` only
 * in *chrome* (same sidebar, same page shell). The content of that
 * Figma frame itself is identical, pixel for pixel, to
 * `discover_food_-_recipient_-_desktop.png` — same "Browse nearby
 * food" heading, same category chips, same claimable listing cards —
 * with only the sidebar's highlighted item differing. That's not a
 * real dashboard design, it's the same frame duplicated with a
 * different nav state, so it isn't followed literally here. A vendor
 * dashboard showing generic claimable listings (with a "Claim"
 * button, on their own inventory) wouldn't make sense anyway.
 *
 * What's built instead: a real, API-backed "your active listings"
 * view. There is no documented "my listings" or dashboard-stats
 * endpoint (`GET /vendors/:id/dashboard` is explicitly "Not Yet
 * Available"), so this combines two endpoints that *do* exist:
 *   1. `GET /vendors/me` → this vendor's own `_id`
 *   2. `GET /listings` (proximity-based, the only listings-read
 *      endpoint available) → filtered client-side to
 *      `listing.vendorId === vendor._id`
 *
 * LIMITATION, stated plainly: `GET /listings` is a location-radius
 * query, not "all listings for this vendor" — it only returns
 * listings within `maxDistanceKm` of the coordinates passed in. Using
 * the vendor's current device location with a generous 50km radius
 * covers the realistic case (checking the dashboard from the same
 * business location a listing was posted from), but a listing posted
 * from elsewhere, or checked from far away, could be missed. This
 * isn't a bug to silently work around — it's a real gap that only a
 * dedicated backend endpoint can close properly.
 *
 * Also missing for the same reason: claimed-vs-discarded history.
 * `GET /listings` only ever returns `state: "active"` listings, so
 * there's no data source yet for anything that's been claimed,
 * picked up, or expired — the stats below only count what's
 * currently live.
 */
function minutesUntil(pickupByTime) {
  const diffMs = new Date(pickupByTime).getTime() - Date.now();
  return Math.max(0, Math.round(diffMs / 60000));
}

export default function DashboardPage() {
  const [phase, setPhase] = useState('loading'); // loading | empty | error | success
  const [listings, setListings] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async () => {
    setPhase('loading');
    setErrorMessage('');
    try {
      const [vendorData, coords] = await Promise.all([getVendorMe(), getCurrentPosition()]);
      const vendorId = vendorData.vendor._id;

      const listingsData = await getListings({ lat: coords.lat, lng: coords.lng, maxDistanceKm: 50 });
      const mine = listingsData.listings.filter((l) => l.vendorId === vendorId);

      setListings(mine);
      setPhase(mine.length === 0 ? 'empty' : 'success');
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.msg : err.message);
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalPortions = listings.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <DashboardLayout renderSidebar={(onClose) => <AppNav onCloseMobile={onClose} />}>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-h4 font-bold text-ink">Dashboard</h1>
        <p className="mt-1 text-body2 text-ink-muted">
          Your currently active listings. Claimed/discarded history isn't available yet — the backend endpoint
          for it hasn't shipped.
        </p>

        {phase === 'success' && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Card padding="md">
              <p className="text-h4 font-bold text-accent-green">{listings.length}</p>
              <p className="text-caption font-semibold text-ink-faint">Active listings</p>
            </Card>
            <Card padding="md">
              <p className="text-h4 font-bold text-accent-orange">{totalPortions}</p>
              <p className="text-caption font-semibold text-ink-faint">Portions available</p>
            </Card>
          </div>
        )}

        <div className="mt-4">
          {phase === 'loading' && <Loading title="Loading your vendor dashboard…" description="Fetching your active listings" />}

          {phase === 'error' && (
            <ErrorState title="Connection Interrupted" description={errorMessage} actionLabel="Try Again" onAction={load} />
          )}

          {phase === 'empty' && (
            <EmptyState
              icon={<ForkKnifeIcon />}
              title="No Active Listings"
              description="You don't have any surplus food listed right now. Share some to see it here."
              actionLabel="Share Surplus Food"
              onAction={() => (window.location.href = '/create-listing')}
            />
          )}

          {phase === 'success' && (
            <div className="flex flex-col gap-4">
              {listings.map((listing) => {
                const minutesLeft = minutesUntil(listing.pickupByTime);
                return (
                  <Card key={listing._id} padding="md">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-accent-green-light">
                        <ForkKnifeIcon />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sh2 font-bold text-ink">{listing.itemDescription}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge tone="neutral">{listing.price === 'free' ? 'Free' : `₦${listing.price}`}</Badge>
                          <Badge tone="secondary">{listing.category.replace('_', ' ')}</Badge>
                          <Badge tone="accent">Live</Badge>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-sh2 font-bold text-ink">{listing.quantity}</p>
                        <p className="text-caption text-ink-faint">portions</p>
                      </div>
                    </div>
                    <p className="mt-3 flex items-center gap-1 text-caption text-ink-faint">
                      <ClockIcon /> {minutesLeft}m until pickup-by time
                    </p>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
