import { AlertCircleIcon, AlertIcon, CheckIcon, XIcon } from '../Icon/Icon.jsx';

/**
 * Alert — inline message box within page content (a persistent banner
 * about the current view, e.g. "Your connection was interrupted").
 * Distinct from `Toast`, which floats and auto-dismisses.
 */
const TONE_ICON = {
  info: AlertCircleIcon,
  success: CheckIcon,
  warning: AlertIcon,
  error: AlertIcon,
};

const TONE_STYLES = {
  info: 'bg-accent-orange-light border-accent-orange-light-active text-accent-orange-dark',
  success: 'bg-accent-green-light border-accent-green-light-active text-accent-green-dark',
  warning: 'bg-accent-orange-light border-accent-orange-light-active text-accent-orange-dark',
  error: 'bg-accent-orange-light border-accent-orange-light-active text-danger',
};

export default function Alert({ tone = 'info', title, children, onDismiss, className = '' }) {
  const ToneIcon = TONE_ICON[tone] || AlertCircleIcon;
  const toneClasses = TONE_STYLES[tone] || TONE_STYLES.info;

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={['flex items-start gap-3 rounded-lg border px-4 py-3', toneClasses, className].filter(Boolean).join(' ')}
    >
      <ToneIcon className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="text-body2 font-bold">{title}</p>}
        {children && <div className="mt-0.5 text-body2">{children}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="flex-shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
        >
          <XIcon width={16} height={16} />
        </button>
      )}
    </div>
  );
}
