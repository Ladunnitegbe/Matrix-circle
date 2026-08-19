import { useEffect, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx';
import AdminNav from '../../components/AdminNav/AdminNav.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import Loading from '../../components/Loading/Loading.jsx';
import ErrorState from '../../components/ErrorState/ErrorState.jsx';
import { ShieldIcon } from '../../components/Icon/Icon.jsx';
import { subscribe, getSnapshot, loadPendingCharities } from '../../lib/mockCharities.js';
import { getAccount } from '../../lib/authStorage.js';
import { trackEvent } from '../../lib/analytics.js';
import { ApiError } from '../../lib/apiClient.js';

/**
 * Admin — Review Charity Orgs. Matches the "Admin" table screenshot:
 * dark green header row, Charity / Reg number / Sign up / Review
 * columns. Shows only `pending` charities — approved/rejected ones
 * move to Summary.
 *
 * REAL DATA NOW: the list comes from `GET /admin/charities/pending`
 * (via `loadPendingCharities` in `lib/mockCharities.js`), which
 * didn't exist when this page was first built — it used to read a
 * hardcoded local list, which is also what caused a 500 on approve
 * (fake ids reaching a real endpoint; see that file's header comment
 * for the full trace). Approving a charity (on the detail page this
 * links to) calls the real backend endpoint too — see
 * `lib/mockCharities.js` for the full breakdown of what's real vs.
 * still local-only (rejecting a charity still has no backend support
 * at all).
 *
 * Analytics: `admin_review_viewed` now fires after the real fetch
 * resolves (was fire-on-mount against hardcoded data before — moved
 * so `pending_count` reflects what actually loaded, not a guess).
 * `charity_review_opened` fires when an admin clicks through to a
 * specific charity. Neither is part of the original Event Tracking
 * Plan — same extension caveat already noted on
 * `charity_approved`/`charity_rejected` in AdminCharityDetailPage.
 */
export default function AdminReviewPage() {
  const account = getAccount();
  const charities = useSyncExternalStore(subscribe, getSnapshot);
  const pending = charities.filter((c) => c.status === 'pending');

  const [phase, setPhase] = useState('loading'); // loading | error | success
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setPhase('loading');
      try {
        await loadPendingCharities();
        if (cancelled) return;
        setPhase('success');
        trackEvent('admin_review_viewed', { admin_id: account?.id, pending_count: getSnapshot().filter((c) => c.status === 'pending').length });
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
            <Loading title="Loading pending charities…" description="Fetching charities awaiting verification" />
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
            pending.length === 0 ? (
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
                  <Link
                    to={`/admin/charities/${charity.id}`}
                    onClick={() => trackEvent('charity_review_opened', { admin_id: account?.id, charity_id: charity.id })}
                    className="text-right font-bold text-accent-orange hover:text-accent-orange-normal-hover"
                  >
                    Review
                  </Link>
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
