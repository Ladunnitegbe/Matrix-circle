import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx';
import AppNav from '../../components/AppNav/AppNav.jsx';
import Button from '../../components/Button/Button.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import { ForkKnifeIcon } from '../../components/Icon/Icon.jsx';
import { getAccount } from '../../lib/authStorage.js';
import { trackEvent } from '../../lib/analytics.js';

/**
 * Confirm Pickup — matches `confirm_pickup_-_vendor_-_desktop.png`:
 * a responsive grid of "Pending" cards (Claimed by / Claimed at /
 * live "Hold expires in" countdown / Confirm Pickup button).
 *
 * DATA SOURCE, stated plainly: this still can't be wired to a real
 * backend. `PATCH /listings/:id/confirm-pickup` is "Not Yet Available",
 * and — more fundamentally — there's still no way to know *which*
 * listings have a pending claim at all, since `POST /listings/:id/claim`
 * doesn't exist either and `GET /listings` only ever returns
 * `state: "active"` listings (never a claimed one). So unlike the
 * Dashboard (which combines two real endpoints), this screen has no
 * real data source available anywhere in the documented API.
 *
 * What's built instead: the full visual/interactive layer running on
 * local mock state — two seeded "pending" entries matching the Figma
 * exactly, each with a real, independently-ticking countdown (not
 * static text). Confirming a card removes it locally and fires the
 * `picked_up_confirmed` analytics event; nothing is persisted or sent
 * to a backend. Swap the mock seed + `handleConfirm`'s local removal
 * for a real fetch + `PATCH` call the moment both endpoints exist —
 * everything else (layout, countdown, empty state) is already real.
 *
 * Analytics: `picked_up_confirmed` fires on confirm, mirroring the
 * Event Tracking Plan's Frontend-fired "Vendor: 'Mark picked up'
 * button" event (this app's equivalent action). Property names follow
 * the same pattern as the plan's other events (`vendor_id`,
 * `listing_id`); `claim_id` is a mock placeholder here since no real
 * claim record exists yet — worth double-checking against the exact
 * tracking-plan spreadsheet once real claim IDs exist.
 */
const MOCK_PENDING = [
  { id: 'mock-1', listingId: 'mock-listing-1', claimedBy: 'Individual', claimedAtLabel: '3:40 pm', expiresInSeconds: 552 }, // 09:12
  { id: 'mock-2', listingId: 'mock-listing-2', claimedBy: 'Individual', claimedAtLabel: '3:40 pm', expiresInSeconds: 552 },
];

function formatCountdown(totalSeconds) {
  const clamped = Math.max(0, totalSeconds);
  const mm = String(Math.floor(clamped / 60)).padStart(2, '0');
  const ss = String(clamped % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function PendingCard({ item, onConfirm }) {
  const [secondsLeft, setSecondsLeft] = useState(item.expiresInSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const interval = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="bg-accent-green px-4 py-3 text-center text-body1 font-bold text-white">Pending</div>
      <div className="bg-secondary-light px-4 py-3">
        <div className="flex items-center justify-between border-b border-border py-2.5">
          <span className="text-body2 font-bold text-ink">Claimed by</span>
          <span className="text-body2 text-ink-muted">{item.claimedBy}</span>
        </div>
        <div className="flex items-center justify-between border-b border-border py-2.5">
          <span className="text-body2 font-bold text-ink">Claimed at</span>
          <span className="text-body2 text-ink-muted">{item.claimedAtLabel}</span>
        </div>
        <div className="flex items-center justify-between py-2.5">
          <span className="text-body2 font-bold text-ink">Hold expires in</span>
          <span className="text-body2 font-semibold text-ink">{formatCountdown(secondsLeft)}</span>
        </div>
      </div>
      <div className="bg-primary-light p-4">
        <Button color="accent" variant="solid" fullWidth onClick={() => onConfirm(item)} disabled={secondsLeft <= 0}>
          Confirm Pickup
        </Button>
      </div>
    </div>
  );
}

export default function ConfirmPickupPage() {
  const [pending, setPending] = useState(MOCK_PENDING);
  const account = getAccount();

  function handleConfirm(item) {
    trackEvent('picked_up_confirmed', {
      vendor_id: account?.id,
      listing_id: item.listingId,
      claim_id: item.id, // mock placeholder — see file-level note
    });
    setPending((prev) => prev.filter((p) => p.id !== item.id));
  }

  return (
    <DashboardLayout renderSidebar={(onClose) => <AppNav onCloseMobile={onClose} />}>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-h4 font-bold text-ink">Confirm Pickup</h1>

        <div className="mt-4">
          {pending.length === 0 ? (
            <EmptyState
              icon={<ForkKnifeIcon />}
              title="Nothing Awaiting Pickup"
              description="Claimed listings that are waiting for pickup confirmation will show up here."
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2">
              {pending.map((item) => (
                <PendingCard key={item.id} item={item} onConfirm={handleConfirm} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
