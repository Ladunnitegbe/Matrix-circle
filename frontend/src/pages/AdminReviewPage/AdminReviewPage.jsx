import { useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx';
import AdminNav from '../../components/AdminNav/AdminNav.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import { ShieldIcon } from '../../components/Icon/Icon.jsx';
import { subscribe, getSnapshot } from '../../lib/mockCharities.js';

/**
 * Admin — Review Charity Orgs. Matches the "Admin" table screenshot:
 * dark green header row, Charity / Reg number / Sign up / Review
 * columns. Shows only `pending` charities — approved/rejected ones
 * move to Summary. The list itself comes from `mockCharities`,
 * because there's no `GET` endpoint yet to list charities pending
 * review — not because charity verification is unbuilt. Approving a
 * charity (on the detail page this links to) calls the real backend
 * endpoint; see `lib/mockCharities.js` for the full breakdown.
 */
export default function AdminReviewPage() {
  const charities = useSyncExternalStore(subscribe, getSnapshot);
  const pending = charities.filter((c) => c.status === 'pending');

  return (
    <DashboardLayout renderSidebar={(onClose) => <AdminNav onCloseMobile={onClose} />}>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-h4 font-bold text-ink">Admin</h1>

        <div className="mt-4">
          {pending.length === 0 ? (
            <EmptyState
              icon={<ShieldIcon width={26} height={26} />}
              title="Nothing to Review"
              description="No charity organizations are currently pending verification."
            />
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <div className="grid grid-cols-4 gap-4 bg-accent-green px-4 py-3 text-body2 font-bold text-white">
                <span>Charity</span>
                <span>Reg number</span>
                <span>Sign up</span>
                <span className="text-right">&nbsp;</span>
              </div>
              {pending.map((charity) => (
                <div key={charity.id} className="grid grid-cols-4 items-center gap-4 border-t border-border px-4 py-3 text-body2">
                  <span className="font-semibold text-ink">{charity.name}</span>
                  <span className="text-ink-muted">{charity.regNumber}</span>
                  <span className="text-ink-muted">{charity.signUpDate}</span>
                  <Link to={`/admin/charities/${charity.id}`} className="text-right font-bold text-accent-orange hover:text-accent-orange-normal-hover">
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
