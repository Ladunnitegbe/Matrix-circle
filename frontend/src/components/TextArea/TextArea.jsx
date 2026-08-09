import { useId } from 'react';
export default function TextArea({ label, caption1, caption2, error = false, rows = 4, id, className = '', ...rest }) {
  const autoId = useId();
  const textareaId = id || autoId;
  const captionId = `${textareaId}-caption1`;
  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
      {(label || caption2) && (
        <div className="mb-1.5 flex items-center justify-between gap-2">
          {label && <label htmlFor={textareaId} className="text-body2 font-medium text-ink">{label}</label>}
          {caption2 && <span className="text-caption text-ink-faint">{caption2}</span>}
        </div>
      )}
      <textarea id={textareaId} rows={rows} aria-invalid={error || undefined} aria-describedby={caption1 ? captionId : undefined}
        className={['w-full rounded-input border px-3 py-2.5 text-body1 text-ink placeholder:text-ink-faint focus:outline-none disabled:cursor-not-allowed disabled:opacity-60', error ? 'border-danger bg-accent-orange-light' : 'border-border bg-secondary-light focus:border-accent-orange'].join(' ')} {...rest} />
      {caption1 && <p id={captionId} className={['mt-1.5 text-caption', error ? 'font-medium text-danger' : 'text-ink-faint'].join(' ')}>{caption1}</p>}
    </div>
  );
}
