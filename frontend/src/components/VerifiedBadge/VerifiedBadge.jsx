import './VerifiedBadge.css';
import { ShieldIcon } from '../Icon/Icon.jsx';

export default function VerifiedBadge({ label = 'Verified charity' }) {
  return (
    <span className="verified-badge">
      <ShieldIcon />
      {label}
    </span>
  );
}
