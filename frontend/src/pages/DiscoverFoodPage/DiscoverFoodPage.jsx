import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppTopBar from '../../components/AppTopBar/AppTopBar.jsx';
import Chip from '../../components/Chip/Chip.jsx';
import Card from '../../components/Card/Card.jsx';
import Badge from '../../components/Badge/Badge.jsx';
import Loading from '../../components/Loading/Loading.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import ErrorState from '../../components/ErrorState/ErrorState.jsx';
import { ClockIcon, BoxIcon } from '../../components/Icon/Icon.jsx';
import { getListings } from '../../api/listings.js';
import { getCurrentPosition } from '../../lib/geolocation.js';
import { ApiError } from '../../lib/apiClient.js';

/**
 * Discover Food — the recipient/charity feed. Matches
 * `discover_food_-_recipient.png`: category chips, then a list of
 * listing cards.
 *
 * KNOWN GAP, not silently papered over: the Figma cards show a vendor
 * business name ("Ma's Kitchen") and a human-readable "Location" line.
 * The `GET /listings` response only includes `vendorId` (no vendor
 * name) and raw coordinates (no address) — there's no documented
 * endpoint to resolve either one. Cards below only show fields the API
 * actually returns; vendor name is omitted rather than invented, and
 * location shows a generic pin, not a resolved address.
 *
 * Polling: the API docs say there's no push/websocket update and to
 * poll on an interval — implemented below at 45s, the middle of the
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

function minutesUntil(pickupByTime) {
  const diffMs = new Date(pickupByTime).getTime() - Date.now();
  return Math.max(0, Math.round(diffMs / 60000));
}

export default function DiscoverFoodPage() {
  const [category, setCategory] = useState('');
  const [phase, setPhase] = useState('loading'); // loading | empty | error | success
  const [listings, setListings] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const loadListings = useCallback(async (activeCategory) => {
    setPhase('loading');
    setErrorMessage('');
    try {
      const coords = await getCurrentPosition();
      const data = await getListings({ lat: coords.lat, lng: coords.lng, category: activeCategory || undefined });
      setListings(data.listings);
      setPhase(data.listings.length === 0 ? 'empty' : 'success');
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.msg);
      } else {
        // Geolocation failure (permission denied, unsupported, timeout).
        setErrorMessage(err.message);
      }
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    loadListings(category);
    const interval = setInterval(() => loadListings(category), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [category, loadListings]);

  return (
    <div className="min-h-screen bg-surface">
      <AppTopBar />

      <main className="mx-auto max-w-3xl px-4 py-6 tablet:px-6 laptop:px-8">
        <h1 className="text-h4 font-bold text-ink">Browse nearby food</h1>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((c) => (
            <Chip key={c.value || 'all'} label={c.label} selected={category === c.value} onClick={() => setCategory(c.value)} />
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
              icon={<BoxIcon />}
              title="No Food Available Nearby"
              description="There are no surplus food listings in your area right now. Check back shortly or be the first to share with neighbours!"
              actionLabel="Refresh Feed"
              onAction={() => loadListings(category)}
            />
          )}

          {phase === 'success' && (
            <div className="flex flex-col gap-4">
              {listings.map((listing) => {
                const minutesLeft = minutesUntil(listing.pickupByTime);
                return (
                  <Link key={listing._id} to={`/claim/${listing._id}`}>
                    <Card padding="md" as="article">
                      <div className="flex gap-4">
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-accent-green-light">
                          <BoxIcon />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sh2 font-bold text-ink">{listing.itemDescription}</p>
                          <p className="mt-1 flex items-center gap-1 text-caption text-ink-faint">
                            <ClockIcon /> {minutesLeft}m until pickup-by time
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sh2 font-bold text-ink">{listing.quantity}</p>
                          <p className="text-caption text-ink-faint">portions</p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Badge tone="neutral">{listing.price === 'free' ? 'Free' : `₦${listing.price}`}</Badge>
                        <Badge tone="secondary">{listing.category.replace('_', ' ')}</Badge>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
