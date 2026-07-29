import './StatusTag.css';

const LABELS = {
  claimed: 'CLAIMED',
  discarded: 'DISCARDED',
  live: 'LIVE',
  pending: 'PENDING',
  awaiting: 'AWAITING PICKUP',
};

/** StatusTag — small state chip used on vendor dashboard listing rows. */
export default function StatusTag({ status }) {
  return <span className={`status-tag status-tag-${status}`}>{LABELS[status] || status}</span>;
}
