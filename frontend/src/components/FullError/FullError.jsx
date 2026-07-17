import './FullError.css';
import Button from '../Button/Button.jsx';
import { WifiOffIcon } from '../Icon/Icon.jsx';

export default function FullError({ code = 'ERROR · HTTP 500', title, description, onRetry }) {
  return (
    <div className="full-error">
      <div className="full-error-glyph">
        <WifiOffIcon />
      </div>
      <p className="full-error-code">{code}</p>
      <h3>{title}</h3>
      <p className="full-error-desc">{description}</p>
      <Button variant="primary" onClick={onRetry} fullWidth={false}>
        Try again
      </Button>
    </div>
  );
}
