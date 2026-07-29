import { useId } from 'react';
import { ChevronDownIcon } from '../Icon/Icon.jsx';

/**
 * Select — same visual language as Input, built on a native <select>
 * rather than a custom listbox. A hand-built dropdown would need its
 * own full keyboard/ARIA implementation (roving focus, typeahead,
 * aria-activedescendant, etc.) to match what native <select> already
 * gives every browser and screen reader for free — not worth
 * reinventing without a specific reason to.
 *
 * Accepts either an `options` array of `{ value, label }`, or raw
 * `<option>` children for full control (option groups, disabled
 * options, etc.).
 */
export default function Select({
  label,
  caption1,
  caption2,
  options,
  children,
  error = false,
  id,
  className = '',
  ...rest
}) {
  const autoId = useId();
  const selectId = id || autoId;
  const captionId = `${selectId}-caption1`;

  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
      {(label || caption2) && (
        <div className="mb-1.5 flex items-center justify-between gap-2">
          {label && (
            <label htmlFor={selectId} className="text-body2 font-medium text-ink">
              {label}
            </label>
          )}
          {caption2 && <span className="text-caption text-ink-faint">{caption2}</span>}
        </div>
      )}

      <div
        className={[
          'relative rounded-input border',
          'has-[:disabled]:opacity-60',
          error
            ? 'border-danger bg-accent-orange-light'
            : 'border-border bg-secondary-light focus-within:border-accent-orange',
        ].join(' ')}
      >
        <select
          id={selectId}
          aria-invalid={error || undefined}
          aria-describedby={caption1 ? captionId : undefined}
          className="w-full appearance-none bg-transparent px-3 py-2.5 pr-9 text-body1 text-ink focus:outline-none disabled:cursor-not-allowed"
          {...rest}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDownIcon
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
          aria-hidden="true"
        />
      </div>

      {caption1 && (
        <p
          id={captionId}
          className={['mt-1.5 text-caption', error ? 'font-medium text-danger' : 'text-ink-faint'].join(' ')}
        >
          {caption1}
        </p>
      )}
    </div>
  );
}
