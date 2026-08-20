import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx';
import AppNav from '../../components/AppNav/AppNav.jsx';
import Card from '../../components/Card/Card.jsx';
import Button from '../../components/Button/Button.jsx';
import Loading from '../../components/Loading/Loading.jsx';
import { CheckIcon } from '../../components/Icon/Icon.jsx';
import { getListing } from '../../api/listings.js';
import { getAccount } from '../../lib/authStorage.js';
import { trackEvent } from '../../lib/analytics.js';
import { useToast } from '../../components/Toast/ToastProvider.jsx';

const POLL_INTERVAL_MS = 5000;

/**
 * Release Claim / hold screen — matches `release_claim.png` /
 * `claim_food_-_recipient_-_desktop-1.png` (the active "Food Portion
 * Secured!" hold) and `confirm_pickup.png` (the "Pickup successful."
 * terminal state, once the vendor confirms).
 *
 * REBUILT ON REAL, POLLED DATA. The previous version was entirely
 * local: it read the listing once from router state and never talked
 * to the backend again, so it had no way to know if the vendor
 * confirmed pickup while this screen was open, and it broke on a page
 * refresh (router state is gone, and it just bounced to /discover).
 * Now: `GET /listings/:id` (already used by ClaimFoodPage) is called
 * on mount — using the listing passed via router state only as an
 * instant first paint, immediately reconciled with the real fetch —
 * and then polled every 5s to catch a server-side state change.
 *
 * WHY 5s HERE, NOT THE APP'S USUAL 30–60s (Discover Food's polling
 * interval, per the API docs' general guidance): this screen exists
 * for one specific, short, real-world moment — a shopper physically
 * standing in front of a vendor while the vendor taps "Mark Picked
 * Up" on the Dashboard or Confirm Pickup. A 45s lag there would mean
 * standing at the counter looking at a stale "Food Portion Secured!"
 * screen well after pickup actually happened. It's a single-document
 * GET on one narrow screen for at most 15 minutes, so the tighter
 * interval is a deliberate, justified deviation, not an oversight.
 *
 * COUNTDOWN BADGE — the previous version used the shared
 * `CountdownRing` component (a large ring, "to reach the vendor"
 * subtitle). That doesn't match this Figma at all: the design shows a
 * small black rounded badge with just "14:59" in it. Built fresh here
 * to match, ticking from the real `claim.holdExpiresAt`
 * (CountdownRing's own hardcoded 900s default is gone along with it —
 * this page no longer uses that component).
 *
 * KNOWN GAP, not fixed here: "Release Hold" still doesn't call any
 * backend endpoint — there isn't one. No `PATCH /listings/:id/release`
 * or equivalent exists (only `/claim` and `/confirm-pickup` do, per
 * `claim.route.ts`). Clicking it just navigates away locally; the
 * listing stays `claimed` server-side until the backend's own
 * 15-minute hold naturally expires via `expireListings.job.ts`. This
 * matches the Figma exactly (there's nothing in the design indicating
 * otherwise) — the gap is real backend scope, not a frontend choice,
 * so it's documented here rather than surfaced as user-facing copy
 * the design never called for.
 *
 * Analytics: none of this is part of the original Event Tracking
 * Plan — same extension caveat as every other page's analytics in
 * this project.
 */
function secondsUntil(dateStr) {
  return Math.max(0, Math.round((new Date(dateStr).getTime() - Date.now()) / 1000));
}

