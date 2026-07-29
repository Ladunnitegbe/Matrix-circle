import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppTopBar from '../../components/AppTopBar/AppTopBar.jsx';
import Card from '../../components/Card/Card.jsx';
import Badge from '../../components/Badge/Badge.jsx';
import Button from '../../components/Button/Button.jsx';
import Loading from '../../components/Loading/Loading.jsx';
import ErrorState from '../../components/ErrorState/ErrorState.jsx';
import { ClockIcon, BoxIcon } from '../../components/Icon/Icon.jsx';
import { getListing } from '../../api/listings.js';
import { getAccount } from '../../lib/authStorage.js';
import { ApiError } from '../../lib/apiClient.js';

/**
 * Claim Food — matches `claim_food_-_recipient.png` /
 * `claim_food_-_charity.png`. The listing itself is fetched for real
 * via `GET /listings/:id` (documented, available). The claim *action*
 * is NOT wired to any backend call — `POST /listings/:id/claim` is
 * explicitly listed as "Not Yet Available" in the API docs, which say
 * not to scaffold logic against it since its shape may still change.
 *
 * Tapping the button below only navigates to a local-only "hold"
 * screen (`ReleaseClaimPage`) with the listing passed via router
 * state — nothing is persisted server-side. This will need to be
 * replaced with a real `createClaim()` call the moment that endpoint
 * ships.
 *
 * Button label depends on the logged-in account's role — "Claim All
 * Portions" for a charity account, "Claim A Portion" otherwise —
 * matching the two Figma variants exactly.
 */
function minutesUntil(pickupByTime) {
  const diffMs = new Date(pickupByTime).getTime() - Date.now();
  return Math.max(0, Math.round(diffMs / 60000));
}

export default function ClaimFoodPage() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const account = getAccount();

  const [phase, setPhase] = useState('loading'); // loading | error | success
  const [listing, setListing] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setPhase('loading');
      try {
        const data = await getListing(listingId);
        if (!cancelled) {
          setListing(data.listing);
          setPhase('success');
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMessage(err instanceof ApiError ? err.msg : 'Something went wrong. Please try again.');
          setPhase('error');
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  function handleClaim() {
    // Local-only — see file-level note above. Passes the listing via
    // router state since there's no backend "my active hold" to fetch
    // from instead.
    navigate(`/claim/${listingId}/hold`, { state: { listing } });
  }

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-surface">
        <AppTopBar />
        <main className="mx-auto max-w-lg px-4 py-6 tablet:px-6 laptop:px-8">
          <Loading title="Loading listing…" description="Fetching the latest details for this item" />
        </main>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-surface">
        <AppTopBar />
        <main className="mx-auto max-w-lg px-4 py-6 tablet:px-6 laptop:px-8">
          <ErrorState title="This food listing is no longer available." description={errorMessage} actionLabel="Back to feed" onAction={() => navigate('/discover')} />
        </main>
      </div>
    );
  }

  const minutesLeft = minutesUntil(listing.pickupByTime);
  const isCharity = account?.role === 'charity';

  return (
    <div className="min-h-screen bg-surface">
      <AppTopBar />
      <main className="mx-auto max-w-lg px-4 py-6 tablet:px-6 laptop:px-8">
        <Card padding="md">
          <div className="flex h-40 items-center justify-center rounded-xl bg-accent-green-light">
            <BoxIcon />
          </div>
          <p className="mt-4 text-sh1 font-bold text-ink">{listing.itemDescription}</p>

          <div className="mt-3 flex gap-2">
            <Badge tone="neutral">{listing.price === 'free' ? 'Free' : `₦${listing.price}`}</Badge>
            <Badge tone="secondary">{listing.category.replace('_', ' ')}</Badge>
            <span className="ml-auto text-sh2 font-bold text-ink">{listing.quantity} portions</span>
          </div>

          <hr className="my-4 border-border" />

          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-secondary-light text-accent-green">
              <ClockIcon />
            </span>
            <div>
              <p className="text-body2 font-bold text-ink">{minutesLeft} mins until pickup-by time</p>
              <p className="text-caption text-ink-faint">Claim locks it for 15 minutes so you can get there.</p>
            </div>
          </div>
        </Card>

        <Button color="accent" variant="solid" fullWidth className="mt-4" onClick={handleClaim}>
          {isCharity ? 'Claim All Portions' : 'Claim A Portion'}
        </Button>
      </main>
    </div>
  );
}
