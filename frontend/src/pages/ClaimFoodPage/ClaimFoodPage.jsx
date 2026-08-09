import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx';
import AppNav from '../../components/AppNav/AppNav.jsx';
import Card from '../../components/Card/Card.jsx';
import Badge from '../../components/Badge/Badge.jsx';
import Button from '../../components/Button/Button.jsx';
import Loading from '../../components/Loading/Loading.jsx';
import ErrorState from '../../components/ErrorState/ErrorState.jsx';
import { ClockIcon, ForkKnifeIcon, PinIcon } from '../../components/Icon/Icon.jsx';
import { getListing } from '../../api/listings.js';
import { getAccount } from '../../lib/authStorage.js';
import { ApiError } from '../../lib/apiClient.js';
import { trackEvent } from '../../lib/analytics.js';

/**
 * Claim Food — matches `claim_food_-_recipient.png` /
 * `claim_food_-_charity.png` / `claim_food_-_organization_-_desktop.png`.
 * The listing itself is fetched for real via `GET /listings/:id`. The
 * claim *action* is NOT wired to any backend call — `POST
 * /listings/:id/claim` is still listed as "Not Yet Available" in the
 * API docs. Tapping the button navigates to a local-only hold screen
 * (`ReleaseClaimPage`) with the listing passed via router state;
 * nothing is persisted server-side yet.
 *
 * Firebase/GA: fires `claim_attempted` from the tracking plan the
 * instant the button is tapped — the plan explicitly says to fire
 * this *before* the API call resolves, which lines up naturally here
 * since there's no real API call to wait for yet. `claim_id` is a
 * locally-generated placeholder (`crypto.randomUUID()`), since no
 * backend claim record exists to issue a real one — flagged in the
 * property itself via `claim_id_is_placeholder: true` rather than
 * silently passing off a fake id as if it were real.
 *
 * Button label depends on account role: charity AND organization
 * accounts both see "Claim All Portions" (both map to the API's
 * `role: "charity"` — "organization" is just how the Figma labels the
 * charity account type, not a separate role), everyone else sees
 * "Claim A Portion".
 */
function minutesUntil(pickupByTime) {
  const diffMs = new Date(pickupByTime).getTime() - Date.now();
  return Math.max(0, Math.round(diffMs / 60000));
}

export default function ClaimFoodPage() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const account = getAccount();

  const [phase, setPhase] = useState('loading');
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
    return () => { cancelled = true; };
  }, [listingId]);

  function handleClaim() {
    const claimId = crypto.randomUUID();

    trackEvent('claim_attempted', {
      user_id: account?.id,
      listing_id: listingId,
      claim_id: claimId,
      claim_id_is_placeholder: true,
    });

    navigate(`/claim/${listingId}/hold`, { state: { listing } });
  }

  if (phase === 'loading') {
    return (
      <DashboardLayout renderSidebar={(onClose) => <AppNav listingId={listingId} onCloseMobile={onClose} />}>
        <div className="mx-auto max-w-lg">
          <Loading title="Loading listing…" description="Fetching the latest details for this item" />
        </div>
      </DashboardLayout>
    );
  }

  if (phase === 'error') {
    return (
      <DashboardLayout renderSidebar={(onClose) => <AppNav listingId={listingId} onCloseMobile={onClose} />}>
        <div className="mx-auto max-w-lg">
          <ErrorState title="This food listing is no longer available." description={errorMessage} actionLabel="Back to feed" onAction={() => navigate('/discover')} />
        </div>
      </DashboardLayout>
    );
  }

  const minutesLeft = minutesUntil(listing.pickupByTime);
  const isCharity = account?.role === 'charity';

  return (
    <DashboardLayout renderSidebar={(onClose) => <AppNav listingId={listingId} onCloseMobile={onClose} />}>
      <div className="mx-auto max-w-lg">
        <Card padding="md">
          <div className="flex h-40 items-center justify-center rounded-xl bg-accent-green-light text-ink">
            <ForkKnifeIcon width={32} height={32} />
          </div>
          <p className="mt-4 text-sh1 font-bold text-ink">{listing.itemDescription}</p>
          <p className="mt-1 flex items-center gap-1 text-caption text-ink-faint">
            <PinIcon /> Location
          </p>

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
      </div>
    </DashboardLayout>
  );
}
