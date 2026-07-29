import { useEffect, useState } from 'react';
import './DiscoveryFeedScreen.css';
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader.jsx';
import Chip from '../../components/Chip/Chip.jsx';
import ListingCard from '../../components/ListingCard/ListingCard.jsx';
import Skeleton from '../../components/Skeleton/Skeleton.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import Banner from '../../components/Banner/Banner.jsx';
import Button from '../../components/Button/Button.jsx';
import { PinIcon, LeafIcon } from '../../components/Icon/Icon.jsx';
import { categories } from '../../data/listings.js';

export default function DiscoveryFeedScreen({ listings, onClaim }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [phase, setPhase] = useState('loading'); // loading | ready | error

  function load(allowFail) {
    setPhase('loading');
    setTimeout(() => {
      if (allowFail && Math.random() < 0.25) {
        setPhase('error');
        return;
      }
      setPhase('ready');
    }, 700);
  }

  useEffect(() => {
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = activeCategory === 'All' ? listings : listings.filter((l) => l.category === activeCategory);

  const chipRow = (
    <div className="discovery-feed-chips">
      {categories.map((cat) => (
        <Chip key={cat} label={cat} active={cat === activeCategory} onClick={() => setActiveCategory(cat)} />
      ))}
    </div>
  );

  if (phase === 'loading') {
    return (
      <div className="discovery-feed-screen">
        <ScreenHeader title="Nearby now" />
        {chipRow}
        {[1, 2, 3].map((i) => (
          <div className="discovery-feed-card-skeleton" key={i}>
            <Skeleton width="56px" height="56px" radius="13px" />
            <div className="discovery-feed-card-skeleton-lines">
              <Skeleton height="14px" width="80%" />
              <Skeleton height="11px" width="50%" />
            </div>
            <Skeleton width="44px" height="44px" radius="50%" />
          </div>
        ))}
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="discovery-feed-screen">
        <ScreenHeader title="Nearby now" />
        <Banner type="offline">Feed couldn't refresh — showing your last known results.</Banner>
        {listings.slice(0, 2).map((l) => (
          <ListingCard listing={l} key={l.id} />
        ))}
        <Button variant="ghost" onClick={() => load(true)}>
          Retry refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="discovery-feed-screen">
      <ScreenHeader
        title="Nearby now"
        right={
          <button className="discovery-feed-icon-btn" onClick={() => load(true)}>
            <PinIcon />
          </button>
        }
      />
      {chipRow}
      {listings.length === 0 ? (
        <EmptyState
          icon={<LeafIcon />}
          title="Nothing surplus nearby right now"
          description="Vendors post close to closing time — check back in a bit, or widen your radius."
          action={<Button variant="ghost" onClick={() => load(true)}>Refresh</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<LeafIcon />}
          title={`No ${activeCategory.toLowerCase()} surplus right now`}
          description='Try another category, or switch back to "All" to see everything nearby.'
          action={
            <Button variant="ghost" onClick={() => setActiveCategory('All')}>
              Clear filter
            </Button>
          }
        />
      ) : (
        filtered.map((l) => (
          <div className="discovery-feed-listing-wrap" key={l.id}>
            <ListingCard listing={l} />
            <Button variant="orange" onClick={() => onClaim(l)}>
              Claim this listing
            </Button>
          </div>
        ))
      )}
    </div>
  );
}
