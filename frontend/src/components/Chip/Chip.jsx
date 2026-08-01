import { XIcon } from '../Icon/Icon.jsx';
export default function Chip({ label, selected = false, onClick, onRemove, disabled = false, className = '' }) {
  const base = 'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-caption font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange';
  const tone = selected ? 'bg-accent-orange text-white border-accent-orange' : 'bg-transparent text-ink border-border hover:border-accent-orange';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  if (!onRemove) {
    return (
      <button type="button" onClick={onClick} disabled={disabled} aria-pressed={selected} className={[base, tone, disabledClasses, className].filter(Boolean).join(' ')}>
        {label}
      </button>
    );
  }
  return (
    <span className={[base, tone, disabledClasses, className].filter(Boolean).join(' ')}>
      <button type="button" onClick={onClick} disabled={disabled} aria-pressed={selected} className="focus-visible:outline-none">{label}</button>
      <button type="button" onClick={onRemove} disabled={disabled} aria-label={`Remove ${label}`} className="focus-visible:outline-none">
        <XIcon width={12} height={12} />
      </button>
    </span>
  );
}
