import { useEffect, useState, useSyncExternalStore } from 'react';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx';
import AdminNav from '../../components/AdminNav/AdminNav.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import Loading from '../../components/Loading/Loading.jsx';
import ErrorState from '../../components/ErrorState/ErrorState.jsx';
import { ShieldIcon } from '../../components/Icon/Icon.jsx';
import { subscribe, getSnapshot, loadPendingCharities, hasLoaded } from '../../lib/mockCharities.js';
import { getAccount } from '../../lib/authStorage.js';
import { trackEvent } from '../../lib/analytics.js';
import { ApiError } from '../../lib/apiClient.js';

/**
 * Admin — Summary. Matches the second "Admin" table screenshot: same
 * columns plus a green "Status" column. Shows charities that have
 * already been decided (approved or rejected) — the reviewed history,
 * as distinct from Review's pending queue.
 *
 * STILL LOCAL-ONLY, unlike Review: there's no backend endpoint that
 * returns decided charities — `GET /admin/charities/pending` (the one
 * real list endpoint) is scoped to pending only. So "decided" here
 * means "decided in this browser session," not a durable record — see
 * `lib/mockCharities.js`'s header comment for the full reasoning.
 * This page still fetches on mount (only if the store hasn't loaded
 * yet this session — no need to refetch if Review already did) purely
 * so a charity that was approved elsewhere is correctly inferred as
 * 'approved' rather than just missing, which requires the pending
 * list to have loaded at least once.
 *
 * Analytics: `admin_summary_viewed` fires once on load, same
 * extension caveat as `admin_review_viewed` in AdminReviewPage.
 */
const STATUS_LABEL = { approved: 'Approved', rejected: 'Rejected' };
const STATUS_CLASS = { approved: 'text-accent-green font-bold', rejected: 'text-danger font-bold' };

export default function AdminSummaryPage() {
  const account = getAccount();
  const charities = useSyncExternalStore(subscribe, getSnapshot);
  const decided = charities.filter((c) => c.status !== 'pending');

  const [phase, setPhase] = useState(hasLoaded() ? 'success' : 'loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (hasLoaded()) {
        setPhase('success');
        trackEvent('admin_summary_viewed', { admin_id: account?.id, decided_count: getSnapshot().filter((c) => c.status !== 'pending').length });
        return;
      }
      setPhase('loading');
      try {
        await loadPendingCharities();
        if (cancelled) return;
        setPhase('success');
        trackEvent('admin_summary_viewed', { admin_id: account?.id, decided_count: getSnapshot().filter((c) => c.status !== 'pending').length });
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

  return (
    <DashboardLayout renderSidebar={(onClose) => <AdminNav onCloseMobile={onClose} />}>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-h4 font-bold text-ink">Admin</h1>

        <div className="mt-4">
          {phase === 'loading' && (
            <Loading title="Loading charity history…" description="Fetching your review history" />
          )}

          {phase === 'error' && (
            <ErrorState
              title="Connection Interrupted"
              description={errorMessage}
              actionLabel="Try Again"
              onAction={() => window.location.reload()}
            />
          )}

          {phase === 'success' && (
            decided.length === 0 ? (
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
            )
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
