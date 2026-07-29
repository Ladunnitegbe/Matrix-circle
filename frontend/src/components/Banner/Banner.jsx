import './Banner.css';
import { AlertIcon, CheckIcon, ClockIcon, WifiOffIcon } from '../Icon/Icon.jsx';

const ICONS = {
  error: AlertIcon,
  success: CheckIcon,
  info: ClockIcon,
  offline: WifiOffIcon,
};

/** Banner — inline error / success / info messaging (server-response states). */
export default function Banner({ type = 'info', children }) {
  const Icon = ICONS[type] || ClockIcon;
  return (
    <div className={`banner banner-${type}`}>
      <Icon />
      <span>{children}</span>
    </div>
  );
}
