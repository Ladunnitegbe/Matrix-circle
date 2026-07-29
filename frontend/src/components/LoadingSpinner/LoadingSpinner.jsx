/**
 * LoadingSpinner — standalone spinner control. `Button`'s own `loading`
 * state uses this internally too, rather than each keeping its own
 * copy of the same SVG.
 *
 * Not the same thing as the Figma "Loading" *state* pattern (a labeled
 * progress bar — "Finding available food nearby… Scanning within 5km")
 * — that's a different, page-level composite than a spinner control,
 * and wasn't asked for here, so it hasn't been built.
 *
 * Accessibility: `role="status"` gives it an implicit polite live
 * region, and the visible spinner is hidden from assistive tech in
 * favor of the screen-reader-only `label` text.
 */
const SIZES = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
};

export default function LoadingSpinner({ size = 'md', label = 'Loading', className = '' }) {
  return (
    <span role="status" className={['inline-flex items-center', className].filter(Boolean).join(' ')}>
      <svg
        className={['animate-spin', SIZES[size] || SIZES.md].join(' ')}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}
