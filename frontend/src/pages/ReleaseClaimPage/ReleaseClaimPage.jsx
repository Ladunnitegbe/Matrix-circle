import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx';
import AppNav from '../../components/AppNav/AppNav.jsx';
import Card from '../../components/Card/Card.jsx';
import Button from '../../components/Button/Button.jsx';
import CountdownRing from '../../components/CountdownRing/CountdownRing.jsx';
import { ForkKnifeIcon } from '../../components/Icon/Icon.jsx';

/**
 * Release Claim — matches `release_claim.png`. Entirely local state:
 * no backend endpoint exists yet for creating, releasing, or expiring
 * a claim/hold. The listing is read from router state rather than
 * fetched, since there's no server-side "my active hold" to fetch
 * instead. No tracking-plan event exists for this specific screen
 * (the plan's `claim_attempted` already fires one step earlier, on
 * ClaimFoodPage) — nothing invented beyond what's specified there.
 *
 * `CountdownRing` defaults to a 60x sped-up countdown from an earlier
 * demo build — explicitly overridden to `speedFactor={1}` here so 15
 * minutes really means 15 minutes.
 */
export default function ReleaseClaimPage() {
  const { listingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const listing = location.state?.listing;

  if (!listing) {
    return <Navigate to="/discover" replace />;
  }

  function handleRelease() {
    navigate('/discover', { replace: true });
  }
  function handleExpire() {
    navigate('/discover', { replace: true });
  }

  return (
    <DashboardLayout renderSidebar={(onClose) => <AppNav listingId={listingId} onCloseMobile={onClose} />}>
      <div className="mx-auto max-w-lg">
        <h1 className="text-h4 font-bold text-ink">Your Claim</h1>

        <Card padding="md" className="mt-4 text-center">
          <p className="text-caption font-bold uppercase tracking-wide text-accent-green">Hold Active</p>
          <CountdownRing totalSeconds={900} speedFactor={1} active onExpire={handleExpire} />
        </Card>

        <Card padding="md" className="mt-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-accent-green-light text-ink">
              <ForkKnifeIcon width={22} height={22} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sh2 font-bold text-ink">{listing.itemDescription}</p>
              <p className="text-caption text-ink-faint">Location</p>
            </div>
          </div>
        </Card>

        <Button color="accent" variant="outlined" fullWidth className="mt-4" onClick={handleRelease}>
          Release Hold
        </Button>
      </div>
    </DashboardLayout>
  );
}
