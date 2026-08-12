import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSyncExternalStore } from 'react';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout.jsx';
import AdminNav from '../../components/AdminNav/AdminNav.jsx';
import Card from '../../components/Card/Card.jsx';
import Badge from '../../components/Badge/Badge.jsx';
import Button from '../../components/Button/Button.jsx';
import Alert from '../../components/Alert/Alert.jsx';
import ErrorState from '../../components/ErrorState/ErrorState.jsx';
import { subscribe, getSnapshot, markApproved, rejectCharity } from '../../lib/mockCharities.js';
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
 * Approve calls the real backend endpoint
 * (`PATCH /api/admin/charities/:userId/verify` — documented, admin-
 * gated, and wired here via `api/admin.js`). It is NOT mocked. On
 * success, the local `mockCharities` store is updated to reflect the
 * new status (there's no `GET` endpoint to re-fetch from).
 *
 * Reject stays local-only — no backend endpoint exists for rejecting
 * a charity yet. See `lib/mockCharities.js` for the full breakdown of
 * what's real vs. mocked here.
 *
 * Analytics: `charity_review_viewed` fires once on load, and
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

  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState('');

  useEffect(() => {
    if (charity) {
      trackEvent('charity_review_viewed', { admin_id: account?.id, charity_id: charity.id, status: charity.status });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charity?.id]);

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
