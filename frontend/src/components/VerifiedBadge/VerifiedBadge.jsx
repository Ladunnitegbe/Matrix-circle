import './VerifiedBadge.css';
import { ShieldIcon } from '../Icon/Icon.jsx';

/** VerifiedBadge — the only visual differentiator for a charity account (US-8). */
export default function VerifiedBadge({ label = 'Verified charity' }) {
  return (
    <span className="verified-badge">
      <ShieldIcon />
      {label}
    </span>
  );
}
