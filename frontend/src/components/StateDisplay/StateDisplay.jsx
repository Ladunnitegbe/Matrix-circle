import Button from '../Button/Button.jsx';

/**
 * StateDisplay — shared base for EmptyState / ErrorState / SuccessState.
 * The Figma states sheet shows all three (plus Loading) as one visual
 * family — icon badge + title + description + a text-link-or-button
 * action — rather than unrelated components, so they share this one
 * implementation instead of duplicating markup three times.
 *
 * `actionVariant`: Figma mixes text-link actions ("Refresh Feed",
 * "Post Surplus Food") and outlined-button actions ("View My Active
 * Listings") depending on context, with no obvious rule distinguishing
 * them — so it's a prop here rather than something this component
 * decides on its own.
 */
const TONE_BADGE = {
  neutral: 'bg-secondary-light',
  error: 'bg-accent-orange-light',
  success: 'bg-accent-green-light',
};

export default function StateDisplay({
  icon,
  tone = 'neutral', // 'neutral' | 'error' | 'success'
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = 'link', // 'link' | 'button'
  className = '',
}) {
  const badgeClasses = TONE_BADGE[tone] || TONE_BADGE.neutral;

  return (
    <div className={['flex flex-col items-center px-6 py-10 text-center', className].filter(Boolean).join(' ')}>
      <div className={['mb-4 flex h-16 w-16 items-center justify-center rounded-2xl', badgeClasses].join(' ')}>
        {icon}
      </div>
      <h3 className="mb-1 text-sh2 font-bold text-ink">{title}</h3>
      {description && <p className="mb-4 max-w-xs text-body2 text-ink-muted">{description}</p>}
      {actionLabel &&
        (actionVariant === 'button' ? (
          <Button onClick={onAction} color={tone === 'error' ? 'accent' : 'secondary'} variant="outlined" fullWidth={false}>
            {actionLabel}
          </Button>
        ) : (
          <button
            type="button"
            onClick={onAction}
            className="rounded text-body2 font-bold text-accent-orange hover:text-accent-orange-normal-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
          >
            {actionLabel}
          </button>
        ))}
    </div>
  );
}
