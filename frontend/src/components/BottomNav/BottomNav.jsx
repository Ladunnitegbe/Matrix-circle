import './BottomNav.css';
import { PlusCircleIcon, CompassIcon, GridIcon } from '../Icon/Icon.jsx';

const TABS = [
  { key: 'vendor-listing', label: 'List', Icon: PlusCircleIcon },
  { key: 'feed', label: 'Nearby', Icon: CompassIcon },
  { key: 'vendor-dashboard', label: 'Dashboard', Icon: GridIcon },
];

export default function BottomNav({ current, onSelect }) {
  return (
    <nav className="bottom-nav">
      {TABS.map(({ key, label, Icon }) => (
        <button
          key={key}
          className={`bottom-nav-btn ${current === key ? 'bottom-nav-active' : ''}`}
          onClick={() => onSelect(key)}
        >
          <Icon />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
