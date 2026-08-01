import { useId } from 'react';
import { TrashIcon } from '../Icon/Icon.jsx';

export default function Input({
  label, caption1, caption2, trailingText, trailingAction, deletable = false, onDelete,
  deleteLabel = 'Remove', error = false, required = false, id, className = '', ...rest
}) {
  const autoId = useId();
  const inputId = id || autoId;
  const captionId = `${inputId}-caption1`;

  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
      {(label || caption2) && (
        <div className="mb-1.5 flex items-center justify-between gap-2">
          {label && (
            <label htmlFor={inputId} className="text-body2 font-medium text-ink">
              {label}
              {required && <span aria-hidden="true" className="ml-0.5 text-danger">*</span>}
            </label>
          )}
          {caption2 && <span className="text-caption text-ink-faint">{caption2}</span>}
        </div>
      )}
      <div className={['flex items-center gap-2 rounded-input border px-3 py-2.5', 'has-[:disabled]:opacity-60', error ? 'border-danger bg-accent-orange-light' : 'border-border bg-secondary-light focus-within:border-accent-orange'].join(' ')}>
        <input id={inputId} required={required} className="min-w-0 flex-1 bg-transparent text-body1 text-ink placeholder:text-ink-faint focus:outline-none disabled:cursor-not-allowed" aria-invalid={error || undefined} aria-describedby={caption1 ? captionId : undefined} {...rest} />
        {trailingText && <span className="flex-shrink-0 text-caption text-ink-faint">{trailingText}</span>}
        {trailingAction && <span className="flex-shrink-0">{trailingAction}</span>}
        {deletable && (
          <button type="button" onClick={onDelete} aria-label={deleteLabel} className="flex-shrink-0 rounded text-ink-faint hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange">
            <TrashIcon width={16} height={16} />
          </button>
        )}
      </div>
      {caption1 && <p id={captionId} className={['mt-1.5 text-caption', error ? 'font-medium text-danger' : 'text-ink-faint'].join(' ')}>{caption1}</p>}
    </div>
  );
}
