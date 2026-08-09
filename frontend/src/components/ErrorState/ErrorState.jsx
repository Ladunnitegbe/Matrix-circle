import StateDisplay from '../StateDisplay/StateDisplay.jsx';
import { AlertIcon } from '../Icon/Icon.jsx';
export default function ErrorState({ icon, title = 'Something went wrong', description, actionLabel = 'Try Again', onAction, actionVariant, className }) {
  return <StateDisplay tone="error" icon={icon || <AlertIcon />} title={title} description={description} actionLabel={actionLabel} onAction={onAction} actionVariant={actionVariant} className={className} />;
}