function formatCountdown(totalSeconds) {
  const clamped = Math.max(0, totalSeconds);
  const mm = String(Math.floor(clamped / 60)).padStart(2, '0');
  const ss = String(clamped % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function getPendingClaim(listing) {
  return listing?.claims?.find((claim) => claim.status === 'pending') || null;
}

export default function ReleaseClaimPage() {
  const { listingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const account = getAccount();

 const [listing, setListing] = useState(location.state?.listing || null);

const [secondsLeft, setSecondsLeft] = useState(() => {
  const pendingClaim = getPendingClaim(location.state?.listing);
  return pendingClaim?.holdExpiresAt
    ? secondsUntil(pendingClaim.holdExpiresAt)
    : 0;
});

  const hasViewedRef = useRef(false);
  const hasEndedRef = useRef(false); // guards against firing hold_expired/redirecting twice

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const data = await getListing(listingId);
        if (cancelled) return;
        setListing(data.listing);

const pendingClaim = getPendingClaim(data.listing);

if (pendingClaim?.holdExpiresAt) {
  setSecondsLeft(secondsUntil(pendingClaim.holdExpiresAt));
}

        if (!hasViewedRef.current) {
          hasViewedRef.current = true;
          trackEvent('hold_screen_viewed', { user_id: account?.id, listing_id: listingId, state: data.listing.state });
        }

        if (data.listing.state === 'picked_up' && !hasEndedRef.current) {
          hasEndedRef.current = true;
          trackEvent('pickup_completed_viewed', { user_id: account?.id, listing_id: listingId });
        }

        if ((data.listing.state === 'expired_unclaimed' || data.listing.state === 'expired_no_show') && !hasEndedRef.current) {
          hasEndedRef.current = true;
          trackEvent('hold_expired', { user_id: account?.id, listing_id: listingId });
          showToast({ tone: 'info', message: 'Your hold on this listing has expired.' });
          navigate('/discover', { replace: true });
        }
      } catch {
        // A transient poll failure isn't worth interrupting this screen over — the next poll will retry.
        // If the listing is genuinely gone, the countdown reaching 0 below still gets the shopper out.
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  useEffect(() => {
    if (secondsLeft <= 0 || listing?.state !== 'claimed') return undefined;
    const tick = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(tick);
  }, [secondsLeft, listing?.state]);

  useEffect(() => {
    if (secondsLeft <= 0 && listing?.state === 'claimed' && !hasEndedRef.current) {
      hasEndedRef.current = true;
      trackEvent('hold_expired', { user_id: account?.id, listing_id: listingId });
      showToast({ tone: 'info', message: 'Your hold on this listing has expired.' });
      navigate('/discover', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, listing?.state]);

  if (!listing) {
    return (
      <DashboardLayout renderSidebar={(onClose) => <AppNav listingId={listingId} onCloseMobile={onClose} />}>
        <div className="mx-auto max-w-lg">
          <Loading title="Loading your claim…" description="Fetching the latest status for this hold" />
        </div>
      </DashboardLayout>
    );
  }

  function handleRelease() {
    trackEvent('hold_released', { user_id: account?.id, listing_id: listingId });
    navigate('/discover', { replace: true });
  }

  const isPickedUp = listing.state === 'picked_up';

  return (
    <DashboardLayout renderSidebar={(onClose) => <AppNav listingId={listingId} onCloseMobile={onClose} />}>
      <div className="mx-auto max-w-lg">
        <h1 className="text-h4 font-bold text-ink">Your Claim</h1>

        <Card padding="md" className="mt-4 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-green-light">
            <CheckIcon width={28} height={28} />
          </span>

          {!isPickedUp && (
            <span className="mx-auto mt-4 inline-flex items-center justify-center rounded-lg bg-secondary px-4 py-2 text-h4 font-bold text-white">
              {formatCountdown(secondsLeft)}
            </span>
          )}

          <p className="mt-4 text-body1 font-bold text-ink">Food Portion Secured!</p>
          <p className="mt-1 text-body2 text-ink-muted">
            {isPickedUp
              ? 'Pickup successful.'
              : 'Show this active screen to the vendor upon arrival to collect your meal.'}
          </p>
        </Card>

        {isPickedUp ? (
          <Button color="secondary" variant="solid" fullWidth className="mt-4" onClick={() => navigate('/discover')}>
            Back to Discover Feed
          </Button>
        ) : (
          <Button color="accent" variant="outlined" fullWidth className="mt-4" onClick={handleRelease}>
            Release Hold
          </Button>
        )}
      </div>
    </DashboardLayout>
  );
}
