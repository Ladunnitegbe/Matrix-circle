import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx';
import AppNav from '../../components/AppNav/AppNav.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import { LockIcon } from '../../components/Icon/Icon.jsx';

/**
 * Confirm Pickup — reachable from the vendor sidebar, but genuinely
 * has nothing to show yet. Two backend pieces are both missing:
 *   - `PATCH /listings/:id/confirm-pickup` (explicitly "Not Yet
 *     Available" in the API docs)
 *   - Any way to know *which* listings have a pending claim at all —
 *     `POST /listings/:id/claim` doesn't exist either, so there's no
 *     data source for "awaiting pickup confirmation" to begin with.
 *
 * This is a harder gap than the Dashboard's: that page could combine
 * two endpoints that *do* exist (`GET /vendors/me` + `GET /listings`)
 * into something real. There's no equivalent combination here — every
 * endpoint this page would need is unbuilt. Rather than fabricate a
 * fake list of "pending" items, this stays an honest placeholder.
 */
export default function ConfirmPickupPage() {
  return (
    <DashboardLayout renderSidebar={(onClose) => <AppNav onCloseMobile={onClose} />}>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-h4 font-bold text-ink">Confirm Pickup</h1>
        <div className="mt-4">
          <EmptyState
            icon={<LockIcon />}
            title="Not Available Yet"
            description="Pickup confirmation depends on claim data from the backend, and claiming isn't implemented yet. This screen will show your listings awaiting pickup confirmation once both are live."
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
