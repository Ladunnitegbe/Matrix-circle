import './StatusTag.css';

const LABELS = {
  claimed: 'CLAIMED',
  discarded: 'DISCARDED',
  live: 'LIVE',
  pending: 'PENDING',
};

export default function StatusTag({ status }) {
  return <span className={`status-tag status-tag-${status}`}>{LABELS[status] || status}</span>;
}
