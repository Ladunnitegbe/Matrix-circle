import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx';
import AppNav from '../../components/AppNav/AppNav.jsx';
import Card from '../../components/Card/Card.jsx';
import Input from '../../components/Input/Input.jsx';
import Select from '../../components/Select/Select.jsx';
import Button from '../../components/Button/Button.jsx';
import Alert from '../../components/Alert/Alert.jsx';
import Loading from '../../components/Loading/Loading.jsx';
import ErrorState from '../../components/ErrorState/ErrorState.jsx';
import { ClockIcon, BoxIcon } from '../../components/Icon/Icon.jsx';
import { createListing } from '../../api/listings.js';
import { getVendorMe } from '../../api/vendors.js';
import { getAccount } from '../../lib/authStorage.js';
import { ApiError } from '../../lib/apiClient.js';
import { trackEvent } from '../../lib/analytics.js';

const CATEGORY_OPTIONS = [
  { value: 'cooked_meal', label: 'Cooked meal' },
  { value: 'baked_goods', label: 'Baked goods' },
  { value: 'raw_produce', label: 'Raw produce' },
  { value: 'free_donation', label: 'Free donation' },
];

/**
 * Create List — matches `create_list_-_vendor(-desktop).png` (the
 * form) and `listing_live.png` (the post-submit success state).
 *
 * TWO GAPS FIXED, neither previously matching the Figma:
 *
 * 1. Missing business-name header. Every other vendor page
 *    (Dashboard, Confirm Pickup, Profile) shows "• Jane's Kitchen" up
 *    top; this page didn't, even though the Figma shows it here too.
 *    Now fetched via the same `getVendorMe()` already used elsewhere.
 *
 * 2. Location field. The Figma shows a static "Location: Auto-filled"
 *    row — not the interactive click-to-geolocate `LocationField`
 *    component this page used before (that component's UX — "tap to
 *    use current location" — belongs to Registration's vendor step,
 *    where there's no location on file yet; here, a vendor posting a
 *    listing already has one from registration, so re-prompting for
 *    GPS every time was never right). This page now auto-fills
 *    `location` from the vendor's own `GET /vendors/me` record on
 *    load, with no click required, matching the Figma's "auto-filled"
 *    framing exactly — and, same as ProfilePage's read-only Location
 *    field, shown as real formatted coordinates rather than the
 *    Figma's literal placeholder-looking text, since the real value
 *    is on hand and hiding it behind static copy would be worse than
 *    showing what's actually available.
 *
 * SUCCESS STATE — the previous version silently navigated to
 * `/discover` (the RECIPIENT feed — not even the right destination
 * for a vendor) immediately after `POST /listings` succeeded, with no
 * confirmation shown at all. Now shows the `listing_live.png` success
 * card first, and "View My Active Listings" goes to
 * `/vendor/dashboard` (the page that actually shows a vendor's own
 * listings) instead. `BoxIcon` stands in for the Figma's basket icon
 * — nothing in the existing icon set is a literal basket, and this is
 * the closest available shape rather than hand-drawing new SVG art.
 *
 * Analytics: `create_listing_viewed` fires once on load — new, filling
 * the same page-view gap already closed on the other vendor/admin
 * pages. `listing_created` is unchanged from before (it already fired
 * with the exact properties the Event Tracking Plan specifies, on
 * real success only) — still fires here, just before the success
 * screen shows instead of an immediate redirect.
 */
