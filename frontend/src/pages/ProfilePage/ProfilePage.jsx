import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx';
import AppNav from '../../components/AppNav/AppNav.jsx';
import Input from '../../components/Input/Input.jsx';
import Loading from '../../components/Loading/Loading.jsx';
import ErrorState from '../../components/ErrorState/ErrorState.jsx';
import { getVendorMe } from '../../api/vendors.js';
import { getAccount } from '../../lib/authStorage.js';
import { ApiError } from '../../lib/apiClient.js';
import { trackEvent } from '../../lib/analytics.js';

/**
 * Profile — matches `profile_-_vendor_-_desktop.png` /
 * `profile_-_vendor_-_mobile.png`: Business Name + Location, both
 * read-only.
 *
 * Read-only is a deliberate reading of the Figma, not a limitation
 * papered over: neither screenshot shows a Save/Edit button anywhere,
 * and there's no documented endpoint to update a vendor's profile
 * (`GET /vendors/me` is the only vendor-profile endpoint in the API
 * docs — no matching `PATCH`). Building an editable form against a
 * save action that doesn't exist would mean either a fake "success"
 * with nothing actually persisted, or a broken submit — this instead
 * displays the vendor's real data, fetched for real, with nothing
 * invented.
 *
 * EDITABLE LOCATION FOR VENDORS — INVESTIGATED, RULED OUT, DO NOT
 * REVISIT WITHOUT A BACKEND CHANGE: it looks tempting to reuse
 * `PATCH /users/me/location` (`user.route.ts`) the same way
 * RecipientProfilePage does, since that endpoint has no role guard on
 * it (`authenticateUser` only, no `authorizePermissions(...)`). But
 * confirmed directly against the backend source
 * (`user.controller.ts` → `user.service.ts`: `updateLocation`), it
 * runs `User.findOneAndUpdate({ accountId }, ...)` — and per
 * `auth.service.ts`'s registration flow, a `User` document is only
 * ever created for `individual`/`charity` roles. Vendors get a
 * completely separate `Vendor` document instead
 * (`createVendorProfile`). So a vendor calling this endpoint always
 * hits `User.findOneAndUpdate` finding NOTHING, which throws
 * `NotFoundError("User profile not found")` — a clean 404, every
 * single time, for every vendor, no exceptions. This isn't a role
 * restriction that could be reasoned around on the frontend; it's a
 * structural fact about the two roles living in different
 * collections. A real fix needs a new backend endpoint (e.g. `PATCH
 * /vendors/me/location`) that does not currently exist. Until one
 * does, Location here has to stay read-only.
 *
 * Location: the API only returns raw GeoJSON coordinates
 * (`{ type: "Point", coordinates: [lng, lat] }`), not a resolved
 * address — same gap noted elsewhere in this project (Discover Food's
 * cards, etc.). Shown here as formatted coordinates rather than the
 * Figma's placeholder-looking "Vendor location" text, since real data
 * exists and hiding it behind static placeholder copy would be worse
 * than showing what's actually available.
 *
 * ADDRESS — new, real field: `vendor.model.ts` now has a required
 * `address` string (vendor registration was updated to collect it —
 * see the auth flow), separate from the GeoJSON coordinates above.
 * `GET /vendors/me` returns it, so it's shown here as its own
 * read-only row rather than left out — same "show real data, nothing
 * invented" reasoning as everything else on this page.
 *
 * Header now matches every other vendor page (Dashboard, Confirm
 * Pickup, Create List): "• Jane's Kitchen" alongside the title. The
 * Figma (`profile_-_vendor_-_desktop.png`) always showed this — it
 * just hadn't been added here yet, the one inconsistency versus the
 * rest of the vendor experience. Fixed now since RecipientProfilePage
 * uses this file as its style baseline and shouldn't inherit a gap
 * this page itself no longer has.
 *
 * Analytics: `profile_viewed` fires on load. Not part of the original
 * Event Tracking Plan spreadsheet (profile viewing wasn't in that
 * 11-event list) — added here as a reasonable, consistently-named
 * addition, not something sourced from the plan. Worth confirming
 * with whoever owns that plan if it should be formally added.
 */
export default function ProfilePage() {
  const [phase, setPhase] = useState('loading'); // loading | error | success
  const [vendor, setVendor] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const account = getAccount();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setPhase('loading');
      try {
        const data = await getVendorMe();
        if (cancelled) return;
        setVendor(data.vendor);
        setPhase('success');
        trackEvent('profile_viewed', { vendor_id: account?.id });
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(err instanceof ApiError ? err.msg : err.message);
        setPhase('error');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const locationLabel = vendor?.location?.coordinates
    ? `${vendor.location.coordinates[1].toFixed(4)}, ${vendor.location.coordinates[0].toFixed(4)}`
    : 'Not set';

  return (
    <DashboardLayout renderSidebar={(onClose) => <AppNav onCloseMobile={onClose} />}>
      <div className="mx-auto max-w-xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-h4 font-bold text-ink">Profile</h1>
          {phase === 'success' && (
            <span className="flex items-center gap-2 text-body1 font-semibold text-ink">
              <span className="h-2.5 w-2.5 rounded-full bg-accent-green" aria-hidden="true" />
              {vendor.businessName}
            </span>
          )}
        </div>

        <div className="mt-4">
          {phase === 'loading' && <Loading title="Loading your profile…" description="Fetching your vendor details" />}

          {phase === 'error' && (
            <ErrorState
              title="Connection Interrupted"
              description={errorMessage}
              actionLabel="Try Again"
              onAction={() => window.location.reload()}
            />
          )}

          {phase === 'success' && (
            <div className="flex flex-col gap-4">
              <Input label="Business Name" value={vendor.businessName} readOnly />
              <Input label="Address" value={vendor.address || 'Not set'} readOnly />
              <Input label="Location" value={locationLabel} readOnly />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
