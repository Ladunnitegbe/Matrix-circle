import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSyncExternalStore } from 'react';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx';
import AdminNav from '../../components/AdminNav/AdminNav.jsx';
import Card from '../../components/Card/Card.jsx';
import Badge from '../../components/Badge/Badge.jsx';
import Button from '../../components/Button/Button.jsx';
import Alert from '../../components/Alert/Alert.jsx';
import Loading from '../../components/Loading/Loading.jsx';
import ErrorState from '../../components/ErrorState/ErrorState.jsx';
import { subscribe, getSnapshot, loadPendingCharities, hasLoaded, markApproved, rejectCharity } from '../../lib/mockCharities.js';
import { verifyCharity } from '../../api/admin.js';
import { getAccount } from '../../lib/authStorage.js';
import { trackEvent } from '../../lib/analytics.js';
import { ApiError } from '../../lib/apiClient.js';

const STATUS_TONE = { pending: 'accent', approved: 'secondary', rejected: 'neutral' };
const STATUS_LABEL = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };

/**
 * Admin — charity review detail. Matches the "Grace Foundation" card:
 * Reg number / Signed up / Status, then Approve (solid) / Reject
 * (outlined) actions.
 *
 * FETCHES ON MOUNT NOW IF NEEDED — the old version assumed the store
 * was already populated synchronously (it was hardcoded data, so it
 * always was). Now that the store is fetch-backed
 * (`lib/mockCharities.js`), a direct page load or refresh on this
 * route lands here with an empty store, which would incorrectly show
 * "Charity Not Found" for a perfectly real charity. Now: if the
 * store hasn't loaded this session, or has loaded but doesn't (yet)
 * contain this specific charity, this page calls
 * `loadPendingCharities()` itself before deciding the charity
 * genuinely doesn't exist.
 *
 * Approve calls the real backend endpoint
 * (`PATCH /api/admin/charities/:userId/verify` — documented, admin-
 * gated, and wired here via `api/admin.js`). It is NOT mocked. On
 * success, the local store is updated to reflect the new status —
 * there's still no `GET /admin/charities/:id` to re-fetch a single
 * charity from, only the pending-list endpoint.
 *
 * Reject stays local-only — no backend endpoint exists for rejecting
 * a charity yet. See `lib/mockCharities.js` for the full breakdown of
 * what's real vs. mocked here.
 *
 * Analytics: `charity_review_viewed` fires once the charity is
 * actually available (after any needed fetch resolves), and
 * `charity_approved` / `charity_rejected` fire on action. None of
 * this is part of the original Event Tracking Plan (that plan didn't
 * cover an admin surface at all) — added as reasonable, consistently
 * named extensions, same caveat as `profile_viewed` and
 * `picked_up_confirmed` before it.
 */
export default function AdminCharityDetailPage() {
  const { charityId } = useParams();
  const navigate = useNavigate();
  const account = getAccount();
  const charities = useSyncExternalStore(subscribe, getSnapshot);
  const charity = charities.find((c) => c.id === charityId);

  const [phase, setPhase] = useState('loading'); // loading | error | success
  const [errorMessage, setErrorMessage] = useState('');
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function ensureLoaded() {
      if (hasLoaded() && getSnapshot().some((c) => c.id === charityId)) {
        setPhase('success');
        return;
      }
      setPhase('loading');
      try {
        await loadPendingCharities();
        if (cancelled) return;
        setPhase('success');
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(err instanceof ApiError ? err.msg : err.message);
        setPhase('error');
      }
    }

    ensureLoaded();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charityId]);

  useEffect(() => {
    if (phase === 'success' && charity) {
      trackEvent('charity_review_viewed', { admin_id: account?.id, charity_id: charity.id, status: charity.status });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, charity?.id]);

  if (phase === 'loading') {
    return (
      <DashboardLayout renderSidebar={(onClose) => <AdminNav onCloseMobile={onClose} />}>
        <div className="mx-auto max-w-4xl">
          <h1 className="text-h4 font-bold text-ink">Admin</h1>
          <div className="mt-4">
            <Loading title="Loading charity…" description="Fetching this charity's verification details" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (phase === 'error') {
    return (
      <DashboardLayout renderSidebar={(onClose) => <AdminNav onCloseMobile={onClose} />}>
        <div className="mx-auto max-w-4xl">
          <h1 className="text-h4 font-bold text-ink">Admin</h1>
          <div className="mt-4">
            <ErrorState title="Connection Interrupted" description={errorMessage} actionLabel="Try Again" onAction={() => window.location.reload()} />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!charity) {
    return (
      <DashboardLayout renderSidebar={(onClose) => <AdminNav onCloseMobile={onClose} />}>
        <div className="mx-auto max-w-4xl">
          <h1 className="text-h4 font-bold text-ink">Admin</h1>
          <div className="mt-4">
            <ErrorState title="Charity Not Found" description="This charity organization doesn't exist or has already been removed." actionLabel="Back to Review" onAction={() => navigate('/admin')} />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  async function handleApprove() {
    setApproveError('');
    setApproving(true);
    try {
      await verifyCharity(charity.id);
      markApproved(charity.id);
      trackEvent('charity_approved', { admin_id: account?.id, charity_id: charity.id });
      navigate('/admin');
    } catch (err) {
      setApproveError(
        err instanceof ApiError ? err.msg : 'Something went wrong approving this charity. Please try again.'
      );
    } finally {
      setApproving(false);
    }
  }

  function handleReject() {
    rejectCharity(charity.id);
    trackEvent('charity_rejected', { admin_id: account?.id, charity_id: charity.id });
    navigate('/admin');
  }

  return (
    <DashboardLayout renderSidebar={(onClose) => <AdminNav onCloseMobile={onClose} />}>
      <div className="mx-auto max-w-md">
        <h1 className="text-h4 font-bold text-ink">Admin</h1>

        {approveError && (
          <Alert tone="error" className="mt-4">
            {approveError}
          </Alert>
        )}

        <Card padding="md" className="mt-4">
          <p className="text-sh2 font-bold text-ink">{charity.name}</p>

          <div className="mt-3 flex items-center justify-between border-b border-border py-2.5">
            <span className="text-body2 font-bold text-ink">Reg number</span>
            <span className="text-body2 text-ink-muted">{charity.regNumber}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border py-2.5">
            <span className="text-body2 font-bold text-ink">Signed up</span>
            <span className="text-body2 text-ink-muted">{charity.signUpDate}</span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-body2 font-bold text-ink">Status</span>
            <Badge tone={STATUS_TONE[charity.status]}>{STATUS_LABEL[charity.status]}</Badge>
          </div>

          {charity.status === 'pending' && (
            <div className="mt-4 flex flex-col gap-3 tablet:flex-row">
              <Button color="secondary" variant="solid" fullWidth loading={approving} disabled={approving} onClick={handleApprove}>
                Approve
              </Button>
              <Button color="accent" variant="outlined" fullWidth disabled={approving} onClick={handleReject}>
                Reject
              </Button>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
