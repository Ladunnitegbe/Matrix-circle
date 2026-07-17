import './ClaimHoldScreen.css';
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader.jsx';
import Card from '../../components/Card/Card.jsx';
import CountdownRing from '../../components/CountdownRing/CountdownRing.jsx';
import Button from '../../components/Button/Button.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import Banner from '../../components/Banner/Banner.jsx';
import { BoxIcon, ClockIcon } from '../../components/Icon/Icon.jsx';

export default function ClaimHoldScreen({ listing, raceLost, expired, onBack, onExpire, onRelease }) {
  if (raceLost) {
    return (
      <div className="claim-hold-screen">
        <ScreenHeader title="Your claim" onBack={onBack} />
        <Banner type="error">Someone claimed this a split second before you. Exactly one claim can ever win.</Banner>
        <Card muted>
          <div className="claim-hold-listing">
            <div className="claim-hold-thumb">
              <BoxIcon />
            </div>
            <div>
              <p className="claim-hold-vendor">{listing.vendor}</p>
              <p className="claim-hold-item">{listing.item}</p>
            </div>
          </div>
        </Card>
        <Button variant="orange" onClick={onBack}>
          Browse similar nearby
        </Button>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="claim-hold-screen">
        <ScreenHeader title="Your claim" onBack={onBack} />
        <EmptyState
          icon={<ClockIcon width="28" height="28" />}
          title="Hold expired"
          description="You didn't confirm pickup in time, so this listing has been released back to the feed for others."
          action={<Button variant="ghost" onClick={onBack}>Back to feed</Button>}
        />
      </div>
    );
  }

  return (
    <div className="claim-hold-screen">
      <ScreenHeader title="Your claim" onBack={onBack} />
      <Card tinted>
        <p className="claim-hold-active-label">Hold active</p>
        <CountdownRing totalSeconds={900} speedFactor={60} active onExpire={onExpire} />
      </Card>
      <Card>
        <div className="claim-hold-listing">
          <div className="claim-hold-thumb">
            <BoxIcon />
          </div>
          <div>
            <p className="claim-hold-vendor">
              {listing.vendor} · {listing.distanceKm} km
            </p>
            <p className="claim-hold-item">{listing.item}</p>
          </div>
        </div>
      </Card>
      <Button variant="danger-outline" onClick={onRelease}>
        Release this hold
      </Button>
    </div>
  );
}
