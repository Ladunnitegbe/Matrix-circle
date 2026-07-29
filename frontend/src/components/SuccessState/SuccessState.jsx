import StateDisplay from '../StateDisplay/StateDisplay.jsx';
import { CheckIcon } from '../Icon/Icon.jsx';

/**
 * SuccessState — thin StateDisplay configuration for confirmations
 * (e.g. "Food Portion Secured!", "Listing is Live!").
 */
export default function SuccessState({
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
      tone="success"
      icon={icon || <CheckIcon />}
      title={title}
      description={description}
      actionLabel={actionLabel}
      onAction={onAction}
      actionVariant={actionVariant}
      className={className}
    />
  );
}
