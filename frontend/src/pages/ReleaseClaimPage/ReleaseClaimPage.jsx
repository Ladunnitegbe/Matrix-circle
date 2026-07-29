import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import AppTopBar from '../../components/AppTopBar/AppTopBar.jsx';
import Card from '../../components/Card/Card.jsx';
import Button from '../../components/Button/Button.jsx';
import CountdownRing from '../../components/CountdownRing/CountdownRing.jsx';
import { BoxIcon } from '../../components/Icon/Icon.jsx';

/**
 * Release Claim — matches `release_claim.png`. Entirely local state:
 * there is no backend endpoint yet for creating, releasing, or
 * expiring a claim/hold (see the file-level note in ClaimFoodPage.jsx).
 * The listing is read from router state rather than fetched, since
 * there's no server-side "my active hold" to fetch instead.
 *
 * If someone lands here directly (e.g. a page refresh, which clears
 * router state), there's nothing to show — redirect back to the feed
 * rather than rendering a broken page.
 *
 * `CountdownRing` defaults to a 60x sped-up countdown (built for an
 * earlier demo). That's wrong for real usage — explicitly passing
 * `speedFactor={1}` here so 15 minutes really means 15 minutes.
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
    // Local-only — no backend release endpoint exists yet.
    navigate('/discover', { replace: true });
  }

  function handleExpire() {
    // Local-only — no backend expiry to report to.
    navigate('/discover', { replace: true });
  }

  return (
    <div className="min-h-screen bg-surface">
      <AppTopBar />
      <main className="mx-auto max-w-lg px-4 py-6 tablet:px-6 laptop:px-8">
        <h1 className="text-h4 font-bold text-ink">Your Claim</h1>

        <Card padding="md" className="mt-4 text-center">
          <p className="text-caption font-bold uppercase tracking-wide text-accent-green">Hold Active</p>
          <CountdownRing totalSeconds={900} speedFactor={1} active onExpire={handleExpire} />
        </Card>

        <Card padding="md" className="mt-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-accent-green-light">
              <BoxIcon />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sh2 font-bold text-ink">{listing.itemDescription}</p>
              <p className="text-caption text-ink-faint">{listingId}</p>
            </div>
          </div>
        </Card>

        <Button color="accent" variant="outlined" fullWidth className="mt-4" onClick={handleRelease}>
          Release Hold
        </Button>
      </main>
    </div>
  );
}
