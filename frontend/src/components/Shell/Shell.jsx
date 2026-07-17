import './Shell.css';

export default function Shell({ children }) {
  return (
    <div className="shell">
      <div className="shell-phone">{children}</div>
    </div>
  );
}
