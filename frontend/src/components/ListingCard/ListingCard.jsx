import './ListingCard.css';
import Card from '../Card/Card.jsx';
import TimeRing from '../TimeRing/TimeRing.jsx';
import { PinIcon, BoxIcon } from '../Icon/Icon.jsx';

/** ListingCard — a single surplus-food listing on the discovery feed (US-4). */
export default function ListingCard({ listing, muted = false }) {
  return (
    <Card muted={muted}>
      <div className="listing-card-top">
        <div className="listing-card-thumb">
          <BoxIcon />
        </div>
        <div className="listing-card-info">
          <p className="listing-card-vendor">{listing.vendor}</p>
          <p className="listing-card-item">{listing.item}</p>
          <div className="listing-card-meta">
            <span>
              <PinIcon /> {listing.distanceKm} km
            </span>
            <span className="listing-card-dot">·</span>
            <span>{listing.qty}</span>
          </div>
        </div>
        <TimeRing minutes={listing.minutesLeft} maxMinutes={listing.maxMinutes} />
      </div>
      <hr className="listing-card-divider" />
      <div className="listing-card-footer">
        <span className="listing-card-price">{listing.price}</span>
        <span className="listing-card-category">{listing.category}</span>
      </div>
    </Card>
  );
}
