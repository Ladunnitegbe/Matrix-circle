import StateDisplay from '../StateDisplay/StateDisplay.jsx';
import { BoxIcon } from '../Icon/Icon.jsx';

/**
 * EmptyState — thin StateDisplay configuration for "nothing here yet"
 * (e.g. "No Food Available Nearby", "No Active Food Listings").
 *
 * NOTE: replaces an earlier plain-CSS EmptyState built before the
 * Figma design system existed. Old mobile-only screens still
 * reference the old version's props/markup — flagging rather than
 * silently leaving two differently-shaped "EmptyState" components.
 */
export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionVariant,
  className,
}) {
  return (
    <StateDisplay
      tone="neutral"
      icon={icon || <BoxIcon />}
      title={title}
      description={description}
      actionLabel={actionLabel}
      onAction={onAction}
      actionVariant={actionVariant}
      className={className}
    />
  );
}
