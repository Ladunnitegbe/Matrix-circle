import './StateSwitcher.css';

export default function StateSwitcher({ variants, current, onChange }) {
  if (!variants || variants.length < 2) return null;
  return (
    <div className="state-switcher">
      {variants.map((v) => (
        <button
          key={v.key}
          className={`state-switcher-pill ${v.key === current ? 'state-switcher-active' : ''}`}
          onClick={() => onChange(v.key)}
        >
          {v.label}
          {v.tag && <span className="state-switcher-tag">{v.tag}</span>}
        </button>
      ))}
    </div>
  );
}
