import { useId } from 'react';

/**
 * Loading — matches the Figma "Loading" state exactly: a heading, a
 * short supporting line, and a horizontal progress bar (e.g. "Finding
 * available food nearby… / Scanning within 5km of your location", or
 * "Loading your vendor dashboard… / Updating real-time portion
 * claims").
 *
 * This is deliberately a *different* component from `LoadingSpinner`:
 * LoadingSpinner is a small inline control (used inside Button, or
 * anywhere a compact spinner is needed). Loading is this page-level
 * composite — heading + copy + bar — for a screen that's waiting on
 * something to load, matching the Figma pattern rather than reusing
 * the spinner in a different layout.
 *
 * Pass `progress` (0–100) for a determinate bar with a real
 * percentage. Omit it for an indeterminate sliding-bar animation, for
 * the (more common) case where there's no actual number to report —
 * e.g. "scanning nearby" doesn't have a meaningful percentage.
 *
 * Accessibility: `role="progressbar"` labeled by the heading via
 * `aria-labelledby`. `aria-valuenow` is only set for the determinate
 * case — per the WAI-ARIA spec, omitting it (rather than setting some
 * fake number) is the correct way to signal an indeterminate progress
 * bar to assistive tech.
 */
export default function Loading({ title, description, progress, className = '' }) {
  const headingId = useId();
  const isDeterminate = typeof progress === 'number';
  const clampedProgress = isDeterminate ? Math.min(100, Math.max(0, progress)) : undefined;

  return (
    <div className={['flex flex-col items-start px-6 py-8', className].filter(Boolean).join(' ')}>
      <h3 id={headingId} className="mb-1 text-sh2 font-bold text-ink">
        {title}
      </h3>
      {description && <p className="mb-4 text-body2 text-ink-muted">{description}</p>}

      <div
        role="progressbar"
        aria-labelledby={headingId}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clampedProgress}
        className="h-1.5 w-full overflow-hidden rounded-full bg-secondary-light"
      >
        {isDeterminate ? (
          <div
            className="h-full rounded-full bg-accent-orange transition-all duration-300"
            style={{ width: `${clampedProgress}%` }}
          />
        ) : (
          <div className="h-full w-1/3 rounded-full bg-accent-orange animate-loading-bar" />
        )}
      </div>
    </div>
  );
}
