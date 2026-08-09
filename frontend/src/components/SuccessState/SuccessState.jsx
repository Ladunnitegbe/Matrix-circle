import StateDisplay from '../StateDisplay/StateDisplay.jsx';
import { CheckIcon } from '../Icon/Icon.jsx';
export default function SuccessState({ icon, title, description, actionLabel, onAction, actionVariant, className }) {
  return <StateDisplay tone="success" icon={icon || <CheckIcon />} title={title} description={description} actionLabel={actionLabel} onAction={onAction} actionVariant={actionVariant} className={className} />;
}
