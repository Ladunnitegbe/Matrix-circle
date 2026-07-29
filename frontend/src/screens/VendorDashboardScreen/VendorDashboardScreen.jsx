import { useEffect, useState } from 'react';
import './VendorDashboardScreen.css';
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader.jsx';
import ScreenContainer from '../../components/ScreenContainer/ScreenContainer.jsx';
import Skeleton from '../../components/Skeleton/Skeleton.jsx';
import StatCard from '../../components/StatCard/StatCard.jsx';
import StatusTag from '../../components/StatusTag/StatusTag.jsx';
import Button from '../../components/Button/Button.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import FullError from '../../components/FullError/FullError.jsx';
import { BoxIcon } from '../../components/Icon/Icon.jsx';

const BASE_LISTINGS = [
  { name: 'Meat pies (18)', meta: '18 units · 5:10 PM', status: 'discarded' },
  { name: 'Bread loaves', meta: '12 loaves · 8:00 PM', status: 'live' },
];

export default function VendorDashboardScreen({ extraListings = [], awaitingPickup, claimedCount, onOpenPickup }) {
  const [phase, setPhase] = useState('loading'); // loading | success | empty | error
  const [rows, setRows] = useState([]);

  function fetchData(allowFail) {
    setPhase('loading');
    setTimeout(() => {
      if (allowFail && Math.random() < 0.25) {
        setPhase('error');
        return;
      }
      const liveRows = extraListings.map((l) => ({ name: l.item, meta: `${l.qty} · just now`, status: 'live' }));
      setRows([...liveRows, ...BASE_LISTINGS]);
      setPhase('success');
    }, 700);
  }

  useEffect(() => {
    fetchData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extraListings.length]);

  const discarded = rows.filter((r) => r.status === 'discarded').length + 3;
  const nothingToShow = rows.length === 0 && !awaitingPickup;

  if (phase === 'loading') {
    return (
      <ScreenContainer className="vendor-dashboard-screen">
        <ScreenHeader title="Dashboard" />
        <div className="vendor-dashboard-stats">
          <div className="vendor-dashboard-stat-skeleton">
            <Skeleton height="26px" width="40px" />
            <Skeleton height="11px" width="70px" />
          </div>
          <div className="vendor-dashboard-stat-skeleton">
            <Skeleton height="26px" width="40px" />
            <Skeleton height="11px" width="70px" />
          </div>
        </div>
        <p className="vendor-dashboard-section-label">Today's listings</p>
        {[1, 2, 3].map((i) => (
          <div className="vendor-dashboard-row-skeleton" key={i}>
            <Skeleton height="16px" width="70%" />
            <Skeleton height="12px" width="40%" />
          </div>
        ))}
      </ScreenContainer>
    );
  }

  if (phase === 'error') {
    return (
      <ScreenContainer className="vendor-dashboard-screen">
        <ScreenHeader title="Dashboard" />
        <FullError
          title="Couldn't load your dashboard"
          description="Something went wrong on our end. Your listings are safe — this is just a display issue."
          onRetry={() => fetchData(true)}
        />
      </ScreenContainer>
    );
  }

  if (nothingToShow) {
    return (
      <ScreenContainer className="vendor-dashboard-screen">
        <ScreenHeader title="Dashboard" />
        <EmptyState
          icon={<BoxIcon />}
          title="No listings today yet"
          description="Post your first surplus item and your claimed-vs-discarded counts will show up here in real time."
          action={<Button variant="orange">Post a listing</Button>}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="vendor-dashboard-screen">
      <ScreenHeader
        title="Dashboard"
        right={
          <button className="vendor-dashboard-refresh" onClick={() => fetchData(true)}>
            Refresh
          </button>
        }
      />
      <div className="vendor-dashboard-stats">
        <StatCard value={claimedCount} label="Claimed today" color="green" />
        <StatCard value={discarded} label="Discarded today" color="orange" />
      </div>
      <p className="vendor-dashboard-section-label">Today's listings</p>

      {awaitingPickup && (
        <div className="vendor-dashboard-row vendor-dashboard-row-awaiting">
          <div className="vendor-dashboard-row-top">
            <div>
              <p className="vendor-dashboard-row-name">{awaitingPickup.item}</p>
              <p className="vendor-dashboard-row-meta">{awaitingPickup.vendorNote}</p>
            </div>
            <StatusTag status="awaiting" />
          </div>
          <Button variant="primary" onClick={onOpenPickup}>
            Confirm pickup
          </Button>
        </div>
      )}

      {rows.map((row, i) => (
        <div className="vendor-dashboard-row" key={row.name + i}>
          <div>
            <p className="vendor-dashboard-row-name">{row.name}</p>
            <p className="vendor-dashboard-row-meta">{row.meta}</p>
          </div>
          <StatusTag status={row.status} />
        </div>
      ))}
    </ScreenContainer>
  );
}
