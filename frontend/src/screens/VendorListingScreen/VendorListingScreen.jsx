import { useState } from 'react';
import './VendorListingScreen.css';
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader.jsx';
import ScreenContainer from '../../components/ScreenContainer/ScreenContainer.jsx';
import Button from '../../components/Button/Button.jsx';
import FormField from '../../components/FormField/FormField.jsx';
import Banner from '../../components/Banner/Banner.jsx';
import ListingCard from '../../components/ListingCard/ListingCard.jsx';
import { CheckIcon } from '../../components/Icon/Icon.jsx';

export default function VendorListingScreen({ onPosted }) {
  const [phase, setPhase] = useState('idle'); // idle | error | loading | success
  const [item, setItem] = useState('');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('Free');
  const [pickupBy, setPickupBy] = useState('');
  const [posted, setPosted] = useState(null);

  const fieldError = (field) => phase === 'error' && !field.trim();

  function handleSubmit() {
    if (!item.trim() || !qty.trim() || !pickupBy.trim()) {
      setPhase('error');
      return;
    }
    setPhase('loading');
    const newListing = {
      id: Date.now(),
      vendor: "Mama Bisi's Kitchen",
      item,
      qty,
      category: 'Prepared meals',
      distanceKm: 0.1,
      minutesLeft: 60,
      maxMinutes: 60,
      price,
    };
    setTimeout(() => {
      setPosted(newListing);
      setPhase('success');
      if (onPosted) onPosted(newListing);
    }, 900);
  }

  function reset() {
    setItem('');
    setQty('');
    setPrice('Free');
    setPickupBy('');
    setPosted(null);
    setPhase('idle');
  }

  if (phase === 'success' && posted) {
    return (
      <ScreenContainer className="vendor-listing-screen">
        <ScreenHeader title="New listing" />
        <div className="vendor-listing-success">
          <div className="vendor-listing-success-badge">
            <CheckIcon />
          </div>
          <h3>Listing is live</h3>
          <p>{posted.item} is now visible to nearby residents and charities.</p>
        </div>
        <ListingCard listing={posted} />
        <Button variant="ghost" onClick={reset}>
          List another item
        </Button>
      </ScreenContainer>
    );
  }

  if (phase === 'loading') {
    return (
      <ScreenContainer className="vendor-listing-screen">
        <ScreenHeader title="New listing" />
        <FormField label="Item" value={item} disabled />
        <FormField label="Quantity" value={qty} disabled />
        <FormField label="Price" value={price} disabled />
        <FormField label="Pickup-by time" value={pickupBy} disabled />
        <Button variant="disabled" loading>
          Posting listing…
        </Button>
      </ScreenContainer>
    );
  }

  const showError = phase === 'error';

  return (
    <ScreenContainer className="vendor-listing-screen">
      <ScreenHeader title="New listing" />
      {showError && <Banner type="error">Fix the highlighted fields before you can post this listing.</Banner>}
      <FormField
        label="Item"
        placeholder="e.g. Jollof rice & grilled chicken"
        value={item}
        onChange={(e) => setItem(e.target.value)}
        error={fieldError(item)}
        helper={fieldError(item) ? 'Tell us what the surplus item is.' : undefined}
      />
      <FormField
        label="Quantity"
        placeholder="e.g. 6 portions"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        error={fieldError(qty)}
        helper={fieldError(qty) ? 'Add a rough quantity so people know how much is available.' : undefined}
      />
      <FormField
        label="Price"
        type="select"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        options={['Free', 'Informal price (e.g. ₦300)']}
      />
      <FormField
        label="Pickup-by time"
        placeholder="e.g. 9:30 PM"
        value={pickupBy}
        onChange={(e) => setPickupBy(e.target.value)}
        error={fieldError(pickupBy)}
        helper={fieldError(pickupBy) ? 'Set the last time this can still be collected.' : undefined}
      />
      <Button variant="orange" onClick={handleSubmit}>
        Post listing
      </Button>
      <p className="vendor-listing-footnote">Goes live on the feed instantly — no review step.</p>
    </ScreenContainer>
  );
}
