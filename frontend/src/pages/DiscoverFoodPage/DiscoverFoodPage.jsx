import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx';
import AppNav from '../../components/AppNav/AppNav.jsx';
import Chip from '../../components/Chip/Chip.jsx';
import Card from '../../components/Card/Card.jsx';
import Pill from '../../components/Pill/Pill.jsx';
import Loading from '../../components/Loading/Loading.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import ErrorState from '../../components/ErrorState/ErrorState.jsx';
import { ForkKnifeIcon } from '../../components/Icon/Icon.jsx';
import { getListings } from '../../api/listings.js';
import { getCurrentPosition, distanceMeters } from '../../lib/geolocation.js';
import { getAccount } from '../../lib/authStorage.js';
import { ApiError } from '../../lib/apiClient.js';
import { trackEvent } from '../../lib/analytics.js';

/**
 * Discover Food — the listings page. Matches
 * `discover_food_-_recipient_-_desktop.png` / `-mobile.png`: category
 * chips, then a list of listing cards, inside the sidebar shell
 * (`AppNav` highlights "Discovery Feed").
 *
 * CARD LAYOUT — rebuilt to match the Figma card precisely: a small
 * icon square on the left, title + one subtitle line, then two dark
 * pills (distance, time left) underneath. No separate category badge
 * — the Figma doesn't show one on the card itself (the filter chips
 * above already cover that).
 *
 * ONE REMAINING, DELIBERATE GAP: the Figma subtitle line reads
 * "Jane's Kitchen · Free · 6 portions" — a vendor business name.
 * `GET /listings` (`listing.service.ts: getFeed`) does a plain
 * `Listing.find(...)`, no `.populate('vendorId')`, so `vendorId` is
 * just a raw id with no name attached — there's still no documented
 * endpoint that resolves it. The subtitle here shows "Free · 6
 * portions" (real fields only) instead of fabricating a business
 * name.
 *
 * The "0.4km" pill IS real now, though, not a gap — `distanceMeters`
 * was already being computed from the user's captured coordinates for
 * the `listing_viewed` analytics event below; it just wasn't being
 * shown on the card. Now it's the same real number in both places.
 *
 * Firebase/GA tracking (from the Event Tracking Plan):
 *   - `filter_applied` fires the instant a category chip is tapped.
 *   - `listing_viewed` fires once per listing, only after it has been
 *     continuously visible in the viewport for 5 seconds (via
 *     IntersectionObserver + a per-card timer) — matching the plan's
 *     "appears on screen for at least 5 secs" condition exactly,
 *     rather than firing on every render or on mere presence in the
 *     DOM. `distance_m` is a real haversine distance computed from the
 *     user's captured coordinates and the listing's own coordinates —
 *     not invented, since the API doesn't provide a precomputed one.
 *   - `listing_clicked` is new: fires when a card is actually clicked
 *     through to (navigation intent), as distinct from the passive,
 *     dwell-based `listing_viewed`. Neither the previous version of
 *     this page nor the documented plan (as far as it's visible in
 *     this repo) had a click-through event at all — Claim/Confirm
 *     only track the claim action itself, not the click that got a
 *     shopper there. Added as a reasonable extension, same properties
 *     as `listing_viewed` for easy funnel comparison between the two.
 *
 * Polling: the API docs say there's no push/websocket update and to
 * poll on an interval — implemented at 45s, the middle of the
 * documented 30–60s range.
 */
const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'cooked_meal', label: 'Cooked' },
  { value: 'baked_goods', label: 'Baked' },
  { value: 'raw_produce', label: 'Raw' },
  { value: 'free_donation', label: 'Free' },
];

const POLL_INTERVAL_MS = 45000;
const VIEW_TRACK_DELAY_MS = 5000;

function minutesUntil(pickupByTime) {
  const diffMs = new Date(pickupByTime).getTime() - Date.now();
  return Math.max(0, Math.round(diffMs / 60000));
}

function formatDistance(meters) {
  if (meters == null) return null;
  return meters < 1000 ? `${Math.round(meters)}m` : `${(meters / 1000).toFixed(1)}km`;
}