export default function CreateListPage() {
  const navigate = useNavigate();
  const account = getAccount();

  const [phase, setPhase] = useState('loading'); // loading | error | form | live
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState(null);
  const [loadError, setLoadError] = useState('');

  const [itemDescription, setItemDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('cooked_meal');
  const [pickupTime, setPickupTime] = useState('');
  const [createdListing, setCreatedListing] = useState(null);

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = itemDescription.trim().length > 0 && quantity.trim().length > 0 && pickupTime.trim().length > 0 && location !== null;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setPhase('loading');
      try {
        const data = await getVendorMe();
        if (cancelled) return;
        setBusinessName(data.vendor.businessName);
        setLocation({ lat: data.vendor.location.coordinates[1], lng: data.vendor.location.coordinates[0] });
        setPhase('form');
        trackEvent('create_listing_viewed', { vendor_id: account?.id });
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof ApiError ? err.msg : 'Something went wrong. Please try again.');
          setPhase('error');
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buildPickupByTimeIso() {
    const [hours, minutes] = pickupTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  }

  function validate() {
    const next = {};
    if (itemDescription.trim().length < 2) next.itemDescription = 'Describe the surplus item (min 2 characters).';
    const quantityNum = Number(quantity);
    if (!quantity.trim() || Number.isNaN(quantityNum) || quantityNum < 1) next.quantity = 'Enter a quantity of at least 1.';
    if (!pickupTime) next.pickupTime = 'Set a pickup-by time.';
    if (!location) next.location = 'Location could not be determined — please refresh and try again.';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    const trimmedPrice = price.trim();
    const isFree = !trimmedPrice || trimmedPrice.toLowerCase() === 'free';
    const pickupByTime = buildPickupByTimeIso();
    const payload = {
      itemDescription,
      quantity: Number(quantity),
      price: isFree ? 'free' : Number(trimmedPrice),
      category,
      pickupByTime,
      coordinates: [location.lng, location.lat],
    };

    setSubmitting(true);
    try {
      const data = await createListing(payload);

      trackEvent('listing_created', {
        vendor_id: account?.id,
        listing_id: data.listing?._id,
        category,
        is_free: isFree,
        quantity: Number(quantity),
        pickup_by: pickupByTime,
        location: { lat: location.lat, lng: location.lng },
      });

      setCreatedListing(data.listing);
      setPhase('live');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors?.length) {
          const next = {};
          err.errors.forEach((fieldErr) => {
            const key = fieldErr.field.replace(/^body\./, '');
            next[key] = fieldErr.message;
          });
          setFieldErrors((prev) => ({ ...prev, ...next }));
        } else {
          setFormError(err.msg);
        }
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (phase === 'loading') {
    return (
      <DashboardLayout renderSidebar={(onClose) => <AppNav onCloseMobile={onClose} />}>
        <div className="mx-auto max-w-lg">
          <Loading title="Loading…" description="Fetching your vendor details" />
        </div>
      </DashboardLayout>
    );
  }

  if (phase === 'error') {
    return (
      <DashboardLayout renderSidebar={(onClose) => <AppNav onCloseMobile={onClose} />}>
        <div className="mx-auto max-w-lg">
          <ErrorState title="Connection Interrupted" description={loadError} actionLabel="Try Again" onAction={() => window.location.reload()} />
        </div>
      </DashboardLayout>
    );
  }

  if (phase === 'live') {
    return (
      <DashboardLayout renderSidebar={(onClose) => <AppNav onCloseMobile={onClose} />}>
        <div className="mx-auto max-w-lg">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-h4 font-bold text-ink">New Listing</h1>
            <span className="flex items-center gap-2 text-body1 font-semibold text-ink">
              <span className="h-2.5 w-2.5 rounded-full bg-accent-green" aria-hidden="true" />
              {businessName}
            </span>
          </div>

          <Card padding="md" className="mt-4 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-green-light">
              <BoxIcon width={28} height={28} />
            </span>
            <p className="mt-4 text-body1 font-bold text-ink">Listing is Live!</p>
            <p className="mt-1 text-body2 text-ink-muted">
              Your surplus food is now visible to nearby students and community members.
            </p>
            <button
              type="button"
              onClick={() => navigate('/vendor/dashboard')}
              className="mt-4 text-body2 font-bold text-accent-green hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
            >
              View My Active Listings
            </button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout renderSidebar={(onClose) => <AppNav onCloseMobile={onClose} />}>
      <div className="mx-auto max-w-lg">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-h4 font-bold text-ink">New Listing</h1>
          <span className="flex items-center gap-2 text-body1 font-semibold text-ink">
            <span className="h-2.5 w-2.5 rounded-full bg-accent-green" aria-hidden="true" />
            {businessName}
          </span>
        </div>

        <hr className="mt-4 border-border" />

        <p className="mt-4 text-sh2 font-bold text-ink">Share Surplus Food</p>
        <p className="mt-1 text-body2 text-ink-muted">
          Add details about the available portions so nearby residents can claim them.
        </p>

        {formError && <Alert tone="error" className="mt-4">{formError}</Alert>}

        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
          <Input label="Item Description" placeholder="e.g Jollof rice and plantain" value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)} error={Boolean(fieldErrors.itemDescription)} caption1={fieldErrors.itemDescription} required />

          <Input label="Quantity" type="number" min="1" placeholder="e.g 6" value={quantity}
            onChange={(e) => setQuantity(e.target.value)} error={Boolean(fieldErrors.quantity)} caption1={fieldErrors.quantity} required />

          <Input label="Price" placeholder="Free" value={price} onChange={(e) => setPrice(e.target.value)}
            caption1="Leave blank or type 'Free' for a free listing, or enter a number." />

          <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} options={CATEGORY_OPTIONS} required />

          <Input label="Pickup-by Time" type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)}
            error={Boolean(fieldErrors.pickupTime)} caption1={fieldErrors.pickupTime}
            trailingAction={<ClockIcon width={18} height={18} className="text-ink-faint" />} required />

          <Input
            label="Location"
            readOnly
            value={location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : ''}
            error={Boolean(fieldErrors.location)}
            caption1={fieldErrors.location}
          />

          <Button type="submit" color="accent" variant="solid" fullWidth loading={submitting} disabled={!canSubmit}>
            Post to Community
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
