import './Button.css';

export default function Button({
  children,
  variant = 'primary', 
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  fullWidth = true,
}) {
  const isDisabled = disabled || loading;
  const classes = [
    'btn',
    `btn-${isDisabled ? 'disabled' : variant}`,
    fullWidth ? 'btn-full' : '',
  ].join(' ').trim();

  return (
    <button type={type} className={classes} disabled={isDisabled} onClick={onClick}>
      {loading && <span className="btn-spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
