import { useEffect, useState } from 'react';
import './VendorDashboardScreen.css';
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader.jsx';
import Skeleton from '../../components/Skeleton/Skeleton.jsx';
import StatCard from '../../components/StatCard/StatCard.jsx';
import StatusTag from '../../components/StatusTag/StatusTag.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import FullError from '../../components/FullError/FullError.jsx';
import Button from '../../components/Button/Button.jsx';
import { BoxIcon } from '../../components/Icon/Icon.jsx';

const BASE_LISTINGS = [
  { name: 'Jollof rice trays', meta: '6 portions · 6:40 PM', status: 'claimed' },
  { name: 'Meat pies (18)', meta: '18 units · 5:10 PM', status: 'discarded' },
  { name: 'Bread loaves', meta: '12 loaves · 8:00 PM', status: 'live' },
];

export default function VendorDashboardScreen({ extraListings = [] }) {
  const [phase, setPhase] = useState('loading'); 
  const [rows, setRows] = useState([]);

  function fetchData(allowFail) {
    setPhase('loading');
    setTimeout(() => {
      if (allowFail && Math.random() < 0.25) {
        setPhase('error');
        return;
      }
      const liveRows = extraListings.map((l) => ({ name: l.item, meta: `${l.qty} · just now`, status: 'live' }));
      const all = [...liveRows, ...BASE_LISTINGS];
      setRows(all);
      setPhase(all.length === 0 ? 'empty' : 'success');
    }, 700);
  }

  useEffect(() => {
    fetchData(false);
  }, [extraListings.length]);

  const claimed = rows.filter((r) => r.status === 'claimed').length + 14;
  const discarded = rows.filter((r) => r.status === 'discarded').length + 3;

  if (phase === 'loading') {
    return (
      <div className="vendor-dashboard-screen">
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
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="vendor-dashboard-screen">
        <ScreenHeader title="Dashboard" />
        <FullError
          title="Couldn't load your dashboard"
          description="Something went wrong on our end. Your listings are safe — this is just a display issue."
          onRetry={() => fetchData(true)}
        />
      </div>
    );
  }

  if (phase === 'empty') {
    return (
      <div className="vendor-dashboard-screen">
        <ScreenHeader title="Dashboard" />
        <EmptyState
          icon={<BoxIcon />}
          title="No listings today yet"
          description="Post your first surplus item and your claimed-vs-discarded counts will show up here in real time."
          action={<Button variant="orange">Post a listing</Button>}
        />
      </div>
    );
  }

  return (
    <div className="vendor-dashboard-screen">
      <ScreenHeader
        title="Dashboard"
        right={
          <button className="vendor-dashboard-refresh" onClick={() => fetchData(true)}>
            Refresh
          </button>
        }
      />
      <div className="vendor-dashboard-stats">
        <StatCard value={claimed} label="Claimed today" color="green" />
        <StatCard value={discarded} label="Discarded today" color="orange" />
      </div>
      <p className="vendor-dashboard-section-label">Today's listings</p>
      {rows.map((row, i) => (
        <div className="vendor-dashboard-row" key={row.name + i}>
          <div>
            <p className="vendor-dashboard-row-name">{row.name}</p>
            <p className="vendor-dashboard-row-meta">{row.meta}</p>
          </div>
          <StatusTag status={row.status} />
        </div>
      ))}
    </div>
  );
}
