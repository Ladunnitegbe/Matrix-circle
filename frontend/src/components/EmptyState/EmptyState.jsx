import StateDisplay from '../StateDisplay/StateDisplay.jsx';
import { BoxIcon } from '../Icon/Icon.jsx';
export default function EmptyState({ icon, title, description, actionLabel, onAction, actionVariant, className }) {
  return <StateDisplay tone="neutral" icon={icon || <BoxIcon />} title={title} description={description} actionLabel={actionLabel} onAction={onAction} actionVariant={actionVariant} className={className} />;
}
