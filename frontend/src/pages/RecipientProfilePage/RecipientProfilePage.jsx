import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx';
import AppNav from '../../components/AppNav/AppNav.jsx';
import Input from '../../components/Input/Input.jsx';
import LocationField from '../../components/LocationField/LocationField.jsx';
import Button from '../../components/Button/Button.jsx';
import Loading from '../../components/Loading/Loading.jsx';
import ErrorState from '../../components/ErrorState/ErrorState.jsx';
import { getUserMe, updateUserLocation } from '../../api/users.js';
import { getAccount } from '../../lib/authStorage.js';
import { ApiError } from '../../lib/apiClient.js';
import { trackEvent } from '../../lib/analytics.js';
import { useToast } from '../../components/Toast/ToastProvider.jsx';

const ACCOUNT_TYPE_LABEL = { individual: 'Individual', charity: 'Charity' };

/**
 * Profile (individual/charity) — there's no dedicated Figma frame for
 * this screen: `profile_-_recipient_-_desktop.png` shows only the
 * page chrome (sidebar with "Profile" active, "Profile" header) and a
 * completely empty content area — the frame itself was never
 * finished. Per direction, this uses the vendor `ProfilePage` as the
 * style baseline: same header, same `Input` read-only row styling,
 * same `phase`-based load pattern, same max-width container.
 *
 * NOT A PURE COPY, for one real reason: unlike vendors (no
 * profile-update endpoint exists at all — see `ProfilePage`'s own
 * comment on why that page is fully read-only), individual/charity
 * accounts have a genuine, working `PATCH /users/me/location`
 * (`user.route.ts`) — and, unlike vendors, registration for these two
 * roles never captures a location at all (`auth.service.ts`'s
 * `createUserProfile` call passes none). So Location here isn't
 * styled to just look editable — it actually is, via the same
 * `LocationField` component (this is that component's correct,
 * original context: "tap to use current location" against a location
 * a person doesn't have yet, as opposed to CreateListPage, which
 * doesn't use it anymore for exactly this reason).
 *
 * Charity-only fields (Reg Number, verification status) only render
 * for `accountType === 'charity'` — real fields the API returns for
 * charity accounts, not shown for individual accounts, which don't
 * have them. The verification pill reuses the same visual language as
 * the "Pending verification" screen in ClaimFoodPage's blocked state.
 *
 * ROUTING NOTE: this needed a new route (`/profile`, unprefixed —
 * matching how Discover/Claim/Release already aren't `/vendor`-
 * namespaced) and `RequireAuth` needed to accept an array of roles
 * (`['individual', 'charity']`) since this is the first route two
 * different roles both need and a third (`vendor`) doesn't — see
 * `RequireAuth.jsx` and `App.jsx`.
 *
 * Analytics: `profile_viewed` reuses the exact event name vendor's
 * ProfilePage already fires — same real-world action (viewing your
 * own profile), just from a different account type; `role`
 * distinguishes them instead of inventing a second event name.
 * `profile_location_updated` is new — vendor's page has no editable
 * action to reuse a name from. Neither is part of the original Event
 * Tracking Plan — same extension caveat as everywhere else in this
 * project.
 */
export default function RecipientProfilePage() {
  const { showToast } = useToast();
  const account = getAccount();

  const [phase, setPhase] = useState('loading'); // loading | error | success
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [draftLocation, setDraftLocation] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setPhase('loading');
      try {
        const data = await getUserMe();
        if (cancelled) return;
        setUser(data.user);
        setPhase('success');
        trackEvent('profile_viewed', { user_id: account?.id, role: account?.role });
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

  function handleLocate(coords) {
    setDraftLocation(coords);
    setDirty(true);
    setSaveError('');
  }

  async function handleSaveLocation() {
    setSaving(true);
    setSaveError('');
    try {
      const data = await updateUserLocation([draftLocation.lng, draftLocation.lat]);
      setUser(data.user);
      setDirty(false);
      trackEvent('profile_location_updated', { user_id: account?.id, role: account?.role });
      showToast({ tone: 'success', message: 'Location updated.' });
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.msg : 'Could not update your location. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const storedLocation = user?.location?.coordinates
    ? { lat: user.location.coordinates[1], lng: user.location.coordinates[0] }
    : null;
  const isCharity = user?.accountType === 'charity';

  return (
    <DashboardLayout renderSidebar={(onClose) => <AppNav onCloseMobile={onClose} />}>
      <div className="mx-auto max-w-xl">
        <h1 className="text-h4 font-bold text-ink">Profile</h1>

        <div className="mt-4">
          {phase === 'loading' && <Loading title="Loading your profile…" description="Fetching your account details" />}

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
              <Input label="Name" value={user.name} readOnly />
              <Input label="Account Type" value={ACCOUNT_TYPE_LABEL[user.accountType] || user.accountType} readOnly />

              {isCharity && (
                <>
                  <Input label="Reg Number" value={user.charityRegNumber || 'Not set'} readOnly />
                  <div>
                    <p className="text-body2 font-bold text-ink">Verification Status</p>
                    <span
                      className={[
                        'mt-1.5 inline-flex items-center rounded-pill px-2.5 py-1 text-caption font-bold',
                        user.charityVerifiedAt ? 'bg-accent-green-light text-accent-green-dark' : 'bg-accent-orange-light text-accent-orange',
                      ].join(' ')}
                    >
                      {user.charityVerifiedAt ? 'Verified' : 'Pending verification'}
                    </span>
                  </div>
                </>
              )}

              <LocationField
                label="Location"
                value={draftLocation || storedLocation}
                onLocate={handleLocate}
                caption1={saveError || (!storedLocation && !draftLocation ? 'Not set yet — tap to use your current location.' : undefined)}
                error={Boolean(saveError)}
              />

              {dirty && (
                <Button color="accent" variant="solid" loading={saving} disabled={saving} onClick={handleSaveLocation} className="self-start">
                  Save Location
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