export default function DiscoverFoodPage() {
  const [category, setCategory] = useState('');
  const [phase, setPhase] = useState('loading'); // loading | empty | error | success
  const [listings, setListings] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const account = getAccount();
  const [userCoords, setUserCoords] = useState(null);
  const viewTrackingRef = useRef(new Map()); // listingId -> { observer, timer, fired }

  const loadListings = useCallback(async (activeCategory) => {
    setPhase('loading');
    setErrorMessage('');
    try {
      const coords = await getCurrentPosition();
      setUserCoords(coords);
      const data = await getListings({ lat: coords.lat, lng: coords.lng, category: activeCategory || undefined });
      setListings(data.listings);
      setPhase(data.listings.length === 0 ? 'empty' : 'success');
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.msg : err.message);
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (isMounted) {
        await loadListings(category);
      }
    };
    load();
    const interval = setInterval(() => {
      if (isMounted) {
        loadListings(category);
      }
    }, POLL_INTERVAL_MS);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [category, loadListings]);

  // Clean up any in-flight observers/timers on unmount or when the
  // underlying listing set changes (new poll cycle, new filter).
  useEffect(() => {
    const map = viewTrackingRef.current;
    return () => {
      map.forEach(({ observer, timer }) => {
        observer.disconnect();
        if (timer) clearTimeout(timer);
      });
      map.clear();
    };
  }, [listings]);

  function handleFilterChange(value) {
    setCategory(value);
    trackEvent('filter_applied', { user_id: account?.id, category: value || 'all' });
  }

  function listingDistanceMeters(listing) {
    if (!userCoords) return null;
    const listingCoords = { lat: listing.location.coordinates[1], lng: listing.location.coordinates[0] };
    return distanceMeters(userCoords, listingCoords);
  }

  function handleListingClick(listing, index) {
    trackEvent('listing_clicked', {
      user_id: account?.id,
      listing_id: listing._id,
      distance_m: listingDistanceMeters(listing),
      position_in_feed: index,
    });
  }

  function registerCardRef(listing, index) {
    return (node) => {
      const tracking = viewTrackingRef.current;
      const existing = tracking.get(listing._id);
      if (!node || existing?.fired) return;
      if (existing) return; // already observing this card

      const observer = new IntersectionObserver(
        ([entry]) => {
          const state = tracking.get(listing._id);
          if (!state || state.fired) return;

          if (entry.isIntersecting) {
            state.timer = setTimeout(() => {
              state.fired = true;
              trackEvent('listing_viewed', {
                user_id: account?.id,
                listing_id: listing._id,
                distance_m: listingDistanceMeters(listing),
                position_in_feed: index,
              });
            }, VIEW_TRACK_DELAY_MS);
          } else if (state.timer) {
            clearTimeout(state.timer);
            state.timer = null;
          }
        },
        { threshold: 0.5 },
      );

      observer.observe(node);
      tracking.set(listing._id, { observer, timer: null, fired: false });
    };
  }

  return (
    <DashboardLayout renderSidebar={(onClose) => <AppNav onCloseMobile={onClose} />}>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-h4 font-bold text-ink">Browse nearby food</h1>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((c) => (
            <Chip key={c.value || 'all'} label={c.label} selected={category === c.value} onClick={() => handleFilterChange(c.value)} />
          ))}
        </div>

        <div className="mt-4">
          {phase === 'loading' && (
            <Loading title="Finding available food nearby…" description="Scanning within 5km of your location" />
          )}

          {phase === 'error' && (
            <ErrorState title="Connection Interrupted" description={errorMessage} actionLabel="Try Again" onAction={() => loadListings(category)} />
          )}

          {phase === 'empty' && (
            <EmptyState
              icon={<ForkKnifeIcon />}
              title="No Food Available Nearby"
              description="There are no surplus food listings in your area right now. Check back shortly or be the first to share with neighbours!"
              actionLabel="Refresh Feed"
              onAction={() => loadListings(category)}
            />
          )}

          {phase === 'success' && (
            <div className="flex flex-col gap-4 tablet:grid tablet:grid-cols-2 tablet:gap-6">
              {listings.map((listing, index) => {
                const minutesLeft = minutesUntil(listing.pickupByTime);
                const distanceLabel = formatDistance(listingDistanceMeters(listing));
                return (
                  <Link
                    key={listing._id}
                    to={`/claim/${listing._id}`}
                    ref={registerCardRef(listing, index)}
                    onClick={() => handleListingClick(listing, index)}
                  >
                    <Card padding="md" as="article">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-accent-green-light text-ink">
                          <ForkKnifeIcon />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sh2 font-bold text-ink">{listing.itemDescription}</p>
                          <p className="mt-0.5 text-caption text-ink-muted">
                            {listing.price === 'free' ? 'Free' : `₦${listing.price}`} ·{' '}
                            <span className="font-semibold text-ink">{listing.quantity}</span> portions
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        {distanceLabel && <Pill>{distanceLabel}</Pill>}
                        <Pill>{minutesLeft}m left</Pill>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
