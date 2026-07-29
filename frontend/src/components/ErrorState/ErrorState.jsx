import StateDisplay from '../StateDisplay/StateDisplay.jsx';
import { AlertIcon } from '../Icon/Icon.jsx';

/**
 * ErrorState — thin StateDisplay configuration for connection/loading
 * failures (e.g. "Connection Interrupted", "Portion Already Claimed").
 * Replaces the old `FullError` component, which did the same job with
 * its own separate, heavier markup.
 */
export default function ErrorState({
  icon,
  title = 'Something went wrong',
  description,
  actionLabel = 'Try Again',
  onAction,
  actionVariant,
  className,
}) {
  return (
    <StateDisplay
      tone="error"
      icon={icon || <AlertIcon />}
      title={title}
      description={description}
      actionLabel={actionLabel}
      onAction={onAction}
      actionVariant={actionVariant}
      className={className}
    />
  );
}
