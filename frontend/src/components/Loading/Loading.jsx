import { useId } from 'react';

export default function Loading({ title, description, progress, className = '' }) {
  const headingId = useId();
  const isDeterminate = typeof progress === 'number';
  const clampedProgress = isDeterminate ? Math.min(100, Math.max(0, progress)) : undefined;

  return (
    <div className={['flex flex-col items-start px-6 py-8', className].filter(Boolean).join(' ')}>
      <h3 id={headingId} className="mb-1 text-sh2 font-bold text-ink">{title}</h3>
      {description && <p className="mb-4 text-body2 text-ink-muted">{description}</p>}
      <div role="progressbar" aria-labelledby={headingId} aria-valuemin={0} aria-valuemax={100} aria-valuenow={clampedProgress}
        className="h-1.5 w-full overflow-hidden rounded-full bg-secondary-light">
        {isDeterminate ? (
          <div className="h-full rounded-full bg-accent-orange transition-all duration-300" style={{ width: `${clampedProgress}%` }} />
        ) : (
          <div className="h-full w-1/3 rounded-full bg-accent-orange animate-loading-bar" />
        )}
      </div>
    </div>
  );
}
