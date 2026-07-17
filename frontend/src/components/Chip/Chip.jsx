import './Chip.css';

export default function Chip({ label, active = false, onClick }) {
  return (
    <button className={`chip ${active ? 'chip-active' : ''}`} onClick={onClick}>
      {label}
    </button>
  );
}
