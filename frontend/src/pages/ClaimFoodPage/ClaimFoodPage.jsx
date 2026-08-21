import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx';
import AppNav from '../../components/AppNav/AppNav.jsx';
import Card from '../../components/Card/Card.jsx';
import Pill from '../../components/Pill/Pill.jsx';
import Button from '../../components/Button/Button.jsx';
import Alert from '../../components/Alert/Alert.jsx';
import Loading from '../../components/Loading/Loading.jsx';
import ErrorState from '../../components/ErrorState/ErrorState.jsx';
import { ForkKnifeIcon } from '../../components/Icon/Icon.jsx';
import { getListing, claimListing } from '../../api/listings.js';
import { getUserMe } from '../../api/users.js';
import { getCurrentPosition, distanceMeters } from '../../lib/geolocation.js';
import { getAccount } from '../../lib/authStorage.js';
import { ApiError } from '../../lib/apiClient.js';
import { trackEvent } from '../../lib/analytics.js';

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatDistance(meters) {
  if (meters == null) return null;
  return meters < 1000 ? `${Math.round(meters)}m` : `${(meters / 1000).toFixed(1)}km`;
}

function getVendorProfile(listing) {
  if (!listing?.vendorId || typeof listing.vendorId !== 'object') return null;
  return listing.vendorId;
}

function getInitials(name) {
  return (name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export default function ClaimFoodPage() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const account = getAccount();

  const [phase, setPhase] = useState('loading'); // loading | error | blocked | success
  const [listing, setListing] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [claimant, setClaimant] = useState(null); // { name, accountType, charityVerifiedAt } — only fetched for charity accounts
  const [distanceM, setDistanceM] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setPhase('loading');
      try {
        const isCharity = account?.role === 'charity';
        const [listingData, userData] = await Promise.all([
          getListing(listingId),
          isCharity ? getUserMe() : Promise.resolve(null),
        ]);
        if (cancelled) return;

        setListing(listingData.listing);
        setVendor(getVendorProfile(listingData.listing));

        const blocked = isCharity && !userData.user.charityVerifiedAt;
        if (blocked) {
          setClaimant(userData.user);
          setPhase('blocked');
          trackEvent('claim_page_viewed', { user_id: account?.id, listing_id: listingId, blocked: true });
          return;
        }

        setPhase('success');
        trackEvent('claim_page_viewed', { user_id: account?.id, listing_id: listingId, blocked: false });

        try {
          const coords = await getCurrentPosition();
          if (cancelled) return;
          const listingCoords = { lat: listingData.listing.location.coordinates[1], lng: listingData.listing.location.coordinates[0] };
          setDistanceM(distanceMeters(coords, listingCoords));
        } catch {
          // Distance is supplementary here (unlike Discover Food) — claiming doesn't need it, so a denied/unavailable
          // location just means no distance pill, not a blocked page.
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
  }, [listingId, account?.id, account?.role]);

  async function handleClaim() {
    setClaimError('');
    setClaiming(true);
    trackEvent('claim_attempted', { user_id: account?.id, listing_id: listingId });
    try {
      const data = await claimListing(listingId);
      trackEvent('claim_succeeded', {
        user_id: account?.id,
        listing_id: listingId,
        vendor_id: data.listing.vendorId,
        hold_expires_at: data.listing.claim?.holdExpiresAt,
      });
      navigate(`/claim/${listingId}/hold`, { state: { listing: data.listing } });
    } catch (err) {
      const message = err instanceof ApiError ? err.msg : 'Something went wrong claiming this listing. Please try again.';
      trackEvent('claim_failed', { user_id: account?.id, listing_id: listingId, reason: message });
      setClaimError(message);
    } finally {
      setClaiming(false);
    }
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
          <ErrorState
            title="This food listing is no longer available."
            description={errorMessage}
            actionLabel="Back to feed"
            onAction={() => navigate('/discover')}
          />
        </div>
      </DashboardLayout>
    );
  }

  if (phase === 'blocked') {
    return (
      <DashboardLayout renderSidebar={(onClose) => <AppNav listingId={listingId} onCloseMobile={onClose} />}>
        <div className="mx-auto max-w-lg">
          <Card padding="md">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-accent-green text-body2 font-bold text-white">
                {getInitials(claimant.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-body1 font-bold text-ink">{claimant.name}</p>
                <p className="text-caption text-ink-faint capitalize">{claimant.accountType}</p>
              </div>
            </div>
            <span className="mt-3 inline-flex items-center rounded-pill bg-accent-orange-light px-2.5 py-1 text-caption font-bold text-accent-orange">
              Pending verification
            </span>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const distanceLabel = formatDistance(distanceM);

  return (
    <DashboardLayout renderSidebar={(onClose) => <AppNav listingId={listingId} onCloseMobile={onClose} />}>
      <div className="mx-auto max-w-lg">
        <h1 className="text-h4 font-bold text-ink">Claim food listing</h1>

        {claimError && (
          <Alert tone="error" className="mt-4">
            {claimError}
          </Alert>
        )}

        <Card padding="md" className="mt-4">
          <div className="flex h-40 items-center justify-center rounded-xl bg-accent-green-light text-ink">
            <ForkKnifeIcon width={32} height={32} />
          </div>
          <p className="mt-4 text-body1 font-bold text-ink">{listing.itemDescription}</p>

          {vendor && (
            <div className="mt-4 rounded-lg bg-secondary-light p-3">
              <p className="text-caption font-bold uppercase tracking-wide text-ink-faint">
                Vendor
              </p>
              <p className="mt-1 text-body1 font-bold text-ink">
                {vendor.businessName}
              </p>
              <p className="mt-1 text-body2 text-ink-muted">
                {vendor.address}
              </p>
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <Pill>{listing.category.replace('_', ' ')}</Pill>
            <Pill>{listing.price === 'free' ? 'Free' : `₦${listing.price}`}</Pill>
          </div>

          <div className="mt-4 flex flex-col">
            {distanceLabel && (
              <div className="flex items-center justify-between border-b border-border py-2.5">
                <span className="text-body2 font-bold text-ink">Distance</span>
                <span className="text-body2 text-ink-muted">{distanceLabel}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-b border-border py-2.5">
              <span className="text-body2 font-bold text-ink">Pickup by</span>
              <span className="text-body2 text-ink-muted">{formatTime(listing.pickupByTime)}</span>
            </div>
          </div>
        </Card>

        <Button color="accent" variant="solid" fullWidth className="mt-4" loading={claiming} disabled={claiming} onClick={handleClaim}>
          Claim this listing
        </Button>
      </div>
    </DashboardLayout>
  );
}
