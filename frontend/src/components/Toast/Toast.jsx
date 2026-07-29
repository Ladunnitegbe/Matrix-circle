import { AlertCircleIcon, CheckIcon, WifiOffIcon, XIcon } from '../Icon/Icon.jsx';

/**
 * Toast — a single floating notification. Matches the Figma "http
 * response" pattern: icon + message + optional action + dismiss.
 * Usually rendered through `ToastProvider`/`useToast` (see
 * ToastProvider.jsx) rather than placed directly by a page.
 *
 * Accessibility: `role="alert"` (assertive) for error toasts so they
 * interrupt immediately; `role="status"` (polite) otherwise, so
 * routine confirmations don't talk over whatever the user is doing.
 */
const TONE_ICON = {
  info: AlertCircleIcon,
  success: CheckIcon,
  error: WifiOffIcon,
};

const TONE_COLOR = {
  info: 'text-accent-orange',
  success: 'text-accent-green',
  error: 'text-danger',
};

export default function Toast({ tone = 'info', message, actionLabel, onAction, onDismiss, className = '' }) {
  const ToneIcon = TONE_ICON[tone] || AlertCircleIcon;

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={[
        'flex max-w-sm items-start gap-3 rounded-lg border border-border bg-primary-light px-4 py-3 shadow',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <ToneIcon className={['mt-0.5 h-5 w-5 flex-shrink-0', TONE_COLOR[tone] || TONE_COLOR.info].join(' ')} aria-hidden="true" />
      <p className="min-w-0 flex-1 text-body2 text-ink">{message}</p>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="flex-shrink-0 rounded text-body2 font-bold text-accent-orange hover:text-accent-orange-normal-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
        >
          {actionLabel}
        </button>
      )}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="flex-shrink-0 rounded text-ink-faint hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
        >
          <XIcon width={14} height={14} />
        </button>
      )}
    </div>
  );
}
