import { useSyncExternalStore } from 'react';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx';
import AdminNav from '../../components/AdminNav/AdminNav.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import { ShieldIcon } from '../../components/Icon/Icon.jsx';
import { subscribe, getSnapshot } from '../../lib/mockCharities.js';

/**
 * Admin — Summary. Matches the second "Admin" table screenshot: same
 * columns plus a green "Status" column. Shows charities that have
 * already been decided (approved or rejected) — the reviewed history,
 * as distinct from Review's pending queue.
 */
const STATUS_LABEL = { approved: 'Approved', rejected: 'Rejected' };
const STATUS_CLASS = { approved: 'text-accent-green font-bold', rejected: 'text-danger font-bold' };

export default function AdminSummaryPage() {
  const charities = useSyncExternalStore(subscribe, getSnapshot);
  const decided = charities.filter((c) => c.status !== 'pending');

  return (
    <DashboardLayout renderSidebar={(onClose) => <AdminNav onCloseMobile={onClose} />}>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-h4 font-bold text-ink">Admin</h1>

        <div className="mt-4">
          {decided.length === 0 ? (
            <EmptyState
              icon={<ShieldIcon width={26} height={26} />}
              title="No Decisions Yet"
              description="Charities you've approved or rejected will show up here."
            />
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <div className="grid grid-cols-4 gap-4 bg-accent-green px-4 py-3 text-body2 font-bold text-white">
                <span>Charity</span>
                <span>Reg number</span>
                <span>Sign up</span>
                <span>Status</span>
              </div>
              {decided.map((charity) => (
                <div key={charity.id} className="grid grid-cols-4 items-center gap-4 border-t border-border px-4 py-3 text-body2">
                  <span className="font-semibold text-ink">{charity.name}</span>
                  <span className="text-ink-muted">{charity.regNumber}</span>
                  <span className="text-ink-muted">{charity.signUpDate}</span>
                  <span className={STATUS_CLASS[charity.status]}>{STATUS_LABEL[charity.status]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
