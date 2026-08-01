import { useId } from 'react';
export default function Radio({ label, description, id, className = '', ...rest }) {
  const autoId = useId();
  const radioId = id || autoId;
  return (
    <div className={['flex items-start gap-3', className].filter(Boolean).join(' ')}>
      <input type="radio" id={radioId} className="mt-0.5 h-5 w-5 flex-shrink-0 border-border accent-accent-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60" {...rest} />
      {(label || description) && (
        <div className="min-w-0">
          {label && <label htmlFor={radioId} className="cursor-pointer text-body2 font-medium text-ink">{label}</label>}
          {description && <p className="mt-0.5 text-caption text-ink-faint">{description}</p>}
        </div>
      )}
    </div>
  );
}
