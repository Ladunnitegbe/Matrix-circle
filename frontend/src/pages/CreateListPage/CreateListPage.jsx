import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppTopBar from '../../components/AppTopBar/AppTopBar.jsx';
import Input from '../../components/Input/Input.jsx';
import Select from '../../components/Select/Select.jsx';
import LocationField from '../../components/LocationField/LocationField.jsx';
import Button from '../../components/Button/Button.jsx';
import Alert from '../../components/Alert/Alert.jsx';
import { ClockIcon } from '../../components/Icon/Icon.jsx';
import { createListing } from '../../api/listings.js';
import { ApiError } from '../../lib/apiClient.js';

const CATEGORY_OPTIONS = [
  { value: 'cooked_meal', label: 'Cooked meal' },
  { value: 'baked_goods', label: 'Baked goods' },
  { value: 'raw_produce', label: 'Raw produce' },
  { value: 'free_donation', label: 'Free donation' },
];

/**
 * Create List — matches `create_list_-_vendor.png`. Reuses
 * `LocationField` (the same component built for vendor registration),
 * rather than a second location-capture implementation.
 *
 * "Pickup-by Time" in Figma shows a plain time value ("14:30"), not a
 * date — assumed to mean "today at this time," since vendors are
 * listing same-day surplus close to closing time. The entered time is
 * combined with today's date client-side to build the ISO string the
 * API requires. Flagging this assumption rather than silently baking
 * it in: a vendor listing food for pickup after midnight would need a
 * real date field, which isn't what the Figma shows.
 */
export default function CreateListPage() {
  const navigate = useNavigate();

  const [itemDescription, setItemDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('cooked_meal');
  const [pickupTime, setPickupTime] = useState('');
  const [location, setLocation] = useState(null);

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    itemDescription.trim().length > 0 && quantity.trim().length > 0 && pickupTime.trim().length > 0 && location !== null;

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
    if (!quantity.trim() || Number.isNaN(quantityNum) || quantityNum < 1) {
      next.quantity = 'Enter a quantity of at least 1.';
    }

    if (!pickupTime) next.pickupTime = 'Set a pickup-by time.';
    if (!location) next.location = 'Set your location to continue.';

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    const trimmedPrice = price.trim();
    const payload = {
      itemDescription,
      quantity: Number(quantity),
      price: !trimmedPrice || trimmedPrice.toLowerCase() === 'free' ? 'free' : Number(trimmedPrice),
      category,
      pickupByTime: buildPickupByTimeIso(),
      coordinates: [location.lng, location.lat],
    };

    setSubmitting(true);
    try {
      await createListing(payload);
      navigate('/discover');
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
          // Covers 404 "Vendor profile not found", 429, network failure.
          setFormError(err.msg);
        }
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <AppTopBar />

      <main className="mx-auto max-w-lg px-4 py-6 tablet:px-6 laptop:px-8">
        <h1 className="text-h4 font-bold text-ink">Share Surplus Food</h1>
        <p className="mt-1 text-body2 text-ink-muted">
          Add details about the available portions so nearby residents can claim them.
        </p>

        {formError && (
          <Alert tone="error" className="mt-4">
            {formError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
          <Input
            label="Item Description"
            placeholder="e.g Jollof rice and plantain"
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            error={Boolean(fieldErrors.itemDescription)}
            caption1={fieldErrors.itemDescription}
            required
          />

          <Input
            label="Quantity"
            type="number"
            min="1"
            placeholder="e.g 6"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            error={Boolean(fieldErrors.quantity)}
            caption1={fieldErrors.quantity}
            required
          />

          <Input
            label="Price"
            placeholder="Free"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            caption1="Leave blank or type 'Free' for a free listing, or enter a number."
          />

          <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} options={CATEGORY_OPTIONS} required />

          <Input
            label="Pickup-by Time"
            type="time"
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            error={Boolean(fieldErrors.pickupTime)}
            caption1={fieldErrors.pickupTime}
            trailingAction={<ClockIcon width={18} height={18} className="text-ink-faint" />}
            required
          />

          <LocationField
            value={location}
            onLocate={setLocation}
            error={Boolean(fieldErrors.location)}
            caption1={fieldErrors.location}
            required
          />

          <Button type="submit" color="accent" variant="solid" fullWidth loading={submitting} disabled={!canSubmit}>
            Post to Community
          </Button>
        </form>
      </main>
    </div>
  );
}
