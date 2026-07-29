import './StatCard.css';

/** StatCard — claimed-vs-discarded counters on the vendor dashboard (US-3). */
export default function StatCard({ value, label, color = 'green' }) {
  return (
    <div className="stat-card">
      <div className={`stat-card-num stat-card-${color}`}>{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}
