import { useState } from 'react';
import Shell from './components/Shell/Shell.jsx';
import PhoneFrame from './components/PhoneFrame/PhoneFrame.jsx';
import BottomNav from './components/BottomNav/BottomNav.jsx';

import VendorListingScreen from './screens/VendorListingScreen/VendorListingScreen.jsx';
import VendorDashboardScreen from './screens/VendorDashboardScreen/VendorDashboardScreen.jsx';
import DiscoveryFeedScreen from './screens/DiscoveryFeedScreen/DiscoveryFeedScreen.jsx';
import ClaimHoldScreen from './screens/ClaimHoldScreen/ClaimHoldScreen.jsx';

import { listings as initialListings } from './data/listings.js';


export default function App() {
  const [tab, setTab] = useState('vendor-listing');
  const [listings, setListings] = useState(initialListings);
  const [postedListings, setPostedListings] = useState([]);

  const [claim, setClaim] = useState(null); 

  function handlePosted(newListing) {
    setPostedListings((prev) => [newListing, ...prev]);
    setListings((prev) => [newListing, ...prev]);
  }

  function handleClaim(listing) {
    const raceLost = listing.minutesLeft <= 15;
    if (!raceLost) {
      setListings((prev) => prev.filter((l) => l.id !== listing.id));
    }
    setClaim({ listing, raceLost, expired: false });
  }

  function backToFeed() {
    setClaim(null);
    setTab('feed');
  }

  function handleExpire() {
    if (claim) {
      setListings((prev) => [claim.listing, ...prev]);
      setClaim({ ...claim, expired: true });
    }
  }

  function handleRelease() {
    if (claim) {
      setListings((prev) => [claim.listing, ...prev]);
    }
    backToFeed();
  }

  let screen;
  if (claim) {
    screen = (
      <ClaimHoldScreen
        listing={claim.listing}
        raceLost={claim.raceLost}
        expired={claim.expired}
        onBack={backToFeed}
        onExpire={handleExpire}
        onRelease={handleRelease}
      />
    );
  } else if (tab === 'vendor-listing') {
    screen = <VendorListingScreen onPosted={handlePosted} />;
  } else if (tab === 'vendor-dashboard') {
    screen = <VendorDashboardScreen extraListings={postedListings} />;
  } else {
    screen = <DiscoveryFeedScreen listings={listings} onClaim={handleClaim} />;
  }

  return (
    <Shell>
      <PhoneFrame bottom={!claim && <BottomNav current={tab} onSelect={setTab} />}>
        {screen}
      </PhoneFrame>
    </Shell>
  );
}
