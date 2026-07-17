import './ScreenHeader.css';
import { ArrowLeftIcon } from '../Icon/Icon.jsx';

export default function ScreenHeader({ title, onBack, right }) {
  return (
    <div className="screen-header">
      {onBack ? (
        <button className="screen-header-back" onClick={onBack}>
          <ArrowLeftIcon />
        </button>
      ) : (
        <span className="screen-header-spacer" />
      )}
      <span className="screen-header-title">{title}</span>
      <span className="screen-header-right">{right}</span>
    </div>
  );
}
