/**
 * Button — matches the Figma "buttons" sheet:
 *   colorway: accent | secondary   (accent = Orange ramp, secondary = Green ramp
 *             — NOTE: this is the Figma *button* sheet's own labeling, which is
 *             different from the top-level Primary/Secondary brand swatches in
 *             the colors sheet. Confirm this reading if it looks off.)
 *   variant:  solid | outlined | text
 *   disabled: boolean
 *
 * Not shown in Figma, added for production use (flagged, not hidden):
 *   - `loading` state (no loading button was in the export)
 *   - `iconLeft` / `iconRight` slots, generalized from the sheet's template
 *     "← Button →" convention, which real usages in the states export show
 *     are optional, not literal
 *
 * Accessibility:
 *   - renders a native <button> (keyboard operable, correct role, no extra
 *     ARIA needed for basic semantics)
 *   - `type="button"` by default so it never accidentally submits a form
 *   - visible keyboard focus ring (focus-visible only, not on mouse click)
 *   - `loading` sets `aria-busy` and disables the button to prevent double
 *     activation, with a screen-reader-only "Loading" announcement
 *   - warns in the console (dev-time only) if used icon-only with no
 *     accessible name, rather than silently shipping an unlabeled control
 */

import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.jsx';

const COLOR_CLASSES = {
  accent: {
    solid: [
      'bg-accent-orange text-white',
      'hover:bg-accent-orange-normal-hover',
      'active:bg-accent-orange-normal-active',
      'focus-visible:ring-accent-orange',
      'disabled:bg-accent-orange-light-active disabled:text-white/70',
    ],
    outlined: [
      'bg-transparent text-accent-orange border border-accent-orange',
      'hover:bg-accent-orange-light-hover',
      'active:bg-accent-orange-light-active',
      'focus-visible:ring-accent-orange',
      'disabled:text-accent-orange-light-active disabled:border-accent-orange-light-active',
    ],
    text: [
      'bg-transparent text-accent-orange',
      'hover:text-accent-orange-normal-hover',
      'active:text-accent-orange-normal-active',
      'focus-visible:ring-accent-orange',
      'disabled:text-accent-orange-light-active',
    ],
  },
  secondary: {
    solid: [
      'bg-accent-green text-white',
      'hover:bg-accent-green-normal-hover',
      'active:bg-accent-green-normal-active',
      'focus-visible:ring-accent-green',
      'disabled:bg-accent-green-light-active disabled:text-white/70',
    ],
    outlined: [
      'bg-transparent text-accent-green border border-accent-green',
      'hover:bg-accent-green-light-hover',
      'active:bg-accent-green-light-active',
      'focus-visible:ring-accent-green',
      'disabled:text-accent-green-light-active disabled:border-accent-green-light-active',
    ],
    text: [
      'bg-transparent text-accent-green',
      'hover:text-accent-green-normal-hover',
      'active:text-accent-green-normal-active',
      'focus-visible:ring-accent-green',
      'disabled:text-accent-green-light-active',
    ],
  },
};

const BASE_CLASSES = [
  'inline-flex items-center justify-center gap-2',
  'rounded-pill font-medium text-body1',
  'px-6 py-3',
  'transition-colors duration-150',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed',
].join(' ');

export default function Button({
  children,
  color = 'accent', // 'accent' | 'secondary'
  variant = 'solid', // 'solid' | 'outlined' | 'text'
  disabled = false,
  loading = false,
  fullWidth = false,
  iconLeft = null,
  iconRight = null,
  type = 'button',
  className = '',
  onClick,
  ...rest
}) {
  if (process.env.NODE_ENV !== 'production' && !children && !rest['aria-label']) {
    // eslint-disable-next-line no-console
    console.warn('Button: icon-only buttons need an aria-label for screen reader users.');
  }

  const colorClasses = (COLOR_CLASSES[color] || COLOR_CLASSES.accent)[variant] || COLOR_CLASSES.accent.solid;
  const isDisabled = disabled || loading;

  const classes = [BASE_CLASSES, ...colorClasses, fullWidth ? 'w-full' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      onClick={onClick}
      {...rest}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" className="text-current" />
        </>
      ) : (
        iconLeft
      )}
      {children}
      {!loading && iconRight}
    </button>
  );
}
