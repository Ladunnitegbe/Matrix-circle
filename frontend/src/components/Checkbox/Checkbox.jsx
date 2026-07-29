import { useId } from 'react';

/**
 * Checkbox — native <input type="checkbox">, styled via the CSS
 * `accent-color` property (Tailwind's `accent-*` utility) rather than
 * hiding the native control and drawing a custom box. This keeps full
 * native keyboard support, indeterminate-state support, and screen
 * reader behavior without extra ARIA work.
 */
export default function Checkbox({ label, description, id, className = '', ...rest }) {
  const autoId = useId();
  const checkboxId = id || autoId;

  return (
    <div className={['flex items-start gap-3', className].filter(Boolean).join(' ')}>
      <input
        type="checkbox"
        id={checkboxId}
        className="mt-0.5 h-5 w-5 flex-shrink-0 rounded border-border accent-accent-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        {...rest}
      />
      {(label || description) && (
        <div className="min-w-0">
          {label && (
            <label htmlFor={checkboxId} className="cursor-pointer text-body2 font-medium text-ink">
              {label}
            </label>
          )}
          {description && <p className="mt-0.5 text-caption text-ink-faint">{description}</p>}
        </div>
      )}
    </div>
  );
}
