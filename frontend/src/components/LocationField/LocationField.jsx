import { useState } from 'react';
import Input from '../Input/Input.jsx';
import { PinIcon } from '../Icon/Icon.jsx';
import { getCurrentPosition } from '../../lib/geolocation.js';

/**
 * LocationField — captures coordinates via the browser's Geolocation
 * API rather than free text, matching the Figma's "use current
 * location" / "Auto-filled" pattern. Read-only: the trailing pin
 * button (or the field itself) triggers capture; there's nothing to
 * type. Reused by vendor registration and the Create List form.
 *
 * Reports `{ lat, lng }` to the parent via `onLocate` rather than
 * holding its own form state — same controlled pattern as every other
 * field in these forms, just driven by a browser API instead of typing.
 */
export default function LocationField({
  label = 'Set Location',
  value, // { lat, lng } | null
  onLocate,
  error = false,
  caption1,
  required = false,
  className = '',
}) {
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState('');

  async function handleLocate() {
    setGeoError('');
    setLocating(true);
    try {
      const coords = await getCurrentPosition();
      onLocate(coords);
    } catch (err) {
      setGeoError(err.message);
    } finally {
      setLocating(false);
    }
  }

  const displayValue = value ? `Location captured (${value.lat.toFixed(4)}, ${value.lng.toFixed(4)})` : '';

  return (
    <Input
      label={label}
      required={required}
      readOnly
      onClick={handleLocate}
      placeholder={locating ? 'Locating…' : 'use current location'}
      value={displayValue}
      error={error || Boolean(geoError)}
      caption1={geoError || caption1}
      className={className}
      trailingAction={
        <button
          type="button"
          onClick={handleLocate}
          disabled={locating}
          aria-label={value ? 'Update location' : 'Use current location'}
          className="rounded text-ink-faint hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange disabled:cursor-not-allowed disabled:opacity-60"
        >
          <PinIcon width={18} height={18} />
        </button>
      }
    />
  );
}
