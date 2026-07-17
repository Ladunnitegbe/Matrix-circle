import './TimeRing.css';


export default function TimeRing({ minutes, maxMinutes = 60, size = 44, stroke = 4 }) {
  const pct = Math.max(0, Math.min(1, minutes / maxMinutes));
  const urgent = minutes <= 15;
  const r = size / 2 - stroke / 2 - 1;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);

  return (
    <div className="time-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle className="time-ring-track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
        <circle
          className={`time-ring-progress ${urgent ? 'time-ring-urgent' : ''}`}
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="time-ring-label">{minutes}m</div>
    </div>
  );
}
