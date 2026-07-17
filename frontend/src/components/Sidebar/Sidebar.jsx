import './Sidebar.css';
import { LeafIcon } from '../Icon/Icon.jsx';

export default function Sidebar({ groups, current, onSelect }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">
          <LeafIcon stroke="white" />
        </div>
        <div className="sidebar-brand-name">FoodShare</div>
      </div>
      <p className="sidebar-brand-sub">Component library · Lagos pilot</p>

      {groups.map((group) => (
        <div className="sidebar-group" key={group.label}>
          <p className="sidebar-group-label">{group.label}</p>
          {group.screens.map((screen) => (
            <button
              key={screen.key}
              className={`sidebar-nav-btn ${screen.key === current ? 'sidebar-nav-active' : ''}`}
              onClick={() => onSelect(screen.key)}
            >
              <span>{screen.label}</span>
              <span className="sidebar-nav-dot" />
            </button>
          ))}
        </div>
      ))}

      <div className="sidebar-footer">
        Green = trust &amp; vendor actions.
        <br />
        Orange = time-pressure &amp; claim actions.
        <br />
        Every component ships with its own .css file — nothing lives in App.css.
      </div>
    </aside>
  );
}
